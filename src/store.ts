import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { temporal } from 'zundo';
import type {
  Asset, DeepPartial, Format, ImageRef, Project, Slide, SlideContent, SlideOverrides, TemplateId, Theme,
} from './types';
import type { GuideFlags } from './components/primitives/SlideContext';
import { createSlide, getDefaultProject, loadSavedProject, parseProject, saveProject, uid } from './utils/project';
import { deepMerge, patchFromPath, resolveTheme } from './utils/theme';
import { DEFAULT_THEME_ID } from './tokens';

/* ----------------------------- undo grouping ----------------------------- */

// Rapid edits (typing, dragging a slider) collapse into ONE undo step: only the first change of a
// burst stores a snapshot. Structural actions call closeUndoGroup() so they always get their own step.
let lastChange = 0;
const BURST_MS = 700;
export function closeUndoGroup() {
  lastChange = 0;
}

/* ----------------------------- state shape ----------------------------- */

export type SidePanel = 'inspector' | 'theme';

export interface Toast {
  id: string;
  kind: 'info' | 'success' | 'error';
  text: string;
}

interface UIState {
  selectedId: string;
  format: Format;
  /** Zoom multiplier on top of "fit to window". */
  zoom: number;
  guides: GuideFlags;
  showGuides: boolean;
  panel: SidePanel;
  /** Inspector field to focus (set by clicking a text on the canvas). */
  focusField: string | null;
  toasts: Toast[];
  exportOpen: boolean;
}

interface Actions {
  /* project */
  setProjectName: (name: string) => void;
  loadProject: (project: Project) => void;
  resetProject: () => void;
  /* slides */
  selectSlide: (id: string) => void;
  addSlide: (template: TemplateId, afterId?: string) => void;
  duplicateSlide: (id: string) => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, toIndex: number) => void;
  updateContent: (id: string, patch: SlideContent) => void;
  setImage: (id: string, slot: string, ref: ImageRef | null) => void;
  updateOverrides: (id: string, patch: Partial<SlideOverrides>) => void;
  /* assets & brand */
  addAsset: (asset: Asset) => string;
  updateBrand: (patch: Partial<Omit<Project['brandKit'], 'tokenOverrides' | 'customThemes'>>) => void;
  /* themes */
  setTheme: (themeId: string) => void;
  setToken: (path: string[], value: unknown) => void;
  resetTokens: () => void;
  saveCustomTheme: (name: string) => void;
  deleteCustomTheme: (id: string) => void;
  /* ui */
  setFormat: (f: Format) => void;
  setZoom: (z: number) => void;
  setGuide: (key: keyof GuideFlags, on: boolean) => void;
  setShowGuides: (on: boolean) => void;
  setPanel: (p: SidePanel) => void;
  requestFocus: (field: string | null) => void;
  setExportOpen: (open: boolean) => void;
  toast: (kind: Toast['kind'], text: string) => void;
  dismissToast: (id: string) => void;
}

export type StudioState = { project: Project } & UIState & Actions;

/* ----------------------------- store ----------------------------- */

const initialProject = loadSavedProject() ?? getDefaultProject();

function touch(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

function mapSlide(project: Project, id: string, fn: (s: Slide) => Slide): Project {
  return touch({ ...project, slides: project.slides.map((s) => (s.id === id ? fn(s) : s)) });
}

export const useStudio = create<StudioState>()(
  temporal(
    (set, get) => ({
      project: initialProject,

      selectedId: initialProject.slides[0]?.id ?? '',
      format: 'portrait',
      zoom: 1,
      guides: { safe: true, center: false, thirds: false, squareCrop: false, gridCrop: false },
      showGuides: false,
      panel: 'inspector',
      focusField: null,
      toasts: [],
      exportOpen: false,

      /* project */
      setProjectName: (name) => set((s) => ({ project: touch({ ...s.project, name }) })),
      loadProject: (project) => {
        closeUndoGroup();
        set({ project, selectedId: project.slides[0]?.id ?? '' });
      },
      resetProject: () => {
        closeUndoGroup();
        const p = getDefaultProject();
        set({ project: p, selectedId: p.slides[0]?.id ?? '' });
      },

      /* slides */
      selectSlide: (id) => set({ selectedId: id }),
      addSlide: (template, afterId) => {
        closeUndoGroup();
        const slide = createSlide(template);
        set((s) => {
          const slides = [...s.project.slides];
          const at = afterId ? slides.findIndex((x) => x.id === afterId) + 1 : slides.length;
          slides.splice(at, 0, slide);
          return { project: touch({ ...s.project, slides }), selectedId: slide.id };
        });
      },
      duplicateSlide: (id) => {
        closeUndoGroup();
        set((s) => {
          const idx = s.project.slides.findIndex((x) => x.id === id);
          if (idx < 0) return {};
          const copy: Slide = { ...structuredClone(s.project.slides[idx]), id: uid('s') };
          const slides = [...s.project.slides];
          slides.splice(idx + 1, 0, copy);
          return { project: touch({ ...s.project, slides }), selectedId: copy.id };
        });
      },
      removeSlide: (id) => {
        const { project } = get();
        if (project.slides.length <= 1) {
          get().toast('error', 'حداقل یک اسلاید باید در پروژه بماند.');
          return;
        }
        closeUndoGroup();
        set((s) => {
          const idx = s.project.slides.findIndex((x) => x.id === id);
          const slides = s.project.slides.filter((x) => x.id !== id);
          const next = slides[Math.min(idx, slides.length - 1)]?.id ?? '';
          return { project: touch({ ...s.project, slides }), selectedId: s.selectedId === id ? next : s.selectedId };
        });
      },
      moveSlide: (id, toIndex) => {
        closeUndoGroup();
        set((s) => {
          const slides = [...s.project.slides];
          const from = slides.findIndex((x) => x.id === id);
          if (from < 0) return {};
          const to = Math.max(0, Math.min(slides.length - 1, toIndex));
          if (from === to) return {};
          const [item] = slides.splice(from, 1);
          if (!item) return {};
          slides.splice(to, 0, item);
          return { project: touch({ ...s.project, slides }) };
        });
      },
      updateContent: (id, patch) =>
        set((s) => ({ project: mapSlide(s.project, id, (sl) => ({ ...sl, content: { ...sl.content, ...patch } })) })),
      setImage: (id, slot, ref) => {
        closeUndoGroup();
        set((s) => ({
          project: mapSlide(s.project, id, (sl) => {
            const images = { ...(sl.content.images ?? {}) };
            if (ref) images[slot] = ref;
            else delete images[slot];
            return { ...sl, content: { ...sl.content, images } };
          }),
        }));
      },
      updateOverrides: (id, patch) =>
        set((s) => ({ project: mapSlide(s.project, id, (sl) => ({ ...sl, overrides: { ...sl.overrides, ...patch } })) })),

      /* assets & brand */
      addAsset: (asset) => {
        const id = uid('a');
        set((s) => ({ project: { ...s.project, assets: { ...s.project.assets, [id]: asset } } }));
        return id;
      },
      updateBrand: (patch) => set((s) => ({ project: touch({ ...s.project, brandKit: { ...s.project.brandKit, ...patch } }) })),

      /* themes */
      setTheme: (themeId) => {
        closeUndoGroup();
        set((s) => ({ project: touch({ ...s.project, brandKit: { ...s.project.brandKit, themeId, tokenOverrides: {} } }) }));
      },
      setToken: (path, value) =>
        set((s) => {
          const patch = patchFromPath(path, value) as DeepPartial<Theme>;
          const tokenOverrides = deepMerge(s.project.brandKit.tokenOverrides, patch);
          return { project: touch({ ...s.project, brandKit: { ...s.project.brandKit, tokenOverrides } }) };
        }),
      resetTokens: () => {
        closeUndoGroup();
        set((s) => ({ project: touch({ ...s.project, brandKit: { ...s.project.brandKit, tokenOverrides: {} } }) }));
      },
      saveCustomTheme: (name) => {
        closeUndoGroup();
        set((s) => {
          const resolved = resolveTheme(s.project.brandKit);
          const theme: Theme = { ...structuredClone(resolved), id: uid('custom'), name: name.trim() || 'تم سفارشی' };
          const brandKit = {
            ...s.project.brandKit,
            customThemes: [...s.project.brandKit.customThemes, theme],
            themeId: theme.id,
            tokenOverrides: {},
          };
          return { project: touch({ ...s.project, brandKit }) };
        });
      },
      deleteCustomTheme: (id) => {
        closeUndoGroup();
        set((s) => {
          const customThemes = s.project.brandKit.customThemes.filter((t) => t.id !== id);
          const themeId = s.project.brandKit.themeId === id ? DEFAULT_THEME_ID : s.project.brandKit.themeId;
          return { project: touch({ ...s.project, brandKit: { ...s.project.brandKit, customThemes, themeId, tokenOverrides: {} } }) };
        });
      },

      /* ui */
      setFormat: (format) => set({ format }),
      setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
      setGuide: (key, on) => set((s) => ({ guides: { ...s.guides, [key]: on } })),
      setShowGuides: (showGuides) => set({ showGuides }),
      setPanel: (panel) => set({ panel }),
      requestFocus: (focusField) => set({ focusField }),
      setExportOpen: (exportOpen) => set({ exportOpen }),
      toast: (kind, text) => {
        const id = uid('t');
        set((s) => ({ toasts: [...s.toasts, { id, kind, text }] }));
        setTimeout(() => get().dismissToast(id), 4200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      // Only the project is part of undo/redo; selection, zoom, panels etc. are not.
      partialize: (s) => ({ project: s.project }),
      limit: 100,
      equality: (a, b) => a.project === b.project,
      handleSet: (handleSet) => {
        // zundo types this callback loosely; at runtime it is the internal (past, replace, current, delta) saver.
        const save = handleSet as unknown as (p: unknown, r: unknown, c: unknown, d: unknown) => void;
        return (pastState, replace, currentState, deltaState) => {
          const now = Date.now();
          if (now - lastChange > BURST_MS) save(pastState, replace, currentState, deltaState);
          lastChange = now;
        };
      },
    },
  ),
);

/* ----------------------------- selectors & helpers ----------------------------- */

export function useSelectedSlide(): { slide: Slide; index: number } {
  // useShallow: compare the returned object by its fields so selecting stays referentially stable.
  return useStudio(
    useShallow((s) => {
      const idx = Math.max(0, s.project.slides.findIndex((x) => x.id === s.selectedId));
      return { slide: s.project.slides[idx] as Slide, index: idx };
    }),
  );
}

export const undo = () => {
  closeUndoGroup();
  useStudio.temporal.getState().undo();
};
export const redo = () => {
  closeUndoGroup();
  useStudio.temporal.getState().redo();
};

/* ----------------------------- autosave ----------------------------- */

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let warnedStorage = false;

/** Debounced autosave to localStorage. Image data is stripped (with a warning) if the quota is exceeded. */
export function startAutosave() {
  return useStudio.subscribe((state, prev) => {
    if (state.project === prev.project) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const result = saveProject(state.project);
      if (result !== 'ok' && !warnedStorage) {
        warnedStorage = true;
        useStudio
          .getState()
          .toast(
            'error',
            result === 'without-images'
              ? 'حافظه مرورگر پر است؛ متن‌ها ذخیره شد اما عکس‌ها نه. برای نگه‌داشتن عکس‌ها «خروجی JSON پروژه» بگیرید.'
              : 'ذخیره خودکار ممکن نیست. لطفاً پروژه را به‌صورت JSON خروجی بگیرید.',
          );
      } else if (result === 'ok') {
        warnedStorage = false;
      }
    }, 600);
  });
}

export { parseProject };

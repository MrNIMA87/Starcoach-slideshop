import type { Theme } from '../types';
import editorialDark from './editorial-dark.json';
import minimalLight from './minimal-light.json';
import boldSale from './bold-sale.json';
import iranpooshClassic from './iranpoosh-classic.json';

/** Built-in presets. JSON is the single source of truth for every visual value. */
export const PRESET_THEMES: Theme[] = [
  editorialDark as unknown as Theme,
  minimalLight as unknown as Theme,
  boldSale as unknown as Theme,
  iranpooshClassic as unknown as Theme,
];

export const DEFAULT_THEME_ID = 'editorial-dark';

export function findPreset(id: string): Theme | undefined {
  return PRESET_THEMES.find((t) => t.id === id);
}

import { memo, useMemo } from 'react';
import type { Format, Project, Slide } from '../../types';
import { SlideRenderer } from '../templates/SlideRenderer';
import { resolveTheme, themeHeight } from '../../utils/theme';

export interface SlideThumbProps {
  project: Project;
  slide: Slide;
  index: number;
  format: Format;
  /** Rendered height in px; width follows the slide's aspect ratio. */
  height: number;
}

/** A non-interactive, scaled-down live render of a slide (used by the carousel strip and slide list). */
export const SlideThumb = memo(function SlideThumb({ project, slide, index, format, height }: SlideThumbProps) {
  const theme = useMemo(() => resolveTheme(project.brandKit), [project.brandKit]);
  const W = theme.canvas.width;
  const H = themeHeight(theme, format);
  const scale = height / H;
  return (
    <div style={{ width: W * scale, height, position: 'relative', overflow: 'hidden', flex: 'none' }} aria-hidden>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none' }}>
        <SlideRenderer
          project={project}
          slide={slide}
          index={index}
          total={project.slides.length}
          format={format}
          mode="edit"
        />
      </div>
    </div>
  );
});

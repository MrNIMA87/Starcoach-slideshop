import type { ComponentType } from 'react';
import type { TemplateId, TemplateProps } from '../../types';
import type { TemplateMeta } from './shared';
import { CoverSlide, coverMeta } from './CoverSlide';
import { ProductSlide, productMeta } from './ProductSlide';
import { FeatureSlide, featureMeta } from './FeatureSlide';
import { SaleSlide, saleMeta } from './SaleSlide';
import { ContentSlide, contentMeta } from './ContentSlide';
import { GallerySlide, galleryMeta } from './GallerySlide';
import { CtaSlide, ctaMeta } from './CtaSlide';

export interface TemplateEntry {
  meta: TemplateMeta;
  Component: ComponentType<TemplateProps>;
}

/**
 * Template registry. To add a template: create <Name>Slide.tsx exporting a component + meta,
 * add the id to TemplateId in src/types.ts, then register it here (see README.fa.md).
 */
export const TEMPLATES: Record<TemplateId, TemplateEntry> = {
  cover: { meta: coverMeta, Component: CoverSlide },
  product: { meta: productMeta, Component: ProductSlide },
  feature: { meta: featureMeta, Component: FeatureSlide },
  sale: { meta: saleMeta, Component: SaleSlide },
  content: { meta: contentMeta, Component: ContentSlide },
  gallery: { meta: galleryMeta, Component: GallerySlide },
  cta: { meta: ctaMeta, Component: CtaSlide },
};

export const TEMPLATE_ORDER: TemplateId[] = ['cover', 'product', 'feature', 'sale', 'content', 'gallery', 'cta'];

export function getTemplate(id: TemplateId): TemplateEntry {
  return TEMPLATES[id] ?? TEMPLATES.cover;
}

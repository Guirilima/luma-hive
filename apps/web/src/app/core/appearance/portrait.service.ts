import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Agent } from '@domain/models';
import { portrait as originalPortrait, PORTRAITS } from '@domain/catalog';
import { AppearanceService } from './appearance.service';

/** Stable catalog IDs select display variants; never change an agent's saved image. */
export const PORTRAIT_CATALOG = Object.fromEntries(
  Object.entries(PORTRAITS).map(([id, original]) => [
    id,
    { id, original, pixel: '/assets/portraits/pixel/' + id + '.png' },
  ]),
);
const ORIGINAL_PORTRAITS = new Map(
  Object.values(PORTRAIT_CATALOG).map((p) => [p.original, p.pixel]),
);
@Injectable({ providedIn: 'root' })
export class PortraitService {
  private readonly document = inject(DOCUMENT);
  private readonly appearance = inject(AppearanceService);
  readonly source = (agent: Agent): string => this.resolve(originalPortrait(agent));
  readonly resolve = (source: string): string => {
    if (this.appearance.agents() !== 'pixel') return source;
    // Custom uploads and external URLs keep their original image.
    let original = source;
    try {
      const url = new URL(source, this.document.baseURI);
      if (url.origin === this.document.location?.origin) original = url.pathname;
    } catch {}
    return ORIGINAL_PORTRAITS.get(original) || source;
  };
}

import { clamp01, smoothstep } from './motion';

const INTRO_MS = 2500;
const INTRO_SHARE = 0.6;
const ASSEMBLY_SCROLL_END = 0.55;
const HANDOFF_SCROLL_START = 0.62;

export interface HeroProgress {
  assembly: number;
  handoff: number;
  update(nowMs: number, deltaSeconds: number): void;
}

export function createHeroProgress(section: HTMLElement, still: boolean): HeroProgress {
  const introStart = performance.now();
  let assembled = false;

  const scrolled = () => {
    const bounds = section.getBoundingClientRect();
    const span = bounds.height - window.innerHeight;
    return span > 0 ? clamp01(-bounds.top / span) : 0;
  };

  const progress: HeroProgress = {
    assembly: 0,
    handoff: 0,
    update(nowMs, deltaSeconds) {
      if (still) {
        progress.assembly = 1;
        progress.handoff = smoothstep(HANDOFF_SCROLL_START, 1, scrolled());
        return;
      }
      const intro = clamp01((nowMs - introStart) / INTRO_MS);
      const scroll = scrolled();
      let target =
        INTRO_SHARE * (1 - Math.pow(1 - intro, 2)) + (1 - INTRO_SHARE) * clamp01(scroll / ASSEMBLY_SCROLL_END);
      if (scroll >= ASSEMBLY_SCROLL_END || target >= 0.999) assembled = true;
      if (assembled) target = 1;
      const rate = scroll >= ASSEMBLY_SCROLL_END ? 12 : 6;
      progress.assembly += (target - progress.assembly) * Math.min(1, deltaSeconds * rate);
      const handoffTarget = smoothstep(HANDOFF_SCROLL_START, 1, scroll);
      progress.handoff += (handoffTarget - progress.handoff) * Math.min(1, deltaSeconds * 8);
    },
  };
  return progress;
}

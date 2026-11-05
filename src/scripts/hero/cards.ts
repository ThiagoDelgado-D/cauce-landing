import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  Scene,
  Vector3,
  type Texture,
} from 'three';
import { heroWindow } from '../../content/copy';
import { canvasTexture, fonts, ink, roundedRect } from './canvas';
import { toWindowSpace, windowHeight, windowLayout } from './app-window';
import { clamp01, easeInOutCubic, seededRandom, smoothstep } from './motion';

type ModuleName = (typeof heroWindow.rows)[number]['module'] | 'recommend';

const toneOf: Record<ModuleName, string> = {
  capture: '#8fb2d6',
  path: ink.pine,
  focus: ink.ember,
  recommend: ink.ochre,
};

const CARD_HEIGHT = 0.3;
const FIRST_START = 0.18;
const START_STEP = 0.078;
const TRAVEL = 0.32;

function rowCanvas(row: (typeof heroWindow.rows)[number]): HTMLCanvasElement {
  const { width, height } = windowLayout.rows;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  context.scale(scale, scale);
  const tone = toneOf[row.module];

  roundedRect(context, 1, 1, width - 2, height - 2, 10);
  context.fillStyle = ink.raised;
  context.fill();
  context.lineWidth = 1.5;
  context.strokeStyle = '#3d4137';
  context.stroke();
  context.fillStyle = tone;
  context.fillRect(0, 12, 4, height - 24);

  context.textBaseline = 'middle';
  context.font = `500 20px ${fonts.sans}`;
  context.fillStyle = ink.strong;
  context.fillText(row.title, 24, height / 2 - 1);

  context.font = `500 14px ${fonts.mono}`;
  const kindWidth = context.measureText(row.kind).width;
  context.globalAlpha = 0.16;
  context.fillStyle = tone;
  roundedRect(context, width - 150 - kindWidth, height / 2 - 12, kindWidth + 16, 24, 6);
  context.fill();
  context.globalAlpha = 1;
  context.fillText(row.kind, width - 142 - kindWidth, height / 2 + 1);
  context.fillStyle = ink.dim;
  context.fillText(row.meta, width - 100, height / 2 + 1);
  return canvas;
}

function idealMatchCanvas(): HTMLCanvasElement {
  const { width, height } = windowLayout.idealMatch;
  const copy = heroWindow.idealMatch;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  context.scale(scale, scale);

  roundedRect(context, 1, 1, width - 2, height - 2, 14);
  context.fillStyle = '#2b2617';
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = ink.ochre;
  context.stroke();

  context.textBaseline = 'middle';
  context.font = `500 16px ${fonts.mono}`;
  context.fillStyle = ink.ochre;
  context.fillText(copy.label, 24, 36);
  context.font = `500 30px ${fonts.display}`;
  context.fillStyle = ink.strong;
  context.fillText(copy.title, 24, 90);
  context.font = `400 18px ${fonts.sans}`;
  context.fillStyle = '#cdc7b8';
  context.fillText(copy.reason, 24, 128);
  roundedRect(context, 24, 168, 150, 44, 10);
  context.fillStyle = ink.pine;
  context.fill();
  context.font = `600 18px ${fonts.sans}`;
  context.fillStyle = '#0b0c09';
  context.fillText(copy.action, 44, 191);
  return canvas;
}

function cardCanvas(text: string, tone: string): { canvas: HTMLCanvasElement; aspect: number } {
  const font = `500 30px ${fonts.mono}`;
  const canvas = document.createElement('canvas');
  const measure = canvas.getContext('2d');
  if (!measure) return { canvas, aspect: 1 };
  measure.font = font;
  const width = Math.ceil(measure.measureText(text).width) + 70;
  const height = 64;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return { canvas, aspect: width / height };

  roundedRect(context, 2, 2, width - 4, height - 4, 12);
  context.fillStyle = ink.raised;
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = tone;
  context.stroke();
  context.fillStyle = tone;
  context.beginPath();
  context.arc(28, height / 2, 6, 0, Math.PI * 2);
  context.fill();
  context.font = font;
  context.fillStyle = '#e4e0d3';
  context.textBaseline = 'middle';
  context.fillText(text, 48, height / 2 + 2);
  return { canvas, aspect: width / height };
}

function flashCanvas(): HTMLCanvasElement {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return canvas;
}

interface Target {
  title: string;
  tone: string;
  center: Vector3;
  width: number;
  height: number;
  draw: () => HTMLCanvasElement;
}

function targets(): Target[] {
  const { rows, idealMatch, textureWidth, textureHeight } = windowLayout;
  const rowTargets = heroWindow.rows.map((row, index) => ({
    title: row.title,
    tone: toneOf[row.module],
    center: toWindowSpace(rows.x + rows.width / 2, rows.y + index * rows.step + rows.height / 2),
    width: (rows.width / textureWidth) * windowLayout.width,
    height: (rows.height / textureHeight) * windowHeight,
    draw: () => rowCanvas(row),
  }));
  const ideal = {
    title: heroWindow.idealMatch.card,
    tone: toneOf.recommend,
    center: toWindowSpace(idealMatch.x + idealMatch.width / 2, idealMatch.y + idealMatch.height / 2),
    width: (idealMatch.width / textureWidth) * windowLayout.width,
    height: (idealMatch.height / textureHeight) * windowHeight,
    draw: idealMatchCanvas,
  };
  return [...rowTargets, ideal];
}

interface Card {
  target: Target;
  filled: Mesh<PlaneGeometry, MeshBasicMaterial>;
  flash: Mesh<PlaneGeometry, MeshBasicMaterial>;
  card: Mesh<PlaneGeometry, MeshBasicMaterial>;
  scatter: Vector3;
  scatterRotation: Quaternion;
  landingScale: number;
  start: number;
  drift: number;
  landedAt: number;
  redraw: () => void;
}

export interface StudyCards {
  setSpread(spread: number): void;
  update(assembly: number, time: number, handoff: number): void;
  redraw(): void;
}

export function createStudyCards(scene: Scene, windowGroup: Group): StudyCards {
  const random = seededRandom(1234);
  const flashTexture = canvasTexture(flashCanvas());
  const landing = new Vector3();
  const windowRotation = new Quaternion();
  let spread = 1;

  const cards: Card[] = targets().map((target, index) => {
    const filledTexture: Texture = canvasTexture(target.draw());
    const filled = new Mesh(
      new PlaneGeometry(target.width, target.height),
      new MeshBasicMaterial({ map: filledTexture, transparent: true, opacity: 0, depthWrite: false }),
    );
    filled.position.copy(target.center).setZ(0.004);
    windowGroup.add(filled);

    const flash = new Mesh(
      new PlaneGeometry(target.width * 1.4, target.height * 2.4),
      new MeshBasicMaterial({
        map: flashTexture,
        color: new Color(target.tone),
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    flash.position.copy(target.center).setZ(0.003);
    windowGroup.add(flash);

    const drawn = cardCanvas(target.title, target.tone);
    const cardTexture = canvasTexture(drawn.canvas);
    const card = new Mesh(
      new PlaneGeometry(CARD_HEIGHT * drawn.aspect, CARD_HEIGHT),
      new MeshBasicMaterial({ map: cardTexture, transparent: true, depthWrite: false, side: DoubleSide }),
    );
    scene.add(card);

    const side = index % 2 ? 1 : -1;
    const isIdeal = index === heroWindow.rows.length;
    const fit = Math.min(target.width / (CARD_HEIGHT * drawn.aspect), target.height / CARD_HEIGHT);
    return {
      target,
      filled,
      flash,
      card,
      scatter: new Vector3(side * (2.9 + random() * 2.1), -1 + random() * 3, -1.6 + random() * 3.2),
      scatterRotation: new Quaternion().setFromEuler(
        new Euler((random() - 0.5) * 0.8, (random() - 0.5) * 1.5, (random() - 0.5) * 0.7),
      ),
      landingScale: fit * (isIdeal ? 0.7 : 1),
      start: FIRST_START + index * START_STEP,
      drift: random() * Math.PI * 2,
      landedAt: -1,
      redraw: () => {
        filledTexture.image = target.draw();
        filledTexture.needsUpdate = true;
        cardTexture.image = cardCanvas(target.title, target.tone).canvas;
        cardTexture.needsUpdate = true;
      },
    };
  });

  return {
    setSpread(value) {
      spread = value;
    },
    update(assembly, time, handoff) {
      windowGroup.updateMatrixWorld();
      windowGroup.getWorldQuaternion(windowRotation);
      const windowScale = windowGroup.scale.x;

      for (const card of cards) {
        const travel = clamp01((assembly - card.start) / TRAVEL);
        const eased = easeInOutCubic(travel);
        const sway = (1 - travel) * 0.14;

        landing.copy(card.target.center);
        windowGroup.localToWorld(landing);
        card.card.position.set(card.scatter.x * spread, card.scatter.y, card.scatter.z).lerp(landing, eased);
        card.card.position.y += Math.sin(time * 0.7 + card.drift) * sway;
        card.card.position.z += Math.sin(travel * Math.PI) * 0.6;
        card.card.quaternion.copy(card.scatterRotation).slerp(windowRotation, eased);
        card.card.scale.setScalar(1 + (card.landingScale * windowScale - 1) * eased);

        const landed = travel >= 0.999;
        if (landed && card.landedAt < 0) card.landedAt = time;
        if (!landed) card.landedAt = -1;
        const sinceLanding = landed ? time - card.landedAt : 0;

        card.card.material.opacity = landed ? Math.max(0, 1 - sinceLanding * 5) : 1;
        card.card.visible = card.card.material.opacity > 0.01 && handoff < 0.02;
        card.filled.material.opacity = landed ? Math.min(1, sinceLanding * 5) : smoothstep(0.85, 1, travel) * 0.5;
        card.flash.material.opacity = landed ? Math.max(0, 0.9 - sinceLanding * 1.4) : 0;
      }
    },
    redraw() {
      cards.forEach((card) => card.redraw());
    },
  };
}

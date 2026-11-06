export const site = {
  name: 'Cauce',
  title: 'Cauce',
  description: 'A personal learning ecosystem.',
  repositoryUrl: 'https://github.com/ThiagoDelgado-D/EAP-Ecosystem',
};

export const header = {
  downloadLabel: 'Download',
  downloadHref: '#closing',
};

export const hero = {
  headline: 'Your study, in one channel.',
  subline: 'Capture what you want to learn, follow a path, focus, and get the next step that fits your energy.',
  downloadLabel: 'Download',
  downloadHref: '#closing',
};

export const heroWindow = {
  appName: 'Cauce',
  navigation: ['Today', 'Library', 'Paths', 'Focus', 'Recommend', 'Settings'],
  title: 'Today',
  context: 'Thursday · medium energy · 50 min free',
  emptyList: 'waiting for what you capture',
  rows: [
    { title: 'Clean Code, ch. 4', kind: 'book', module: 'capture', meta: '40 min' },
    { title: 'DSA: graphs', kind: 'path', module: 'path', meta: '3 of 9' },
    { title: '25 min · DSA', kind: 'focus', module: 'focus', meta: 'today' },
    { title: 'Docker crash course', kind: 'video', module: 'capture', meta: '1 h 10' },
    { title: 'Deploy a VPS', kind: 'path', module: 'path', meta: '1 of 6' },
    { title: 'Article: event loop', kind: 'article', module: 'capture', meta: '12 min' },
  ],
  idealMatch: {
    card: 'Next: graphs, ch. 2',
    label: 'IDEAL MATCH',
    title: 'Graphs, ch. 2',
    reason: '25 min · fits medium energy',
    action: 'Start focus',
  },
} as const;

export const principles = {
  eyebrow: 'Ground rules',
  heading: 'Four rules I build Cauce by.',
  aside: "If a new feature breaks one, it doesn't ship.",
  items: [
    {
      lead: 'One thing to study next.',
      rest: 'Picked for right now, from what you saved.',
      note: "Open the app and there's one suggestion waiting. Start it or skip it.",
      today: 'Ideal Match',
      tone: 'ochre',
    },
    {
      lead: "It asks how you're doing.",
      rest: 'Then picks something that fits.',
      note: 'Low energy and twenty free minutes gets you a short article, not chapter nine.',
      today: 'daily calibration',
      tone: 'ember',
    },
    {
      lead: 'Only real study time counts.',
      rest: 'False starts get dropped.',
      note: "There are no streaks to keep alive, so there's nothing to fake.",
      today: 'focus log',
      tone: 'pine',
    },
    {
      lead: 'Your notes are yours.',
      rest: 'And the code is out in the open.',
      note: 'Cauce is open source, so you can read exactly what it does with your data.',
      today: 'public on GitHub',
      tone: 'info',
    },
  ],
} as const;

export const footer = {
  repositoryLabel: 'GitHub',
};

export const sections = [
  { id: 'chapters', label: 'Chapters' },
  { id: 'principles', label: 'Principles' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'capture', label: 'Capture' },
  { id: 'bento', label: 'Bento' },
  { id: 'closing', label: 'Closing' },
] as const;

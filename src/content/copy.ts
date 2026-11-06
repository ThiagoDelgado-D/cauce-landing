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

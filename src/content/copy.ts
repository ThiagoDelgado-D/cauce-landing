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
  subline:
    'Capture what you want to learn, follow a path, focus, and get the next step that fits your energy.',
  downloadLabel: 'Download',
  downloadHref: '#closing',
};

export const heroWindow = {
  appName: 'Cauce',
  navigation: ['Today', 'Library', 'Paths', 'Focus', 'Recommend', 'Settings'],
  title: 'Today',
  context: 'Thursday · medium energy · 50 min free',
  emptyList: 'waiting for what you capture',
};

export const footer = {
  repositoryLabel: 'GitHub',
};

export const sections = [
  { id: 'principles', label: 'Principles' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'capture', label: 'Capture' },
  { id: 'bento', label: 'Bento' },
  { id: 'closing', label: 'Closing' },
] as const;

/**
 * Registry of all widgets. Each module exports as `default` a function
 *   mount(element: HTMLElement, props: object): void
 * Modules are only loaded when a page needs them.
 */
export const WIDGETS = {
  // Lecture 1: Graph intro
  'graph-builder': () => import('./graph-builder.js'),
  'neighborhood': () => import('./neighborhood.js'),
  'handshake': () => import('./handshake.js'),
  'degree-sequence': () => import('./degree-sequence.js'),
  'degree-stats': () => import('./degree-stats.js'),
  'subgraph': () => import('./subgraph.js'),
  'isomorphism': () => import('./isomorphism.js'),
  'automorphisms': () => import('./automorphisms.js'),
  'regularize': () => import('./regularize.js'),
  'dense-subgraph': () => import('./dense-subgraph.js'),
};

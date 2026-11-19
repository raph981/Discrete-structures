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
  // Lecture 2: walks, paths, cycles, trees
  'walk-builder': () => import('./walk-builder.js'),
  'components': () => import('./components.js'),
  'cycles': () => import('./cycles.js'),
  'tree-explorer': () => import('./tree-explorer.js'),
  'tree-characterizations': () => import('./tree-characterizations.js'),
  // Lecture 3: unique paths, girth, Moore's bound
  'unique-paths': () => import('./unique-paths.js'),
  'girth-distance': () => import('./girth-distance.js'),
  'moore-bound': () => import('./moore-bound.js'),
  'moore-layers': () => import('./moore-layers.js'),
  // Lecture 4: algorithms, running time, spanning trees
  'growth-rates': () => import('./growth-rates.js'),
  'find-max': () => import('./find-max.js'),
  'sorting-bound': () => import('./sorting-bound.js'),
  'adjacency-list': () => import('./adjacency-list.js'),
  'spanning-tree': () => import('./spanning-tree.js'),
  // Lectures 5 and 6: minimum spanning trees, BFS/DFS, bipartite graphs
  'kruskal': () => import('./kruskal.js'),
  'mst-property': () => import('./mst-property.js'),
  'bipartite': () => import('./bipartite.js'),
  // Lecture 7: Eulerian tours, connectivity
  'euler-tour': () => import('./euler-tour.js'),
  'connectivity': () => import('./connectivity.js'),
};

/**
 * Example graphs with drawing positions.
 *
 * Positions refer to the default drawing area of core/graph-view.js (600 × 360 units).
 * Each example: { label, vertices: { id: [x, y] }, edges: [[u, v], …] }.
 * Use `loadExample(key)` to get a fresh Graph and a mutable copy of the positions.
 */
import { Graph } from '../lib/graphs/graph.js';

const ring = (ids, cx, cy, r, startDeg = -90) => Object.fromEntries(ids.map((id, i) => {
  const a = ((startDeg + (360 * i) / ids.length) * Math.PI) / 180;
  return [id, [Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]];
}));

const cycleEdges = (ids) => ids.map((id, i) => [id, ids[(i + 1) % ids.length]]);

const completeEdges = (ids) => ids.flatMap((u, i) => ids.slice(i + 1).map((v) => [u, v]));

export const EXAMPLES = {
  /** The running example drawn throughout the lecture notes (pages 1–5). */
  lecture: {
    label: 'Lecture example',
    vertices: { u: [130, 100], t: [270, 100], v: [130, 280], x: [270, 280], w: [420, 70], y: [500, 220] },
    edges: [['u', 't'], ['u', 'v'], ['v', 'x'], ['t', 'x'], ['u', 'x'], ['t', 'w'], ['w', 'y']],
  },
  path4: {
    label: 'Path P₄',
    vertices: { a: [120, 180], b: [240, 180], c: [360, 180], d: [480, 180] },
    edges: [['a', 'b'], ['b', 'c'], ['c', 'd']],
  },
  star: {
    label: 'Star K₁,₃',
    vertices: { c: [300, 190], a: [300, 60], b: [180, 280], d: [420, 280] },
    edges: [['c', 'a'], ['c', 'b'], ['c', 'd']],
  },
  square: {
    label: 'Cycle C₄',
    vertices: { a: [200, 80], b: [400, 80], c: [400, 280], d: [200, 280] },
    edges: cycleEdges(['a', 'b', 'c', 'd']),
  },
  c5: {
    label: 'Cycle C₅',
    vertices: ring(['1', '2', '3', '4', '5'], 300, 185, 140),
    edges: cycleEdges(['1', '2', '3', '4', '5']),
  },
  k4: {
    label: 'Complete K₄',
    vertices: { a: [200, 80], b: [400, 80], c: [400, 280], d: [200, 280] },
    edges: completeEdges(['a', 'b', 'c', 'd']),
  },
  k5: {
    label: 'Complete K₅',
    vertices: ring(['a', 'b', 'c', 'd', 'e'], 300, 185, 140),
    edges: completeEdges(['a', 'b', 'c', 'd', 'e']),
  },
  cube: {
    label: 'Cube Q₃',
    vertices: {
      a: [150, 90], b: [370, 90], c: [370, 300], d: [150, 300],
      e: [230, 50], f: [450, 50], g: [450, 250], h: [230, 250],
    },
    edges: [
      ...cycleEdges(['a', 'b', 'c', 'd']), ...cycleEdges(['e', 'f', 'g', 'h']),
      ['a', 'e'], ['b', 'f'], ['c', 'g'], ['d', 'h'],
    ],
  },
  petersen: {
    label: 'Petersen graph',
    vertices: { ...ring(['1', '2', '3', '4', '5'], 300, 190, 150), ...ring(['6', '7', '8', '9', '10'], 300, 190, 70) },
    edges: [
      ...cycleEdges(['1', '2', '3', '4', '5']),
      ['1', '6'], ['2', '7'], ['3', '8'], ['4', '9'], ['5', '10'],
      ['6', '8'], ['8', '10'], ['10', '7'], ['7', '9'], ['9', '6'],
    ],
  },
  /** A dense core (K₄) with a sparse "tail": the min-degree deletion process peels the tail off. */
  coreWithTail: {
    label: 'K₄ with a tail',
    vertices: {
      a: [400, 90], b: [540, 90], c: [540, 260], d: [400, 260],
      p: [280, 175], q: [160, 175], r: [60, 100], s: [60, 250], z: [160, 300],
    },
    edges: [...completeEdges(['a', 'b', 'c', 'd']), ['a', 'p'], ['p', 'q'], ['q', 'r'], ['q', 's'], ['q', 'z']],
  },
  /** Lecture 2 example (walks, paths, cycles): square a–b–f–e with diagonal af and a tail b–c–d. */
  walks: {
    label: 'Lecture 2 example',
    vertices: { a: [130, 110], b: [290, 110], c: [400, 60], d: [510, 130], e: [130, 280], f: [290, 280] },
    edges: [['a', 'b'], ['a', 'e'], ['a', 'f'], ['b', 'f'], ['e', 'f'], ['b', 'c'], ['c', 'd']],
  },
  /** Lecture 2: a graph with five components (as in the notes). */
  components: {
    label: 'Five components',
    vertices: {
      a: [50, 120], b: [130, 90], c: [80, 250], d: [180, 110], e: [190, 270], f: [240, 130], g: [270, 270], h: [300, 130],
      i: [400, 70], j: [340, 180], k: [400, 180], l: [460, 180], m: [400, 290], n: [540, 90],
    },
    edges: [['a', 'b'], ['a', 'c'], ['b', 'c'], ['d', 'e'], ['f', 'g'], ['g', 'h'], ['i', 'k'], ['j', 'k'], ['k', 'l'], ['k', 'm']],
  },
  tree: {
    label: 'A tree',
    vertices: {
      a: [300, 60], b: [180, 150], c: [420, 150], d: [100, 250], e: [230, 260], f: [360, 260], g: [490, 250], h: [560, 330], i: [40, 330],
    },
    edges: [['a', 'b'], ['a', 'c'], ['b', 'd'], ['b', 'e'], ['c', 'f'], ['c', 'g'], ['g', 'h'], ['d', 'i']],
  },
  forest: {
    label: 'A forest',
    vertices: { a: [90, 90], b: [60, 230], c: [170, 230], d: [300, 80], e: [300, 200], f: [300, 320], g: [440, 120], h: [540, 120], i: [490, 260] },
    edges: [['a', 'b'], ['a', 'c'], ['d', 'e'], ['e', 'f'], ['g', 'h'], ['g', 'i']],
  },
  k33: {
    label: 'K₃,₃',
    vertices: { a: [150, 80], b: [300, 80], c: [450, 80], x: [150, 290], y: [300, 290], z: [450, 290] },
    edges: ['a', 'b', 'c'].flatMap((u) => ['x', 'y', 'z'].map((v) => [u, v])),
  },
  heawood: {
    label: 'Heawood graph',
    vertices: ring(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'], 300, 182, 160),
    edges: [
      ...cycleEdges(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14']),
      ['1', '6'], ['3', '8'], ['5', '10'], ['7', '12'], ['9', '14'], ['11', '2'], ['13', '4'],
    ],
  },
  /** Lecture 4: the adjacency-list example (same shape as the lecture 2 example, labeled 1–6). */
  numbered: {
    label: 'Lecture 4 example',
    vertices: { 1: [130, 110], 2: [290, 110], 3: [400, 60], 4: [510, 130], 5: [130, 280], 6: [290, 280] },
    edges: [['1', '2'], ['1', '5'], ['1', '6'], ['2', '3'], ['2', '6'], ['3', '4'], ['5', '6']],
  },
  grid: {
    label: '3 × 4 grid',
    vertices: Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'].map((id, i) => [id, [120 + 120 * (i % 4), 70 + 110 * Math.floor(i / 4)]])),
    edges: [
      ['a', 'b'], ['b', 'c'], ['c', 'd'], ['e', 'f'], ['f', 'g'], ['g', 'h'], ['i', 'j'], ['j', 'k'], ['k', 'l'],
      ['a', 'e'], ['e', 'i'], ['b', 'f'], ['f', 'j'], ['c', 'g'], ['g', 'k'], ['d', 'h'], ['h', 'l'],
    ],
  },
  /** Lecture 7: Königsberg with the parallel bridges subdivided (blue vertices p, q in the notes). */
  konigsberg: {
    label: 'Königsberg (subdivided)',
    vertices: { N: [300, 50], I: [230, 190], E: [470, 190], S: [300, 320], p: [130, 110], q: [130, 260] },
    edges: [['N', 'I'], ['N', 'p'], ['p', 'I'], ['S', 'I'], ['S', 'q'], ['q', 'I'], ['I', 'E'], ['N', 'E'], ['S', 'E']],
  },
  /** Lecture 7: a graph with all degrees even (a triangle and a pentagon sharing vertex c). */
  eulerian: {
    label: 'All degrees even',
    vertices: { a: [90, 90], b: [90, 270], c: [230, 180], d: [370, 90], e: [370, 270], f: [510, 90], g: [510, 270] },
    edges: [['a', 'b'], ['b', 'c'], ['c', 'a'], ['c', 'd'], ['e', 'c'], ['d', 'f'], ['f', 'g'], ['g', 'e']],
  },
  /** Two K₄'s glued along a single vertex – that vertex is a separator of size 1. */
  bowtie: {
    label: 'Two K₄ sharing a vertex',
    vertices: { a: [80, 90], b: [80, 270], c: [200, 180], x: [300, 180], d: [400, 180], e: [520, 90], f: [520, 270] },
    edges: [
      ...completeEdges(['a', 'b', 'c', 'x']), ...completeEdges(['x', 'd', 'e', 'f']),
    ],
  },
  c6: {
    label: 'Cycle C₆',
    vertices: ring(['a', 'b', 'c', 'd', 'e', 'f'], 300, 185, 140),
    edges: cycleEdges(['a', 'b', 'c', 'd', 'e', 'f']),
  },
  empty: {
    label: 'Empty',
    vertices: {},
    edges: [],
  },
};

/** Pairs of graphs for the isomorphism widget. Vertices of H use letters, those of G digits. */
export const ISOMORPHISM_PAIRS = {
  pentagram: {
    label: 'C₅ vs. pentagram',
    G: EXAMPLES.c5,
    H: {
      vertices: ring(['a', 'b', 'c', 'd', 'e'], 300, 185, 140),
      edges: [['a', 'c'], ['c', 'e'], ['e', 'b'], ['b', 'd'], ['d', 'a']],
    },
  },
  lectureRedrawn: {
    label: 'Lecture example, redrawn',
    G: {
      vertices: { 1: [130, 100], 2: [270, 100], 3: [130, 280], 4: [270, 280], 5: [420, 70], 6: [500, 220] },
      edges: [['1', '2'], ['1', '3'], ['3', '4'], ['2', '4'], ['1', '4'], ['2', '5'], ['5', '6']],
    },
    H: {
      vertices: { a: [90, 180], b: [210, 80], c: [210, 280], d: [330, 180], e: [450, 180], f: [550, 180] },
      edges: [['a', 'b'], ['a', 'c'], ['b', 'c'], ['b', 'd'], ['c', 'd'], ['d', 'e'], ['e', 'f']],
    },
  },
  k33: {
    label: 'K₃,₃ vs. hexagon with diagonals',
    G: {
      vertices: { 1: [150, 80], 2: [300, 80], 3: [450, 80], 4: [150, 290], 5: [300, 290], 6: [450, 290] },
      edges: ['1', '2', '3'].flatMap((u) => ['4', '5', '6'].map((v) => [u, v])),
    },
    H: {
      vertices: ring(['a', 'b', 'c', 'd', 'e', 'f'], 300, 185, 140),
      edges: [...cycleEdges(['a', 'b', 'c', 'd', 'e', 'f']), ['a', 'd'], ['b', 'e'], ['c', 'f']],
    },
  },
  prism: {
    label: 'K₃,₃ vs. prism (not isomorphic)',
    G: {
      vertices: { 1: [150, 80], 2: [300, 80], 3: [450, 80], 4: [150, 290], 5: [300, 290], 6: [450, 290] },
      edges: ['1', '2', '3'].flatMap((u) => ['4', '5', '6'].map((v) => [u, v])),
    },
    H: {
      vertices: { a: [300, 50], b: [140, 310], c: [460, 310], d: [300, 150], e: [230, 250], f: [370, 250] },
      edges: [...cycleEdges(['a', 'b', 'c']), ...cycleEdges(['d', 'e', 'f']), ['a', 'd'], ['b', 'e'], ['c', 'f']],
    },
  },
  c6: {
    label: 'C₆ vs. two triangles (not isomorphic)',
    G: { vertices: ring(['1', '2', '3', '4', '5', '6'], 300, 185, 140), edges: cycleEdges(['1', '2', '3', '4', '5', '6']) },
    H: {
      vertices: { ...ring(['a', 'b', 'c'], 170, 200, 100), ...ring(['d', 'e', 'f'], 430, 200, 100) },
      edges: [...cycleEdges(['a', 'b', 'c']), ...cycleEdges(['d', 'e', 'f'])],
    },
  },
};

/**
 * Turns an example description into a Graph and a fresh positions object.
 * @returns {{graph: Graph, positions: Record<string, {x: number, y: number}>}}
 */
export function fromSpec(spec) {
  const ids = Object.keys(spec.vertices);
  return {
    graph: new Graph(ids, spec.edges),
    positions: Object.fromEntries(ids.map((id) => [id, { x: spec.vertices[id][0], y: spec.vertices[id][1] }])),
  };
}

/** @param {keyof EXAMPLES} key */
export function loadExample(key) {
  const spec = EXAMPLES[key];
  if (!spec) throw new Error(`Unknown example graph "${key}"`);
  return fromSpec(spec);
}

/** Example list for chip rows: [{ key, label }]. */
export function exampleChoices(keys) {
  return keys.map((key) => ({ key, label: EXAMPLES[key].label }));
}

/**
 * Edge weights for the MST widgets, keyed by example. Keys are "u|v" with u < v (see edgeKey).
 */
export const WEIGHTS = {
  walks: { 'a|b': 4, 'a|e': 2, 'a|f': 3, 'b|f': 5, 'e|f': 6, 'b|c': 1, 'c|d': 7 },
  grid: {
    'a|b': 3, 'b|c': 5, 'c|d': 2, 'e|f': 4, 'f|g': 1, 'g|h': 6, 'i|j': 7, 'j|k': 2, 'k|l': 4,
    'a|e': 6, 'e|i': 1, 'b|f': 2, 'f|j': 5, 'c|g': 3, 'g|k': 4, 'd|h': 5, 'h|l': 3,
  },
  k5: { 'a|b': 3, 'a|c': 7, 'a|d': 4, 'a|e': 2, 'b|c': 1, 'b|d': 6, 'b|e': 5, 'c|d': 2, 'c|e': 8, 'd|e': 3 },
  petersen: {
    '1|2': 5, '2|3': 3, '3|4': 6, '4|5': 2, '1|5': 4, '1|6': 1, '2|7': 7, '3|8': 2, '4|9': 5, '10|5': 3,
    '6|8': 6, '10|8': 4, '10|7': 1, '7|9': 3, '6|9': 2,
  },
};

/**
 * Example graph together with its weights as a Map (missing weights default to 1).
 * @returns {{graph: Graph, positions: object, weights: Map<string, number>}}
 */
export function loadWeightedExample(key) {
  const { graph, positions } = loadExample(key);
  const given = WEIGHTS[key] ?? {};
  const weights = new Map(graph.edges.map(([u, v]) => {
    const k = u < v ? `${u}|${v}` : `${v}|${u}`;
    return [k, given[k] ?? 1];
  }));
  return { graph, positions, weights };
}

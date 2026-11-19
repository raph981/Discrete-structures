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

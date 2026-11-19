/**
 * Spanning trees: the exploration algorithm from lecture 4 (with BFS / DFS choice of v ∈ Q),
 * Kruskal's algorithm with component labels (lectures 5 and 6) and the MST property.
 */
import { edgeKey } from './graph.js';
import { allPaths, isConnected } from './paths.js';

/**
 * The spanning tree algorithm, one entry per execution of Step 3.
 *   Step 1: R := {s}, Q := {s}, T := ∅
 *   Step 2: if Q = ∅ stop, else choose v ∈ Q
 *   Step 3: if some w ∈ N(v) \ R exists: R := R ∪ {w}, Q := Q ∪ {w}, T := T ∪ {vw}; else Q := Q \ {v}
 * @param {'bfs'|'dfs'} strategy  bfs: v = vertex that joined Q first (queue); dfs: joined last (stack)
 * @returns {{R: string[], Q: string[], T: [string, string][], v: string|null, w: string|null,
 *            action: 'start'|'add'|'remove', tested: number}[]}
 *   tested: number of (v, w) pairs examined so far (each edge is examined at most twice)
 */
export function spanningTreeSteps(G, s, strategy = 'bfs') {
  const R = [s];
  const inR = new Set(R);
  const Q = [s];
  const T = [];
  let tested = 0;
  const snapshot = (extra) => ({ R: [...R], Q: [...Q], T: T.map((e) => [...e]), tested, ...extra });
  const steps = [snapshot({ v: null, w: null, action: 'start' })];
  // position of the next neighbor to test for each vertex ("look at each neighbor of v in turn")
  const pointer = new Map();
  const sortedNeighbors = new Map(G.vertices.map((v) => [v, [...G.neighbors(v)].sort()]));

  while (Q.length) {
    const v = strategy === 'dfs' ? Q.at(-1) : Q[0];
    const list = sortedNeighbors.get(v);
    let k = pointer.get(v) ?? 0;
    while (k < list.length && inR.has(list[k])) { k++; tested++; }
    if (k < list.length) {
      const w = list[k];
      tested++;
      pointer.set(v, k + 1);
      R.push(w); inR.add(w); Q.push(w); T.push([v, w]);
      steps.push(snapshot({ v, w, action: 'add' }));
    } else {
      pointer.set(v, k);
      Q.splice(Q.indexOf(v), 1);
      steps.push(snapshot({ v, w: null, action: 'remove' }));
    }
  }
  return steps;
}

/** Total weight of a set of edges. */
export function weightOf(edges, weights) {
  return edges.reduce((sum, [u, v]) => sum + weights.get(edgeKey(u, v)), 0);
}

/** Edges sorted by weight; ties broken by the edge key so the order is reproducible. */
export function sortedEdges(G, weights) {
  return [...G.edges].sort((a, b) => weights.get(edgeKey(...a)) - weights.get(edgeKey(...b))
    || edgeKey(...a).localeCompare(edgeKey(...b)));
}

/**
 * Kruskal's algorithm with component labels: two endpoints are connected in T iff they carry the same
 * label; when two components merge, the smaller one is relabeled.
 * @returns {{edge: [string, string]|null, weight: number|null, accepted: boolean|null, T: [string, string][],
 *            labels: Map<string, string>, relabeled: string[], relabelTotal: number}[]}
 */
export function kruskalSteps(G, weights) {
  const labels = new Map(G.vertices.map((v) => [v, v]));
  const members = new Map(G.vertices.map((v) => [v, [v]]));
  const T = [];
  let relabelTotal = 0;
  const steps = [{ edge: null, weight: null, accepted: null, T: [], labels: new Map(labels), relabeled: [], relabelTotal }];
  for (const [u, v] of sortedEdges(G, weights)) {
    const lu = labels.get(u);
    const lv = labels.get(v);
    let relabeled = [];
    const accepted = lu !== lv;
    if (accepted) {
      T.push([u, v]);
      const [small, big] = members.get(lu).length <= members.get(lv).length ? [lu, lv] : [lv, lu];
      relabeled = members.get(small);
      for (const x of relabeled) labels.set(x, big);
      members.set(big, [...members.get(big), ...relabeled]);
      members.delete(small);
      relabelTotal += relabeled.length;
    }
    steps.push({ edge: [u, v], weight: weights.get(edgeKey(u, v)), accepted, T: T.map((e) => [...e]), labels: new Map(labels), relabeled, relabelTotal });
  }
  return steps;
}

/** Is the edge set a spanning tree of G? */
export function isSpanningTree(G, edges) {
  if (edges.length !== G.order - 1) return false;
  const T = G.clone();
  for (const [u, v] of G.edges) T.removeEdge(u, v);
  for (const [u, v] of edges) {
    if (!G.hasEdge(u, v)) return false;
    T.addEdge(u, v);
  }
  return isConnected(T);
}

/**
 * MST property check: for every non-tree edge (x, y), no edge on the x–y path in T may be heavier.
 * @returns {{edge: [string, string], path: string[], heavier: [string, string][]}[]}  violations
 */
export function mstViolations(G, weights, treeEdges) {
  const T = G.clone();
  for (const [u, v] of G.edges) T.removeEdge(u, v);
  for (const [u, v] of treeEdges) T.addEdge(u, v);
  const inTree = new Set(treeEdges.map(([u, v]) => edgeKey(u, v)));
  const result = [];
  for (const [x, y] of G.edges) {
    if (inTree.has(edgeKey(x, y))) continue;
    const [path] = allPaths(T, x, y, 1);
    if (!path) continue;
    const w = weights.get(edgeKey(x, y));
    const heavier = path.slice(1).map((b, i) => [path[i], b]).filter(([a, b]) => weights.get(edgeKey(a, b)) > w);
    if (heavier.length) result.push({ edge: [x, y], path, heavier });
  }
  return result;
}

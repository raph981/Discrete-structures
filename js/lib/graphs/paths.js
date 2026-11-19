/**
 * Walks, paths, cycles, components and distances.
 *
 * A walk is a sequence of vertices in which consecutive vertices are adjacent.
 * A path is a walk without repeated vertices. A cycle is a closed walk with at least
 * three distinct vertices and no other repetitions (stored here without repeating the start).
 */

/**
 * Classifies a vertex sequence.
 * @returns {{isWalk: boolean, brokenAt: number, isPath: boolean, isClosed: boolean, isCycle: boolean,
 *            edges: [string, string][]}}
 *   brokenAt: index i such that seq[i−1], seq[i] are not adjacent (−1 if it is a walk)
 */
export function classifyWalk(G, seq) {
  let brokenAt = -1;
  for (let i = 1; i < seq.length; i++) {
    if (!G.hasEdge(seq[i - 1], seq[i])) { brokenAt = i; break; }
  }
  const isWalk = seq.length > 0 && seq.every((v) => G.hasVertex(v)) && brokenAt === -1;
  const isPath = isWalk && new Set(seq).size === seq.length;
  const isClosed = isWalk && seq.length > 1 && seq[0] === seq.at(-1);
  const inner = seq.slice(0, -1);
  const isCycle = isClosed && new Set(inner).size === inner.length && inner.length >= 3;
  const edges = isWalk ? seq.slice(1).map((v, i) => [seq[i], v]) : [];
  return { isWalk, brokenAt, isPath, isClosed, isCycle, edges };
}

/**
 * Turns a u–v walk into a u–v path as in the proof of the Claim: while some vertex w repeats,
 * delete everything between the first and the last occurrence of w (and one copy of w).
 * @returns {{walk: string[], removed: string[], vertex: string|null}[]}  all intermediate walks
 */
export function shortcutSteps(walk) {
  const steps = [{ walk: [...walk], removed: [], vertex: null }];
  let current = [...walk];
  for (;;) {
    const i = current.findIndex((v, k) => current.indexOf(v) !== k);
    if (i === -1) return steps;
    const w = current[i];
    const first = current.indexOf(w);
    const removed = current.slice(first + 1, i + 1);
    current = [...current.slice(0, first + 1), ...current.slice(i + 1)];
    steps.push({ walk: current, removed, vertex: w });
  }
}

/** Connected components as arrays of vertices (in vertex order of their first vertex). */
export function components(G) {
  const seen = new Set();
  const result = [];
  for (const s of G.vertices) {
    if (seen.has(s)) continue;
    const comp = [s];
    seen.add(s);
    for (let k = 0; k < comp.length; k++) {
      for (const w of G.neighbors(comp[k])) {
        if (!seen.has(w)) { seen.add(w); comp.push(w); }
      }
    }
    result.push(comp);
  }
  return result;
}

/** G is connected if it has exactly one component (the graph without vertices counts as connected). */
export function isConnected(G) {
  return components(G).length <= 1;
}

/**
 * Breadth-first distances from s.
 * @returns {{dist: Map<string, number>, parent: Map<string, string|null>, layers: string[][]}}
 *   layers[i] = N_i = { u : dist(s, u) = i }; unreachable vertices are missing from `dist`.
 */
export function bfs(G, s) {
  const dist = new Map([[s, 0]]);
  const parent = new Map([[s, null]]);
  const order = [s];
  for (let k = 0; k < order.length; k++) {
    const v = order[k];
    for (const w of [...G.neighbors(v)].sort()) {
      if (!dist.has(w)) {
        dist.set(w, dist.get(v) + 1);
        parent.set(w, v);
        order.push(w);
      }
    }
  }
  const layers = [];
  for (const v of order) (layers[dist.get(v)] ??= []).push(v);
  return { dist, parent, layers };
}

/** dist_G(u, v): number of edges on a shortest u–v path, Infinity if none exists. */
export function distance(G, u, v) {
  return bfs(G, u).dist.get(v) ?? Infinity;
}

/** A shortest u–v path as a vertex list, or null. */
export function shortestPath(G, u, v) {
  const { parent } = bfs(G, u);
  if (!parent.has(v)) return null;
  const path = [v];
  while (path[0] !== u) path.unshift(parent.get(path[0]));
  return path;
}

/** All u–v paths (as vertex lists), at most `limit`. */
export function allPaths(G, u, v, limit = 1000) {
  const result = [];
  const path = [u];
  const onPath = new Set([u]);
  (function extend(x) {
    if (result.length >= limit) return;
    if (x === v) { result.push([...path]); return; }
    for (const w of [...G.neighbors(x)].sort()) {
      if (onPath.has(w)) continue;
      path.push(w); onPath.add(w);
      extend(w);
      path.pop(); onPath.delete(w);
    }
  }(u));
  return result;
}

/**
 * All cycles of G, each listed once as a vertex array [c₀, …, c_{k−1}] (closing edge c_{k−1}c₀ implied).
 * Canonical form: c₀ is the earliest vertex of the cycle in vertex order, and c₁ comes before c_{k−1}.
 */
export function allCycles(G, limit = 5000) {
  const index = new Map(G.vertices.map((v, i) => [v, i]));
  const cycles = [];
  for (const s of G.vertices) {
    const path = [s];
    const onPath = new Set([s]);
    const extend = (x) => {
      if (cycles.length >= limit) return;
      for (const w of G.neighbors(x)) {
        if (w === s && path.length >= 3 && index.get(path[1]) < index.get(path.at(-1))) cycles.push([...path]);
        if (onPath.has(w) || index.get(w) < index.get(s)) continue;
        path.push(w); onPath.add(w);
        extend(w);
        path.pop(); onPath.delete(w);
      }
    };
    extend(s);
  }
  return cycles;
}

/** Girth g(G): length of a shortest cycle (Infinity for forests), together with one shortest cycle. */
export function girth(G) {
  let best = null;
  for (const c of allCycles(G)) if (!best || c.length < best.length) best = c;
  return { girth: best ? best.length : Infinity, cycle: best };
}

/** Edges of a cycle given as vertex array (including the closing edge). */
export function cycleEdges(cycle) {
  return cycle.map((v, i) => [v, cycle[(i + 1) % cycle.length]]);
}

/**
 * Lemma "2 paths give a cycle": from two different u–v paths P and Q, extract a cycle as in the proof.
 * Let i be the first index where P and Q differ, and a_j the first vertex of P after that which lies on Q
 * (it exists, because v lies on both). Then P from a_{i−1} to a_j, followed by Q backwards from a_j to
 * a_{i−1}, is a cycle.
 * @returns {string[]|null}  the cycle as a vertex array (closing edge implied), or null if P = Q
 */
export function cycleFromTwoPaths(P, Q) {
  let i = 0;
  while (i < P.length && i < Q.length && P[i] === Q[i]) i++;
  if (i === P.length && i === Q.length) return null;
  const onQ = new Map(Q.map((v, k) => [v, k]));
  let j = i;
  while (!onQ.has(P[j])) j++;
  const m = onQ.get(P[j]);
  return [...P.slice(i - 1, j + 1), ...Q.slice(i, m).reverse()];
}

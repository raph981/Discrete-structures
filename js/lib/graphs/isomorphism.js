/**
 * Isomorphisms and automorphisms.
 *
 * A bijection f: V(G) → V(H) is an isomorphism if for all distinct u, v
 *   {u, v} ∈ E(G)  ⇔  {f(u), f(v)} ∈ E(H).
 * An automorphism is an isomorphism from G to itself.
 *
 * The search is plain backtracking with simple pruning by degrees; for the small
 * graphs on this site (up to about 12 vertices) that is fast enough.
 */
import { degreeSequence } from './degrees.js';

/**
 * Checks a (possibly partial) assignment f (Map or object u → f(u)).
 * @returns {{complete: boolean, injective: boolean, pairs: {u: string, v: string, inG: boolean, inH: boolean, ok: boolean}[],
 *            isIsomorphism: boolean}}
 *   pairs: all pairs {u, v} of assigned vertices that are an edge in G or whose images are an edge in H
 */
export function checkMapping(G, H, mapping) {
  const f = mapping instanceof Map ? mapping : new Map(Object.entries(mapping));
  const mapped = G.vertices.filter((v) => f.has(v));
  const images = mapped.map((v) => f.get(v));
  const injective = new Set(images).size === images.length;
  const complete = mapped.length === G.order && G.order === H.order;
  const pairs = [];
  for (let i = 0; i < mapped.length; i++) {
    for (let j = i + 1; j < mapped.length; j++) {
      const u = mapped[i];
      const v = mapped[j];
      const inG = G.hasEdge(u, v);
      const inH = H.hasEdge(f.get(u), f.get(v));
      if (inG || inH) pairs.push({ u, v, inG, inH, ok: inG === inH });
    }
  }
  return { complete, injective, pairs, isIsomorphism: complete && injective && pairs.every((p) => p.ok) };
}

/**
 * Generates all isomorphisms G → H (as Maps), at most `limit` of them.
 * @returns {Map<string, string>[]}
 */
export function findIsomorphisms(G, H, { limit = Infinity } = {}) {
  if (G.order !== H.order || G.size !== H.size) return [];
  const sg = degreeSequence(G);
  const sh = degreeSequence(H);
  if (sg.some((d, i) => d !== sh[i])) return [];

  // Fix high-degree vertices first: this prunes the search tree early.
  const order = [...G.vertices].sort((a, b) => G.degree(b) - G.degree(a));
  const targets = H.vertices;
  const f = new Map();
  const used = new Set();
  const results = [];

  function consistent(u, image) {
    if (G.degree(u) !== H.degree(image)) return false;
    for (const [w, wImage] of f) {
      if (G.hasEdge(u, w) !== H.hasEdge(image, wImage)) return false;
    }
    return true;
  }

  function extend(k) {
    if (results.length >= limit) return;
    if (k === order.length) {
      results.push(new Map(f));
      return;
    }
    const u = order[k];
    for (const image of targets) {
      if (used.has(image) || !consistent(u, image)) continue;
      f.set(u, image);
      used.add(image);
      extend(k + 1);
      f.delete(u);
      used.delete(image);
    }
  }

  extend(0);
  // Return results in the vertex order of G (more readable)
  return results.map((m) => new Map(G.vertices.map((v) => [v, m.get(v)])));
}

/** One isomorphism G → H, or null. */
export function findIsomorphism(G, H) {
  return findIsomorphisms(G, H, { limit: 1 })[0] ?? null;
}

/** All automorphisms of G; the trivial one (identity) always comes first. */
export function automorphisms(G, options) {
  const all = findIsomorphisms(G, G, options);
  const isIdentity = (f) => [...f].every(([u, v]) => u === v);
  return all.sort((a, b) => Number(isIdentity(b)) - Number(isIdentity(a)));
}

/** Vertices not fixed by f. */
export function movedVertices(f) {
  return [...f].filter(([u, v]) => u !== v).map(([u]) => u);
}

/**
 * Cycle notation of a permutation f of a vertex set, e.g. "(u x)" or "(1 2 3)(4 5)";
 * the identity is written "id". Fixed points are omitted.
 */
export function cycleNotation(f) {
  const seen = new Set();
  const cycles = [];
  for (const start of f.keys()) {
    if (seen.has(start)) continue;
    const cycle = [];
    for (let v = start; !seen.has(v); v = f.get(v)) {
      seen.add(v);
      cycle.push(v);
    }
    if (cycle.length > 1) cycles.push(`(${cycle.join(' ')})`);
  }
  return cycles.length ? cycles.join('') : 'id';
}

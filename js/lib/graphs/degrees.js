/**
 * Degree-based quantities: degree sequence, δ(G), Δ(G), d(G), ε(G), regularity
 * and the incidence matrix (the picture behind the Handshake Lemma).
 */

/** Degrees of all vertices as a Map v → d(v). */
export function degrees(G) {
  return new Map(G.vertices.map((v) => [v, G.degree(v)]));
}

/** Degree sequence, sorted in decreasing order. */
export function degreeSequence(G) {
  return G.vertices.map((v) => G.degree(v)).sort((a, b) => b - a);
}

/**
 * Key figures of a graph.
 * For the graph without vertices, δ, Δ, d and ε are undefined (null).
 * @returns {{order: number, size: number, degreeSum: number, min: number|null, max: number|null,
 *            average: number|null, density: number|null}}
 */
export function degreeStats(G) {
  const ds = G.vertices.map((v) => G.degree(v));
  const order = G.order;
  const size = G.size;
  const degreeSum = ds.reduce((s, d) => s + d, 0);
  return {
    order,
    size,
    degreeSum,
    min: order ? Math.min(...ds) : null, // δ(G)
    max: order ? Math.max(...ds) : null, // Δ(G)
    average: order ? degreeSum / order : null, // d(G) = 2e(G)/v(G)
    density: order ? size / order : null, // ε(G) = e(G)/v(G)
  };
}

/** Vertices of minimum degree (in vertex order). */
export function minDegreeVertices(G) {
  const { min } = degreeStats(G);
  return G.vertices.filter((v) => G.degree(v) === min);
}

/** Is G r-regular? Without r: do all vertices have the same degree? */
export function isRegular(G, r) {
  const ds = G.vertices.map((v) => G.degree(v));
  if (ds.length === 0) return true;
  const target = r ?? ds[0];
  return ds.every((d) => d === target);
}

/**
 * Incidence matrix: rows = vertices, columns = edges, entry 1 iff the vertex
 * and the edge are incident.
 * Row sums are the degrees; every column sum is 2.
 */
export function incidenceMatrix(G) {
  const vertices = G.vertices;
  const edges = G.edges;
  const rows = vertices.map((v) => edges.map(([a, b]) => (a === v || b === v ? 1 : 0)));
  return {
    vertices,
    edges,
    rows,
    rowSums: rows.map((r) => r.reduce((s, x) => s + x, 0)),
    columnSums: edges.map(() => 2),
  };
}

/**
 * Checks whether a sequence of non-negative integers is the degree sequence of a simple graph
 * (Havel–Hakimi). Also reports whether the sum is even (necessary by the Handshake Lemma).
 */
export function isGraphicSequence(sequence) {
  const evenSum = sequence.reduce((s, d) => s + d, 0) % 2 === 0;
  let rest = [...sequence].sort((a, b) => b - a);
  if (rest.some((d) => d < 0 || !Number.isInteger(d))) return { graphic: false, evenSum };
  while (rest.length && rest[0] > 0) {
    const [d, ...others] = rest;
    if (d > others.length) return { graphic: false, evenSum };
    for (let i = 0; i < d; i++) {
      others[i] -= 1;
      if (others[i] < 0) return { graphic: false, evenSum };
    }
    rest = others.sort((a, b) => b - a);
  }
  return { graphic: true, evenSum };
}

/**
 * Simple graphs G = (V, E) with E ⊆ (V choose 2): undirected, no loops, no multi-edges.
 *
 * Vertices are strings (labels). Edges are unordered pairs of distinct vertices;
 * loops are excluded by the definition and rejected with an error, and adding an
 * existing edge again has no effect (E is a set).
 *
 * The class is deliberately small and knows nothing about the DOM. Where vertices
 * are drawn on screen (positions) is managed separately.
 */
export class Graph {
  /** @type {Map<string, Set<string>>} */
  #adjacency = new Map();

  /**
   * @param {Iterable<string>} [vertices]
   * @param {Iterable<[string, string]>} [edges]
   */
  constructor(vertices = [], edges = []) {
    for (const v of vertices) this.addVertex(v);
    for (const [u, v] of edges) this.addEdge(u, v);
  }

  /** Vertex set V(G) in insertion order. */
  get vertices() {
    return [...this.#adjacency.keys()];
  }

  /** Edge set E(G); each edge exactly once as [u, v], with u before v in vertex order. */
  get edges() {
    const index = new Map(this.vertices.map((v, i) => [v, i]));
    const result = [];
    for (const [u, neighbors] of this.#adjacency) {
      for (const w of neighbors) if (index.get(u) < index.get(w)) result.push([u, w]);
    }
    return result;
  }

  /** v(G) = |V(G)| */
  get order() {
    return this.#adjacency.size;
  }

  /** e(G) = |E(G)| */
  get size() {
    let twice = 0;
    for (const neighbors of this.#adjacency.values()) twice += neighbors.size;
    return twice / 2;
  }

  hasVertex(v) {
    return this.#adjacency.has(v);
  }

  hasEdge(u, v) {
    return this.#adjacency.get(u)?.has(v) ?? false;
  }

  /** Neighborhood N(v) as an array. */
  neighbors(v) {
    return [...this.#requireVertex(v)];
  }

  /** Degree d(v) = |N(v)|. */
  degree(v) {
    return this.#requireVertex(v).size;
  }

  addVertex(v) {
    if (typeof v !== 'string' || v === '') throw new TypeError('Vertices must be non-empty strings');
    if (!this.#adjacency.has(v)) this.#adjacency.set(v, new Set());
    return this;
  }

  /** Removes v together with all incident edges. */
  removeVertex(v) {
    for (const w of this.#requireVertex(v)) this.#adjacency.get(w).delete(v);
    this.#adjacency.delete(v);
    return this;
  }

  addEdge(u, v) {
    if (u === v) throw new Error(`Loop {${u}, ${v}} is not allowed: an edge is a pair of distinct vertices`);
    this.#requireVertex(u).add(v);
    this.#requireVertex(v).add(u);
    return this;
  }

  removeEdge(u, v) {
    this.#requireVertex(u).delete(v);
    this.#requireVertex(v).delete(u);
    return this;
  }

  /** Adds the edge, or removes it if it already exists. */
  toggleEdge(u, v) {
    return this.hasEdge(u, v) ? this.removeEdge(u, v) : this.addEdge(u, v);
  }

  clone() {
    return new Graph(this.vertices, this.edges);
  }

  /** G − x: G without the vertex x and its incident edges (= G[V(G) \ {x}]). */
  without(x) {
    return this.clone().removeVertex(x);
  }

  /** The subgraph G[U] induced on U. */
  induced(U) {
    const keep = new Set(U);
    for (const u of keep) this.#requireVertex(u);
    return new Graph(
      this.vertices.filter((v) => keep.has(v)),
      this.edges.filter(([u, v]) => keep.has(u) && keep.has(v)),
    );
  }

  #requireVertex(v) {
    const neighbors = this.#adjacency.get(v);
    if (!neighbors) throw new Error(`Unknown vertex "${v}"`);
    return neighbors;
  }
}

/** Number of unordered pairs from n elements: |(V choose 2)| = n(n−1)/2. */
export function pairCount(n) {
  return (n * (n - 1)) / 2;
}

/** Unique key of an undirected edge (independent of the order of u and v). */
export function edgeKey(u, v) {
  return u < v ? `${u}|${v}` : `${v}|${u}`;
}

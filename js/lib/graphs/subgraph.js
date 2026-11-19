/**
 * Subgraphs H ⊆ G and induced subgraphs G[U].
 */

/**
 * Is H a subgraph of G, i.e. V(H) ⊆ V(G) and E(H) ⊆ E(G)?
 * @returns {{isSubgraph: boolean, extraVertices: string[], extraEdges: [string, string][]}}
 */
export function checkSubgraph(H, G) {
  const extraVertices = H.vertices.filter((v) => !G.hasVertex(v));
  const extraEdges = H.edges.filter(([u, v]) => !G.hasEdge(u, v));
  return { isSubgraph: extraVertices.length === 0 && extraEdges.length === 0, extraVertices, extraEdges };
}

/**
 * Is H an induced subgraph of G? Besides H ⊆ G, for all u, v ∈ V(H):
 * {u, v} ∈ E(H) ⇔ {u, v} ∈ E(G). Also returns the edges of G between vertices
 * of H that are missing in H – exactly these prevent H from being induced.
 * @returns {{isSubgraph: boolean, isInduced: boolean, missingEdges: [string, string][]}}
 */
export function checkInduced(H, G) {
  const { isSubgraph } = checkSubgraph(H, G);
  if (!isSubgraph) return { isSubgraph, isInduced: false, missingEdges: [] };
  const missingEdges = G.induced(H.vertices).edges.filter(([u, v]) => !H.hasEdge(u, v));
  return { isSubgraph, isInduced: missingEdges.length === 0, missingEdges };
}

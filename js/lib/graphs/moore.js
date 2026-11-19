/**
 * Moore's bound (lecture 3): if δ(G) ≥ δ ≥ 3 and g(G) ≥ g ≥ 3, then |V(G)| ≥ n₀(δ, g), where
 *   g = 2r:      n₀ = 2 · Σ_{i=0}^{r−1} (δ−1)^i
 *   g = 2r + 1:  n₀ = 1 + δ · Σ_{i=0}^{r−1} (δ−1)^i
 */
export function mooreBound(delta, g) {
  const r = Math.floor(g / 2);
  let sum = 0;
  for (let i = 0; i < r; i++) sum += (delta - 1) ** i;
  return g % 2 === 0 ? 2 * sum : 1 + delta * sum;
}

/** Lower bound on |N_i| from the proof (odd girth 2r + 1, i ≤ r): |N₀| = 1, |N_i| ≥ δ(δ−1)^{i−1}. */
export function layerBound(delta, i) {
  return i === 0 ? 1 : delta * (delta - 1) ** (i - 1);
}

/** log₂(n!) – the comparison lower bound for sorting (lecture 4). */
export function log2Factorial(n) {
  let s = 0;
  for (let k = 2; k <= n; k++) s += Math.log2(k);
  return s;
}

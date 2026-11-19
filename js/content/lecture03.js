/**
 * Lecture 3: Unique paths, girth and Moore's bound
 * End of the tree theorem ((i) ⇔ (iv), Lemma "2 paths give a cycle"), girth, distance, shortest paths,
 * and Moore's theorem with the consequence δ(G) ≥ 3 ⇒ g(G) ≤ 2 log₂ |V(G)|.
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const uniquePaths = {
  id: 'unique-paths',
  title: 'Trees have unique paths',
  body: tx`
    ${lead('We finish the theorem on tree “definitions” by showing (i) ⇔ (iv): a graph is a tree exactly when every two vertices are joined by exactly one path.')}
    ${proof(tx`$T$ is certainly connected (every pair has a path). It cannot have a cycle: otherwise, between any two vertices on the cycle there would be
      at least 2 paths – travel around the cycle in either direction.`, '(iv) ⇒ (i)')}
    <p>For (i) ⇒ (iv): $T$ is connected, so for any $u, v$ there is a $u$–$v$ path. We need to show there is not <em>more</em> than one. That follows from a lemma that is useful on its own:</p>
    ${box('lemma', '(2 paths give a cycle)', tx`If a graph $H$ has vertices $u, v$ with at least 2 distinct $u$–$v$ paths, then $H$ contains a cycle.
      ${proof(tx`Let $P$ and $Q$ be two different $u$–$v$ paths. If one of them is just the edge $uv$, the two paths combine to form a cycle. Otherwise write
        $$P = (u, a_1, a_2, \dots, a_k, v), \qquad Q = (u, b_1, b_2, \dots, b_\ell, v)$$
        (with $a_0 = b_0 = u$). Let $i$ be the smallest index with $a_i \ne b_i$ – the place where the paths split. Let $j$ be the smallest index with $j \ge i$ and $a_j \in Q$ –
        the place where $P$ first comes back to $Q$ (it does, since $v \in Q$). Then $a_j = b_m$ for some $m > i - 1$, and
        $$(a_{i-1}, a_i, \dots, a_j = b_m, b_{m-1}, \dots, b_i, b_{i-1} = a_{i-1})$$
        – forwards on $P$, then backwards on $Q$ – is a cycle: its vertices $a_i, \dots, a_{j-1}$ are not on $Q$ by the choice of $j$, so no vertex repeats.`)}`)}
    ${widget('unique-paths', {}, tx`Pick $u$ and $v$. In the lecture 2 graph there are several $e$–$d$ paths; the two highlighted ones split at one vertex and rejoin later, enclosing a cycle. Try the tree: there is always exactly one path.`)}
    <p>So if a tree had two different $u$–$v$ paths, it would contain a cycle – impossible. This proves (i) ⇒ (iv) and completes the theorem.</p>
  `,
};

const girthDistance = {
  id: 'girth-and-distance',
  title: 'Girth and distance',
  body: tx`
    ${lead('Now consider graphs with cycles, but no small cycles.')}
    ${box('definition', '(Girth)', tx`The <dfn>girth</dfn> $g(G)$ of a graph $G$ is the length (number of vertices, also number of edges) of a shortest cycle in $G$.
      If $G$ is a forest, $g(G) = \infty$.`)}
    ${box('definition', '(Distance)', tx`The <dfn>distance</dfn> $\mathrm{dist}_G(u, v)$ between vertices $u$ and $v$ is the minimum number of edges in a $u$–$v$ path.
      If there is no $u$–$v$ path, $\mathrm{dist}_G(u, v) = \infty$.`)}
    ${box('claim', '', tx`If $P$ is a shortest path, then any subpath of $P$ is a shortest path between its endpoints.
      ${proof(tx`If a subpath were not a shortest path, replace that segment of $P$ by a shorter path between the same endpoints. This gives a shorter walk between the endpoints of $P$,
        and hence (by the Claim from lecture 2) a shorter path – so $P$ was not shortest.`, 'Proof (summary)')}`)}
    ${widget('girth-distance', {}, tx`The Petersen graph has girth 5. Click a vertex to see all distances from it, and the sets $N_i = \{u : \mathrm{dist}(v, u) = i\}$ that the next proof uses.`)}
    <p>How big can the girth be? If $G$ is itself a cycle, $g(G) = |V(G)|$. Let's make things interesting: what if every vertex has degree at least 3? Then cycles cannot be long, as we show next:</p>
    $$\delta(G) \ge 3 \implies g(G) \le 2 \log_2 |V(G)|.$$
  `,
};

const moore = {
  id: 'moores-theorem',
  title: "Moore's theorem",
  body: tx`
    ${box('theorem', "(Moore's theorem)", tx`If $\delta(G) \ge \delta \ge 3$ and $g(G) \ge g \ge 3$, then $|V(G)| \ge n_0(\delta, g)$, where
      $$n_0(\delta, g) = \begin{cases} 2 \displaystyle\sum_{i=0}^{r-1} (\delta - 1)^i & \text{if } g = 2r, \\[2ex] 1 + \delta \displaystyle\sum_{i=0}^{r-1} (\delta - 1)^i & \text{if } g = 2r + 1. \end{cases}$$
      The number $n_0(\delta, g)$ is called <dfn>Moore's number</dfn>.`)}
    ${widget('moore-bound', {}, tx`Moore's number for chosen $\delta$ and $g$. The Petersen graph ($\delta = 3$, $g = 5$, 10 vertices) and the Heawood graph ($\delta = 3$, $g = 6$, 14 vertices) meet the bound exactly.`)}
    <h3>Consequence: high minimum degree forces short cycles</h3>
    <p>Suppose the theorem is true, and let $G$ have $\delta(G) \ge 3$ and girth $g$. With $\delta = 3$ we have $\sum_{i=0}^{r-1} 2^i = 2^r - 1$, so
      $$n_0(3, g) = 2\,(2^{g/2} - 1) \ \ (g \text{ even}) \qquad\text{or}\qquad 1 + 3\,(2^{(g-1)/2} - 1) \ \ (g \text{ odd}),$$
      and both are $\ge 2^{g/2}$. Therefore $|V(G)| \ge 2^{g/2}$, i.e. $g \le 2 \log_2 |V(G)|$.</p>
    <h3>Proof of Moore's theorem (for odd $g$)</h3>
    <p>Let $g = 2r + 1$. Choose any vertex $v$ of $G$ and define the distance layers
      $$N_0 = \{v\}, \quad N_1 = N(v), \quad \dots, \quad N_i = \{u \in V(G) : \mathrm{dist}_G(u, v) = i\}.$$
      We bound the sizes of these sets for $0 \le i \le r$. Of course $|N_0| = 1$ and $|N_1| = |N(v)| \ge \delta$.</p>
    ${box('lemma', '1', tx`If $1 \le i \le r$ and $u \in N_i$, then $u$ has exactly one neighbor closer to $v$:
      $$|N(u) \cap (N_0 \cup \dots \cup N_{i-1})| = |N(u) \cap N_{i-1}| = 1.$$
      ${proof(tx`${list([
    tx`$u$ has distance $i$ from $v$, so it cannot be adjacent to a vertex at distance at most $i - 2$ (that would give a shorter route to $u$). So only $N_{i-1}$ matters – the first equality.`,
    tx`A $v$–$u$ path of length $i$ exists, and its vertex before $u$ lies in $N_{i-1}$. So $|N(u) \cap N_{i-1}| \ge 1$.`,
    tx`Suppose $|N(u) \cap N_{i-1}| > 1$. Then there are at least 2 distinct $v$–$u$ paths of length $i$. By the “2 paths give a cycle” lemma, these paths contain a cycle, with at most as many edges as both paths together: at most $2i \le 2r < g(G)$. Contradiction!`,
  ])}`)}`)}
    ${box('lemma', '2', tx`If $i < r$, there are no edges inside $N_i$.
      ${proof(tx`If $w, x \in N_i$ and $wx \in E(G)$, there are 2 distinct $v$–$x$ paths: one of length $i$, and one of length $i + 1$ through $w$.
        By the same reasoning there is a cycle of length at most $i + (i + 1) = 2i + 1 < 2r + 1 = g(G)$. Contradiction.`)}`)}
    ${box('claim', '', tx`For $2 \le i \le r$: $\ |N_i| \ge (\delta - 1)\,|N_{i-1}|$.
      ${proof(tx`A vertex of $N_{i-1}$ has no neighbor in $N_{i-1}$ (Lemma 2, as $i - 1 < r$) and only one neighbor closer to $v$ (Lemma 1).
        Its other $\ge \delta - 1$ neighbors must lie in $N_i$. Counting edges between the layers: $e(N_{i-1}, N_i) \ge (\delta - 1)\,|N_{i-1}|$.
        Moreover, each vertex of $N_i$ is incident to only one edge from $N_{i-1}$ (Lemma 1 again), so $e(N_{i-1}, N_i) = |N_i|$. Hence $|N_i| \ge (\delta - 1)\,|N_{i-1}|$.
        <p class="small">(The notes write $(\delta-1)|N_i|$ in the first inequality; it should be $|N_{i-1}|$, as here.)</p>`)}`)}
    <p>Using the claim repeatedly, starting from $|N_1| \ge \delta$, gives $|N_j| \ge \delta(\delta - 1)^{j-1}$ for all $1 \le j \le r$. Therefore
      $$|V(G)| \ \ge\ \sum_{i=0}^{r} |N_i| \ \ge\ 1 + \delta \sum_{i=0}^{r-1} (\delta - 1)^i = n_0(\delta, g).$$</p>
    ${widget('moore-layers', {}, tx`The layers around a root. In the Petersen graph ($g = 5$, $r = 2$): $|N_0| = 1$, $|N_1| = 3$, $|N_2| = 6$ – exactly the bound, and there are no edges inside $N_0$ or $N_1$. Edges inside the last layer $N_r$ are allowed (red).`)}
    ${exercise(tx`Why does the proof stop at layer $r$ and not continue to $r + 1$?`,
    tx`Lemmas 1 and 2 need short cycles to be impossible: two paths of length $i$ give a cycle of length up to $2i$, which is only guaranteed to be $< g = 2r + 1$ while $i \le r$. Beyond that, layers may contain edges and vertices may have several neighbors closer to $v$.`)}
  `,
};

/** @type {import('./index.js').Lecture} */
export default {
  id: 'lecture3',
  number: 3,
  title: "Unique paths, girth and Moore's bound",
  summary: "Why trees have unique paths (two paths give a cycle), girth and distance, and Moore's theorem: a graph with minimum degree ≥ 3 always has a cycle of length at most 2 log₂ n.",
  sections: [uniquePaths, girthDistance, moore],
};

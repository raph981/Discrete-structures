/**
 * Lecture 5: Spanning trees – correctness, efficiency; minimum spanning trees
 * Correctness and linear running time of the spanning tree algorithm, minimum spanning trees,
 * Kruskal's algorithm and the MST property lemma.
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const correctness = {
  id: 'correctness',
  title: 'Correctness of the spanning tree algorithm',
  body: tx`
    ${lead('We show that the algorithm from lecture 4 really outputs a spanning tree (assuming for now that it stops).')}
    ${box('claim', '1', tx`The algorithm does not stop until $R = V(G)$.
      ${proof(tx`Suppose the algorithm stops with some vertex $v \notin R$. Take an $s$–$v$ path $P$ in $G$ ($G$ is connected). Since $s \in R$ and $v \notin R$, somewhere along $P$
        there are consecutive vertices $w, x$ with $wx \in E(G)$, $w \in R$ and $x \notin R$.
        Since $w \in R$, at some time $w$ was in $Q$, and the algorithm does not stop until $w$ is removed from $Q$. But $w$ is only removed once every neighbor of $w$ is in $R$ – including $x$. Contradiction!`)}`)}
    ${box('claim', '2', tx`Between steps, $T$ is always the edge set of a spanning tree of $G[R]$.
      ${proof(tx`Induction on $|R|$. <strong>Base case</strong> $|R| = 1$: $T$ has no edges, and a single vertex is a tree.
        <p><strong>Induction step:</strong> suppose $T$ is currently a spanning tree of $G[R]$, and consider a Step 3 in which $w$ is added to $R$ ($R_\text{old} \to R_\text{new}$) and $vw$ to $T$ ($T_\text{old} \to T_\text{new}$). Note $v \in Q \subseteq R$.</p>
        ${list([
    tx`$T_\text{old}$ connects all vertices of $R_\text{old}$, and $vw$ connects $w$ to $R_\text{old}$, so $T_\text{new}$ connects everything in $R_\text{new}$.`,
    tx`A vertex outside $R$ is never incident to an edge of $T$. When $vw$ is added, $w$ joins $R$ at the same moment, so $w$ is incident to just one tree edge, $vw$. An edge with an endpoint of degree 1 cannot lie on a cycle, so $vw$ creates no cycle.`,
  ])}`)}`)}
    <p>Together: when the algorithm stops, $R = V(G)$ and $T$ is a spanning tree of $G[V(G)] = G$.</p>
    ${widget('spanning-tree', { chooseStrategy: false, example: 'grid' }, 'Watch the invariant: the green edges always form a tree on the reached vertices (|T| = |R| − 1).')}
  `,
};

const efficiency = {
  id: 'efficiency',
  title: 'Efficiency: linear time',
  body: tx`
    ${box('claim', '', tx`The algorithm runs in linear time with respect to $m$, the number of edges (assuming $m \ge 1$).
      ${proof(tx`Since $G$ is connected, $e(G) \ge |V(G)| - 1$, so input size and number of edges are linearly related.
        <p>We use <strong>cost assignment</strong>: each elementary step is “assigned to” a vertex or an edge of $G$. If there is a constant $k$ (independent of $G$) such that,
          when the algorithm stops, every vertex and every edge has at most $k$ elementary steps assigned to it, then the algorithm runs in linear time.</p>
        <p>Step 2 leaves some flexibility in how $v \in Q$ is picked. For simplicity, suppose we pick the same $v$ repeatedly until it is removed from $Q$ (this doesn't crucially affect the proof).
          In Step 3 we look at the neighbors of $v$ in turn: if a neighbor is in $R$, go to the next one; if not, update the variables and go back to Step 2.</p>
        ${list([
    tx`Throughout Step 3 we are always “testing” some vertex $v$ paired with a neighbor $w$. For a specific pair $(v, w)$ there are $O(1)$ steps; each edge is tested at most twice (once from each end). So all executions of Step 3 together take linear time.`,
    'Step 1 takes constant time.',
    'Step 2 takes constant time per iteration, and the number of iterations is the number of Step 3 iterations plus 1. So the total time of Step 2 is O(time of Step 3).',
  ])}`)}`)}
    <p>In the widget above, the counter “pairs (v, w) tested” never exceeds $2e(G)$.</p>
  `,
};

const mst = {
  id: 'minimum-spanning-trees',
  title: "Minimum spanning trees and Kruskal's algorithm",
  body: tx`
    ${lead('A new problem: the edges have costs, and we want the cheapest spanning tree.')}
    ${box('definition', '(Minimum spanning tree)', tx`Let $G$ be connected and let each edge $e$ have a positive <dfn>weight</dfn> $w(e)$, i.e. a weight function $w: E(G) \to \R_{>0}$.
      A <dfn>minimum spanning tree</dfn> (MST) is a spanning tree $T \subseteq G$ for which $\sum_{e \in E(T)} w(e)$ is minimum.
      (If all weights are equal, any spanning tree is minimum.)`)}
    ${box('note', "(Kruskal's algorithm)", tx`Let $|V(G)| = n$, $|E(G)| = m$.
      ${list([
    'Sort all edges of E(G) in increasing order of weight (break ties arbitrarily).',
    tx`$T := \emptyset$.`,
    'Consider each edge e in the sorted list: if the endpoints of e are already connected in T, throw e away and move on; otherwise put T := T ∪ {e}.',
    'Output T.',
  ])}
      Clearly the algorithm stops.`)}
    ${widget('kruskal', {}, 'Step through Kruskal. Each color is one component of T; a thrown-away edge (red, dashed) would close a cycle.')}
  `,
};

const mstProperty = {
  id: 'mst-property',
  title: 'The MST property',
  body: tx`
    ${box('lemma', '(MST property)', tx`Let $T$ be a spanning tree of $G$. Then $T$ is an MST if and only if, for every edge $xy \in E(G) \setminus E(T)$,
      no edge on the $x$–$y$ path in $T$ has higher weight than $xy$.`)}
    ${proof(tx`Contrapositive. Suppose there is $xy \in E(G) \setminus E(T)$ and an edge $e$ on the $x$–$y$ path in $T$ with $w(e) > w(xy)$.
      Then $T' := T + xy - e$ has less weight than $T$. And $T'$ is a tree: adding $xy$ to $T$ creates exactly one cycle $C$ ($xy$ plus the unique $x$–$y$ path in $T$).
      Since $e \in C$, deleting $e$ leaves $T'$ acyclic and still connected (deleting an edge from a cycle leaves all previously connected vertices connected).
      So $T'$ is a lighter spanning tree, and $T$ is not an MST.`, '“⇒” (an MST has the property)')}
    ${proof(tx`Suppose $T$ has the property. Among all minimum spanning trees, let $T''$ be one with the maximum number of edges in common with $T$. Suppose for contradiction that $T'' \ne T$,
      and let $xy \in E(T'') \setminus E(T)$.
      <p>Removing $xy$ splits $T''$ into two components, one containing $x$ and one containing $y$. The $x$–$y$ path in $T$ starts in the first and ends in the second,
        so it has an edge $e$ joining the two components; $e \notin E(T'')$ (the only edge of $T''$ between them is $xy$). By the property (applied to $xy \notin E(T)$), $w(xy) \ge w(e)$.</p>
      <p>Hence the graph $T'' + e - xy$</p>
      ${list([
    'is a spanning tree of G (adding e reconnects the two parts),',
    tx`is an MST (its weight is at most that of $T''$),`,
    tx`has more edges in common with $T$ than $T''$ does. Contradiction!`,
  ])}
      <p class="small">(The notes pick “some edge $e$ on the $x$–$y$ path in $T$ not in $T''$”; choosing one that joins the two parts of $T'' - xy$ makes sure the swap gives a tree.)</p>`, '“⇐” (the property implies minimum)')}
    ${widget('mst-property', {}, 'Click edges to choose a spanning tree. Every violation of the property shows a cheaper swap; press “Swap” until no violation is left – then T is an MST.')}
    <p>Correctness of Kruskal's algorithm follows from this lemma – see <a href="#/lecture6/kruskal-correctness">lecture 6</a>.</p>
    ${exercise('If all edge weights are distinct, is the minimum spanning tree unique?',
    tx`Yes. If $T_1 \ne T_2$ were both MSTs, take the lightest edge $e$ in exactly one of them, say in $T_1$. Adding $e$ to $T_2$ creates a cycle, which contains an edge $f \notin T_1$; $w(f) > w(e)$ by the choice of $e$ and distinctness. Then $T_2 + e - f$ is lighter than $T_2$ – a contradiction.`)}
  `,
};

/** @type {import('./index.js').Lecture} */
export default {
  id: 'lecture5',
  number: 5,
  title: 'Spanning trees and Kruskal',
  summary: "Why the spanning tree algorithm is correct and runs in linear time, minimum spanning trees, Kruskal's algorithm, and the MST property that characterizes minimum spanning trees.",
  sections: [correctness, efficiency, mst, mstProperty],
};

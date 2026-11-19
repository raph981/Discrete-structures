/**
 * Lecture 7: Eulerian tours and connectivity
 * The Königsberg bridges, Euler's theorem with the tour-building algorithm, separators, k-connectivity,
 * complete graphs, cliques, K_n, C_n, P_n.
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const konigsberg = {
  id: 'konigsberg',
  title: 'The bridges of Königsberg',
  body: tx`
    ${lead('Can you walk through the historical city of Königsberg and cross each of its seven bridges exactly once? Euler answered this question.')}
    <p>Make each land mass a vertex and each bridge an edge. The question becomes: is there a walk that contains every edge <em>exactly once</em>? Such a walk is an <dfn>Eulerian trail</dfn>.</p>
    <p>Königsberg has two pairs of “parallel” bridges, so its graph has parallel edges – a <dfn>multigraph</dfn>, which we don't use. The trick: put an extra vertex in the middle of
      one edge of each parallel pair. A bridge is then crossed exactly once iff both halves of the subdivided edge are used exactly once, so we can ask the question on this simple graph instead.</p>
    ${box('definition', '(Eulerian tour)', 'If a walk that contains every edge exactly once is closed (it starts and ends at the same vertex), it is an Eulerian tour.')}
    ${box('theorem', "(Euler's theorem, for walks)", tx`A connected graph $G$ has an Eulerian tour if and only if all of its degrees are even.`)}
    ${widget('euler-tour', { example: 'konigsberg' }, tx`The subdivided Königsberg graph: four vertices have odd degree (outlined), so there is no Eulerian tour. (In fact not even an open Eulerian trail: a trail exists iff at most 2 vertices have odd degree.)`)}
  `,
};

const euler = {
  id: 'euler-proof',
  title: "Proof of Euler's theorem",
  body: tx`
    ${proof(tx`Follow an Eulerian tour: every time it enters a vertex, it leaves it again along a different edge (also at the start/end vertex, where the first exit pairs with the last entry).
      So every vertex is “entered” and “exited” equally often, and its edges are used in pairs: all degrees are even.`, '“⇒”')}
    <p>For “⇐” we first need a lemma. A walk that does not repeat edges is <dfn>maximal</dfn> if it cannot be extended at either end without repeating an edge.</p>
    ${box('lemma', '', tx`If $G$ has no vertices of odd degree, any maximal walk (not repeating edges) starts and ends at the same vertex – it is a <dfn>closed walk</dfn>.
      ${proof(tx`Without loss of generality look at the end vertex $v$ of a walk that does not repeat edges. If $v$ is not the start, then the walk has used an odd number of the edges at $v$
        (enter, exit, enter, exit, …, enter). Since $d(v)$ is even, at least one edge at $v$ is not in the walk – so the walk can be extended and was not maximal.`)}`)}
    ${box('note', '(Algorithm)', tx`Pick a start vertex $s$. Set $Q = \{s\}$ (reached vertices with untraveled edges) and $W = (s)$ (the current closed walk).
      <p><strong>While</strong> $Q \neq \emptyset$:</p>
      ${list([
    tx`pick some $v \in Q$;`,
    tx`in $G \setminus E(W)$, create a maximal walk $Y$ from $v$. It includes all edges at $v$ that are not in $W$, and it ends at $v$ (by the Lemma – removing the closed walk $W$ keeps all degrees even);`,
    tx`$W := W' \cup Y$, where $W'$ is $W$ “rotated” to start and end at $v$;`,
    tx`$Q := Q \cup \{\text{new vertices reached by } Y\} \setminus \{v\}$ (more precisely: the reached vertices that still have untraveled edges).`,
  ])}
      <p>Output $W$.</p>`)}
    ${widget('euler-tour', {}, 'Step through the algorithm. Each step adds a new closed walk Y (red) at a vertex v of the current tour; the numbers give the final order of the edges.')}
    ${proof(tx`Throughout the algorithm:
      ${list([
    tx`$W$ is always a closed walk;`,
    tx`$Q$ only contains reached vertices, and all reached vertices incident to edges not in $W$ are in $Q$;`,
    tx`at each iteration, if there are any edges not in $W$, at least one such edge is incident to a vertex in $Q$ – <em>this is where we need $G$ to be connected</em>: a path from $s$ to an untraveled edge leaves the set of vertices of $W$ somewhere, along an untraveled edge at a reached vertex. So the algorithm cannot end before $W$ is an Eulerian tour;`,
    tx`after each iteration a vertex is permanently deleted from $Q$, so the algorithm is finite.`,
  ])}
      So $W$, a closed walk, eventually covers all edges.`, '“⇐” (correctness of the algorithm)')}
    <p>Fun fact: this algorithm can be performed in linear time, if the closed walk is represented in the right way (e.g. as a linked list, so splicing in $Y$ is cheap).</p>
    ${exercise('A connected graph has exactly two vertices of odd degree, u and v. Why does it have an Eulerian trail from u to v?',
    tx`Add a new vertex $z$ adjacent to $u$ and $v$. Now all degrees are even, so there is an Eulerian tour; remove $z$ from it – what is left is a walk from $u$ to $v$ using every original edge exactly once.`)}
  `,
};

const connectivity = {
  id: 'connectivity',
  title: 'Separators and k-connectivity',
  body: tx`
    ${lead('How well is a graph connected? Measure how many vertices you must delete to break it apart.')}
    ${box('definition', '(Separator, k-connected)', tx`For a graph $G$, a set $X \subseteq V(G)$ is a <dfn>separator</dfn> if $G \setminus X$ is disconnected.
      <p>$G$ is <dfn>$k$-connected</dfn> if $|V(G)| \ge k + 1$ and $G$ has no separator with fewer than $k$ vertices.</p>
      So if $|V(G)| \ge 2$, “connected” is the same as “1-connected”.`)}
    ${box('note', '(Fact)', tx`If $G$ is $k$-connected, then $\delta(G) \ge k$.
      ${proof(tx`Contrapositive: suppose $\delta(G) < k$, and also $|V(G)| \ge k + 1$ (otherwise $G$ is not $k$-connected anyway). Let $v$ be a vertex with $d(v) < k$.
        Since $|V(G)| \ge k + 1 > d(v) + 1$, there is a vertex $w \in V(G) \setminus (\{v\} \cup N(v))$. Then $X = N(v)$ is a separator (it separates $v$ from $w$) with fewer than $k$ vertices.`)}`)}
    ${widget('connectivity', {}, tx`Two copies of $K_4$ sharing one vertex: that vertex alone is a separator, so the graph is only 1-connected although $\delta = 3$. Choose your own sets $X$, or edit the graph.`)}
    ${box('definition', '(Complete graphs and cliques)', tx`A <dfn>complete graph</dfn> is a graph in which every pair of vertices is adjacent.
      A <dfn>clique</dfn> $K$ in a graph $G$ is a subgraph in which every pair of vertices is adjacent, i.e. $G[V(K)]$ is a complete graph.
      ${list([
    tx`$K_n$: the complete graph (clique) with $n$ vertices ($K_1$ = a vertex, $K_2$ = an edge, $K_3$ = a triangle);`,
    tx`$C_n$: the cycle with $n$ vertices;`,
    tx`$P_n$: the path with $n$ vertices (its length is $n - 1$).`,
  ])}`)}
    ${box('note', '(Fact)', tx`If $G$ is 2-connected, then $G$ contains a cycle.
      ${proof(tx`$G$ 2-connected $\Rightarrow$ $\delta(G) \ge 2$ (by the Fact above) $\Rightarrow$ $G$ has a cycle (“Exercise 0”: take a longest path; its end vertex has a second neighbor, which must lie on the path, closing a cycle).`, 'Why')}`)}
    ${exercise(tx`What is the connectivity of $K_n$, of $C_n$ ($n \ge 3$) and of a tree with at least 3 vertices?`,
    tx`$K_n$ has no separator at all; the condition $|V| \ge k + 1$ makes it $(n-1)$-connected but not $n$-connected. $C_n$ is 2-connected: deleting one vertex leaves a path, deleting two non-adjacent vertices disconnects it. A tree with $\ge 3$ vertices is 1-connected: deleting any non-leaf disconnects it.`)}
  `,
};

/** @type {import('./index.js').Lecture} */
export default {
  id: 'lecture7',
  number: 7,
  title: 'Eulerian tours and connectivity',
  summary: "The bridges of Königsberg, Euler's theorem (a connected graph has an Eulerian tour iff all degrees are even) with an algorithm that builds the tour, separators, k-connectivity and cliques.",
  sections: [konigsberg, euler, connectivity],
};

/**
 * Lecture 2: Some structures within graphs
 * Walks and paths, connectedness and components, cycles, trees and forests, leaves, the number of
 * edges of a tree, and the theorem on equivalent "definitions" of trees (parts (i)–(iii)).
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const walks = {
  id: 'walks-and-paths',
  title: 'Walks and paths',
  body: tx`
    ${lead('To talk about getting from one vertex to another, we need names for routes through a graph.')}
    ${box('definition', '(Walk, path)', tx`
      A <dfn>walk</dfn> is a sequence of vertices $(v_0, v_1, \dots, v_k)$ such that any two consecutive vertices are adjacent.
      The walk <em>contains</em> the edges $\{v_0, v_1\}, \{v_1, v_2\}, \dots, \{v_{k-1}, v_k\}$.
      <p>A <dfn>path</dfn> is a walk in which no vertex is repeated.</p>
      <p>A <dfn>$u$–$v$ walk</dfn> (or <dfn>$u$–$v$ path</dfn>) is a walk (path) that starts at $u$ and ends at $v$.
        A walk or path of a single vertex is allowed: the “$u$–$u$ path” is just $(u)$.</p>`)}
    ${box('example', '', tx`In the graph below, $(a, b, c, b, f, a, e)$ is a walk; it contains the edges $ab, bc, bf, fa, ae$ (the edge $bc$ twice).
      It is not a path, because $a$ and $b$ repeat. $(a, f, b, c)$ is a path.`)}
    ${widget('walk-builder', {}, 'Click vertices to build a sequence. Try a sequence that jumps between non-adjacent vertices, then press “Shorten to a path”.')}
    ${box('claim', '', tx`If $G$ contains a $u$–$v$ walk, then it contains a $u$–$v$ path.
      ${proof(tx`Consider a <em>shortest</em> $u$–$v$ walk. Suppose some vertex $w$ (possibly $u$ or $v$) repeats.
        Delete all vertices between two occurrences of $w$, and one of the two copies of $w$. What remains is still a $u$–$v$ walk
        (the vertex before the first $w$ is adjacent to $w$, and so is the vertex after the second $w$), but it is shorter – a contradiction.
        So the shortest walk has no repeated vertex: it is a path.`)}`)}
    ${box('intuition', '', 'A walk that visits a vertex twice has made a detour (a loop). Cutting out the loop gives a shorter route between the same endpoints. Repeat until there are no loops left.')}
  `,
};

const connected = {
  id: 'connectedness',
  title: 'Connectedness and components',
  body: tx`
    ${box('definition', '(Connected vertices)', tx`Two vertices $u, v$ are <dfn>connected</dfn> in a graph $G$ if there is a $u$–$v$ walk in $G$
      (equivalently, by the Claim, a $u$–$v$ path).`)}
    <p>Write $u \sim v$ for “$u$ is connected to $v$”. This is an <strong>equivalence relation</strong>:</p>
    ${list([
    tx`<em>reflexive:</em> $u \sim u$ for every vertex $u$, since $(u)$ is a valid walk;`,
    tx`<em>symmetric:</em> if $u \sim v$ then $v \sim u$, since any $u$–$v$ walk can be reversed;`,
    tx`<em>transitive:</em> if $u \sim v$ and $v \sim w$ then $u \sim w$: a $u$–$v$ walk followed by a $v$–$w$ walk is a $u$–$w$ walk.
      (Not necessarily a path – but the Claim turns it into one. This is why walks are convenient.)`,
  ])}
    ${box('definition', '(Component, connected graph)', tx`A <dfn>component</dfn> of $G$ is a maximal set of mutually connected vertices; that is,
      the components of $G$ are the equivalence classes of the relation $\sim$.
      <p>A graph $G$ is <dfn>connected</dfn> if every pair of vertices is connected, i.e. $G$ itself is just one component.</p>`)}
    ${widget('components', {}, 'The example from the notes has five components (one color each). Add an edge between two colors and watch two classes merge.')}
    ${exercise('Can deleting one edge increase the number of components by more than one?',
    tx`No. If the edge $uv$ is deleted, every vertex that was connected to $u$ or $v$ without using $uv$ stays in its class; every other route used $uv$ and now ends in the class of $u$ or of $v$.
      So the component of $uv$ splits into at most two parts.`)}
  `,
};

const cycles = {
  id: 'cycles',
  title: 'Cycles',
  body: tx`
    ${box('definition', '(Cycle)', tx`A <dfn>cycle</dfn> is a walk such that
      ${list([
    'the first and last vertices of the sequence are the same, but there are no other repetitions, and',
    'there are at least 3 distinct vertices.',
  ])}
      We treat a cycle simply as its set of vertices and edges: $(a, b, f, e, a)$, $(b, f, e, a, b)$ and $(b, a, e, f, b)$ describe the same cycle.
      Its <dfn>length</dfn> is its number of edges (= number of vertices).`)}
    <p>“At least 3 distinct vertices” rules out walking along an edge and straight back, $(a, b, a)$: that is not a cycle.</p>
    ${widget('cycles', {}, tx`The graph from the notes has exactly 3 distinct cycles: the triangles $a b f$ and $a f e$, and the square $a b f e$. $K_4$ has 7.`)}
  `,
};

const trees = {
  id: 'trees',
  title: 'Trees, forests and leaves',
  body: tx`
    ${lead('A very important kind of graph, using all of these definitions.')}
    ${box('definition', '(Tree, forest, leaf)', tx`
      ${list([
    tx`A <dfn>tree</dfn> is a graph $G$ that is connected and has no cycles (“<dfn>acyclic</dfn>”).`,
    tx`A graph with no cycles, not necessarily connected, is a <dfn>forest</dfn> – its components are trees.`,
    tx`A vertex of a tree with just one neighbor is a <dfn>leaf</dfn>.`,
  ])}
      Of course, a graph that is simply a path is a tree.`)}
    ${box('claim', '', tx`Every tree with at least 2 vertices has at least 2 leaves.
      ${proof(tx`Let $T$ be our tree and let $P$ be a <em>longest</em> path in $T$ (a path with the most vertices). Since $|V(T)| \ge 2$ and $T$ is connected,
        $e(T) \ge 1$, so $P$ has at least 2 vertices. Let $u$ and $v$ be its end vertices ($P$ is a $u$–$v$ path).
        ${list([
    tx`$u$ has no neighbor outside of $P$: otherwise $P$ could be extended to a longer path.`,
    tx`$u$ has no neighbor on $P$ except the vertex next to it on $P$: if $u$ were adjacent to a later vertex $w$ of $P$, the part of $P$ from $u$ to $w$
             together with the edge $wu$ would form a cycle, which $T$ does not have.`,
  ])}
        So $u$ has exactly one neighbor, and by the same argument so does $v$: both are leaves.`)}`)}
    ${widget('tree-explorer', {}, 'Leaves are green. “Highlight a longest path” shows the idea of the proof: its two endpoints are always leaves.')}
    ${box('theorem', '(Tree edges)', tx`If a tree $T$ has $n \ge 1$ vertices, then $e(T) = n - 1$.
      ${proof(tx`Induction on $n$. <strong>Base case</strong> $n = 1$: then certainly $e(T) = 0$.
        <p><strong>Induction step:</strong> suppose every tree with $k$ vertices has $k - 1$ edges, for some $k \ge 1$, and let $T$ be a tree with $n = k + 1$ vertices.
          By the Claim (since $n \ge 2$), $T$ has a leaf $v$. Consider $T - v$:</p>
        ${list([
    tx`$T - v$ has no cycles, since removing vertices and edges certainly creates no cycle;`,
    tx`$T - v$ is connected: for any two vertices $u, w \ne v$, a $u$–$w$ path in $T$ cannot pass through $v$ (an inner vertex of a path has two neighbors on it, but $v$ has only one neighbor), so it is also a path in $T - v$.`,
  ])}
        <p>So $T - v$ is a tree with $n - 1 = k$ vertices, and by the induction hypothesis $e(T - v) = k - 1$. Since $T - v$ has exactly one edge less than $T$, $e(T) = k = n - 1$.</p>`)}`)}
    ${exercise(tx`A forest has $n$ vertices and $c$ components. How many edges does it have?`,
    tx`Each component is a tree; a tree with $n_i$ vertices has $n_i - 1$ edges. Summing over the $c$ components: $e = \sum_i (n_i - 1) = n - c$.`)}
  `,
};

const treeDefinitions = {
  id: 'tree-definitions',
  title: 'Equivalent definitions of a tree',
  body: tx`
    ${lead('Trees can be described in several quite different-looking ways. They all mean the same thing.')}
    ${box('theorem', '(Tree “definitions”)', tx`Let $T$ be a graph. The following four statements are equivalent:
      <ol type="i">
        <li>$T$ is a tree.</li>
        <li>$T$ is <dfn>minimally connected</dfn>: $T$ is connected, but removing any edge (not vertices!) results in a disconnected graph.</li>
        <li>$T$ is <dfn>maximally acyclic</dfn>: $T$ is acyclic, but adding any new edge (not new vertices!) results in a graph with a cycle.</li>
        <li>For any two vertices $u, v \in V(T)$ there is <em>exactly one</em> $u$–$v$ path in $T$.</li>
      </ol>`)}
    ${widget('tree-characterizations', {}, 'All four statements are checked live. Edit the graph: the four marks always agree. Hover a failing statement to see a witness.')}
    <p>Notation: $T - e$ is $T$ with the edge $e$ removed from $E(T)$; $T + uv$ is $T$ with the new edge $uv$ added. The proofs of (i) ⇔ (ii) and (i) ⇔ (iii) follow;
      (i) ⇔ (iv) is in <a href="#/lecture3/unique-paths">lecture 3</a>.</p>
    ${proof(tx`We prove the <em>contrapositive</em>: if (ii) is not true, then (i) is not true.
      If (ii) fails for a connected $T$, there is an edge $e = uv$ such that $T - e$ is still connected. So there is a $u$–$v$ path $P$ in $T - e$.
      Then $P$ together with $e$ is a cycle in $T$, so $T$ is not a tree. (If $T$ is not connected, it is not a tree anyway.)`, '(i) ⇒ (ii)')}
    ${proof(tx`Contrapositive: if $T$ is not a tree, then $T$ is not minimally connected.
      <p><strong>Case 1:</strong> $T$ is not connected – then it is not minimally connected, done.</p>
      <p><strong>Case 2:</strong> $T$ is connected but has a cycle $C$. Pick an edge $e = uv$ of $C$ and let $T' = T - e$. For any $a, b \in V(T)$ there is an $a$–$b$ path in $T$.
        If it does not contain $e$, it is an $a$–$b$ path in $T'$. If it does, replace $e$ by the rest of the cycle, $C - e$, which is a $u$–$v$ path in $T'$;
        this gives an $a$–$b$ <em>walk</em> in $T'$, and hence an $a$–$b$ path. So $T'$ is connected, and $T$ was not minimally connected.</p>
      <p><em>Key idea:</em> breaking a cycle doesn't disconnect anything.</p>`, '(ii) ⇒ (i)')}
    ${proof(tx`If $T$ is a tree, it is acyclic. Let $u, v$ be vertices with $uv \notin E(T)$; we show that $T + uv$ has a cycle.
      Since $T$ is connected, there is a $u$–$v$ path $P$. Adding $uv$ to $T$, the path $P$ “plus” $uv$ is a cycle (it has at least 3 vertices, because $u, v$ are not adjacent).`, '(i) ⇒ (iii)')}
    ${proof(tx`$T$ is acyclic; we show that $T$ is connected, i.e. there is a $u$–$v$ path for any $u, v \in V(T)$.
      If $uv \in E(T)$, then $(u, v)$ is such a path. If $uv \notin E(T)$, then $T + uv$ has a cycle $C$ by (iii), and $C$ must contain $uv$ (since $T$ itself has no cycle).
      Then $C - uv$ is a $u$–$v$ path in $T$.`, '(iii) ⇒ (i)')}
    ${exercise(tx`Using the theorem: is a connected graph with $n$ vertices and $n - 1$ edges always a tree?`,
    tx`Yes. A connected graph contains a minimally connected spanning subgraph (keep deleting edges whose removal keeps it connected). By (ii) ⇒ (i) that subgraph is a tree, so it has $n - 1$ edges – all edges of the graph. Hence the graph itself is that tree.`)}
  `,
};

/** @type {import('./index.js').Lecture} */
export default {
  id: 'lecture2',
  number: 2,
  title: 'Walks, paths, cycles and trees',
  summary: 'Walks and paths, connectedness as an equivalence relation, components, cycles, trees and leaves, why a tree has n − 1 edges, and four equivalent ways to define a tree.',
  sections: [walks, connected, cycles, trees, treeDefinitions],
};

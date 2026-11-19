/**
 * Lecture 1: Graph intro
 * Definition of a graph, basic vocabulary, Handshake Lemma, degree parameters, subgraphs,
 * isomorphisms and automorphisms, the Regularizing Lemma and the lemma on subgraphs with large degrees.
 */
import { box, exercise, lead, list, proof, term, tx, widget } from './blocks.js';

const whatIsAGraph = {
  id: 'what-is-a-graph',
  title: 'What is a graph?',
  body: tx`
    ${lead(`In mathematics the word “graph” has (at least) two unrelated meanings. This course always means
      a network: objects and the connections between them.`)}
    ${box('note', '', tx`<strong>Not this meaning:</strong> the graph of a function, i.e. the curve $\{(x, f(x))\}$ you draw in a coordinate system.
      We will <em>never</em> use “graph” in that sense here.`)}
    <p><strong>Informally</strong>, a graph is a set of objects together with relations (“bonds”) between <em>pairs</em> of objects.
      Think of the word “network”. The emphasis is on the bonds: which objects are connected, not where they are or what they look like.</p>
    ${box('definition', '(Graph)', tx`
      A <dfn>graph</dfn> $G$ consists of a set $V$ of <dfn>vertices</dfn> together with a set $E$ of <dfn>edges</dfn>, such that every edge
      $e \in E$ is an <em>unordered pair of distinct vertices</em> from $V$. In symbols:
      $$E \subseteq \pairs{V},$$
      where $\pairs{V}$ denotes the set of all unordered pairs of (distinct) elements from $V$.
      <p>We usually write $G$ for a graph, $V(G)$ for its vertex set and $E(G)$ for its edge set.</p>`)}
    ${box('intuition', '', tx`Read the definition word by word – each word rules something out:
      ${list([
    tx`<em>pair</em>: an edge joins exactly two vertices;`,
    tx`<em>unordered</em>: $\{u, v\} = \{v, u\}$, edges have no direction;`,
    tx`<em>distinct</em>: no edge from a vertex to itself (no “loops”);`,
    tx`<em>set</em> of edges: the same pair cannot be an edge twice (no “multiple edges”).`,
  ])}`)}
    <p>The lecture notes write an edge as $(u, v)$; since it is an <em>unordered</em> pair, $\{u, v\}$ is the more precise notation, and we use both
      interchangeably. Often one simply writes $uv$.</p>
    <h3>Graphs as pictures</h3>
    <p>We draw vertices as dots and edges as lines between them. The picture is only an illustration: positions, lengths and shapes of the
      lines carry no meaning. Try it – the formal sets update as you draw.</p>
    ${widget('graph-builder', {}, tx`Build a graph and watch $V(G)$ and $E(G)$. Clicking the same vertex twice does not create an edge:
      loops are excluded by definition. A graph on $n$ vertices has at most $\binom{n}{2} = \frac{n(n-1)}{2}$ edges.`)}
    <h3>Graphs in real life</h3>
    ${list([
    '<strong>Transport:</strong> airports are vertices, flight routes are edges.',
    '<strong>Social networks:</strong> profiles are vertices, “friendships” are edges.',
    '<strong>Maps:</strong> regions (e.g. countries) are vertices; two regions are joined if they share part of a border.',
  ])}
    ${exercise(tx`On a social network where you can <em>follow</em> someone without being followed back, why is a graph in our sense not quite the right model?`,
    tx`“Following” is not symmetric: Alice may follow Bob without Bob following Alice. Our edges are <em>unordered</em> pairs, so they can only
      model symmetric relations like friendship. One-directional relations need <em>directed</em> graphs, where edges are ordered pairs.`)}
  `,
};

const vocabulary = {
  id: 'definitions',
  title: 'Adjacent, incident, neighbors, degree',
  body: tx`
    ${lead('A handful of words that we will use constantly. Each one describes a relation between vertices and edges.')}
    ${box('definition', '', tx`Let $G$ be a graph.
      ${list([
    tx`Two vertices $u, v$ are ${term('adjacent')} in $G$ if $\{u, v\} \in E(G)$.`,
    tx`A vertex $v$ and an edge $e$ are ${term('incident')} if $v \in e$, i.e. $v$ is one of the two endpoints of $e$.`,
    tx`A ${term('neighbor')} of a vertex $w$ is a vertex adjacent to $w$. The set of all neighbors is the <dfn>neighborhood</dfn>
           $N(w) = \{v \in V(G) : \{v, w\} \in E(G)\}$.`,
    tx`The ${term('degree')} of $w$ is the number of its neighbors: $d(w) = |N(w)|$.`,
  ])}`)}
    ${box('intuition', '', `“Adjacent” relates two vertices, “incident” relates a vertex and an edge. Compare: two cities are adjacent
      if a road joins them; the road is incident to both cities.`)}
    ${widget('neighborhood', { focus: 'w' }, tx`The lecture's example: $N(w) = \{t, y\}$, so $d(w) = 2$. Click other vertices, or click an edge to see the two vertices it is incident to.`)}
    ${exercise(tx`Why is the degree of $w$ also equal to the number of edges incident to $w$?`,
    tx`Every edge incident to $w$ has the form $\{w, v\}$ with $v \neq w$, and then $v$ is a neighbor of $w$. Conversely every neighbor $v$ gives the edge $\{w, v\}$.
      This is a bijection between incident edges and neighbors. (It works because there are no loops and no multiple edges.)`)}
  `,
};

const handshake = {
  id: 'handshake-lemma',
  title: 'The Handshake Lemma',
  body: tx`
    ${lead(`If everybody at a party counts the hands they shook and we add up all these numbers, we get exactly twice the number of handshakes –
      every handshake involves two hands.`)}
    ${box('lemma', '(Handshake Lemma)', tx`In any graph $G$,
      $$\sum_{v \in V(G)} d(v) = 2\,|E(G)|.$$
      We write $e(G) = |E(G)|$ for the number of edges (and $v(G) = |V(G)|$ for the number of vertices).
      ${proof(tx`Count the number of <em>vertex–edge incident pairs</em> $(v, e)$ with $v \in e$ in two ways.
        <p><strong>1st count, by vertices:</strong> for each vertex $v$, the number of edges incident to $v$ is $d(v)$. This gives $\sum_{v \in V(G)} d(v)$.</p>
        <p><strong>2nd count, by edges:</strong> each edge is incident to exactly 2 vertices. This gives $2\,|E(G)|$.</p>
        <p>Both counts count the same set, so they are equal.</p>`)}`)}
    <p>This proof technique is called <strong>double counting</strong>: count one set in two different ways and equate the results.
      A good way to see it is the <em>incidence matrix</em>: one row per vertex, one column per edge, and a 1 wherever they are incident.
      Summing the rows gives the degrees; every column contains exactly two 1s.</p>
    ${widget('handshake', {}, 'Change the graph: both totals always agree. Hover over rows and columns of the matrix.')}
    ${box('corollary', '', tx`Every graph has an <em>even</em> number of vertices of odd degree.
      ${proof(tx`$\sum_v d(v) = 2e(G)$ is even. The vertices of even degree contribute an even amount, so the odd degrees must also add up to an even number –
        which needs an even number of odd summands.`)}`)}
    <p>The lemma gives a quick test whether a list of numbers can be the degrees of a graph: if the sum is odd, certainly not.</p>
    ${widget('degree-sequence', {}, tx`An odd sum is ruled out immediately by the Handshake Lemma. An even sum is not enough on its own: “3, 3, 3, 1” has sum 10 but is still impossible.`)}
    ${exercise('Is there a graph on 5 vertices in which every vertex has degree 3?',
    tx`No: the degree sum would be $5 \cdot 3 = 15$, which is odd, but it must equal $2e(G)$.`)}
  `,
};

const degreeParameters = {
  id: 'degree-parameters',
  title: 'Minimum, maximum and average degree',
  body: tx`
    ${lead('To describe a whole graph by its degrees, we look at the smallest, the largest and the average degree.')}
    ${box('definition', '', tx`For a graph $G$:
      ${list([
    tx`the <span class="text-min">minimum degree</span> $\delta(G)$ (lowercase delta) is the minimum of $d(v)$ over all $v \in V(G)$;`,
    tx`the <span class="text-max">maximum degree</span> $\Delta(G)$ (uppercase delta) is the maximum of $d(v)$ over all $v \in V(G)$;`,
    tx`the <span class="text-avg">average degree</span> $d(G)$ is the average of $d(v)$ over all $v \in V(G)$.`,
  ])}`)}
    ${box('note', '(Fact, by the Handshake Lemma)', tx`$$d(G) = \frac{1}{v(G)}\sum_{v} d(v) = \frac{2\,e(G)}{v(G)}.$$`)}
    <p>Clearly $\delta(G) \le d(G) \le \Delta(G)$.</p>
    ${box('definition', '(Regular graph)', tx`A graph $G$ is called <dfn>$r$-regular</dfn> if <em>every</em> vertex has degree $r$. Equivalently, $\delta(G) = \Delta(G) = r$.`)}
    ${widget('degree-stats', {}, tx`Cycles are 2-regular, the cube and the Petersen graph are 3-regular. In the lecture example $\delta = 1$, $\Delta = 3$ and $d(G) = 14/6$.`)}
    ${exercise(tx`Show: an $r$-regular graph on $n$ vertices has exactly $rn/2$ edges. Which $r$-regular graphs on 7 vertices can exist?`,
    tx`By the Handshake Lemma, $2e(G) = \sum_v d(v) = rn$, so $e(G) = rn/2$. For $n = 7$ this must be an integer, so $r$ must be even: $r \in \{0, 2, 4, 6\}$ (all of these exist, e.g. the empty graph, the cycle $C_7$, its complement and $K_7$).`)}
  `,
};

const subgraphs = {
  id: 'subgraphs',
  title: 'Subgraphs and induced subgraphs',
  body: tx`
    ${lead('Sometimes we want to work with several graphs at once, sharing common vertices and edges.')}
    ${box('definition', '(Subgraph)', tx`A graph $H$ is a <dfn>subgraph</dfn> of a graph $G$, in symbols $H \subseteq G$, if all vertices and edges of $H$ are also vertices and edges of $G$:
      $$V(H) \subseteq V(G) \quad\text{and}\quad E(H) \subseteq E(G).$$`)}
    ${box('definition', '(Induced subgraph)', tx`$H$ is an <dfn>induced subgraph</dfn> of $G$ if $H \subseteq G$ and for every pair of vertices $u, v \in V(H)$:
      $$\{u, v\} \in E(H) \iff \{u, v\} \in E(G).$$`)}
    ${box('intuition', '', `A subgraph may drop any edges it likes. An induced subgraph may only drop <em>vertices</em>: once two vertices are chosen,
      the edge between them (if G has one) must come along.`)}
    <p>Every induced subgraph is determined by its vertex set: choose $U \subseteq V(G)$, delete all vertices not in $U$ and all edges not in $\pairs{U}$.
      The result is called $G[U]$, “$G$ induced on $U$”.</p>
    ${widget('subgraph', {}, tx`The example from the lecture: the red $H$ is a subgraph of the blue $G$, but <em>not</em> an induced subgraph – $G$ contains the edge $\{u, x\}$ between two
      vertices of $H$, while $H$ does not. Press “Induce” to get $G[V(H)]$.`)}
    ${exercise(tx`How many subgraphs $H$ of $G$ have $V(H) = V(G)$? How many induced subgraphs does $G$ have (counting the empty graph)?`,
    tx`With $V(H) = V(G)$ fixed, any subset of $E(G)$ can be $E(H)$: there are $2^{e(G)}$ such subgraphs. Induced subgraphs correspond to vertex subsets $U$, so there are $2^{v(G)}$ of them.`)}
  `,
};

const isomorphism = {
  id: 'isomorphism',
  title: 'Isomorphic graphs',
  body: tx`
    ${lead(`The same network can be drawn – and labeled – in many ways. Isomorphism formalizes the idea that two graphs are “duplicates” of each other.`)}
    ${box('definition', '(Isomorphism)', tx`Two graphs $G$ and $H$ are <dfn>isomorphic</dfn> if there exists a bijection $f: V(G) \to V(H)$ such that for any two distinct vertices $u, v \in V(G)$:
      $$\{u, v\} \in E(G) \iff \{f(u), f(v)\} \in E(H).$$
      Such an $f$ is called an <dfn>isomorphism</dfn>. We write $G \cong H$.`)}
    <p>Both directions of the “$\iff$” matter: edges must go to edges (“$\Rightarrow$”) <em>and</em> non-edges must go to non-edges (“$\Leftarrow$”).</p>
    ${widget('isomorphism', {}, tx`Assign $f$ by clicking a vertex of $G$ and then a vertex of $H$. Green edges are preserved, red ones violate the condition.
      Try the pentagram: it looks different, but it is just a 5-cycle.`)}
    ${box('note', '(Invariants)', tx`Isomorphic graphs have the same number of vertices and edges, the same degree sequence, the same number of triangles, …
      If such an <em>invariant</em> differs, the graphs are not isomorphic. The converse fails: $C_6$ and two disjoint triangles are both 2-regular on 6 vertices,
      yet not isomorphic (one is connected, the other is not).`)}
    ${exercise(tx`$K_{3,3}$ and the prism (two triangles joined by three edges) are both 3-regular on 6 vertices. Why are they not isomorphic?`,
    tx`The prism contains triangles. $K_{3,3}$ contains none: its vertices split into two sides with all edges going between the sides, so any closed walk alternates sides
      and has even length. An isomorphism maps triangles to triangles, so none can exist.`)}
  `,
};

const automorphism = {
  id: 'automorphisms',
  title: 'Automorphisms',
  body: tx`
    ${lead('Isomorphisms can also be used within just one graph: they describe the symmetries of a graph.')}
    ${box('definition', '(Automorphism)', tx`A bijective function $f: V(G) \to V(G)$ is an <dfn>automorphism</dfn> of $G$ if for all $u, v \in V(G)$:
      $$\{u, v\} \in E(G) \iff \{f(u), f(v)\} \in E(G).$$
      The <dfn>trivial automorphism</dfn> is the identity, $f(v) = v$ for all $v$. Every graph has it.`)}
    ${box('example', '', tx`The lecture's example graph has exactly 2 automorphisms: the trivial one, and the one with $f(u) = x$, $f(x) = u$ that leaves all other vertices unchanged.
      (Swapping the two ends of the diagonal works because $u$ and $x$ have exactly the same neighbors besides each other: $t$ and $v$.)`)}
    ${widget('automorphisms', {}, tx`Pick an automorphism: each vertex moves to the position of its image. The picture stays the same – only the labels move.
      The cycle $C_4$ has 8 automorphisms (the symmetries of a square), $K_4$ has all $4! = 24$ permutations, and the Petersen graph has 120.`)}
    ${exercise(tx`Why does every automorphism map a vertex to a vertex of the same degree?`,
    tx`$f$ maps the neighbors of $v$ bijectively onto the neighbors of $f(v)$: $w \in N(v) \iff f(w) \in N(f(v))$. Hence $d(v) = |N(v)| = |N(f(v))| = d(f(v))$.
      In the lecture's example, $y$ is the only vertex of degree 1, so every automorphism fixes $y$.`)}
  `,
};

const regularizing = {
  id: 'regularizing-lemma',
  title: 'The Regularizing Lemma',
  body: tx`
    ${lead(`Regular graphs are often easier to handle. The good news: every graph sits inside a regular graph, without changing the maximum degree.`)}
    ${box('lemma', '(Regularizing Lemma)', tx`Every graph $G$ is a subgraph – even an induced subgraph – of a graph $H$ which is $\Delta(G)$-regular.`)}
    <p><strong>Idea.</strong> We cannot simply add edges inside $G$ (that would make $G$ a non-induced subgraph, and there may be no room).
      Instead we take a copy of $G$ and use edges <em>between</em> the original and the copy to raise the low degrees.</p>
    ${proof(tx`
      <p>If $\delta(G) = \Delta(G)$, then $G$ is already $\Delta(G)$-regular and we put $H = G$.</p>
      <p>Otherwise $\delta(G) < \Delta(G)$. First construct a graph $G'$ such that
        $$G \subseteq G', \qquad \Delta(G') = \Delta(G), \qquad \delta(G') = \delta(G) + 1:$$</p>
      ${list([
    tx`Make two isomorphic copies $G_1$ and $G_2$ of $G$ on different vertex sets (with $G_1 = G$).`,
    tx`Add an edge between every vertex of $G_1$ with degree $\delta(G)$ and its copy in $G_2$.`,
  ])}
      <p>Vertices of degree $\delta(G)$ gain exactly one edge and now have degree $\delta(G) + 1 \le \Delta(G)$; all other degrees stay the same.
        So $\delta(G') = \delta(G) + 1$ and $\Delta(G') = \Delta(G)$. Moreover $G = G_1$ is an <em>induced</em> subgraph of $G'$, because all new edges go between $G_1$ and $G_2$.</p>
      <p>If $\delta(G) + 1 = \Delta(G)$, put $H = G'$. In general, if $\Delta(G) - \delta(G) = k$, repeat the process $k$ times and put $H = G^{(k)} = G''^{\cdots\prime}$ ($k$ primes).
        Each step raises the minimum degree by one and keeps the maximum degree, so $H$ is $\Delta(G)$-regular; and “induced subgraph of” is transitive, so $G$ is an induced subgraph of $H$.</p>`)}
    ${widget('regularize', {}, tx`The lecture's example: $\delta = 1$, $\Delta = 3$, so two steps are needed. Step 1 joins the two copies of $y$ (as in the notes),
      step 2 joins all vertices of degree 2 to their copies. Edit the starting graph and use the slider.`)}
    ${exercise(tx`How many vertices does $H$ have in this construction?`,
    tx`Each step doubles the number of vertices, so $v(H) = 2^{k}\, v(G)$ with $k = \Delta(G) - \delta(G)$. The construction is simple, but not economical.`)}
  `,
};

const largeDegrees = {
  id: 'large-degrees',
  title: 'Subgraphs with large minimum degree',
  body: tx`
    ${lead(`A graph with many edges on average may still have vertices of tiny degree. But we can always find a subgraph where even the
      <em>minimum</em> degree is large.`)}
    ${box('definition', '(Edge density)', tx`The <dfn>edge density</dfn> of $G$ is $\displaystyle \eps(G) = \frac{e(G)}{v(G)}$. By the Handshake Lemma, $\eps(G) = \tfrac12 d(G)$.`)}
    ${box('lemma', '(Subgraph with large degrees)', tx`If $e(G) \ge 1$, then there is a subgraph $H \subseteq G$ such that
      $$\delta(H) > \eps(H) \ge \eps(G).$$`)}
    <p>So $H$ is at least as dense as $G$, and in $H$ <em>every</em> vertex has degree more than $\eps(H) \ge \eps(G) = \tfrac12 d(G)$: the minimum degree of $H$ exceeds half the average degree of $G$.</p>
    <h3>Key step: deleting a vertex of small degree</h3>
    <p>For a vertex $x$ let $G - x$ be $G$ with $x$ and its incident edges deleted, i.e. $G - x = G[V(G) \setminus \{x\}]$.</p>
    ${box('claim', '', tx`For any graph $G$: if there is $x \in V(G)$ with $d(x) \le \eps(G)$, then $\eps(G - x) \ge \eps(G)$.
      ${proof(tx`Deleting $x$ removes one vertex and $d(x)$ edges. Write $n = v(G)$. Then
        $$\eps(G - x) = \frac{e(G - x)}{n - 1} = \frac{e(G) - d(x)}{n - 1} \ \ge\ \frac{e(G) - \frac{e(G)}{n}}{n - 1}
          = \frac{e(G)\cdot\frac{n-1}{n}}{n - 1} = \frac{e(G)}{n} = \eps(G).$$
        The inequality uses $d(x) \le \eps(G) = e(G)/n$.`)}`)}
    ${box('intuition', '', `Removing a vertex whose degree is at most the density is like removing a student whose grade is at most the class average: the average cannot go down.`)}
    <h3>Proof of the lemma</h3>
    ${proof(tx`
      <p>Induction on $v(G)$. The smallest graph with an edge is a single edge $K_2$ (two vertices, one edge). For $G = K_2$ put $H = G$:
        $\delta(H) = 1 > \tfrac12 = \eps(H) = \eps(G)$.</p>
      <p><strong>Induction step.</strong> Suppose the statement holds for all graphs with $k \ge 2$ vertices, and let $v(G) = k + 1$.</p>
      ${list([
    tx`If $\delta(G) > \eps(G)$, let $H = G$.`,
    tx`Otherwise $\delta(G) \le \eps(G)$. Pick a vertex $x$ of minimum degree; then $d(x) = \delta(G) \le \eps(G)$, so the Claim applies to $G' = G - x$:
           $\eps(G') \ge \eps(G) > 0$. In particular $G'$ still has an edge, so by the induction hypothesis there is $H \subseteq G'$ with $\delta(H) > \eps(H) \ge \eps(G')$.
           Since $G' \subseteq G$ and $\eps(G') \ge \eps(G)$, we get $\delta(H) > \eps(H) \ge \eps(G)$ and $H \subseteq G$.`,
  ])}`, 'Proof (by induction)')}
    <p>The proof is really an algorithm: <em>keep deleting a vertex of minimum degree as long as $\delta \le \eps$</em>. Watch it peel away the sparse parts of a graph:</p>
    ${widget('dense-subgraph', {}, tx`The column $\eps(H)$ never decreases – that is the Claim at work. The process stops as soon as $\delta(H) > \eps(H)$; the green part is the subgraph $H$.`)}
    ${exercise(tx`Why does the process always stop before the graph runs out of edges?`,
    tx`$\eps$ never decreases, so it stays $\ge \eps(G) > 0$; a graph with $\eps > 0$ has an edge. And the process cannot go on forever, since each step deletes a vertex.
      (On a graph with one edge left and no other vertices, $\delta = 1 > \tfrac12 = \eps$, so it stops at the latest there.)`)}
  `,
};

const summary = {
  id: 'summary',
  title: 'Summary',
  body: tx`
    <div class="table-scroll"><table class="data-table">
      <thead><tr><th>Notation</th><th>Meaning</th></tr></thead>
      <tbody>
        <tr><td>$G = (V, E)$, $E \subseteq \pairs{V}$</td><td>graph: edges are unordered pairs of distinct vertices</td></tr>
        <tr><td>$V(G)$, $E(G)$, $v(G)$, $e(G)$</td><td>vertex set, edge set, number of vertices, number of edges</td></tr>
        <tr><td>$u, v$ adjacent</td><td>$\{u, v\} \in E(G)$</td></tr>
        <tr><td>$v$, $e$ incident</td><td>$v \in e$</td></tr>
        <tr><td>$N(w)$, $d(w) = |N(w)|$</td><td>neighborhood and degree of $w$</td></tr>
        <tr><td>$\delta(G)$, $\Delta(G)$, $d(G)$</td><td>minimum, maximum, average degree; $d(G) = 2e(G)/v(G)$</td></tr>
        <tr><td>$\eps(G) = e(G)/v(G)$</td><td>edge density</td></tr>
        <tr><td>$r$-regular</td><td>every vertex has degree $r$</td></tr>
        <tr><td>$H \subseteq G$</td><td>subgraph: $V(H) \subseteq V(G)$, $E(H) \subseteq E(G)$</td></tr>
        <tr><td>$G[U]$</td><td>subgraph induced on $U$: keep all edges of $G$ inside $U$</td></tr>
        <tr><td>$G - x$</td><td>delete $x$ and its incident edges</td></tr>
        <tr><td>$G \cong H$</td><td>isomorphic: a bijection preserving edges and non-edges</td></tr>
      </tbody>
    </table></div>
    <h3>Results</h3>
    ${list([
    tx`<strong>Handshake Lemma:</strong> $\sum_v d(v) = 2e(G)$ – proved by double counting vertex–edge incidences.`,
    tx`<strong>Regularizing Lemma:</strong> every $G$ is an induced subgraph of a $\Delta(G)$-regular graph – proved by repeatedly doubling $G$.`,
    tx`<strong>Large degrees:</strong> if $e(G) \ge 1$, some $H \subseteq G$ has $\delta(H) > \eps(H) \ge \eps(G)$ – proved by deleting vertices of minimum degree.`,
  ])}
  `,
};

/** @type {import('./index.js').Lecture} */
export default {
  id: 'lecture1',
  number: 1,
  title: 'Graph intro',
  summary: `What a graph is, the basic vocabulary (adjacent, incident, degree), the Handshake Lemma, subgraphs, isomorphisms
    and automorphisms, and two lemmas about degrees.`,
  sections: [whatIsAGraph, vocabulary, handshake, degreeParameters, subgraphs, isomorphism, automorphism, regularizing, largeDegrees, summary],
};

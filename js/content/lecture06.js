/**
 * Lecture 6: BFS/DFS, Kruskal revisited, bipartite graphs
 * Breadth-first and depth-first search, correctness and running time of Kruskal's algorithm with
 * component labels, bipartite graphs and the odd cycle theorem.
 */
import { box, exercise, lead, list, proof, tx, widget } from './blocks.js';

const search = {
  id: 'bfs-dfs',
  title: 'Breadth-first and depth-first search',
  body: tx`
    ${lead(tx`Many algorithms use “graph exploration”: walking along edges to reach unexplored vertices. The spanning tree algorithm is one of them,
      and it left open how to choose $v \in Q$ in Step 2. Two choices are especially useful.`)}
    ${box('definition', '(BFS and DFS)', tx`
      ${list([
    tx`<dfn>Breadth-first search</dfn> (BFS): vertices in $Q$ are picked in the order they joined $Q$ – $Q$ is a <em>queue</em>, like waiting in line at the Mensa.
           This reaches all neighbors of the start $s$ first, then all vertices at distance 2, then 3, and so on.`,
    tx`<dfn>Depth-first search</dfn> (DFS): vertices that arrive later in $Q$ are removed earlier – $Q$ is a <em>stack</em>, like a stack of pancakes (or Flammkuchen, langos, pita, tortillas, naan): always add and remove at the top.
           This corresponds to always travelling forward, and going backward only when forced to.`,
  ])}
      Both BFS and DFS can be performed in linear time.`)}
    ${widget('spanning-tree', { example: 'grid', strategy: 'bfs', start: 'a' }, 'Switch between BFS and DFS on the same grid: BFS grows the tree in “rings” of equal distance, DFS runs off in one long path and backtracks.')}
    ${exercise('In the BFS tree, what is the distance from s to a vertex v?',
    tx`Exactly $\mathrm{dist}_G(s, v)$: BFS reaches vertices in order of distance, so the tree path from $s$ to $v$ is a shortest path. (DFS trees have no such property.)`)}
  `,
};

const kruskalCorrectness = {
  id: 'kruskal-correctness',
  title: "Correctness of Kruskal's algorithm",
  body: tx`
    ${box('theorem', '', tx`Kruskal's algorithm outputs a minimum spanning tree.
      ${proof(tx`(The output is a spanning tree: it never closes a cycle, and an edge between two components of $T$ is never thrown away, so at the end $T$ connects everything.)
        <p>Suppose for contradiction that the output $T$ breaks the MST property: there is $xy \in E(G) \setminus E(T)$ and an edge $e$ on the $x$–$y$ path $P$ in $T$ with $w(e) > w(xy)$.
          If there is more than one such $e$, pick the one the algorithm looks at last.</p>
        <p>Let $C = P + xy$ and $Q = P + xy - e$. Then $Q$ is a path, and all its edges were considered by the algorithm before $e$ (the edges of $P$ that are heavier than $xy$ came before $e$ by the choice of $e$,
          the others are at most as heavy as $xy$, which is lighter than $e$). Each edge of $Q$ was either added to $T$ or thrown away because its endpoints were already connected –
          either way, by the time the algorithm considers $e$, every pair of consecutive vertices of $Q$ is connected in $T$. So the endpoints of $e$ are already connected, and the algorithm discards $e$.
          But $e \in E(T)$. Contradiction! By the MST property lemma, $T$ is a minimum spanning tree.</p>`)}`)}
  `,
};

const kruskalTime = {
  id: 'kruskal-running-time',
  title: "Running time of Kruskal's algorithm",
  body: tx`
    <p>The parts of the algorithm that take the most time are:</p>
    ${list([
    tx`sorting the edges by weight: $\Theta(m \log m)$;`,
    tx`determining whether two vertices are already connected – done $m$ times. Done naively (start at one endpoint, run BFS or DFS in $T$ to try to reach the other) each test takes $O(n)$, in total $O(nm)$.`,
  ])}
    <p>Since $m < n^2$, we have $m \log m < 2 m \log n$, so $nm$ is the bigger term. But can we use information gathered in earlier steps to test connectivity faster? Yes!</p>
    ${box('note', '(Component labels)', tx`Give all vertices of a component of $T$ the same <dfn>component label</dfn>. Two vertices are connected iff they have the same label – a constant-time test.
      <p><strong>Extra step (label update):</strong> if two components are joined, change the labels of the vertices in one component – <em>the smaller one</em> – to match the label of the other.</p>`)}
    ${widget('kruskal', { labels: true, example: 'petersen' }, 'Kruskal with component labels. Outlined vertices are relabeled in this step; the counter shows the total number of label changes.')}
    ${exercise('Analyze the total time of all label updates. (Hint: how often can a single vertex be relabeled?)',
    tx`A vertex is relabeled only when its component is the smaller one of the two being joined, so the size of its component at least <em>doubles</em> each time.
      A component has at most $n$ vertices, so each vertex is relabeled at most $\log_2 n$ times. All label updates together take $O(n \log n)$.
      With the sorting step, Kruskal's algorithm then runs in $O(m \log m + n \log n) = O(m \log n)$ for connected $G$.`, 'Exercise from the lecture')}
  `,
};

const bipartite = {
  id: 'bipartite-graphs',
  title: 'Bipartite graphs',
  body: tx`
    ${box('definition', '(Bipartite graph)', tx`A graph is <dfn>bipartite</dfn> if $V(G)$ can be partitioned into $(A, B)$ such that every edge has one end in $A$ and one end in $B$;
      in other words, $E(G) = E(A, B)$. Such $A$ and $B$ are called <dfn>partite sets</dfn>.
      There might be more than one valid partition – in a graph with no edges, $A$ and $B$ can be chosen in any way.`)}
    ${box('theorem', '', tx`A graph is bipartite if and only if it does not contain an odd cycle as a subgraph.`)}
    ${proof(tx`Contrapositive: if $G$ has an odd cycle, pick a vertex of the cycle and travel around it, alternating between $A$ and $B$. Since the cycle is odd, when you return to the start it would have to be on the other side – somewhere there must be an edge inside $A$ or inside $B$. So no valid partition exists.`, '“⇒”')}
    ${proof(tx`Contrapositive again. For now consider a connected graph $G$ (otherwise treat each component separately). Choose a vertex $v$ and let $N_i = \{u \in V(G) : \mathrm{dist}(u, v) = i\}$.
      <p>If $G$ is bipartite, all the $N_i$ with even $i$ must be in one partite set ($A$, say) and those with odd $i$ in the other ($B$). So consider exactly this split.</p>
      <p>If $G$ is <em>not</em> bipartite, this split fails, so some edge joins two vertices of equal parity. Edges only join layers whose indices differ by at most 1, so the edge lies inside some $N_i$: call it $w_i x_i$.
        Let $W = (w_0, w_1, \dots, w_i)$ and $X = (x_0, x_1, \dots, x_i)$ be shortest paths from $v = w_0 = x_0$ to $w_i$ and $x_i$. Let $j$ be the biggest index with $w_j = x_j$. Then
        $$(w_j, \dots, w_i, x_i, \dots, x_j)$$
        – forward on $W$, backward on $X$ – is a cycle of length $(i - j) + 1 + (i - j)$, which is odd.
        (After index $j$ the paths share no vertex: a vertex on both would be at the same distance from $v$, i.e. at the same index, contradicting the choice of $j$.)</p>`, '“⇐”')}
    ${widget('bipartite', {}, 'The proof as an algorithm: color by even/odd distance. The cube and the grid are bipartite; for C₅ or the Petersen graph the widget shows the odd cycle the proof constructs.')}
    ${exercise('Is every tree bipartite?',
    'Yes: a tree has no cycles at all, in particular no odd ones. (Directly: color by the parity of the distance from any vertex.)')}
  `,
};

/** @type {import('./index.js').Lecture} */
export default {
  id: 'lecture6',
  number: 6,
  title: 'BFS, DFS and bipartite graphs',
  summary: "Breadth-first and depth-first search, why Kruskal's algorithm is correct, how component labels make it fast, and bipartite graphs: no odd cycles.",
  sections: [search, kruskalCorrectness, kruskalTime, bipartite],
};

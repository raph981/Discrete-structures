/**
 * Lecture 4: Algorithms
 * Algorithms and elementary steps, running time, Θ / O / o / Ω / ω, finding the maximum, the sorting
 * lower bound, polynomial time, spanning trees, adjacency lists and the spanning tree algorithm.
 */
import { box, exercise, lead, list, tx, widget } from './blocks.js';

const algorithms = {
  id: 'what-is-an-algorithm',
  title: 'What is an algorithm?',
  body: tx`
    ${lead('A precise recipe: given an input of a certain form, it produces a certain output.')}
    ${box('definition', '(Algorithm)', tx`An <dfn>algorithm</dfn> is a set of instructions which takes a certain form of input and gives a certain output.
      The instructions are written as a series of <dfn>elementary steps</dfn>, such as
      ${list([
    'arithmetic operations,',
    'comparisons (is a ≥ b?),',
    'variable updates,',
    'array access (lists, or lists within lists – matrices can be represented this way),',
    'evaluating an “if” condition.',
  ])}`)}
    <p>The <strong>input</strong> is often one or more lists of values (numbers) or names – in our case, vertex labels.
      The <dfn>size of an input</dfn> is the number of values/names in it.</p>
  `,
};

const runningTime = {
  id: 'running-time',
  title: 'Running time and orders of growth',
  body: tx`
    ${box('definition', '(Running time)', tx`Let $A$ be an algorithm which accepts inputs from a set $X$ (possibly infinite, but with only finitely many inputs of each size $n$).
      For $x \in X$ let $E(x)$ be the number of elementary steps needed to compute $A(x)$. The <dfn>running time</dfn> (or <dfn>time complexity</dfn>) of $A$ is the function $T: \N \to \N$,
      $$T(n) = \max\{E(x) : x \in X,\ \mathrm{size}(x) = n\}.$$`)}
    <p>So $T(n)$ is the <em>worst case</em> over all inputs of size $n$. In mathematics and theoretical computer science we care about how quickly $T(n)$ grows with $n$,
      compared with “simple” functions such as polynomials and logarithms.</p>
    ${box('definition', '(Orders of growth)', tx`For functions $f, g: \N \to \R_{>0}$:
      ${list([
    tx`$f$ has the <dfn>same order</dfn> as $g$, written $f = \Theta(g)$, if there are real numbers $m, M > 0$ with $m < \frac{f(n)}{g(n)} < M$ for all $n \in \N$.`,
    tx`$f$ has <dfn>at most the order</dfn> of $g$, written $f = O(g)$ (“big-O of $g$”), if there is $M > 0$ with $f(n) < M\,g(n)$ for all $n$.`,
    tx`$f$ has <dfn>less than the order</dfn> of $g$, written $f = o(g)$ (“little-o”), if $\frac{f(n)}{g(n)} \to 0$ as $n \to \infty$.`,
    tx`$f$ has <dfn>at least the order</dfn> of $g$, written $f = \Omega(g)$, if $g = O(f)$.`,
    tx`$f$ has <dfn>more than the order</dfn> of $g$, written $f = \omega(g)$, if $g = o(f)$.`,
  ])}
      Being of the same order is an equivalence relation.`)}
    ${box('intuition', '', tx`Think of $\Theta, O, o, \Omega, \omega$ as $=, \le, <, \ge, >$ for growth rates, ignoring constant factors: $100n = \Theta(n)$ and $3n^2 + 5n = \Theta(n^2)$.`)}
    ${widget('growth-rates', {}, tx`Choose $f$ and $g$. The right plot shows $f(n)/g(n)$: bounded away from 0 and $\infty$ means $\Theta$; tending to 0 means $o$.`)}
    <p>The most important comparison for us is big-O: we want to show that the time complexity of an algorithm is <em>not too large</em> by comparing it with standard functions.</p>
    ${exercise(tx`Is $n \log_2 n = O(n^2)$? Is $n^2 = O(n \log_2 n)$?`,
    tx`$\frac{n \log_2 n}{n^2} = \frac{\log_2 n}{n} \to 0$, so $n \log_2 n = o(n^2)$ and in particular $O(n^2)$. Conversely $\frac{n^2}{n\log_2 n} = \frac{n}{\log_2 n} \to \infty$, so $n^2 \ne O(n \log_2 n)$.`)}
  `,
};

const examples = {
  id: 'examples',
  title: 'Examples: maximum and sorting',
  body: tx`
    <h3>Finding the maximum</h3>
    <p>Input: a list of distinct numbers. What can we say about the time complexity of an algorithm that finds the maximum?</p>
    ${list([
    tx`It must be <strong>at least linear</strong>, $\Omega(n)$: an algorithm needs linear time even to read the whole input, and every number must be checked.`,
    tx`An algorithm with linear running time: keep a “current leader”. Put $x := \ell_1$; for $i = 2, \dots, n$ put $x := \max\{x, \ell_i\}$; output $x$.
      Comparing two numbers is an elementary step, so the number of steps is linear.`,
  ])}
    ${widget('find-max', {}, 'Step through the “current leader” algorithm: exactly n − 1 comparisons.')}
    <h3>The sorting problem</h3>
    <p>Input: a list $L$ of $n$ distinct numbers. Output: the same numbers in increasing order. How many comparisons are needed in the worst case?</p>
    ${box('note', '', tx`At least $\log_2(n!) = \Theta(n \log n)$ comparisons: there are $n!$ possible orders, and in the worst case each comparison eliminates at most half of the remaining possible outputs.
      And there are algorithms that sort with running time $O(n \log n)$ (for example merge sort) – so this is optimal.`)}
    ${widget('sorting-bound', {}, tx`Halving $n!$ possibilities until one remains takes $\lceil \log_2 n! \rceil$ steps.`)}
    ${box('definition', '(Polynomial time)', tx`An algorithm runs in <dfn>polynomial time</dfn> if its running time is $O(n^k)$ for some integer $k$. “Linear time” is the case $k = 1$.`)}
  `,
};

const spanningTrees = {
  id: 'spanning-trees',
  title: 'Spanning trees and adjacency lists',
  body: tx`
    ${lead('Now a graph example!')}
    ${box('definition', '(Spanning tree)', tx`A <dfn>spanning tree</dfn> of a connected graph (or component) $G$ is a subgraph $T \subseteq G$ with $V(T) = V(G)$ that is minimally connected – so $T$ is a tree.`)}
    ${box('note', '(Algorithmic problem)', 'Given a connected graph G, find a spanning tree.')}
    <p>First question: how do we encode (“represent”) a graph as input? An <dfn>adjacency list</dfn> is a main list with $|V(G)|$ entries, one per vertex, where each entry
      is itself the list of the neighbors of that vertex. For the graph in the notes:</p>
    $$\{\{2,5,6\},\ \{1,3,6\},\ \{2,4\},\ \{3\},\ \{1,6\},\ \{1,2,5\}\}$$
    ${widget('adjacency-list', {}, 'The adjacency list updates as you edit. By the Handshake Lemma its total length is 2e(G).')}
  `,
};

const spanningAlgorithm = {
  id: 'spanning-tree-algorithm',
  title: 'The spanning tree algorithm',
  body: tx`
    ${box('note', '(Spanning tree algorithm)', tx`
      <p><strong>Step 1:</strong> start with any vertex $s$. Put $R := \{s\}$ (“reached” vertices), $Q := \{s\}$ (vertices whose edges have not been fully explored), $T := \emptyset$ (edges of the current tree).</p>
      <p><strong>Step 2:</strong> if $Q = \emptyset$, STOP and output $T$. Otherwise choose some $v \in Q$.</p>
      <p><strong>Step 3:</strong> if there is some $w \in N(v) \setminus R$: put $R := R \cup \{w\}$, $Q := Q \cup \{w\}$, $T := T \cup \{vw\}$.
        Otherwise put $Q := Q \setminus \{v\}$. Then return to Step 2.</p>`)}
    ${widget('spanning-tree', { chooseStrategy: false }, 'Step through the algorithm. In this version Step 2 keeps choosing the same v until it leaves Q.')}
    <p>Two things to prove:</p>
    ${list([
    '<strong>Correctness:</strong> the final T is a spanning tree of G;',
    '<strong>Efficiency:</strong> an upper bound on the running time.',
  ])}
    <p>Both are done in <a href="#/lecture5/correctness">lecture 5</a>.</p>
    ${exercise('Why does the algorithm always choose new vertices w outside R?',
    tx`An edge $vw$ with $w \in R$ would join two vertices that are already connected by $T$ – it would close a cycle. Choosing $w \notin R$ keeps $T$ a tree.`)}
  `,
};

/** @type {import('./index.js').Lecture} */
export default {
  id: 'lecture4',
  number: 4,
  title: 'Algorithms and running time',
  summary: 'What an algorithm and its running time are, the notations Θ, O, o, Ω and ω, why sorting needs Θ(n log n) comparisons, adjacency lists, and an algorithm that finds a spanning tree.',
  sections: [algorithms, runningTime, examples, spanningTrees, spanningAlgorithm],
};

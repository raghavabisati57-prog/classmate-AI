import { Lecture, CatchUpItem } from '../types';

export const INITIAL_SAMPLE_LECTURES: Lecture[] = [
  {
    id: 'lec-cs301-dijkstra',
    courseCode: 'CS 301',
    subject: 'Data Structures & Algorithms',
    title: 'Lecture 18: Dijkstra’s Shortest Path & Priority Queues',
    date: '2026-10-06',
    instructor: 'Prof. David Vance',
    room: 'Turing Hall 204',
    topicsCovered: [
      'Single-Source Shortest Path Formulation',
      'Greedy Strategy & Invariant Proof',
      'Min-Heap Priority Queue Optimization',
      'Time Complexity Analysis (O((V + E) log V))',
      'Negative Edge Weights Limitation (Bellman-Ford transition)'
    ],
    notes: `## Overview: Single-Source Shortest Path (SSSP)
In today's lecture, we tackled how to determine the shortest path from a starting source vertex $s$ to all other vertices in a directed, weighted graph $G = (V, E)$ where all edge weights $w(u, v) \\ge 0$.

### 1. Key Invariant
Dijkstra maintains a set $S$ of vertices whose final shortest-path weights have already been determined. At each iteration, the algorithm greedily picks vertex $u \\in V \\setminus S$ with the minimum tentative distance $d[u]$ and "relaxes" all outgoing edges $(u, v)$:
\`\`\`
relax(u, v, w):
  if dist[v] > dist[u] + w(u, v):
      dist[v] = dist[u] + w(u, v)
      parent[v] = u
      pq.decreaseKey(v, dist[v])
\`\`\`

### 2. Time Complexity Breakdown
- **Unoptimized Array**: $O(V^2)$ - good for dense graphs where $E \\approx V^2$.
- **Binary Min-Heap**: $O((V + E) \\log V)$ - significantly faster for sparse graphs.
- **Fibonacci Heap**: Theoretical $O(E + V \\log V)$ amortized (rarely used in production due to constant factor overhead).

### 3. Critical Exam Warning: Negative Weights!
Dijkstra **fails** if any edge weight is negative because once a node is marked visited in $S$, its distance is finalized and never revisited. For graphs with negative edge weights, we must use the **Bellman-Ford algorithm** (covered next Thursday).`,
    assignments: [
      {
        id: 'asg-cs301-lab5',
        title: 'Lab 5: SSSP Implementation & Benchmark',
        description: 'Implement Dijkstra using a Min-Heap in Python or C++. Compare execution runtime against naive BFS on a weighted roadmap dataset of 10,000 vertices.',
        dueDate: '2026-10-14',
        points: 50,
        submissionInstructions: 'Submit your solution via the course lab portal with unit tests passing all graph test cases.'
      }
    ],
    resources: [
      { id: 'res-1', title: 'Lecture Slides (PDF)', type: 'slides', url: '#' },
      { id: 'res-2', title: 'CLRS Chapter 24.3 Reading', type: 'reading', url: '#' }
    ],
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z'
  },
  {
    id: 'lec-bio210-replication',
    courseCode: 'BIO 210',
    subject: 'Molecular & Cellular Genetics',
    title: 'Lecture 14: DNA Replication Forks & Okazaki Fragments',
    date: '2026-10-07',
    instructor: 'Dr. Elena Rostova',
    room: 'BioMed Pavilion 101',
    topicsCovered: [
      'Helicase & Single-Strand DNA-Binding Proteins (SSB)',
      'Leading Strand vs. Lagging Strand Asymmetry',
      'RNA Primers & DNA Primase Action',
      'DNA Polymerase III vs. DNA Polymerase I proofreading',
      'DNA Ligase & Phosphodiester Bond Formation'
    ],
    notes: `## DNA Replication Fork Mechanics
DNA replication is semiconservative and bidirectional. Because DNA polymerase synthesizes only in the 5' to 3' direction, replication at the replication fork exhibits structural asymmetry:

### 1. Leading Strand (Continuous)
- Synthesized continuously toward the replication fork.
- Requires only one initial RNA primer laid down by Primase.

### 2. Lagging Strand (Discontinuous)
- Synthesized away from the replication fork in short pulses termed **Okazaki fragments** (approx. 1,000–2,000 nucleotides in prokaryotes, 100–200 in eukaryotes).
- Each Okazaki fragment requires its own RNA primer.

### 3. Key Enzymes to Memorize for Midterm:
1. **DNA Helicase**: Unwinds the double helix at the replication fork ($ATP$-dependent).
2. **Topoisomerase (Gyrase)**: Relieves torsional strain ahead of the fork.
3. **DNA Polymerase III**: Main elongation enzyme (high processivity, 3'->5' exonuclease proofreading).
4. **DNA Polymerase I**: Excises RNA primers via 5'->3' exonuclease activity and replaces them with DNA.
5. **DNA Ligase**: Seals nicks by creating phosphodiester bonds between adjacent 3'-OH and 5'-phosphate groups.`,
    assignments: [
      {
        id: 'asg-bio210-case',
        title: 'Case Study: Xeroderma Pigmentosum & Repair Failures',
        description: 'Read the assigned 3-page clinical case study. Explain why mutations in nucleotide excision repair proteins lead to extreme sensitivity to UV sunlight.',
        dueDate: '2026-10-15',
        points: 30,
        submissionInstructions: 'Upload a 500-word response analyzing DNA polymerase fidelity and repair pathways.'
      }
    ],
    resources: [
      { id: 'res-3', title: 'Molecular Cell Biology Ch. 5', type: 'reading', url: '#' }
    ],
    createdAt: '2026-10-07T14:30:00Z',
    updatedAt: '2026-10-07T14:30:00Z'
  },
  {
    id: 'lec-econ205-multiplier',
    courseCode: 'ECON 205',
    subject: 'Macroeconomic Principles',
    title: 'Lecture 11: Fiscal Policy, Multipliers & Crowding-Out',
    date: '2026-10-08',
    instructor: 'Prof. Marcus Sterling',
    room: 'Hall of Commerce 320',
    topicsCovered: [
      'Marginal Propensity to Consume (MPC) & Save (MPS)',
      'Government Spending Multiplier: k = 1 / (1 - MPC)',
      'Tax Multiplier Dynamics vs. Direct Spending',
      'Automatic Stabilizers (Unemployment Insurance, Progressive Tax)',
      'The Crowding-Out Effect in Loanable Funds Markets'
    ],
    notes: `## Fiscal Multipliers & Aggregate Demand Shocks

### 1. The Multiplier Formula
When the government injects spending $\\Delta G$, initial income expands, stimulating further induced consumption based on the Marginal Propensity to Consume ($MPC$):
$$k = \\frac{1}{1 - MPC} = \\frac{1}{MPS}$$
- Example: If $MPC = 0.8$, the government multiplier is $\\frac{1}{0.2} = 5.0$. A $\\$100B$ stimulus yields up to $\\$500B$ in gross GDP expansion under rigid prices.

### 2. Tax Multiplier vs. Spending Multiplier
- **Spending Multiplier**: $k_G = \\frac{1}{1 - MPC}$
- **Lump-Sum Tax Multiplier**: $k_T = -\\frac{MPC}{1 - MPC}$
Notice that the spending multiplier is always larger in absolute terms because households save a fraction $(1 - MPC)$ of any tax rebate before spending the remainder!

### 3. Crowding-Out Mechanism
When the government runs a budget deficit to fund stimulus:
1. Demand for loanable funds shifts right.
2. Real interest rates rise ($r \\uparrow$).
3. Higher interest rates make private corporate borrowing and consumer home loans more expensive.
4. Private investment ($I$) declines, partially dampening the initial fiscal stimulus.`,
    assignments: [
      {
        id: 'asg-econ205-pset4',
        title: 'Problem Set 4: Multiplier Scenarios & Deficit Impact',
        description: 'Calculate GDP equilibrium changes given varying MPC levels (0.75, 0.8, 0.9) and diagram the crowding-out effect on the Loanable Funds Market.',
        dueDate: '2026-10-13',
        points: 40,
        submissionInstructions: 'Complete questions 1-6 on the workbook sheet and submit before midnight.'
      }
    ],
    resources: [
      { id: 'res-4', title: 'Macroeconomics 8th Ed. Chapter 12', type: 'reading', url: '#' }
    ],
    createdAt: '2026-10-08T09:15:00Z',
    updatedAt: '2026-10-08T09:15:00Z'
  },
  {
    id: 'lec-math240-eigen',
    courseCode: 'MATH 240',
    subject: 'Linear Algebra',
    title: 'Lecture 16: Eigenvalues, Eigenvectors & Diagonalization',
    date: '2026-10-05',
    instructor: 'Prof. Ananya Sen',
    room: 'Euler Science 110',
    topicsCovered: [
      'Geometric Intuition of Av = λv',
      'Characteristic Polynomial: det(A - λI) = 0',
      'Algebraic vs. Geometric Multiplicity',
      'Matrix Diagonalization: A = P D P⁻¹',
      'Powers of a Matrix Aᵏ computation'
    ],
    notes: `## Eigenvalues and Eigenvectors: Foundations

### 1. Definition
A non-zero vector $v \\in \\mathbb{R}^n$ is an eigenvector of an $n \\times n$ matrix $A$ if multiplying $A$ by $v$ simply scales $v$ by a scalar $\\lambda$ (the eigenvalue):
$$A v = \\lambda v \\iff (A - \\lambda I) v = \\mathbf{0}$$

### 2. Computing Eigenvalues
For a non-trivial solution $v \\ne \\mathbf{0}$ to exist, the matrix $(A - \\lambda I)$ must be singular:
$$\\det(A - \\lambda I) = 0$$

### 3. Diagonalization Criterion
An $n \\times n$ matrix $A$ is diagonalizable if and only if $A$ has $n$ linearly independent eigenvectors.
Then $A = P D P^{-1}$, where:
- Columns of $P$ are the eigenvectors.
- $D$ is a diagonal matrix containing the corresponding eigenvalues along the main diagonal.

### 4. Practical Power: Matrix Exponentiation
Computing $A^{50}$ directly requires 49 matrix multiplications.
Using diagonalization:
$$A^k = (P D P^{-1})^k = P D^k P^{-1}$$
Because $D$ is diagonal, $D^k$ is simply each diagonal element raised to power $k$!`,
    assignments: [
      {
        id: 'asg-math240-hw6',
        title: 'Written Homework 6: Diagonalization & State Transitions',
        description: 'Find eigenvalues and eigenvectors for 3x3 matrices, test for diagonalizability, and solve a Markov chain transition model.',
        dueDate: '2026-10-12',
        points: 25,
        submissionInstructions: 'Upload clear scans of handwritten step-by-step derivations.'
      }
    ],
    resources: [
      { id: 'res-5', title: 'Gilbert Strang Linear Algebra Chap 6', type: 'reading', url: '#' }
    ],
    createdAt: '2026-10-05T11:00:00Z',
    updatedAt: '2026-10-05T11:00:00Z'
  },
  {
    id: 'lec-mech220-thermo',
    courseCode: 'MECH 220',
    subject: 'Engineering Thermodynamics',
    title: 'Lecture 13: Second Law of Thermodynamics & Carnot Cycle',
    date: '2026-10-09',
    instructor: 'Prof. Robert Hayes',
    room: 'Newton Engineering 402',
    topicsCovered: [
      'Thermal Reservoirs & Heat Engines',
      'Kelvin-Planck & Clausius Statements',
      'The Ideal Carnot Cycle (4 Reversible Processes)',
      'Maximum Theoretical Thermal Efficiency: η_th = 1 - (Tc / Th)',
      'Entropy Concept & Reversibility'
    ],
    notes: `## The Second Law of Thermodynamics
While the 1st Law states that energy is conserved, the 2nd Law asserts that energy has quality and processes occur in a definite direction.

### 1. Statements of the 2nd Law
- **Kelvin-Planck**: No heat engine can produce a net amount of work while operating in a cycle and exchanging heat with only a single reservoir.
- **Clausius**: It is impossible to construct a cyclic device that operates without receiving work and transfers heat from a lower-temperature body to a higher-temperature body.

### 2. The Carnot Cycle (The Gold Standard)
Consists of four totally reversible operations:
1. Reversible Isothermal Heat Addition at $T_H$
2. Reversible Adiabatic Expansion
3. Reversible Isothermal Heat Rejection at $T_C$
4. Reversible Adiabatic Compression

### 3. Thermal Efficiency Formula
$$\\eta_{th, Carnot} = 1 - \\frac{T_C}{T_H}$$
*(Note: All temperatures MUST be expressed in Absolute Kelvin ($K$), never Celsius or Fahrenheit!)*`,
    assignments: [
      {
        id: 'asg-mech220-design',
        title: 'Engineering Mini-Design: Geothermal Heat Pump vs Carnot Limit',
        description: 'Calculate the theoretical maximum coefficient of performance (COP) for a residential ground-source heat pump operating between 10°C ground temperature and 22°C indoor temperature.',
        dueDate: '2026-10-16',
        points: 35,
        submissionInstructions: 'Submit PDF design memo with schematic diagrams and energy balance equations.'
      }
    ],
    resources: [
      { id: 'res-6', title: 'Cengel & Boles Thermodynamics Ch. 7', type: 'reading', url: '#' }
    ],
    createdAt: '2026-10-09T08:00:00Z',
    updatedAt: '2026-10-09T08:00:00Z'
  }
];

export const INITIAL_SAMPLE_CATCH_UP_ITEMS: CatchUpItem[] = [
  {
    id: 'catchup-1',
    lectureId: 'lec-cs301-dijkstra',
    courseCode: 'CS 301',
    subject: 'Data Structures & Algorithms',
    lectureTitle: 'Lecture 18: Dijkstra’s Shortest Path & Priority Queues',
    topic: 'Min-Heap Priority Queue Optimization',
    lectureDate: '2026-10-06',
    status: 'in-progress',
    targetDate: '2026-10-10',
    priority: 'high',
    notes: 'Need to review how decreaseKey operation is implemented with index tracking.',
    createdAt: '2026-10-07T08:00:00Z'
  },
  {
    id: 'catchup-2',
    lectureId: 'lec-bio210-replication',
    courseCode: 'BIO 210',
    subject: 'Molecular & Cellular Genetics',
    lectureTitle: 'Lecture 14: DNA Replication Forks & Okazaki Fragments',
    topic: 'Lagging Strand vs Leading Strand Asymmetry',
    lectureDate: '2026-10-07',
    status: 'to-review',
    targetDate: '2026-10-11',
    priority: 'high',
    notes: 'Watch animation of Okazaki fragment ligation by DNA Ligase.',
    createdAt: '2026-10-08T09:00:00Z'
  },
  {
    id: 'catchup-3',
    lectureId: 'lec-econ205-multiplier',
    courseCode: 'ECON 205',
    subject: 'Macroeconomic Principles',
    lectureTitle: 'Lecture 11: Fiscal Policy, Multipliers & Crowding-Out',
    topic: 'Government Spending Multiplier: k = 1 / (1 - MPC)',
    lectureDate: '2026-10-08',
    status: 'mastered',
    targetDate: '2026-10-09',
    priority: 'medium',
    notes: 'Solved sample problems with MPC = 0.75 and 0.8. Formulas memorized.',
    createdAt: '2026-10-08T18:00:00Z',
    completedAt: '2026-10-09T15:20:00Z'
  },
  {
    id: 'catchup-4',
    lectureId: 'lec-math240-eigen',
    courseCode: 'MATH 240',
    subject: 'Linear Algebra',
    lectureTitle: 'Lecture 16: Eigenvalues, Eigenvectors & Diagonalization',
    topic: 'Characteristic Polynomial: det(A - λI) = 0',
    lectureDate: '2026-10-05',
    status: 'to-review',
    targetDate: '2026-10-12',
    priority: 'medium',
    notes: 'Practice finding roots of characteristic cubic polynomial.',
    createdAt: '2026-10-06T12:00:00Z'
  }
];

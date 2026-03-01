# Artificial Intelligence Should Be a Heuristic State-Space NP Problem Solver

原文以中文撰写，英文翻译由AI完成。可以在[这里](./Theory.md.md)查看原文。

In the [Readme](../../README.md), we have already pointed out two major problems with current AI technology deployment:

1. The Brain-in-a-Vat Problem
2. The Model Limitation Problem

The Brain-in-a-Vat problem has been discussed in detail in the Readme, while the Model Limitation problem was only briefly mentioned, noting that it requires a completely new approach to solve.

The Model Limitation problem is essentially a question of output quality, which can be broken down into several sub-problems:

1. Models hallucinate and cannot distinguish content reliability.
2. Models cannot perform complex reasoning and planning.
3. Models have limited context windows and cannot retain long-term memory.
4. Models may be vulnerable to prompt injection attacks, leading to serious security vulnerabilities.
5. The internal workings of models are a black box—we cannot fully understand their principles and mechanisms, which means we cannot fully trust their outputs.
6. There are many other problems, too numerous to list here completely.

This document will analyze the essence of AI models and address the Model Limitation problem from first principles. We begin with the classic NP problem, demonstrating that AI models are essentially heuristic state-space NP problem solvers. Based on this theory, we can identify the deficiencies in current AI models and tools during both training and deployment, and we can design an entirely new architecture for AI models and tools—one that can largely address the capability limitations of current AI models.
For the sake of clarity and accessibility, this document sacrifices some mathematical rigor to present this theory and related designs more intuitively. Writing and publishing rigorous academic papers is part of our future work plan.

## AI Models Are Heuristic State-Space NP Problem Solvers

### Starting from a Phenomenon

When we ask an LLM to complete a difficult analytical task, direct questioning often yields disappointing results. However, if we add a guiding step to the prompt—for example, asking the model to first consider "what approach should be used to analyze this problem"—the output quality often improves significantly.

This phenomenon conceals a key question: since the model can provide better answers with guidance, the capability for superior solutions already exists within the model. Why doesn't the model do this automatically?

To answer this question, we first need to understand what AI models are actually doing.

### Generation Is Search

In computational complexity theory, P problems are those that can be solved in polynomial time, while NP problems are those where a given solution can be **verified** in polynomial time. It should be noted that this document uses P and NP as informal analogies, with some departure from strict mathematical definitions: strictly speaking, P and NP are complexity classes for decision problems, P⊆NP has been proven, and P≠NP remains an unresolved conjecture. This document borrows this framework as an intuitive descriptive tool rather than a rigorous mathematical statement. The essential difference between the two classes lies in the fact that finding a solution and verifying a solution often differ vastly in difficulty. When facing NP problems, computer science offers a practical solution: **heuristic search**—not pursuing globally optimal solutions, but using heuristic functions to guide the search direction and find sufficiently good solutions within acceptable time.

The LLM generation process works exactly this way. When a model answers a question, it does not "look up" answers from some knowledge base; rather, it progressively samples a sequence of text from an almost infinite token sequence space, guided by probability distributions learned during training. The essence of this process is search advancing through a vast state space—each token generation is a transition from the current state to the next.

**LLMs are heuristic state-space NP problem solvers.** Their "heuristic function" is encoded by training data and weight parameters; their "search strategy" is determined by the autoregressive generation mechanism. All generative AI models, and even human consciousness, can be understood as solvers performing heuristic search in some state space. Whether it's methodical Chain-of-Thought reasoning or seemingly sudden "inspiration," these are all different path choices within this search space. Inspiration can be understood as: reflecting on the search space already explored, boldly inferring that higher-quality solutions may exist in some unexplored region, and thus directing the searcher to try that direction. It doesn't appear from nowhere but is an induction and extrapolation from existing search experience. Any intelligent agent's thinking—from exploration and observation to summarization—is essentially the process of striving toward optimal solutions in an infinite search space.

It should be noted that the difficulty of finding a solution (first-order problem) and finding a method to find a solution (second-order problem) are both essentially NP problems, and the former is not necessarily more complex than the latter, nor vice versa. Even proving which of the first-order problem or its derived higher-order problem is simpler or more complex is itself an NP problem. For generative AI, all problems essentially exist in the same infinite search space; searching for solutions to higher-order problems is itself a possible path to searching for solutions to lower-order problems, and vice versa. Therefore, this document argues that in the field of using generative AI to solve practical problems, **deliberately distinguishing between lower-order problems and their derived higher-order problems is meaningless**—often they need not be distinguished, and this document primarily treats them without distinction.

### Why Prompt Techniques Work

Returning to our initial question: why can guiding prompts significantly improve output quality?

Because prompts change the search path. Autoregressive generation is essentially greedy decoding—the model selects the most probable next step from the current state, rather than globally evaluating which path will ultimately reach the optimal solution. Guiding prompts inject heuristic information in advance, causing the search process to pass through more valuable intermediate states, thereby more likely reaching high-quality output regions.

Chain-of-Thought, self-questioning, think-step-by-step... These techniques differ in form but share the same essence: they all adjust search paths. The model doesn't become "smarter" because it was "guided"; rather, better search paths activate the solving capabilities already latent in the parameter space.

### The Fundamental Limitations of Intelligent Agents

Having demonstrated that intelligent agents, including humans and AI, are essentially NP solvers, the logic of humans using AI becomes very clear: giving problems to AI means transferring the NP generation burden to machines; humans only need to evaluate whether the generated solutions are acceptable. Verifying whether a solution is satisfactory is usually far easier than generating one from scratch—this is closer to P-class problems.

Therefore, the fundamental purpose of using AI is to outsource the burden of generating solutions for uncertain problems while taking on the relatively easy task of verification.

Furthermore, since any intelligent agent, including humans and AI, is essentially a solver searching for solutions in a vast search space with limited resources, we must accept a reality: any intelligent agent can only search for sufficiently good solutions within a specific search space, based on some heuristic strategy. We cannot expect a system with limited computational power and time to always find globally optimal solutions using heuristic search strategies in an infinite state space. We can only expect it to search with a reasonably optimized strategy under reasonable resource constraints and return sufficiently good results. **No technology can make AI always find sufficiently good solutions.**

## The Necessity of AI Model and Tool Design Based on Heuristic State-Space NP Problem Solver Theory

**Only after humanity realized it could never become gods did it truly begin building its own civilization. Only after realizing AI cannot become gods can we truly use it to build the ladder to the future.**

The first half of this document has revealed the essence of AI models and pointed out the capability limits of all intelligent agents, including AI and humans, within this framework, **denying the possibility of a perfect, infallible AI.** This is not a pessimistic conclusion but a liberating truth. It frees us from unrealistic illusions about AI and from being frightened by horror stories about "out-of-control superintelligent AI." Instead, we can design AI models and tool architectures based on this theory that are more realistic and can deliver greater value in practical applications.

### Inherent Deficiencies in Current AI Technology

Earlier, we argued that any intelligent agent is essentially a heuristic searcher, but current AI implementations do not follow this ideal architecture. Existing LLMs, LLM-based tools, and various non-LLM generative AI systems, while performing well on certain specific tasks, cannot overcome the limitations mentioned at the beginning of this article. These deficiencies are rooted in their architectural design, not simply training data or model scale issues:

1. **Heuristics, search, evaluation, and output are coupled into a single inference process**: Due to model uninterpretability, we cannot even confirm that internal heuristic and evaluation processes actually exist, or that each inference actually goes through these steps. Even if they exist, they are merely byproducts of forward propagation, not explicitly designed modules. These steps that should have clear division of labor are forcibly bundled into an indivisible black box, neither observable from outside nor capable of being intervened in or verified. Therefore, while current AI systems formally execute search, they fundamentally do not follow the standard solver architecture of "explicit heuristics—multi-path exploration—result verification." It is not a properly functioning heuristic NP search solver but a "fast-food" implementation that compresses the entire solving process into a single forward propagation. All the aforementioned problems—hallucinations, reasoning breakdowns, oversensitivity to prompts—are inevitable products of this coupled architecture.

2. **Generative architecture and current training paradigms both favor complex outputs**: In practical applications, generative models tend to produce relatively complex, detailed outputs, which to some extent increases the burden of human verification. This problem is actually not unique to AI; for example, in software development, if code writing is completely outsourced to a third party, the client faces a problem: they need to verify whether the delivered code is correct, but if the code is too complex, verification itself becomes an NP problem, leading to extremely low efficiency. AI-generated content is the same—if the generated solution is too complex, verifying its correctness also becomes very difficult, perhaps even impossible to complete in reasonable time. This tendency toward complex outputs undoubtedly exacerbates verification difficulty. On one hand, this undermines the efficiency-improvement logic of "outsourcing NP generation burden"; on the other hand, it prevents the internal evaluation mechanisms that AI should have from functioning effectively.

3. **Excessive stacking of scale and computational power, using scale expansion to mask architectural deficiencies**: Facing these fundamental problems, the mainstream industry response is to continuously stack model parameters and training computational power, attempting to "brute force" intelligence through Scaling Laws. However, while model scale expansion can improve heuristic function precision, its marginal returns are rapidly diminishing—larger models remain trapped in coupled black boxes, and hallucinations and reasoning breakdowns haven't disappeared. More importantly, this single-dimensional stacking ignores more efficient alternative paths: reducing the computational load of single search iterations (using appropriately sized models) and transferring computational power to multi-directional, multi-path search during inference. As "trading computation for parameters" reveals, as long as the number of searches m is less than the model size reduction factor k, small models + deep search can achieve or even exceed large model performance at lower cost. The current path of excessive scale stacking essentially uses expensive training computation to mask the absence of search strategies—a misunderstanding of the essence of "heuristic search."

### Characteristics Required of an Ideal AI-Based Heuristic State-Space NP Problem Solver

Since the deficiencies in current systems stem from the deep coupling of "heuristics, search, evaluation, and output," the ideal solver must take another path: explicit decoupling and modular division of labor. A properly functioning heuristic search solver should have the following core characteristics:

1. **Explicit decoupling and modular division of labor**: Explicit separation of heuristics, search, evaluation, and other functions.
2. **Multi-path management**: The heuristic module should simultaneously propose multiple possible search directions, avoiding premature convergence to a narrow path and thus missing better solutions. At the same time, it must avoid too many branches leading to an excessively large search space, attempting to combat infinite state space with limited computational power.
3. **Independent evaluator**: Evaluation is no longer implicit in each token's probability but performed by a dedicated module that scores complete or partial candidate solutions.
4. **Mechanistic preference for simpler solutions**: Solution complexity should be as low as possible to facilitate verification and understanding while reducing search space expansion.
5. **Interpretability**: The entire solving process should leave sufficient intermediate records to allow humans to understand and trace the model's reasoning path.

## AI System Design Based on Heuristic State-Space NP Problem Solver Theory

### Design Goals

Based on the above constraints, we have clear metrics for success of this solver: **finding high-quality solutions through reasonable steps within given computational power and time constraints.**

### Module Design

It should be noted that the following module design does not mean we need to train an independent model for each module to implement their functions. Rather, we simply want to ensure at the design level that these functions definitely exist and can be called during operation. We can use multi-agent approaches to implement division of labor among these modules, or modify inference architecture to implement these module functions. In short, in this section we only want to discuss their functions and design, not their specific implementation methods. Specific implementation methods will be discussed in subsequent sections.

**Heuristic Module**

Responsible for analyzing current problems and search states, determining which directions are most likely to contain quality solutions. This corresponds to metacognition in human thinking—first asking oneself "how should I think about this problem," then beginning to think.

The heuristic module should not provide only a single direction but should simultaneously propose multiple possible approaches. Different approaches represent different branches in the search space that can be expanded in parallel by the orchestrator, fully utilizing computational resources and avoiding missing better solutions due to premature narrowing of direction.

**Searcher Module**

Generates candidate solutions under the direction guidance provided by the heuristic module. In the new architecture, it is no longer undirected single-shot generation but directed exploration in specified directions.

When the searcher finds the current direction too vague or with too many branches, it can recursively call the heuristic module to further refine that sub-direction before continuing. This mechanism naturally forms a multi-level tree search structure: each node can expand into new sub-directions, and search depth and breadth can be dynamically adjusted according to resource constraints.

**Refiner Module**

Performs iterative refinement and correction of candidate solutions. The searcher may produce a rough but directionally correct candidate solution; the refiner is responsible for gradually polishing it into a higher-quality, more complete solution. This process can occur over multiple rounds.

**Evaluator Module**

Performs multi-dimensional evaluation of candidate solutions, providing basis for subsequent decisions. Evaluation dimensions should at least include:

1. **Solution complexity**: Overly complex solutions may be overfitting and will cause verification itself to become an NP problem, directly undermining the efficiency assumption that "humans handle verification." Good solutions should be as concise as possible while meeting requirements.
2. **Interpretability**: Whether the solution's reasoning chain is clear and whether humans can understand and trace how it was derived.
3. **Verifiability of evidence**: Whether the knowledge points, cited facts, and data in the solution have verifiable sources.
4. **Other constraints**: Depending on application scenarios, checks for copyright compliance, content safety, and other dimensions can be added.

Note that the above evaluation actions do not actually use some algorithm to perform actual evaluation, but rather use algorithms such as AI models for heuristic verification. One can notice that we deliberately avoided correctness dimension evaluation, instead looking at indicators like conciseness and interpretability. Because we know that answer evaluation itself may be an NP problem—if the evaluator tries to give an absolute judgment, it will fall into its own efficiency crisis and be unable to fulfill the role of "verification." So the evaluator is more about judging whether the solution "looks good."

The evaluator's output is structured scoring and analysis, not merely a pass/fail judgment. This information is passed to the Decision and Integration module for processing.

**Decision and Integration Module**

After multiple concurrent search branches produce their respective candidate solutions, this module is responsible for making final decisions based on comprehensive evaluation results. Its work involves three scenarios:

- **Select the best**: If one branch's candidate solution is significantly better than others across all evaluation dimensions, directly select that solution for output.
- **Integrate multiple solutions**: If multiple branches have all produced valuable conclusions that complement each other, merge them into a more complete answer.
- **Initiate next round of search**: If all current branch results are unsatisfactory, summarize the effective information obtained in this round of search, extract structured insights such as "which directions have been ruled out" and "which discoveries are worth pursuing deeper," and use these as input for the next round's heuristic module to restart search with new strategies.

This makes the entire system not just a single search but a search loop that can learn from failures and iterate continuously.

## AI System Implementation Based on Heuristic State-Space NP Problem Solver Theory

To implement the above design, we can innovate at multiple levels including model architecture, training methods, and inference mechanisms. Here are some approaches:

### Training Model Method

Using various methods represented by reinforcement learning to train LLM models to automatically follow the above workflow for reasoning and generation. However, the above text has criticized the architectural design of using a single model to implement all functions, considering it too coupled and lacking modular division of labor, so we do not recommend this approach.

### Modified Model Architecture Method

Implementing the above functional division by modifying model architectural design. For example, we can introduce explicit modules in the model to separately handle heuristics, search, evaluation, and other functions, or design a new inference mechanism that allows these functions to be called and executed during the inference process. While this approach is more aligned with our understanding of heuristic search solvers at the design level, it may face significant technical challenges in practical implementation, requiring major modifications to existing model architectures.

### Modified Inference Mechanism Method

Implementing the above functional division by modifying the underlying inference mechanism. For example, by modifying the code of inference frameworks like llama.cpp, embedding the workflow loop for heuristics, search, evaluation, and other functions into the inference process, enabling the model to reason and generate according to our designed workflow during generation. This approach may be easier to implement compared to modifying model architecture, as it doesn't require major changes to the model itself but achieves functional division by adjusting the workflow during inference. It can even directly use existing open-source models, thereby greatly simplifying the implementation process.

### Multi-Agent Collaboration Method

Designing multiple specialized Agents to separately handle heuristics, search, evaluation, and other functions, with an orchestrator coordinating their work. This approach is very aligned with our understanding of heuristic search solvers at the design level and is relatively feasible in practical implementation. Each Agent can use existing models to implement its functions, while the orchestrator coordinates their workflow, enabling the entire system to reason and generate according to our designed process. Knowledge base retrieval and other capabilities can even be added to these Agents to further enhance their capabilities. However, compared to the modified inference mechanism method, this approach may introduce more communication overhead.

## Why This Design Can Address Current AI Model Capability Limitations

The introduction listed several specific manifestations of model capability limitations. Under the NP solver architecture, the nature of these problems undergoes fundamental transformation.

**Hallucination Problem**

In traditional single-shot generation, hallucinations are errors that silently mix into final output, imperceptible to users. In the new architecture, candidate solutions are first reviewed by the evaluator—hallucinations transform from "imperceptible output errors" to "internally processable search noise." They won't disappear, but their impact is confined within the system rather than directly exposed to users.

**Complex Reasoning and Planning Problem**

Complex tasks are difficult to complete in one shot because too many intermediate steps are required, and single greedy decoding easily goes astray. The multi-step mechanism of heuristic module providing direction, searcher performing directed generation, and refiner performing iterative correction decomposes complex reasoning into a series of directed short-range searches, structurally alleviating this problem.

**Uninterpretability Problem**

Orchestrated workflows naturally leave intermediate records: the heuristic module's analytical reasoning, the searcher's candidate solutions, and the evaluator's judgment basis. This gives the model's reasoning process a degree of traceability, partially alleviating the "black box" problem.

**On Hallucinations, Ethics, and Out-of-Control AI**

Positioning AI as an NP solver fundamentally reshapes our understanding of these issues. P≠NP guarantees that no algorithm can efficiently solve all NP problems, meaning AI will forever be a constrained search engine rather than an intelligence approaching omnipotence.

Within this framework, the premise that "out-of-control superintelligent AI" relies on—that AI can autonomously find optimal solutions to any problem in any domain—is theoretically untenable. A system explicitly designed to "search for solutions under constraints" has far clearer and more trustworthy behavioral boundaries than a system attempting to simulate general intelligence.

## Summary

This document reconceptualizes generative AI models as **heuristic state-space NP problem solvers**: their generation process is autoregressive search in an infinite search space, guided by parameter-encoded heuristic functions. This framework unifies AI and human intelligence within the solving paradigm under finite resource constraints.

Based on this theory, we reveal the fundamental deficiencies in current AI architecture: heuristics, search, evaluation, and output are coupled into a single forward propagation, causing the system to become an unobservable, non-intervenable black box; meanwhile, the industry masks architectural problems by stacking computational power, ignoring the more efficient alternative path of redirecting computational power toward multi-path search.

We further propose an explicitly decoupled modular solver architecture—with heuristic, searcher, evaluator, decision modules working collaboratively—transforming AI from a "fast-food generator" into a traceable, intervenable collaborative tool. This design alleviates problems like hallucinations and reasoning breakdowns from the root while providing natural support for interpretable AI.

At the theoretical level, this document **denies the existence possibility of "perfect AI"** from a computational complexity perspective, instead **restoring AI from myth to an ordinary engineering object, establishing the cognitive foundation for rational AI tool design.**

Future work will focus on specific implementation paths for this architecture (such as modified inference mechanisms, multi-agent collaboration) and extending it to multimodal tasks and complex decision-making scenarios. We believe that a search-based perspective will lead AI toward a more reliable and efficient path to practical application.

---
title: "The Harness Is What Matters: Anatomy of the Modern AI Agent Stack"
excerpt: "Harrison Chase, CEO of LangChain, breaks down the modern AI agent stack—why the harness matters more than the model, and the core primitives that make agents work."
category: "implementation"
tags: ["AI agents","agent architecture","harness","LangChain","context engineering","observability","evals","sub-agents","memory"]
author: "Ryan Lynn"
authorTitle: "Founder, IntelligentNoise"
authorAvatar: "/rl-headshot.jpeg"
publishedAt: "2026-04-02"
featured: true
readTimeMinutes: 14
metaTitle: "The Harness Is What Matters: Anatomy of the Modern AI Agent Stack | IntelligentNoise Insights"
metaDescription: "Harrison Chase explains why the harness matters more than the model—and breaks down the five core primitives of modern AI agents, from sub-agents to memory."
---

**The most important layer in the AI agent stack isn't the model. It's the harness.**

That's the central thesis from Harrison Chase, co-founder and CEO of LangChain, in a [recent conversation on The MAD Podcast with Matt Turk](https://www.youtube.com/watch?v=rSKh6bVuVZI). As agents evolve from simple prompt-based systems into software that can plan, use tools, write code, and manage memory, Chase argues that the real frontier has shifted from the model itself to the stack around the model.

> "The cloud models are great, but the harness is really what made that work."

The conversation is a masterclass in modern agent architecture—covering why agents failed before, what changed, and the specific primitives that define how production agents are built today. For technical leaders evaluating or building agent systems, these are the architectural decisions that matter.

## Why Agents Didn't Work Before—and What Changed

The core idea behind today's agents isn't new. LangChain launched in late 2022 with a straightforward concept: run an LLM in a loop and let it call tools. The [ReAct paper](https://arxiv.org/abs/2210.03629) formalized this pattern—reasoning plus acting in an iterative cycle. It worked on benchmarks like Wikipedia question answering. It didn't work in the real world.

AutoGPT arrived in March 2023 with the same architecture: an LLM running in a loop, calling tools, given broad capabilities. Chase describes it as "a precursor to OpenAI's Codex in a lot of ways." The excitement was enormous. The reliability was not.

What followed was an era of scaffolding. Developers built rigid structures around models to compensate for their limitations—graph-based workflows, explicit planning steps, forced routing between specialized agents. This is why LangChain built LangGraph: a framework for imposing structure and control when the models couldn't be trusted to operate autonomously.

Then, around November–December 2025, two things converged:

- **The models got meaningfully better.** The newest Claude models, in particular, reached a threshold where running in a loop with tools actually produced reliable results.
- **The industry discovered the right harness primitives.** Claude Code, Manus, and Deep Research all shipped around the same period—and they all shared the same core architecture.

> "Two things basically happened: the models got better, but then also we started to discover these primitives of a harness that would really let the models do their best work."

The result was an explosion of agent development. Not because the idea was new, but because the combination of better models and better harnesses finally made it work.

## Two Types of Agents

Chase draws a clear distinction between two categories of agents emerging in production.

**Conversational agents** handle customer support, voice interactions, and real-time chat. They require low latency, do minimal tool calling—one or two calls at most—and are optimized for responsiveness.

**Long-horizon agents**—a term Chase credits to Sequoia—can plan, maintain coherence over extended tasks, and operate autonomously for minutes or hours. These are the agents reshaping how software gets built.

The critical insight: **most long-horizon agents end up looking like coding agents.** Code is a general-purpose tool—it can parse files, loop over data, and execute logic programmatically rather than through hundreds of individual tool calls. But there's also a training data reason: model labs have been reinforcement-learning code execution, bash commands, and file editing directly into the models. That capability is what works best.

Chase believes these two categories will eventually converge. The pattern: a conversational agent handles real-time interaction while kicking off long-horizon agents asynchronously in the background. One interface, multiple execution modes.

## What Is a Harness?

The term "harness" has become central to agent architecture discussions, but it's worth defining precisely.

> "A harness is how the model interacts with its environment. It's the set of tools that it has."

Chase distinguishes between harness-level tools and application-specific tools. File editing, code execution, sub-agent management—these are harness primitives. A Slack integration or a CRM connector is customization on top of the harness.

The harness also handles infrastructure concerns that application developers shouldn't need to think about: prompt caching, context compression, streaming, and persistence. These are general-purpose capabilities that apply across all agent applications.

The practical implication for builders: **you configure a harness with your prompts, tools, skills, and sub-agents to create your agent.** The harness provides the runtime. You provide the domain knowledge.

## The Five Core Primitives of the Modern Agent Stack

When LangChain launched Deep Agents, their agent harness product, they identified four primitives common across Claude Code, Manus, and every major Deep Research implementation. A fifth—code execution—has since joined as a near-universal requirement.

### 1. The System Prompt

The system prompt drives the agent. Chase frames it simply: if you have a standard operating procedure for how a human should do something, that should inform your system prompt.

In practice, the system prompt is an amalgamation. Part is built into the harness—how to interact with tools, how to manage context. Part is provided by whoever configures the agent: instructions, behavioral guidelines, domain knowledge. Claude Code's `claude.md` file is a direct example—user-provided instructions that get inserted into the overall system prompt.

### 2. Planning Tools

Most harnesses include a built-in planning tool that creates a structured task list with descriptions and statuses—to-do, in progress, done. The plan gets written into the agent's context window, functioning as a mental scratch pad.

The key evolution: **modern harnesses no longer enforce plans rigidly.** Earlier approaches used explicit planning steps—create a plan, execute step one, then step two—but this created cascading edge cases. What if the plan needs to change mid-execution? Now you need a meta-step to check whether to re-plan. The complexity spiraled.

Today's approach is simpler. The plan lives as a reference document that the agent can consult and update, but nothing forces sequential execution. Chase notes that this shift reflects a broader principle—letting the model do more rather than constraining it with scaffolding.

### 3. Sub-Agents

Sub-agents solve the context window problem through isolation. The main agent accumulates context as it works—every tool call, every file read, every decision adds tokens. Sub-agents spin up with a fresh context window, complete a focused task, and return only their final response.

The benefit is efficiency. The risk is communication.

> "Communication is the hardest part of life. It's the hardest part of startups, hardest part of relationships, hardest part of working with agents."

Chase describes a common failure mode: a sub-agent completes substantial work, but its final message is just "done"—leaving the main agent with no useful information. The fix is instructional: sub-agents need explicit guidance on what to communicate back, not just what to do.

The triggering mechanism is entirely prompt-driven. There's no programmatic routing or decision tree. You tell the agent when and how to use sub-agents, and it does. This is both the power and the limitation of modern harnesses—flexible, but without guarantees.

### 4. The File System

The file system is how agents manage their own context windows. Rather than dumping everything into the prompt, the agent reads files on demand and writes to files to persist information.

Chase describes three specific uses:

- **Selective reading.** Instead of loading entire codebases into context, the agent chooses which files to read based on what it needs.
- **Large result offloading.** When a tool call returns 60,000 tokens, the harness writes the result to a file and shows the agent only the first thousand tokens with a pointer to the rest.
- **Summarization preservation.** When context compaction occurs, original messages get dumped to the file system so the agent can retrieve details the summary might have missed.

The file system doesn't have to be a literal file system—it could be a database, S3, or anything with a thin file-like interface on top. The key insight: **LLMs are trained to work with files, so exposing any storage layer as a file system is the most natural interface for the model.**

### 5. Code Execution and Sandboxes

Code execution is becoming a standard harness primitive. Agents write scripts, run them, and iterate on results. This requires sandboxing—you don't want an agent executing arbitrary code on shared infrastructure.

The security implications are real. Chase highlights a specific vulnerability: if an agent needs API keys inside a sandbox, those keys become visible to the LLM and vulnerable to prompt injection. Solutions like proxy-based key injection—where credentials are managed outside the sandbox and injected at the network layer—mitigate this, but the security surface area is still evolving.

There are also two distinct deployment patterns emerging: installing the agent *inside* the sandbox versus running the agent *outside* and calling the sandbox as a tool. Chase notes adoption is roughly 50/50 between the two approaches.

## Skills: Progressive Disclosure

Skills are a newer primitive that Chase calls "very, very interesting." A skill is a collection of files—typically a markdown file with detailed instructions for how to accomplish a specific task, alongside scripts or templates.

The critical difference from the system prompt: **skills are referenced, not loaded.** The system prompt tells the agent which skills exist. The agent reads the skill files only when it determines they're relevant. This is progressive disclosure—telling the LLM only what it needs to know, when it needs to know it.

Skills scale far better than stuffing everything into a single system prompt, and they represent another mechanism for the model to manage its own context window.

## Context Compaction

When an agent's context window fills up, compaction condenses the history. The approach Chase describes:

1. **Keep the recent messages.** The last ~10 messages remain intact to maintain conversational flow.
2. **Summarize everything else.** A separate LLM call extracts the main objective, important facts, and relevant file references from the older messages.
3. **Preserve the originals.** The full message history gets written to the file system as a fallback for when the summary misses something critical.

LangChain is now moving toward giving agents a tool to trigger their own compaction—rather than relying on a fixed threshold like 80% of context window capacity. The reasoning: an agent switching to a completely unrelated task at 60% utilization should compact, while an agent deep in a related investigation at 80% might not need to.

> "In the spirit of letting the model do more and more, we're going to give it a tool to let it call its own compaction."

## Memory: Short-Term and Long-Term

Chase distinguishes between short-term memory—everything within a single conversation thread—and long-term memory, which persists across conversations. Long-term memory is where the architecture gets interesting.

**Three types of long-term memory:**

- **Semantic memory** — Facts stored via RAG. The retrieval patterns are well understood; the harder problem is extraction—how facts get into the store in the first place.
- **Episodic memory** — Previous interactions and conversations, retrievable as context for current tasks.
- **Procedural memory** — Instructions on how to do things. Chase argues this is the most interesting type. It's essentially the agent's configuration—system prompts, skills, and tools—represented as files that the agent can read *and update*.

The implication is significant: **when an agent "learns," it's modifying its own procedural memory.** In Deep Agents, this is implemented literally—the agent edits its own instruction files based on experience.

Chase sees convergence between memory and evaluation: when an agent updates its instructions based on feedback, it should simultaneously create a test case to ensure it doesn't regress. Memory and evals become two sides of the same improvement loop.

## Observability and Evaluation

Chase frames agent observability as fundamentally different from software observability. Two factors drive the difference: agent inputs are theoretically infinite (a text box accepts anything), and LLMs are nondeterministic. **You don't know what an agent will do until you run it.**

This makes observability significantly more important—and more tightly connected to evaluation. Traces become test cases. Test cases power regression suites. Online evaluations feed analytics. It's all one loop.

Chase connects evaluation, memory, and prompt optimization as variations of the same pattern: the agent acts, a reward function scores the output, and parameters update. Whether that happens offline (eval suites), in real-time (user feedback updating memory), or systematically (prompt optimization), the underlying architecture is identical.

For production agents, this means **observability isn't a nice-to-have—it's the feedback mechanism** that drives every other improvement.

## Where the Real Differentiation Lies

If the harness is converging—every agent gets code execution, a file system, sub-agents, and [MCP](https://modelcontextprotocol.io/)—and the models keep getting smarter, where does differentiation lie for builders?

Chase's answer is direct:

> "The knowledge of how to do a process that you encode into natural language and give the agent, and then the tools and the skills that you let it call along the way—that's the stuff that won't change."

The harness primitives will stabilize. The scaffolding patterns will keep shifting. But the domain knowledge you encode—the standard operating procedures, the edge case handling, the integration with your specific systems—that's durable competitive advantage.

For enterprise leaders managing agent initiatives across multiple teams, Chase's recommendation is clear: **focus on building up your instructions and tools first.** Whether they get bundled as skills, sub-agents, or standalone agents is a scaffolding decision that will change. The underlying knowledge won't.

## The Bottom Line

The modern AI agent stack has converged on a clear set of primitives: detailed system prompts, planning tools, sub-agents, file systems, code execution, skills, context compaction, and memory. The harness that orchestrates these primitives—not the model underneath—is what separates agents that work from agents that don't.

For organizations building agents today, the strategic priorities are:

- **Invest in understanding the harness layer.** Evaluate agent runtimes and their primitives rather than building from scratch.
- **Encode your domain knowledge.** Instructions, tools, and skills specific to your processes are your durable advantage.
- **Build observability from day one.** Agent behavior is inherently unpredictable—you can't improve what you can't measure.
- **Design for context management.** File systems, compaction, and memory aren't optional—they're what let agents operate over long horizons.
- **Start with code-capable, long-horizon patterns.** The models are optimized for it, and the results speak for themselves.

The agent stack is getting rebuilt. The organizations that understand its architecture will be the ones that capture its value.

---

*At IntelligentNoise, we help organizations design, build, and deploy AI agent systems that deliver real business value. If you're evaluating agent architectures or building your first production agent, [book a strategy call](https://intelligentnoise.ai/contact) to discuss your approach.*

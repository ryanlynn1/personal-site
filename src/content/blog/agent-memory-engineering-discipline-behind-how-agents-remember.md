---
title: "Agent Memory Engineering: The Discipline Behind How Agents Actually Remember"
excerpt: "Nico Bustamante just published the deepest practitioner guide yet on how three production agents actually implement memory—and the lessons translate beyond the CLI into how any team building enterprise agents should be thinking."
category: "implementation"
tags: ["ai-agents","memory-engineering","agent-architecture","context-engineering","agentic-ai","enterprise-ai"]
author: "Ryan Lynn"
authorTitle: "Founder, IntelligentNoise"
authorAvatar: "/rl-headshot.jpeg"
publishedAt: "2026-05-09"
featured: true
readTimeMinutes: 13
metaTitle: "Agent Memory Engineering: How Agents Actually Remember | IntelligentNoise Insights"
metaDescription: "Nico Bustamante’s deep dive into how three production agents implement memory—and the engineering disciplines every team building enterprise agents should adopt."
---

**The most underrated layer of the modern agent stack is no longer the harness or the context layer. It's the engineering discipline around how agents remember the people and teams they work with.**

We've made the case before that [the harness is what matters more than the model](/posts/harness-matters-anatomy-modern-ai-agent-stack), and that [context is what separates agents that work from agents that fail](/posts/building-ai-agents-best-practices-context-is-the-product). Both of those still hold. What's becoming clear in the last six months of production deployments is that there's a third leg to the same stool—memory—and a real engineering discipline is forming around it.

The most thorough practitioner guide we've read on this dropped this week from [Nico Bustamante](https://nicolasbustamante.com/blog/agent-memory-engineering). Nico is one of the sharpest minds building agents in production today. His prior work at Fintool—[recently acquired by Microsoft](https://nicolasbustamante.com/blog/microsoft-has-acquired-fintool)—informed our earlier piece on context engineering. His new article, *Agent Memory Engineering*, is the most useful breakdown we've seen of how memory actually works inside three open production systems: Hermes (Nous Research), Codex (OpenAI), and Claude Code (Anthropic).

The piece is long and dense. We've pulled out the parts that translate beyond the developer CLI into how any team building enterprise agents should be thinking about this layer.

## Memory Is the Third Leg of the Stool

Think of the modern agent stack as a three-legged stool. The harness controls how the agent reasons turn-to-turn. The context layer is the proprietary, normalized knowledge the agent reasons over. Memory is what the agent learns from working with a specific user, team, or workflow over time: operating preferences, corrections, the small institutional facts that don't belong in a static knowledge base but shape every interaction once they're known.

All three legs hold weight. Take any one out and the stool tips.

A memoryless agent walks in as a stranger every session. A well-engineered memory layer means the agent shows up at session 50 already understanding how you operate. That doesn't make memory more important than context—it means the layers compound on each other. Clean context plus disciplined memory is the combination that delivers an agent your team actually keeps using.

What's new is that memory is now its own engineering discipline, with its own failure modes and design patterns. Nico's piece is the first practitioner-grade document to lay them out clearly.

## The Clever Architectures Lost

For roughly two years, every memory-focused AI startup pitched the same architecture: a vector database for embeddings, a knowledge graph layered on top, a background "memory agent" that watched the conversation and decided what to encode, and a RAG pipeline that retrieved memories at inference time.

It looked sophisticated. It mostly didn't ship.

The systems that did ship—Hermes, Codex, and Claude Code—converged on something almost embarrassingly simple. The agent has a Read tool, a Write tool, an Edit tool, and a bash tool. It uses them to read and write markdown files, the way a human would use a notebook. There is no embedding store. There is no semantic similarity search. There is no separate memory agent watching every turn.

> "Every clever architecture lost. The simple thing won. LLM plus markdown plus a bash tool. That is the entire stack." — Nico Bustamante

The lesson generalizes well beyond memory. Agents don't need bespoke infrastructure. They need primitive filesystem tools, a markdown convention, and prompt discipline. The same pattern is now showing up in [skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), plans, and checklists—markdown files in folders, not custom services.

The interesting questions aren't about data structures. They're about discipline.

## Three Architectures, Three Different Bets

Nico walks through the three open production systems in detail. The compressed version:

**Hermes (Nous Research)** bets on simplicity and prefix cache stability. Two flat markdown files—one for environment facts, one for user profile—with a hard character cap. The agent writes synchronously inside the turn, but the snapshot loaded into the system prompt is frozen at session start. New writes only become visible on the next session boot.

**Codex (OpenAI)** bets that the live turn should be cheap and the offline pipeline should do the heavy lifting. The live agent never writes memory directly. After a session has been idle for six hours, a small extraction model reads the entire transcript and emits a structured artifact. A heavier consolidation model then runs as a sandboxed sub-agent inside the memory folder itself, with its own git repository, and edits the canonical handbook. The next session sees only a summary file (capped at ~5K tokens). The full handbook is loaded on demand via grep.

**Claude Code (Anthropic)** bets on user oversight. Memory is written inside the live turn, by the live agent, using the same Write and Edit tools the agent uses for any other file. The user sees the write happen and can object on the spot. There's no background extractor. The memory index is always loaded into the system prompt; individual memory bodies are read on demand when the agent decides they're relevant.

Three completely different choices on synchronous versus deferred writes, always-loaded versus on-demand context, and live agent authoring versus background consolidation. None is obviously correct. Each trades latency, cost, freshness, and consistency in different proportions.

The architectural detail matters less than the disciplines that hold across all three.

## Five Engineering Disciplines That Translate

These are the patterns that show up regardless of which architecture you choose, and that any team building production agents should design for from day one.

### 1. Never Mutate the System Prompt Mid-Session

This is the single most important constraint, and it's economic, not architectural.

Every frontier model API (Anthropic, OpenAI, Google) bills cached input tokens at roughly one-tenth the price of uncached tokens. Cache hits require byte-for-byte prefix equality between turns. If the system prompt changes by even a single character at position N, every token after N is re-billed at the full rate.

The naive memory implementation—re-query a vector store on every turn, splice the results into the system prompt—is a **10x cost multiplier on the entire prompt** for the rest of the session. Over a 50-turn conversation, that turns a $1 conversation into a $10 conversation, for no semantic gain.

Every shipping system avoids this differently. Hermes freezes the snapshot at session start. Codex consolidates between sessions, not during them. Claude Code keeps the index byte-stable mid-session and picks up new entries on the next boot. The shared rule: dynamic per-turn data goes in the user message, not the system prompt.

For any team building agents, this is non-negotiable. Either freeze a snapshot at session start, inject memory in the user message, or load it on demand via tool calls. Mutating the system prompt mid-session breaks the economics of long-running agent sessions, and the cost shows up as a line item on your inference bill before it shows up anywhere else.

### 2. Make the Model Justify Writing

The most common failure mode in memory systems is noise. The model writes too many low-signal memories, the index becomes a personal Wikipedia article, and the agent stops trusting any of it. Once the noise-to-signal ratio crosses a threshold, the feature is effectively dead.

The Codex extraction prompt opens with an explicit gate: **default to no output**. The model is told that most sessions produce nothing worth remembering, that a no-op is a successful run, and that empty output is the right answer when nothing high-signal happened. The Phase 1 worker even has runtime checks that record empty rollouts as `succeeded_no_output` rather than failures.

Claude Code uses prompt discipline instead of a runtime check, with explicit lists of what *not* to save: trivial corrections that apply to one task only, facts already obvious from the codebase, statements likely to flip next session, duplicates of existing memories.

Hermes uses a hard character cap as the forcing function. Hit the limit and you can't add a new memory without removing an old one. The cap doubles as a quality gate—if the new memory isn't worth more than what's already there, don't write it.

The mechanism varies. The principle doesn't. Reward the empty output. Make the model explain why a new memory is worth more than what's already there.

### 3. Wrap Every Read in a Verification Reminder

Claude Code does something the other systems don't, and it's worth porting to any production system.

Every individual memory body, when read, is wrapped in a system reminder that includes the age of the memory in days and an instruction to verify before asserting. The reminder text reads, in part: *"A memory that names a specific function, file, or flag is a claim that it existed when the memory was written. It may have been renamed, removed, or never merged. Before recommending it: if the memory names a file path, check the file exists. If the memory names a function or flag, grep for it."*

This costs maybe 30 tokens per body read. It prevents an entire class of silent failure. A six-month-old memory about a renamed function gets caught the moment the agent tries to act on it, instead of silently pulling the agent toward stale behavior.

The pattern generalizes to any domain where the underlying state evolves. A memory about an account's preferred contact channel is a claim about a moment in time. A memory about a team's workflow is a claim about a moment in time. Every memory should be treated as a hint surface, not an authority surface—and every read should remind the model of that.

### 4. Decide How Memories Decay

All three systems handle eviction differently, and the comparison is instructive.

- **Hermes** uses a hard character cap with no automatic decay. Memories persist until something has to give. The forcing function is the size limit, and the model has to consolidate manually.
- **Codex** tracks usage explicitly. Every memory has a usage count and last-usage timestamp. Memories that haven't been cited in 30 days fall out of selection. Fresh memories get a 30-day trial window.
- **Claude Code** does no automatic decay at all. It relies on the verification reminder at read time. Stale memories don't get auto-trimmed; they get ignored when verification fails.

Three different forcing functions: a cap pressures consolidation, decay rewards memories that actually get used, verification makes staleness visible at use time. Each works for its own architecture. The point is that *something* has to handle staleness. A memory layer with no eviction and no verification gets less reliable every week.

### 5. Solve the Day-One Bootstrap Problem

This is the discipline nobody has fully solved yet, and it's the one that decides whether a memory layer is actually useful in practice.

A new user opens an agent for the first time. The memory directory is empty. The agent has no idea who they are, what their team looks like, what their preferences are, or what their environment looks like. The first ten sessions feel mediocre because the agent is still learning. By session fifty it knows them well. By session two hundred it's irreplaceable.

The problem: most users don't make it to session ten if the early experience is mediocre.

None of the three systems Nico audited solve this. Codex starts with an empty folder and waits for sessions to accumulate. Hermes starts blank. Claude Code partially solves it with a static configuration file the user authors manually—which works for technical users but doesn't scale.

The real answer probably looks like a one-shot extractor that pulls signal from systems the user has already invested in: their CRM, their email, their calendar, their internal wiki. The user's facts about themselves already exist somewhere. A good Day-One bootstrap seeds the memory layer with reference and project files generated from those sources, with the user approving the output before it lands.

This is the open frontier in agent memory design. The team that solves it well will have a real advantage—not because memory is the only thing that matters, but because the first ten sessions of an agent's life are where users decide whether to keep using it.

## What This Means for Sales Agents

The patterns above were drawn from coding agents, but they translate cleanly to the sales domain.

Inny—the agent voice inside the IntelligentNoise platform—operates across two layers we've written about before: a clean context layer (CRM records, call transcripts, email and messaging history, relationship data) and a harness designed for sales workflows. Memory is the third layer, and the disciplines from Nico's article shape how we approach it.

A few examples of what that looks like in practice:

- **Memory is a hint surface, not live truth.** Inny may remember that an account prefers async updates, that a deal previously stalled on a security review, or that a buying-committee pattern mattered in a prior opportunity. Those memories are not treated as authoritative. They're retrieved with freshness and verification guidance, and no memory ever overrides current CRM evidence, approval policy, or system rules. If a memory says a specific person is on the buying committee, Inny verifies the contact still exists in CRM before drafting outreach.
- **The signal gate matters more than the data structure.** Most sales conversations don't produce a memory worth saving. Inny defaults to no-op. A new memory has to clear a real bar: a stable rep preference, a durable account fact, a procedural rule, or reusable workflow knowledge. One-off corrections, temporary statuses, and raw facts already available from the CRM don't become memory unless the memory adds durable interpretation or operating context the CRM can't capture on its own.
- **Memory writes are visible and governed.** Rep-scoped preferences can save directly when explicitly requested. Memories that affect a whole account, contact, or opportunity flow through proposals, confirmations, or admin review before they take effect. The rep or operator can inspect what Inny thinks it learned, correct it, reject it, or remove it. The principle from Claude Code holds: when the user is in the loop, memory shouldn't quietly shift behind their back.
- **Memory is layered by sales scope.** Rep-specific preferences live in rep memory. Company-wide operating rules, brand voice, and escalation policies live in company memory. Account, contact, and opportunity facts live in entity-scoped memory tied to the underlying CRM record. More specific memory can inform the task, but the layered design keeps personal preferences from leaking into shared workspaces and shared rules from overriding rep-level nuance.

None of this makes memory useful by itself. The context layer still has to be clean. The harness still has to match the sales workflow. Memory compounds on top of those foundations: it reduces repeated explanation, preserves durable preferences, and helps long-running agent work feel continuous without turning stale notes into authority.

## The Bottom Line

Memory engineering is becoming a real discipline. It has its own failure modes—prefix cache invalidation, signal-to-noise ratios, staleness, cold-start problems—and its own emerging set of patterns for handling them.

The headline is that the architectures that won are simple. Markdown files. Filesystem tools. The same primitives software engineers have been using for decades. The architectures that lost added complexity in places where complexity wasn't the binding constraint. The binding constraint is judgment—deciding what's worth remembering, when to verify, when to evict—and judgment lives in prompts and in the model, not in the data structure.

For any team building enterprise agents, the practical takeaway is to design for these disciplines from day one. Don't change the system prompt mid-session. Make the model justify every write. Verify on every read. Pick an eviction strategy that matches your architecture. Plan for the Day-One bootstrap before users encounter it.

Memory is the third layer in the agent stack. It compounds on top of the harness and the context layer. Get all three right, and the agent gets meaningfully better the more your team uses it.

---

*At IntelligentNoise, we build sales agents on a stack designed for the long arc—clean context, a sales-native harness, and a memory layer that gets more useful the longer your team works with it. [Book a demo](https://intelligentnoise.ai/contact) to discover what IntelligentNoise can do for your revenue team.*

---
title: "The Question That Separates AI Agents That Deliver From Those That Don't"
excerpt: "Enterprise apps with AI agents will surge from 5% to 40% by 2026. The key differentiator isn't the technology—it's whether you can verify the agent's work. A framework from Anthropic's internal practices."
category: "ai-strategy"
tags: ["ai-agents","claude-agent-sdk","anthropic","enterprise-ai","ai-implementation","verification","agentic-ai"]
author: "Ryan Lynn"
authorTitle: "Founder, IntelligentNoise"
authorAvatar: "/rl-headshot.jpeg"
publishedAt: "2026-01-08"
featured: true
readTimeMinutes: 14
metaTitle: "The Question That Separates AI Agents That Deliver | IntelligentNoise"
metaDescription: "Enterprise apps with AI agents will surge from 5% to 40% by 2026. Learn the verification framework from Anthropic's practices that separates successful agents from expensive experiments."
---

**[Gartner predicts](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025) that enterprise apps with AI agents will surge from 5% to 40% by 2026.** Every major technology company is racing to capture this opportunity. Anthropic launched the [Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk). OpenAI introduced [AgentKit](https://openai.com/index/introducing-agentkit/). Google, Microsoft, and Amazon have all released their own agent platforms.

The results speak for themselves. [Google Cloud research](https://cloud.google.com/transform/roi-of-ai-how-agents-help-business) shows 52% of executives are already deploying agents, with 74% seeing ROI within the first year. [Klarna](https://openai.com/index/klarna/) reports their AI agent handles two-thirds of customer inquiries, saving $60 million annually.

But not every agent project succeeds. Gartner also predicts that more than 40% of AI agent projects will be canceled by the end of 2027 due to escalating costs, unclear business value, and inadequate risk controls. So what separates the winners from those that fail?

In a recent [workshop on the Claude Agent SDK](https://www.youtube.com/watch?v=_N9F9R8J7Jg), Thariq Shihipar from Anthropic shared an insight that cuts through the complexity: **"If you can verify its work, it's a great candidate for an agent. If you can't verify its work, it's harder."**

This single question—*can you verify the work?*—provides a practical framework for evaluating which business processes are ready for agent automation and which aren't.

## The Evolution to Agents

Before diving into the framework, it helps to understand what makes agents different from the AI applications most organizations have deployed.

Shihipar describes three stages of AI evolution:

**Stage 1: Single LLM Features.** The early GPT era. Categorize this email. Generate this response. One input, one output, done.

**Stage 2: Workflows.** More structured applications. Index a codebase via RAG, then provide code completions. Label incoming emails, then route them. Deterministic pipelines with AI at specific steps.

**Stage 3: Agents.** Systems that "build their own context, decide their own trajectories, are working very autonomously." You give them a goal in natural language, and they figure out the steps to achieve it—reading files, writing code, calling APIs, iterating on errors.

The canonical example is Claude Code, Anthropic's coding agent. You don't tell it which files to read or what commands to run. You describe what you want, and it navigates the codebase, writes code, runs tests, and iterates until the task is complete.

> "Cloud Code is a tool where you don't really tell it—we don't restrict what it can do. You're just talking to it in text and it will take a really wide variety of actions."

This autonomy is what makes agents powerful—and what makes them risky. When a system can take arbitrary actions, how do you ensure those actions are correct?

## The Three-Step Agent Loop

Anthropic's internal agent development follows a consistent pattern that Shihipar calls the "agent loop." Every successful agent, whether for coding, customer service, or data analysis, follows three steps:

### Step 1: Gather Context

How does the agent find what it needs to do its work?

For a coding agent, this means searching the codebase, reading relevant files, understanding the architecture. For an email agent, it means querying your inbox, finding relevant messages, understanding conversation threads. For a spreadsheet agent, it might mean navigating sheets, understanding headers, finding the data needed for analysis.

The key insight: **Think about how you would do this yourself—then give the agent those same tools.**

"The way I think about this is kind of like let's say that someone locked you in a room and they were giving you tasks," Shihipar explains. "What tools would you want? Would you just want a list of papers, or would you want a calculator, or a computer? Probably I would want a computer. I'd want Google. I'd want all of these things."

If gathering context requires human judgment that you can't encode into tools—if someone needs to interpret vague requirements or make subjective assessments before the work can begin—the process isn't ready for agent automation.

### Step 2: Take Action

What does the agent actually do? How does it execute on the task?

This is where Anthropic's approach diverges from conventional wisdom. Most agent frameworks emphasize tools—discrete, well-defined functions the agent can call. Anthropic emphasizes something different: **bash and code generation.**

"Bash is what makes Cloud Code so good," Shihipar states. "If you were designing an agent harness, maybe what you would do is you'd have a search tool and a lint tool and an execute tool. Every time you thought of a new use case, you need another tool. Instead, Claude just uses grep. It runs npm. It can lint. It can find out how you lint."

The bash tool provides composability. Instead of building dozens of specialized tools, you give the agent access to the entire Unix toolkit. It can pipe commands together, write scripts, use existing software. For non-coding tasks, agents can generate code that calls APIs, processes data, or orchestrates complex workflows.

This composability matters because **agents that can write scripts can solve problems you didn't anticipate.** A tool-only approach limits agents to the capabilities you've explicitly defined.

### Step 3: Verify the Work

This is the critical step—and where most agent projects fail.

"Think about can you verify its work," Shihipar emphasizes. "Coding you can verify by linting. You can at least make sure it compiles. Research is less verifiable than code because code has a compile step. You can also execute it and see what it does."

Verification is what distinguishes agents that deliver from expensive experiments. Without it, you're trusting autonomous systems to produce correct outputs without any checks—a recipe for the "unclear business value" that Gartner identifies as a primary failure mode.

## How Agents Verify Their Own Work

The most sophisticated agents don't just complete tasks—they check their own work through the same loop. This self-verification is built into the agent architecture.

**Deterministic rules catch common errors.** In Claude Code, if the agent tries to write to a file it hasn't read, the system throws an error: "You haven't read this file yet. Try reading it first." These rules prevent entire categories of mistakes before they compound.

**Linting and compilation provide automated checks.** For code generation, the agent runs the code. If it doesn't compile, the agent sees the error and iterates. If tests fail, it reads the failures and tries again.

**Sub-agents can review the main agent's work.** Shihipar describes using adversarial sub-agents for verification: "You'd probably start a new context session and be like, 'Hey, adversarially check the work of this output.' You might say it was made by a junior analyst—critique it."

**Hooks insert deterministic checkpoints.** The agent SDK supports hooks—triggers that fire after specific events. These can run validation scripts, check for policy violations, or insert human review at critical points.

The key principle: **"Anytime you're thinking about verification, the first step is what can you do deterministically."** Rule-based verification catches errors before they compound. LLM-based verification fills the gaps.

## The Verification Spectrum

Not all business processes are equally suited for agent automation. Understanding where a process falls on the verification spectrum helps predict whether an agent will deliver value or become another failed pilot.

### High Verifiability + High Reversibility = Excellent Agent Candidates

These are the sweet spots for agent automation:

- **Code generation:** Linting, compilation, tests, and version control provide multiple verification layers. Mistakes can be undone with git.
- **Data pipelines:** Schema validation, null checks, and data quality rules verify outputs. Bad runs can be re-executed.
- **Document formatting:** Templates and style guides provide clear correctness criteria. Documents can be regenerated.

This explains why coding has become AI's first "killer use case" in the enterprise. According to [Menlo Ventures](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/), the AI coding market reached **$4 billion** in 2025—up from $550 million in 2024. **50% of developers** now use AI coding tools daily.

### High Verifiability + Low Reversibility = Good with Guardrails

These processes benefit from agents but require human checkpoints:

- **Customer service:** Resolution tracking and escalation patterns verify success. [Salesforce reports](https://www.salesforce.com/news/stories/agentic-enterprise-index-insights-h1-2025/) 84% of support cases resolved autonomously—but human escalation paths remain critical for edge cases.
- **Workflow automation:** Process completion and error rates provide verification. Business process changes may be hard to undo.

Klarna's $60 million in savings from AI customer service came from high-verifiability interactions: checking order status, answering FAQs, processing simple requests. The resolution is verified by whether the customer's question was answered.

### Low Verifiability + High Reversibility = Proceed with Caution

These processes can use agents for drafts and exploration, but outputs need human review:

- **Research synthesis:** Sources can be cited, but comprehensive coverage is hard to verify programmatically.
- **Content drafts:** Style guides provide partial verification, but quality is subjective.

### Low Verifiability + Low Reversibility = Poor Agent Candidates

These should remain human-driven, at least until verification capabilities improve:

- **Strategic decisions:** Correctness depends on future outcomes that can't be verified in advance.
- **High-stakes communications:** Tone, appropriateness, and impact are subjective and irreversible.
- **Complex judgment calls:** Nuanced tradeoffs that depend on context that's hard to encode.

> "How reversible is the work is a really good intuition," Shihipar notes. "Code is quite reversible—you can just go back, you can undo the git history. Computer use is not reversible in state. Let's say you go to DoorDash and add a Pepsi when the user wanted a Coke—you can't just go back and click on the Coke. Your mistake has compounded the state machine."

## Why Most Agent Projects Fail

The Gartner prediction—40%+ of projects canceled by 2027—reflects three common failure modes, each traceable to violations of the verification principle.

### Failure Mode 1: Over-Engineering

Organizations start with complex multi-agent architectures instead of simple, verifiable solutions.

Anthropic's own documentation on [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) advises: "Start with simple prompts, optimize them with comprehensive evaluation, and add multi-step agentic systems only when simpler solutions fall short."

The temptation to build impressive agent systems leads to complexity that's hard to verify and harder to debug. When something goes wrong in a multi-agent workflow, identifying which agent made which mistake becomes a debugging nightmare.

### Failure Mode 2: Wrong Use Case Selection

Organizations choose low-verifiability tasks because they seem impressive or strategic.

The "research agent" is a common trap. Deep research demos well—the agent searches the web, synthesizes information, produces a polished report. But in production, how do you verify the research is comprehensive? How do you ensure nothing important was missed? The verification gap means errors compound silently.

This explains why customer service leads agent adoption. [Google Cloud found](https://cloud.google.com/transform/roi-of-ai-how-agents-help-business) that **49%** of early agent adoption is in customer service—where resolution tracking provides clear verification metrics.

### Failure Mode 3: Treating Agents Like Chatbots

Organizations deploy agents without providing the tools and context they need to verify their own work.

Shihipar uses a vivid analogy: "Imagine if someone came to you with a stack of papers and said, 'How much did I spend on ride sharing this week?' That would be really hard. You need very good precision and recall."

Agents need the same tools for verification that humans use: the ability to check their work, iterate on errors, and confirm results before delivering them. Without these capabilities, agents produce outputs that look correct but may contain subtle errors.

## A Framework for Agent Readiness

Before investing in agent automation, evaluate each potential use case against these four questions:

### Question 1: Can You Map the Process?

What context does a human need to do this task? What actions do they take? How do they know they did it right?

If you can't articulate these clearly, the process isn't ready for automation. Agents need the same clarity humans need—just encoded into tools and prompts.

### Question 2: Can You Score Verifiability?

Can you write automated tests for "correct"? Are there clear success/failure signals? Can you catch errors before they cause damage?

The higher your verifiability score, the more likely an agent will succeed. If verification requires human judgment at every step, you're building an expensive system that still requires constant oversight.

### Question 3: Can You Assess Reversibility?

What happens if the agent makes a mistake? Can you roll back? How quickly? What's the blast radius of a failure?

High reversibility means you can deploy agents more aggressively, iterate faster, and recover from errors gracefully. Low reversibility means every agent action is high-stakes.

### Question 4: Can You Start Simple?

Can you begin with the highest-verifiability step in the process? Can you add complexity only when you have evidence it's needed?

"Simple but not easy" is Shihipar's summary. The final agent system should be elegant and minimal. But finding that simplicity requires iteration, testing, and ruthless prioritization.

## The Bottom Line

The agent opportunity is real. Markets are growing exponentially. Early adopters are capturing significant value. The technology has matured enough for production deployment.

But the 40% failure rate is also real. [McKinsey's 2025 State of AI](/posts/mckinsey-state-of-ai-2025-the-6-percent-problem) research confirms the pattern: 88% of organizations use AI, but only 6% capture meaningful enterprise value. The gap between adoption and transformation applies to agents just as it applies to other AI initiatives.

The verification question provides a filter. Before building an agent, ask: Can we verify its work? If the answer is no—if success depends on subjective judgment, if errors are invisible until they cause damage, if the work is irreversible—you're likely heading toward the 40%.

If the answer is yes—if you have clear correctness criteria, automated checks, reversible actions, and deterministic verification—you're building on solid ground.

As Gartner warns: "Most agentic AI projects right now are early stage experiments or proof of concepts that are mostly driven by hype and are often misapplied. This can blind organizations to the real cost and complexity of deploying AI agents at scale."

The organizations that succeed will be those that match the right problems to the right technology—starting with verification, not with ambition.

---

*At IntelligentNoise, we build production-grade AI agents that follow this exact formula—gathering context programmatically, taking verifiable action, and implementing rigorous self-verification loops. If you're evaluating where agents fit in your business, [book a strategy call](https://intelligentnoise.ai/contact) to discuss your specific use cases.*

---
title: "Context Is the Product: Best Practices for Building AI Agents That Actually Work"
excerpt: "Everyone can call an LLM API. What separates agents that work from agents that fail is context—clean, normalized, searchable knowledge that turns a generic model into a domain expert."
category: "implementation"
tags: ["ai-agents","context-engineering","implementation","best-practices","agentic-ai","enterprise-ai"]
author: "Ryan Lynn"
authorTitle: "Founder, IntelligentNoise"
authorAvatar: "/rl-headshot.jpeg"
publishedAt: "2026-01-29"
featured: true
readTimeMinutes: 12
metaTitle: "Context Is the Product: Best Practices for Building AI Agents | IntelligentNoise Insights"
metaDescription: "Why clean, normalized context—not the model—separates AI agents that work from agents that fail. A practitioner’s playbook from Vercel, Fintool, and production deployments."
---

**Everyone can call an LLM API. The API is the same for everyone. So why do most AI agents fail in production?**

The answer, consistently, is context. Not the model. Not the prompt. Not the framework. The organizations building agents that actually deliver value have figured out one thing the rest haven’t: how to turn messy, heterogeneous internal data into clean, structured context that a model can reason over.

This insight emerges clearly from practitioners who’ve shipped production agents—Vercel’s engineering team with their [filesystem-first agent architecture](https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash), [Drew Bredvick’s GTM agent at Vercel](https://drew.tech/posts/building-vercels-first-gtm-agent) that replaced 10 SDRs, and [Nic Bustamante’s battle-tested lessons](https://x.com/nicbstme/status/2015174818497437834) from building AI agents for financial services at Fintool. Their architecture choices converge on the same principles.

Here’s what they’ve learned—and the playbook you can apply to your own organization.

## Why Context Is the Product

We explored the strategic case for context as competitive advantage in our earlier piece on [Aaron Levie’s vision for the era of context](/posts/the-era-of-context-aaron-levie-ai-competitive-advantage). The argument is straightforward: when every company has access to the same frontier models, the differentiator becomes your proprietary data—the knowledge, processes, and institutional memory that no competitor can replicate.

That post covered *why* context matters. This one covers *how* to build it.

Every organization sits on a wealth of internal knowledge scattered across dozens of systems. CRM data, enrichment providers, Gong call recordings, support tickets, product usage analytics, sales playbooks, internal wikis, customer feedback. Each source has a different schema, a different update frequency, a different quality level. The agent needs one thing from all of it: **clean context it can reason over**.

Nic Bustamante at Fintool describes this challenge in financial services—SEC filings in nested HTML, earnings transcripts with speaker segmentation, press releases from PRNewswire, research reports in PDF, market data from Snowflake, alternative data from satellite imagery. The heterogeneity is staggering. But the principle is universal.

> "Anyone can call an LLM API. Not everyone has normalized decades of financial data into searchable, chunked markdown with proper metadata. The data layer is what makes agents actually work." — Nic Bustamante, Fintool

The same applies to any business domain. Your CRM data, your Gong call transcripts, your support ticket history—these are your equivalent of SEC filings. Messy, heterogeneous, invaluable. The organization that normalizes this data into clean context wins.

### The Normalization Layer

Fintool’s approach is instructive. Everything becomes one of three formats:

- **Markdown** for narrative content (filings, transcripts, articles, call notes)
- **CSV/tables** for structured data (financials, metrics, usage analytics)
- **JSON metadata** for searchability (dates, document types, categories, entities)

Chunking strategy matters too. Not all documents chunk the same way. Earnings transcripts chunk by speaker turn. Support tickets chunk by conversation thread. Sales calls chunk by topic segment. Product documentation chunks by section hierarchy. The chunking strategy determines what context the agent retrieves—bad chunks produce bad answers.

For any organization building agents, the first question isn’t "which model should we use?" It’s "what does our context layer look like?"

## The Filesystem Is the Right Abstraction

Here’s the counterintuitive architectural insight that multiple teams have converged on independently: **the filesystem is a better interface for agents than vector databases or custom APIs**.

Vercel’s engineering team [demonstrated this concretely](https://vercel.com/blog/how-to-build-agents-with-filesystems-and-bash). By replacing elaborate RAG pipelines with organized file structures and standard bash tools, they **reduced agent costs by 75%** while improving output quality. Their sales call summarization agent went from approximately $1.00 to $0.25 per call.

The reason is elegant: LLMs have been trained on massive amounts of code. They’ve spent their entire training navigating directories, grepping through files, reading documentation, and managing state across complex codebases. The filesystem isn’t a new abstraction they need to learn—it’s one they already understand deeply.

Bustamante arrived at the same conclusion from a different direction. Fintool adopted an S3-first architecture where user data—watchlists, portfolios, preferences, memories, skills—lives as YAML and markdown files in S3. The filesystem becomes the user’s personal knowledge base. As he puts it: "What you see is what the agent sees. No hidden state. You can grep your entire knowledge base like a codebase."

The practical implications:

- **Precision over approximation.** Vector search returns semantic similarity. Filesystem operations deliver exact matches. Direct file retrieval eliminates the imprecision of embedding-based retrieval.
- **On-demand context loading.** Instead of stuffing everything into a prompt upfront, the agent loads context as needed—navigating directory structures, reading specific files, searching with grep. This minimizes token consumption.
- **Domain-native organization.** Structure your data the way your domain experts think about it. Customer accounts as directories. Support tickets as files within those directories. Quarterly reports in date-organized folders. The hierarchy itself carries semantic meaning.

> "Maybe the best architecture is almost no architecture at all." — Vercel Engineering

This doesn’t mean vector databases have no role. But the default assumption—that agents need elaborate retrieval pipelines—is being challenged by practitioners who’ve found simpler approaches that work better.

## Skills Are the New Product Layer

If context is the data your agent reasons over, skills are the instructions that tell it *how* to reason. And increasingly, **skills—not models—are becoming the product**.

A skill is a markdown file that teaches the agent how to perform a specific domain task. Anthropic formalized this with their [Agent Skills specification](https://claude.com/blog/equipping-agents-for-the-real-world-with-agent-skills)—modular capability packages that extend what an agent can do.

Bustamante’s experience at Fintool illustrates why this matters. Without skills, even frontier models are surprisingly bad at domain tasks. Ask Claude or GPT to build a DCF valuation model. It knows the theory. It can explain the methodology. But actually executing one? It misses critical steps, uses wrong discount rates for the industry, forgets to add back stock-based compensation, skips sensitivity analysis. The output looks plausible but is subtly wrong in ways that matter to professionals.

Skills solve this by encoding domain expertise in a format the model can follow:

- **Non-engineers can author them.** A portfolio manager who’s done 500 DCF valuations can encode their methodology without writing Python.
- **No deployment needed.** Change a skill file and it takes effect immediately. No CI/CD pipeline, no code review cycle.
- **Readable and auditable.** When something goes wrong, you can read the skill and understand exactly what the agent was supposed to do.

The same pattern applies outside finance. Your top sales rep’s qualification methodology becomes a skill. Your best support engineer’s troubleshooting framework becomes a skill. Your operations lead’s vendor evaluation criteria becomes a skill. The institutional knowledge that usually lives in people’s heads gets externalized into files the agent can follow.

### Design for Obsolescence

There’s an important tension here. Models are improving fast. The elaborate step-by-step instructions you write today may be unnecessary in six months as models get smarter at domain tasks.

Bustamante’s advice: design skills for deletion. Write them in markdown—easy to update, easy to remove. As basic tasks get commoditized by smarter models, delete those skills and build new ones for the harder problems that emerge. The frontier keeps moving. Your skills should move with it.

## Sandbox Everything

When agents need to execute multi-step operations—and production agents almost always do—isolated execution environments are non-negotiable.

Bustamante learned this the hard way. Early in Fintool’s development, an LLM decided to run `rm -rf /` on the server while trying to "clean up temporary files." That incident converted him into a true believer in sandboxing.

The architecture that emerged: each user gets their own isolated sandbox environment. The agent can do whatever it wants inside—install packages, run scripts, modify files. AWS ABAC (Attribute-Based Access Control) generates short-lived credentials scoped to specific S3 prefixes. User A literally cannot access User B’s data. The IAM policy physically won’t allow it.

Key patterns for sandbox design:

- **Pre-warming.** Fintool spins up sandboxes in the background when a user starts typing. By the time they hit enter, the sandbox is ready.
- **Timeout management.** A base timeout (600 seconds) that extends with each tool usage keeps sandboxes alive during complex workflows without leaving orphaned environments.
- **Three-tier mounting.** Private (read/write for the user), shared (read-only for the organization), and public (read-only for everyone) mount points provide flexible access control.

For enterprise deployments, sandboxing isn’t just a safety measure—it’s a compliance requirement. Data isolation, audit trails, and access control are table stakes for regulated industries.

## Shadow Test Before You Ship

The most successful agent deployments share a common methodology: **they run in shadow mode before they touch production**.

Drew Bredvick’s GTM agent at Vercel followed this pattern precisely. Before writing a single line of production code, the team back-tested their agent against three months of historical lead data. Could the AI reach the same qualification decisions as human SDRs? They tweaked prompts until the AI agreed with human decisions, exposing edge cases and gaps in reasoning.

Even after back-testing showed promise, the agent ran alongside human SDRs without taking action. The team compared outputs, identified disagreements, and refined the system. Only after this validation did the agent go live—achieving **100% efficiency improvement** and conversion rates matching their best human performers.

The shadow testing methodology serves multiple purposes:

- **Validates accuracy** before real-world consequences
- **Builds organizational trust** by demonstrating the agent’s reasoning
- **Surfaces edge cases** that synthetic test data misses
- **Creates training data** from disagreements between human and AI decisions

### Evaluations Are Not Optional

Bustamante takes this further for high-stakes domains: **every skill has a companion evaluation suite, and PRs are blocked if eval scores drop more than 5%**.

Generic NLP metrics don’t work for domain-specific agents. A response can be semantically similar to the correct answer but have completely wrong numbers. Fintool maintains approximately 2,000 test cases across categories—ticker disambiguation, fiscal period normalization, numeric precision, adversarial grounding.

The principle generalizes. If your agent handles customer data, you need evals that catch data leakage. If it processes financial transactions, you need evals that catch calculation errors. If it drafts communications, you need evals that catch tone and accuracy issues. Build the eval suite that matches the stakes of your domain.

## The Implementation Playbook

Synthesizing these practitioner insights into an actionable framework:

### Step 1: Audit and Normalize Your Context

Identify every data source your agents will need. CRM records, call transcripts, support tickets, product docs, internal wikis, analytics dashboards. Map each source’s schema, update frequency, and quality level. Then normalize everything into clean formats: markdown for narrative content, structured tables for data, JSON metadata for searchability.

### Step 2: Structure as a Filesystem

Organize your normalized data in a directory hierarchy that mirrors how your domain experts think about it. Customers as directories. Interactions as files within those directories. The structure itself carries meaning that the agent leverages during retrieval. Prefer this over flat vector embeddings as your primary retrieval mechanism.

### Step 3: Build Skills for Domain Workflows

Identify the high-value tasks your agents need to perform. Interview your top performers—what’s their methodology? Encode that expertise in markdown skill files. Start with the workflows that are most common and most error-prone. Use Anthropic’s Agent Skills format for portability.

### Step 4: Sandbox and Isolate Execution

Give each user or session its own isolated environment. Implement proper access controls (ABAC, short-lived credentials). Pre-warm sandboxes for responsiveness. Set appropriate timeouts. This is especially critical for enterprise and regulated deployments.

### Step 5: Shadow Test, Evaluate, Iterate

Run your agent alongside existing workflows before replacing them. Back-test against historical decisions. Build domain-specific evaluation suites. Set quality gates that block deployments on regression. Invest in monitoring—the observability stack that catches issues before your users do.

## The Bottom Line

The model is not your product. The model is a commodity—everyone has access to the same frontier capabilities. What separates agents that deliver value from agents that disappoint is everything you build around the model: the context layer that gives it knowledge, the skills that give it methodology, the sandboxes that give it safety, and the evaluation systems that give it reliability.

The organizations winning with AI agents aren’t the ones with the best prompt engineering. They’re the ones that have done the unglamorous work of normalizing their internal data into clean, searchable context. They’ve encoded their best practitioners’ expertise into skills. They’ve built the testing and evaluation infrastructure that catches mistakes before they reach users.

Context is the product. Everything else is an API call.

---

*At IntelligentNoise, we help organizations build the context layers, skills, and evaluation systems that turn generic AI models into production-grade agents. If you’re ready to move from experimentation to deployment, [book a strategy call](https://intelligentnoise.ai/contact) to discuss your agent architecture.*

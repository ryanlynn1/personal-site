---
title: "Forgetting Well: The Compaction Problem Behind Every Long-Running Agent"
excerpt: "Baseten's research team and Harvey are circling the same question: what should an agent keep when it cannot possibly keep everything?"
category: "industry-insights"
tags: ["compaction","long-horizon-agents","kv-cache","agent-memory","harvey","baseten","vertical-ai","context-engineering"]
author: "Ryan Lynn"
authorTitle: "Founder, IntelligentNoise"
authorAvatar: "/rl-headshot.jpeg"
publishedAt: "2026-07-28"
featured: true
readTimeMinutes: 18
metaTitle: "Forgetting Well: The Compaction Problem Behind Long-Running Agents | IntelligentNoise Insights"
metaDescription: "Why context windows plateaued, what Baseten's KV-cache research means for long-horizon agents, and what Harvey's work in legal AI reveals about agent memory."
---
**Any time I get a chance to learn from the smartest people working in AI, I take it.**

Sometimes that is [a paper](https://arxiv.org/abs/2603.28052). Sometimes that is [a podcast](https://www.youtube.com/watch?v=n4E4xNYCkYM). Sometimes that is [a tweet](https://x.com/trq212/status/2052809885763747935). Recently it was two videos, watched a few weeks apart, that reframed how I think about the hardest problem in building agents that run for a long time.

First, a problem you have almost certainly hit without having a name for it. If you have used Claude or ChatGPT for anything more involved than a quick question - a long working session, a research project, a coding task that stretched across an afternoon - you know the feeling: the assistant seems to get *worse* the longer you work with it. It drifts. It forgets a decision you made an hour ago. It re-asks something you already answered. It contradicts, with total confidence, something it told you earlier.

Go long enough, and you may see a quiet notice that the conversation is being **compacted**.

![Two different products, the same quiet notice](/blog/compaction-side-by-side.png)

That single word carries an enormous amount of weight. It sits at the center of a problem some of the best teams in AI are now racing to solve, and the answer they are converging on is stranger than "make the context window bigger."

## What compaction actually is

Every model has a **context window**: the amount of information it can hold in view at one time. Think of it as the model's desk.

The model already knows a great deal before you say a word - everything absorbed during training, which is roughly the public internet up to a cutoff date. That knowledge is baked into the model itself, and it takes up no room on the desk.

The desk is for everything else. Your conversation, your documents, your codebase, your account history, last week's call transcript - none of that was in the training data, so the only way the model can use it is if it is sitting on the desk. Everything on the desk is available instantly and perfectly. Everything off it may as well not exist.

The desk is finite, and a long conversation or a folder of contracts eventually exceeds the surface. Compaction is what happens when it fills up: the system takes everything sitting there, writes a summary, sweeps the originals away, and puts the summary back down. The session continues. The model keeps working. And a great deal of what was on that desk is simply gone.

The technical word for this is **lossy**. Something was discarded, and you did not get to choose what.

## How we got here

This problem used to be much worse, and the workarounds we built to survive it are still with us.

When GPT-4 arrived in early 2023, it shipped with an 8,000-token window and a 32,000-token variant that felt enormous at the time. Windows grew fast from there: 128,000 tokens by late 2023, 200,000 shortly after, and Google reaching a million with Gemini 1.5 in early 2024.

Then the curve flattened. The working range settled somewhere between roughly 256,000 tokens and a million, and that is broadly where it still sits.

Meanwhile the work kept growing. A chat exchange costs a few thousand tokens. An agent reading files, running commands, and reasoning over the results burns a hundred thousand without trying. So from 2024 through all of 2025, using these tools well meant fighting the context window in every long session: watching the meter, deciding what to paste and what to leave out, dumping state to a file before the wall arrived. You were not just doing the work. You were managing the budget for the work.

It got strange enough that the models started doing it too. Claude Sonnet 4.5 was the first model widely noticed to be aware of its own context window, and it developed what one team aptly named [context anxiety](https://inkeep.com/blog/context-anxiety). Sensing a limit approaching, it would take shortcuts, abandon tasks early, and rush out a summary - all while estimating, with great precision and no accuracy, how much room it had left. Cognition hit the same behavior rebuilding Devin, and the fix was almost comic: give the model a million-token window, then quietly cap what it can use at 200,000. The anxiety stopped once the model could no longer see the edge.

That is the tell. When the operator and the model are both spending attention on the window instead of on the work, the window is the problem.

And hitting the wall was brutal. The model would forget essentially everything. Not degrade - forget. So people, like me, developed a ritual. Before you got close to the limit, you asked the assistant to write a markdown file summarizing what you had done and decided, so the next session could read it and catch up. Cut it too close - let compaction fire before that file was written - and everything the session had worked out went with it. It was a game, and I spent many, many hours of 2025 playing it.

That ritual is the ancestor of the **CLAUDE.md** and **AGENTS.md** files now standard in most coding projects - and it is no longer just a coding habit. Most AI chat products now keep some equivalent memory file running in the background. None of them were designed as a memory architecture. They were a workaround for a model that could not remember anything between sessions.

I recently went looking for the earliest memories ChatGPT saved about me, back when memory first shipped. A little bit of everything, as you can see.

![The first things ChatGPT chose to remember about me, saved October 1, 2024](/blog/early-chatgpt-memories.png)

We now have a whole toolkit for working around the context ceiling: [progressive disclosure](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), where detail, like Skills, loads only once it is actually needed; summarization compaction; externalized memory files like CLAUDE.md; retrieval and RAG; fine-tuning; and sub-agents that carry a subtask off into their own clean context. We have written before about how these fit together - the [harness around the model](/posts/harness-matters-anatomy-modern-ai-agent-stack), the [context layer that feeds it](/posts/building-ai-agents-best-practices-context-is-the-product), and [how production agents implement memory](/posts/agent-memory-engineering-discipline-behind-how-agents-remember). Memory in particular has gotten good enough that these products now genuinely feel like they know you.

But for long-running work the ceiling is still there, and every one of those techniques sits at an extreme. Keep everything in the window and you get perfect recall at a memory cost that grows with every token, which is exactly why it does not scale. Compress heavily into files, indexes, or weights and you get something cheap and durable that is lossy in ways nobody can fully characterize.

What has been missing is the middle.

## Act I: The memory problem

Here is where my own experience got ahead of my understanding.

Sometime this year I noticed that [Codex](https://chatgpt.com/codex/) - OpenAI's coding agent, now built into the ChatGPT desktop app - had stopped feeling like it had a ceiling. I could run long sessions, watch it compact repeatedly, and it kept going without the usual sense of loss. For the first time I was not managing the context window. I was just working.

I assumed I was imagining it until Viv Trivedy [posted almost exactly what I had been thinking](https://x.com/Vtrivedy10/status/2062907178428567791). Viv leads applied research at LangChain, the company behind one of the most widely used frameworks for building AI agents, working on continual learning and harness engineering - which is to say, on exactly this problem.

> "Did OpenAI basically solve compaction? I pretty much never have issues with [GPT-]5.5 in Codex across ultra long threads spanning many compactions. This used to feel like such a problem and I kinda just don't even feel it anymore. Anyone else feel this?"

I could not have agreed more - and it mattered, because the window had been the hardest constraint on the work I care most about: long research tasks with verification loops that run for hours and have to keep their own findings straight the whole way through.

Then I stumbled onto a talk from the research team at Baseten - an infrastructure company that trains and runs models in production for other AI companies, which puts them close to this problem from both ends. It is titled, appropriately, [The Memory Problem](https://www.youtube.com/watch?v=I8YnwUV2C9w), and Mudith Jayasekara, Charlie O'Neill, and Harry Partridge spend twelve minutes on exactly this. It is the clearest articulation I have found of where the field is heading. They name the gap directly: what is missing is an **intermediate memory layer**, and they believe the place to build it is in the **KV cache**.

### What the KV cache is, in plain terms

When a model reads your conversation, it does not store the words. It builds an internal representation of what it read: a dense set of numbers encoding what those words *meant* in context. That representation is what it consults when generating the next word. The important property is that this representation is far richer than the text that produced it. It carries nuance, relationships, and implications that never appear in any summary you could write.

Which leads to the observation that reframed the whole problem for me:

> "If you're trying to shove as much information into a very small space as possible, tokens are just an inefficient way to do that."

Every summarization strategy we have - every markdown file, every compaction summary - takes that rich internal representation, throws it away, converts back down to English, and asks the model to rebuild its understanding from the words. We have been round-tripping through the lossiest available format because it is the one humans can read.

This is not for lack of effort. Compaction is now something the best teams train for rather than bolt on: Cursor, the AI coding editor, trains its in-house model with compaction in the loop, and Charlie notes that models trained this way invent their own shorthand for squeezing more meaning into fewer tokens. It works. It is just working against the format.

The alternative is to compress that representation directly and never return to English at all. That is the intermediate layer the Baseten team is building, published as [Still: Amortized KV Cache Compaction in a Single Forward Pass](https://arxiv.org/abs/2606.07878) - 8x to 200x compression that holds up across dozens of consecutive rounds.

That last part is the part that matters for agents. Surviving one compaction is not hard. Staying coherent across thirty of them, inside a single task that runs for hours, is the whole game - and it is the difference between an agent that can be trusted with long work and one that quietly loses the thread halfway through.

### So is that what Codex is doing?

After watching the talk, I [asked Charlie O'Neill directly on X](https://x.com/oneill_c/status/2073243363730469065): is this what OpenAI is now doing with Codex? The answer was yes - that is what they believe.

To be clear, nobody outside OpenAI actually knows what is in the Codex harness, and Charlie says as much in the talk itself:

> "I have the opinion that I think OpenAI's compaction, which is fantastic and runs very quickly, is probably some form of neural KV cache compaction. And it's why you see these Codex agents able to go for so long and iterate very, very well across many compactions."

There is a real cost worth naming. Compress into a latent representation instead of English and you lose interpretability - you can no longer read the summary and check what survived. For a coding session that is an acceptable trade. For a regulated industry it is a serious problem, which is exactly where the second video picks up.

## Act II: When you cannot afford to miss anything

The second conversation is between Gabe Pereyra, co-founder and president of [Harvey](https://www.harvey.ai), and Baseten's Charlie O'Neill and Mudith Jayasekara - [available here](https://www.youtube.com/watch?v=TU8kwE7z1qY). Harvey builds AI for law firms - the leading company in legal AI, working with many of the largest firms in the world - and Gabe and co-founder Winston Weinberg have spent years arguing, largely correctly, that building for a specific vertical is a real business and not a feature waiting to be absorbed.

It opens with the most useful illustration of this problem I have encountered. Harvey built synthetic data rooms - the document collections lawyers review during a merger - and pointed off-the-shelf agents at them. The agents did not read every document. They searched, found plausible material, and produced a result. The result was missing things.

Gabe on why that is unacceptable:

> "If you're working at a law firm, an associate comes back to you and says, 'I did some graph searches over the data room and I'm pretty sure I found some results,' but they didn't read everything - you could probably fire them."

The standard is not "found relevant documents." It is **read every document**. And a real data room now runs to 50 or 100 million tokens, against a context window that tops out between 256,000 and a million.

You cannot fit it. You cannot skip it. So the whole problem becomes: what do you keep as you go?

### Why the window stopped growing

A reasonable person might assume this resolves itself - windows grew more than a hundredfold in a couple of years, so give it time.

Charlie's read is that it is not coming. The cost of processing a context window rises far faster than the window itself, and the field spent years on architectures designed to escape that wall without solving it.

> "With the hardware we have and the model sizes that we have, it's very hard to push something that looks like vanilla attention past a million tokens."

If Charlie is right, compaction is not a stopgap until windows get bigger. It is the thing you build around.

That is a prediction, not a settled fact. Plenty of people expect another jump, and this field has a poor record of calling ceilings.

But the interesting part is that the conclusion survives either way. Ask how many tokens it takes to do an associate's job at a law firm, across every matter and precedent and internal norm, and the honest answer is somewhere between a billion and a trillion. No plausible context window closes that gap. Whether the ceiling is a million tokens or fifty million, something still has to decide what stays.

### What should an agent just know?

Which leads to the question I keep coming back to. Gabe's version: if you dropped a frontier-level model into a specific law firm and asked it to work as an associate, what would it need to be *told* every time, and what should it simply know?

> "As a human, if I were to go work in this law firm, what would I be expected to remember and not have to search and find every time?"

There is a lot in that. A new associate does not look up where documents live, how the firm handles a particular clause, which partner wants what format, or how review actually runs. They absorbed it. It is not in their working memory; it is in them.

The sales version of the question is identical. A rep two years into the job does not look up your ICP. They know your won-deal shape - not the firmographic filter saved in the CRM, but the real pattern of which accounts close, which stall at procurement, and which look perfect on paper and never move. They know which leadership changes are worth a same-day call and which are noise. They know that a hiring surge in one function means budget and in another means nothing, and they can feel the point in a cycle where a deal has quietly gone single-threaded.

None of that is written down anywhere. Ask most teams to document it and you get a slide that captures maybe a third, because the useful part was never a definition. It accumulated one correction at a time.

Charlie's view is that the mechanisms to move information from context into weights already exist - they are just early and rough - and that specialization will descend a ladder from legal reasoning generally, to a specific firm's norms, to eventually team and person level. The same ladder runs through sales: selling in general, then your company's motion, then a segment, then an individual rep's book.

There is a plain economic argument underneath this, too. However capable a model becomes, knowing something will always beat looking it up. An enormous share of what agents do today is search - re-ingesting the same material every time a fresh window opens. Every piece of that you move into durable memory is cost, latency, and error you stop paying forever.

And a finding from Harvey's own early work complicates the "just retrieve it" answer considerably.

They tried to improve legal research by training on case law. The models were already excellent on Supreme Court cases and fell off sharply on the long tail of non-public ones, so they trained on the missing cases. It did not fix it. Then they tried the retrieval version - hand the model exactly the right cases and ask it to reason the same way. That did not fix it either.

Gabe's read is that the models were never merely reciting Supreme Court cases. They were interpolating over decades of published analysis *about* those cases - a synthesis formed during training that neither adding raw documents nor retrieving the right ones reproduces.

> "If you get all of this data within a firm and just use a markdown harness, you don't get that level of interpolation or deep understanding."

That is the strongest argument I have seen that retrieval alone has a ceiling. Some understanding only forms when information is absorbed, not fetched.

Which is a genuinely uncomfortable finding if you sell for a living. You can hand an agent every closed-won record, every call transcript, and every account history you have, and it still will not hold what a tenured rep holds - the read on which buying signal actually means something this quarter, in this segment, against this competitor. That judgment came from living through a few hundred deals, not from reading them. Retrieval gets you the record. It does not get you the pattern.

It is worth being clear about where that leaves us today. Compressing memory into weights is research. Promising research with a paper behind it and serious teams pushing on it, but not a thing you can buy this quarter, and probably not next year either. Which means that for the foreseeable future the practical answer is the one Harvey is actually executing: a company at the application layer that knows the domain cold, builds the harness around the model, keeps the context clean, verifies the work, and closes the remaining gap with engineering rather than waiting for the model to close it. The research points at where this ends up. The application layer is what makes it useful in the meantime - in law, and in sales.

## Act III: Why the labs will not simply crush the verticals

The reflexive objection to everything above is familiar to anyone building applied AI: none of this matters, because the next frontier model will absorb it. I think that is wrong, and this conversation lays out why better than anything I have read.

**Deployment is the bottleneck, not intelligence.** Even granting a dramatically more capable model, putting it to work inside a large bank or law firm means reorganizing how that institution stores information, routes approvals, and assigns accountability. Charlie estimates that transformation at ten to thirty years for most places. The model is ready long before the organization is.

**Nobel Prize winners do not run companies.** Gabe's line, and it has stayed with me:

> "I think people are like, 'Oh, if you just make these models Nobel Prize winners, they'll just solve everything.' It's like no Nobel Prize winner runs a company. There are so many of these problems that are not intelligence."

Coordination, regulation, trust, accountability, integration. Raising the intelligence ceiling solves none of them.

**Cost is going the wrong direction.** The assumption a year ago was that per-token prices would fall faster than consumption rose. In practice agentic systems consume vastly more tokens than chat ever did, and Harvey has watched its own usage climb steeply. Running a frontier model on every task is not economically sensible, which is why routing matters - frontier models where the task requires it, smaller and specialized models where capability has saturated. Harvey has even had open-source models call frontier models for help when they need it. The architecture is a portfolio, not a binary.

**Enterprises increasingly want to own their intelligence.** Banks, private equity firms, insurers, and the largest law firms are asking where their data goes and whether they can hold the model themselves. A general-purpose API does not satisfy that by getting smarter.

**And specialization is a multi-year program, not a distillation shortcut.** There is a widespread assumption that the leading open-source models are mostly distilled frontier models - that you can copy a bigger model's outputs and shortcut your way to capability. Charlie's read is that this is largely wrong. Distillation is a cheap way to warm-start, but the intelligence in those models comes from the same recipe the big labs run, scaled up. The same correction applies inside an enterprise. Harvey's own data strategy runs in stages: generate synthetic matters good enough to train on, then work with a firm to encode its expertise into that synthetic base without ever touching client data, then eventually help a firm and a specific client encode their working relationship - which requires both parties at the table. That is a multi-year program with a consent problem at every step. Anyone selling "distill your firm's expertise into a model this quarter" is describing something that does not exist.

## What this means for sales

Everything above came from legal and from research labs. I care about both because the sales problem has exactly the same shape, and I do not think that is widely appreciated yet.

Start with the data room, because the comparison is nearly exact. An associate cannot skim it and report back that they are pretty sure they found everything. A revenue team faces the same standard on signals - the leadership change, the funding round, the job posting, the product launch, the competitor mention, the quiet churn risk buried in a support thread. Missing one is not a rounding error. It is the deal. And the volume is genuinely beyond a context window: a single enterprise account's history - every call transcript, every email thread, every Slack and Teams conversation, every CRM record, every note anyone ever wrote - is a data room. Multiply by a book of business.

So the same problems arrive in the same order:

**Finding signals specific to your business.** Generic buying signals are close to worthless because everyone has them. The ones that matter are defined by *your* motion, by what actually preceded your last twenty closed-won deals. That definition lives in your corpus, not in a vendor's taxonomy.

**Verifying the signal is still true.** This is where I think most tooling quietly fails. An agent surfaces something from six weeks ago. Is it current? Has a newer event superseded it, or *muted* it entirely - the champion who was promoted and has since left, the initiative announced and then shelved? A stale signal is not neutral; it is worse than nothing, because someone will act on it. Whatever an agent carries forward is a claim about a moment in time, and freshness is not a nice-to-have on top of correctness - it is part of it.

**Running across the whole corpus, not a slice.** Account history, call transcripts, email, messaging platforms, CRM records, product usage, support conversations - with all the messiness that implies: inconsistent density, missing context, meaning that depends on what came before.

**Layering the network map on top.** Once the account is worth pursuing and the signal is real, the next question is the path in. Who already knows someone there? Which relationship is genuinely warm rather than nominally connected? A graph problem sitting on a retrieval problem sitting on a verification problem.

**Then drafting the right message at the right time** - which requires all of the above to be correct, current, and assembled, and requires the agent to have kept its own reasoning straight across a long chain of work.

That is a long-horizon task with verification loops. It is precisely the workload that breaks when compaction is lossy and the agent forgets, halfway through, what it already checked and what it already ruled out.

Which is why we spend as much time as we do learning from teams like Harvey and Baseten. Not because sales is legal, and not because we are going to publish KV-cache research - but because the disciplines transfer directly. Compaction as a design decision rather than an afterthought. Memory treated as a hint to be checked rather than a fact to be trusted. Freshness treated as part of correctness. And the hardest one: knowing that the judgment worth having is the kind that gets absorbed over hundreds of deals, not the kind you look up.

None of that should ever surface to the person using the product. The entire job is to abstract it away - so a rep opens their day to a short list of accounts worth their time, with the reasoning attached, the signal verified, the warmest path identified, and the message drafted. So they can do the thing they actually want to do, which is sell.

## The Bottom Line

If Charlie is right, the context window is not going to save us - it plateaued for structural reasons rather than temporary ones. And if the plateau breaks, it only buys time, because the work we want agents to do is orders of magnitude larger than any window on the horizon.

So the question stops being how much an agent can hold and becomes how well it forgets. What gets compressed, what gets kept, what gets verified, what gets discarded, and what eventually becomes durable enough that the agent simply knows it and never looks it up again. That is why compaction moved from an overflow mechanism to a core part of the harness, and why the teams building for a specific vertical are not waiting for a general model to solve it for them.

It is also the most underrated reason to be optimistic about applied AI. The hard problems left are not "make the model smarter." They are problems of memory, retrieval, verification, cost, and deployment - solved closest to the work, by the people who understand what a missed document or a stale signal actually costs.

---

*At IntelligentNoise, we build sales agents designed for long-horizon work - filtering an entire corpus of account history, calls, email, and messaging down to verified signals, the warmest path in, and the right message at the right time. [Book a demo](https://intelligentnoise.ai/contact) to discover what IntelligentNoise can do for your revenue team.*

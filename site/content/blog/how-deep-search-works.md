---
title: "How Deep Search works: from one question to 500 analyzed videos"
slug: how-deep-search-works
excerpt: "What happens between your prompt and a cited answer: questions and parameters, a keyword plan, 500 to 1,000 videos watched, and a ranked result you can question."
date: 2026-09-15
category: Product
readingMinutes: 6
author: "ContHunt Team"
featured: true
featuredOrder: 1
cover:
  mood: sea
  plate_prompt: "Text-free, softly blurred, light and airy photographic background plate: calm pale aqua and seafoam horizon where sea meets a hazy white sky, defocused, subtle horizontal motion blur, gentle natural light, fine film grain, muted teal and pearl tones, wide empty space, no people, no text, no logos, no UI"
  fragment: agent-trace
  fragment_data:
    steps:
      - { label: "Read prompt and brief", status: "done" }
      - { label: "Draft 5 questions, 4 scoring parameters", status: "done" }
      - { label: "Search TikTok, Reels, Shorts: 10 keyword angles", status: "done" }
      - { label: "Analyze videos: 500 of 500", status: "done" }
      - { label: "Rank and write answer with citations", status: "running" }
---

A normal search returns a grid of videos. You still have to watch them, judge them and compare them, and that part takes the afternoon. Deep Search is built for questions a grid cannot answer, such as "Which hooks are working for sensitive-skin serums right now, and what do the best ones share?" It turns the question into a research plan, searches TikTok, Instagram Reels and YouTube Shorts, watches 500 to 1,000 videos in under five minutes, scores each against your question and returns an answer with the videos attached as evidence.

This is what happens at each stage, so you can write better prompts and judge the results.

## Stage 1: You ask a question, not a keyword

A good prompt has four parts: the objective, who you are selling to, the window and platforms, and the output you want.

| Weak prompt | Stronger prompt |
| --- | --- |
| "skincare hooks" | "Which opening hooks are working for sensitive-skin serums on TikTok, Reels and Shorts in the last 30 days? I need patterns I can brief to creators, with example videos." |
| "trending products" | "Which home-office products are appearing across many unrelated creators in the last 14 days, and what do buyers ask in the comments?" |

The second version gives the agent something to decide with: a niche, a time window, a use for the answer.

## Stage 2: The agent splits the prompt into Q and P

Deep Search breaks your request into two lists.

**Questions (Q)** are what each video must be examined for. For the serum prompt they might be:

1. What is the opening hook, and which hook family does it belong to?
2. Is a person visible in the first second?
3. Is the product visible by second 3?
4. What proof is shown, and when?
5. What does the video promise the viewer?

**Parameters (P)** are what each video is scored on. For the same prompt: relevance to "sensitive-skin serum", hook strength, proof quality and recency.

Where a question has a fixed set of answers, such as hook family, the labels are fixed up front. That keeps counts comparable across hundreds of videos. The plan shows the questions and selection rules before the run, so you can correct them early. A minute spent reading the plan is cheaper than correcting the answer later.

## Stage 3: It writes a keyword plan in creator language

Product-page vocabulary and creator vocabulary rarely match. The agent starts with broad probes to learn how people in the niche talk, then writes more specific searches from that vocabulary.

For the serum prompt, the angles might include "sensitive skin routine", "barrier repair", "serum burned my face", "dermatologist reacts to skincare" and "patch test". Each search is one coherent angle, so ten searches cover ten different corners of the niche. Results are merged across platforms and deduplicated.

Captions and titles tell you how creators describe things. They do not prove what a video shows. That is why the next stage matters.

## Stage 4: It watches the videos

This is the step a person cannot do at scale. Each selected video is analyzed, not skimmed through its metadata. The analysis covers the hook, the structure of the content, audience cues, the possible reason the video spread, associated metrics, and how well the video fits your question.

500 to 1,000 videos are analyzed in under five minutes. Each gets answers to the questions from Stage 2 and a score on each parameter.

One caution. These scores come from analyzing the video and judging its fit to your question. They are not measured viewer retention, which only the account owner can see. Treat a hook score as a structured judgment of the content, and keep the creator's own analytics as the final check on your own ads.

## Stage 5: Ranking and a cited answer

Deep Search ranks the full set against your question, then writes an answer from what it found. A useful result has four parts:

- A ranked list of the videos that best fit the question.
- Counts and patterns across the whole set, for example the hook-family mix of the top quartile against the rest.
- Findings with the videos that support each one linked beside it, so you can open the evidence.
- A note on gaps: how many videos qualified, what failed, and where coverage was thin.

If only 70 videos in the window truly match your niche, the answer should say so rather than pad the count.

## Stage 6: You keep talking to it

The first answer is a starting point. Follow-up questions run against the same set of videos, so "show only the videos where the product appears before the first spoken claim" does not start a new search. You can also:

- Save the best videos to a board for your team.
- Track the accounts behind them with account tracking, an experimental feature.
- Hand the work to an AI agent through MCP or the CLI (see the [MCP guide](/resources/using-conthunt-with-ai-agents-through-mcp)).

## When to use Deep Search, and when not to

Use it when:

- You need a pattern across hundreds of videos, not a single example.
- You are about to brief creators, plan a test or choose a product.
- You want evidence you can show a colleague or client.

Use a regular search when you want to browse a topic and watch videos yourself. Be cautious when:

- Your niche is tiny. If fewer than around 50 relevant videos exist in your window, widen the window or the topic.
- You need private performance data such as retention, conversion or audience demographics. Public analysis cannot provide them.
- You are asking "why" about one specific account's results. Deep Search finds patterns across videos. It does not prove causes.

## Prompt checklist

Before you run one, check that your prompt states:

- The niche and the audience
- The platforms (default to all three if unsure)
- The time window
- What you will do with the answer (brief, product pick, trend report)
- Any fixed labels you want used, such as your own hook list
- What to exclude, such as brand campaigns or a competitor's own accounts

For ideas on what to ask, see the [hook taxonomy](/resources/the-3-second-rule-a-hook-taxonomy) and the [creator brief process](/resources/research-tiktok-hooks-before-you-brief-a-creator).

[Get started]({{GET_STARTED_URL}}) with one Deep Search on a question you would otherwise spend a day on, and read the evidence behind each answer.

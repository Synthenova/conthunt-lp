---
title: "How Deep Search works: from one question to 500 analyzed videos"
slug: how-deep-search-works
excerpt: "Deep Search turns a prompt into questions, a keyword plan, and 500 to 1,000 watched videos, then a ranked answer you can question."
date: 2026-09-15
category: Product
readingMinutes: 10
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

Deep Search turns one question into a research plan, searches TikTok, Instagram Reels and YouTube Shorts, watches 500 to 1,000 videos in under five minutes, scores each video against the question, and returns an answer with those videos attached as evidence. A normal search returns a grid you still have to watch, judge and compare. Deep Search is for questions a grid cannot answer, such as which hooks are working for sensitive-skin serums right now and what the best ones share.

The six stages below are what happens between the prompt and that cited answer, so you can write better prompts and judge the result.

## Stage 1: You ask a question, not a keyword

Stage 1 is the prompt itself: an objective, an audience, a time window, the platforms and the output you want, written as a question rather than a bare keyword. A good prompt has four parts.

| Weak prompt | Stronger prompt |
| --- | --- |
| "skincare hooks" | "Which opening hooks are working for sensitive-skin serums on TikTok, Reels and Shorts in the last 30 days? I need patterns I can brief to creators, with example videos." |
| "trending products" | "Which home-office products are appearing across many unrelated creators in the last 14 days, and what do buyers ask in the comments?" |

The second version gives the agent something to decide with: a niche, a time window, a use for the answer.

## Stage 2: The agent splits the prompt into Q and P

Stage 2 splits the prompt into questions, what each video must be examined for, and parameters, what each video is scored on. Deep Search breaks your request into those two lists.

**Questions (Q)** are what each video must be examined for. For the serum prompt they might be:

1. What is the opening hook, and which hook family does it belong to?
2. Is a person visible in the first second?
3. Is the product visible by second 3?
4. What proof is shown, and when?
5. What does the video promise the viewer?

**Parameters (P)** are what each video is scored on. For the same prompt: relevance to "sensitive-skin serum", hook strength, proof quality and recency.

Where a question has a fixed set of answers, such as hook family, the labels are fixed up front. That keeps counts comparable across hundreds of videos. The plan shows the questions and selection rules before the run, so you can correct them early. A minute spent reading the plan is cheaper than correcting the answer later.

## Stage 3: It writes a keyword plan in creator language

Stage 3 writes a keyword plan in creator language, because the words on a product page and the words in captions rarely match. The agent starts with broad probes to learn how people in the niche talk, then writes more specific searches from that vocabulary.

For the serum prompt, the angles might include "sensitive skin routine", "barrier repair", "serum burned my face", "dermatologist reacts to skincare" and "patch test". Each search is one coherent angle, so ten searches cover ten different corners of the niche. Results are merged across platforms and deduplicated.

Captions and titles tell you how creators describe things. They do not prove what a video shows. That is why the next stage matters.

## Stage 4: It watches the videos

Stage 4 watches the videos: each selected video is analyzed for the hook, the structure, audience cues, a possible reason it spread, the metrics and how well it fits the question. A person cannot do that step at the scale of the set.

500 to 1,000 videos are analyzed in under five minutes. Each gets answers to the questions from Stage 2 and a score on each parameter.

One caution. These scores come from analyzing the video and judging its fit to your question. They are not measured viewer retention, which only the account owner can see. Treat a hook score as a structured judgment of the content, and keep the creator's own analytics as the final check on your own ads.

## Stage 5: Ranking and a cited answer

Stage 5 ranks the full set against the question and writes a cited answer: a ranked list, pattern counts, findings with links, and a note on gaps. Deep Search does that from what it found, not from the captions alone. A useful result has four parts:

- A ranked list of the videos that best fit the question.
- Counts and patterns across the whole set, for example the hook-family mix of the top quartile against the rest.
- Findings with the videos that support each one linked beside it, so you can open the evidence.
- A note on gaps: how many videos qualified, what failed, and where coverage was thin.

If only 70 videos in the window truly match your niche, the answer should say so rather than pad the count.

## Stage 6: You keep talking to it

Stage 6 keeps the conversation on the same analyzed set, so a follow-up narrows the evidence instead of starting a new search. The first answer is a starting point. "Show only the videos where the product appears before the first spoken claim" does not start over. You can also:

- Save the best videos to a board for your team.
- Track the accounts behind them with account tracking, an experimental feature.
- Hand the work to an AI agent through MCP or the CLI (see the [MCP guide](/resources/using-conthunt-with-ai-agents-through-mcp)).

## When to use Deep Search, and when not to

Deep Search is for a pattern across many videos that you will brief, test or show to someone else, and a regular search is for browsing a topic and watching the videos yourself.

Use it when:

- You need a pattern across hundreds of videos, not a single example.
- You are about to brief creators, plan a test or choose a product.
- You want evidence you can show a colleague or client.

Use a regular search when you want to browse a topic and watch videos yourself. Be cautious when:

- Your niche is tiny. If fewer than around 50 relevant videos exist in your window, widen the window or the topic.
- You need private performance data such as retention, conversion or audience demographics. Public analysis cannot provide them.
- You are asking "why" about one specific account's results. Deep Search finds patterns across videos. It does not prove causes.

## Prompt checklist

The prompt checklist is the list a Deep Search prompt should state before you run it: niche, audience, platforms, window, use of the answer, any fixed labels, and what to exclude. Before you run one, check that your prompt states:

- The niche and the audience
- The platforms (default to all three if unsure)
- The time window
- What you will do with the answer (brief, product pick, trend report)
- Any fixed labels you want used, such as your own hook list
- What to exclude, such as brand campaigns or a competitor's own accounts

For ideas on what to ask, see the [hook taxonomy](/resources/the-3-second-rule-a-hook-taxonomy) and the [creator brief process](/resources/research-tiktok-hooks-before-you-brief-a-creator).

## Walk the serum prompt through the six stages

The serum walk-through shows how one prompt moves through the six stages, from a question a creator brief can use to a cited set you can narrow. The prompt is the stronger example from Stage 1: which opening hooks are working for sensitive-skin serums on TikTok, Reels and Shorts in the last 30 days, with patterns to brief and example videos.

**Stage 1 keeps the decision in the words.** The niche is sensitive-skin serums. The window is the last 30 days. The platforms are TikTok, Instagram Reels and YouTube Shorts. The output is patterns for a creator brief, with examples. A prompt that only says "skincare hooks" fails this stage, because none of those decisions are in it. The home-office row in the Stage 1 table is the same shape for a different job: many unrelated creators, the last 14 days, and the questions buyers ask.

**Stage 2 fixes five questions and the scores.** The questions this prompt might examine are the opening hook and its family, whether a person is visible in the first second, whether the product is visible by second 3, what proof is shown and when, and what the video promises. That is five questions. The parameters are relevance to "sensitive-skin serum", hook strength, proof quality and recency. Hook family uses a fixed label list so a count means the same thing on every video. Read that plan before the run. Fixing a question here is cheaper than correcting the answer later, which is the reason Stage 2 shows the plan up front.

**Stage 3 searches creator language, one angle at a time.** Angles for this prompt include "sensitive skin routine", "barrier repair", "serum burned my face", "dermatologist reacts to skincare" and "patch test". Each search is one corner of the niche. Ten searches cover ten corners only when each one is a single coherent angle. Ten copies of the same phrase return the same videos. Captions from these searches show how people talk. They do not prove what the frames contain. That proof is Stage 4.

**Stage 4 watches the set and says how large the set really was.** Deep Search analyzes 500 to 1,000 videos in under five minutes. Each video gets answers to the Stage 2 questions and a score on each parameter. Those scores judge the content and its fit to the question. They are not measured viewer retention, which only the account owner can see. If the niche is thin, the gap note should say so. Stage 5 states the same caution with a count already in this guide: if only 70 videos in the window truly match, the answer should report 70 rather than pad the count. If fewer than around 50 relevant videos exist, widen the window or the topic instead of trusting a pattern.

**Stage 5 returns four parts you can open.** The useful result is a ranked list of videos that fit the question, counts such as the hook-family mix of the top quartile against the rest, findings with the supporting videos linked, and a note on gaps, including what failed and where coverage was thin. Open the links before you brief anyone. A pattern you cannot see in the cited videos is not ready for a creator. The [hook taxonomy](/resources/the-3-second-rule-a-hook-taxonomy) is the label list to ask for when the finding you need is which opening pattern leads the set. The [creator brief process](/resources/research-tiktok-hooks-before-you-brief-a-creator) is the place those citations go next.

**Stage 6 narrows the same evidence.** A follow-up such as "show only the videos where the product appears before the first spoken claim" reuses the videos already analyzed. It does not start a search. Save the references you will actually brief to a board. Account tracking, an experimental feature, can follow the accounts behind those videos. An agent can take the same thread through MCP or the CLI, as the [MCP guide](/resources/using-conthunt-with-ai-agents-through-mcp) describes. None of those steps replace the cited answer. They keep it attached to the videos.

After the walk, use the prompt checklist on your own question. If the niche, the audience, the platforms, the window, the use of the answer, the fixed labels or the exclusions are missing, the serum example is only a shape. It is not yet your prompt. Regular search remains the right tool when you want to browse and watch videos yourself rather than ask for a pattern across the set.

[Get started]({{GET_STARTED_URL}}) with one Deep Search on a question you would otherwise spend a day on, and read the evidence behind each answer.

/**
 * The directory that sits around the pick sentence on each domain.
 * The sentence itself stays in pages.ts and is repeated, unchanged, on every page.
 */
import { EMD_PAGES, type EmdPage, type EmdTool } from "./pages";

export interface EmdSection {
  heading: string;
  body: string;
}

export interface EmdEntry {
  slug: string;
  label: string;
  title: string;
  blurb: string;
  sections: readonly EmdSection[];
  /** Second answer on this entry: what to check before trusting it. */
  check: string;
}

export interface EmdCopy {
  /** The paragraph under the pick sentence. */
  brief: string;
  howTo: string;
  /** Second FAQ on the homepage. */
  firstStep: string;
  /** What ContHunt does not do for this search. */
  limit: string;
  entries: readonly EmdEntry[];
}

export interface ToolAbout {
  label: string;
  about: string;
  fit: string;
}

const s = (heading: string, body: string): EmdSection => ({ heading, body });

export const TOOL_ABOUT: Record<string, ToolAbout> = {
  "tiktok-creative-center": {
    label: "Hashtag library",
    about:
      "Creative Center is TikTok’s own library. It shows hashtags, songs, and ads TikTok is currently surfacing in its ads tools. The hashtag view includes a trend line and examples. Those examples are selected for advertisers. They are not the whole public feed.",
    fit: "Use it when you want TikTok’s own list before you invent one. Open the videos under a tag. A rising line on an ads chart is not proof the tag fits your video.",
  },
  later: {
    label: "Scheduler",
    about:
      "Later is a scheduler. You write a caption, and it can suggest hashtags to attach before the post goes out. The suggestion is a writing aid for that post. It is not a study of which videos in the niche already won.",
    fit: "Use it at the moment of posting. Decide the tag by watching the videos under it, then let a scheduler attach the ones you already chose.",
  },
  "social-blade": {
    label: "Public statistics",
    about:
      "Social Blade publishes statistics for YouTube channels from public data. Subscriber and view charts are estimates a stranger can see. They are not the numbers inside the creator’s YouTube Studio, and a public chart does not show retention.",
    fit: "Use it for a first look at size and direction. Open the channel, and the recent videos, before you treat the chart as the niche.",
  },
  noxinfluencer: {
    label: "Channel directory",
    about:
      "NoxInfluencer is a directory for finding YouTube channels. You can filter by topic and size and build a list. A directory row is a starting point. The niche label on the row is not a description of the last ten videos.",
    fit: "Use it to assemble names. The finding is not finished until you have opened the channel and watched what it actually publishes.",
  },
  vidiq: {
    label: "YouTube tool",
    about:
      "vidIQ is a YouTube tool. In the browser it shows keyword, tag, competitor, and channel numbers beside YouTube. It also suggests titles and tags. It does not research TikTok or Reels.",
    fit: "Use it when the job stays inside YouTube: a keyword, a tag, or a competitor’s YouTube numbers. It is the wrong tool when the question is which short videos are already working across platforms.",
  },
  tubebuddy: {
    label: "YouTube tool",
    about:
      "TubeBuddy is a browser tool for YouTube channel work. It suggests titles and tags from inside YouTube, and it sits next to the fields YouTube Studio already has. It does not research TikTok or Reels.",
    fit: "Use it while you are uploading, after you already know what the video is. A suggested tag is not a substitute for the title a stranger will read.",
  },
  "youtube-studio": {
    label: "YouTube’s own product",
    about:
      "YouTube Studio is where a channel sets a video’s title, description, and tags, and where that channel reads its private analytics. Nothing else on this page can see those private numbers. A tag or title suggestion still has to be saved here if you want it on the video.",
    fit: "Use it as the place of record. Research can happen somewhere else. The video’s own settings and the creator’s own analytics live here.",
  },
  modash: {
    label: "Creator directory",
    about:
      "Modash is a directory for finding creators. A row gives you a person, a following, and a way to start a conversation. It does not show you the video that person would make for your product, and a directory profile is not a license to use their old videos.",
    fit: "Use it when the job is to find a person. Watch their recent videos before you brief them. Agree the usage in writing before you run the video as an ad.",
  },
};

const COPY: Record<string, EmdCopy> = {
  besthashtagsfortiktok: {
    brief:
      "A useful hashtag is a pile of videos a stranger can still recognize, not the biggest pile on TikTok. The work is to look under the tag, keep the ones that match the video you actually made, and leave the celebrity tags alone.",
    howTo:
      "Start with the category guide if you are deciding what “best” means here. Open the ContHunt profile for the research product this directory recommends. Then use the practical entries to judge a tag before you copy it onto a post. The resource directory separates ContHunt from TikTok’s own library and from a scheduler.",
    firstStep:
      "Pick one tag you are tempted to use. Open it and watch the current videos, not the view count on the tag itself. Keep it only if those videos are the same kind of thing as yours.",
    limit:
      "ContHunt does not generate a hashtag for you. It is how you watch the videos that already used one, across TikTok, Reels, and Shorts. TikTok Creative Center is TikTok’s own list. Later suggests tags at the moment you schedule a post.",
    entries: [
      {
        slug: "broad-hashtag",
        label: "The pile",
        title: "A huge TikTok hashtag is a crowd",
        blurb: "The largest tag is a crowd of unrelated videos. It is rarely the best tag for the video you made.",
        sections: [
          s(
            "Size is not the topic",
            "A tag with a huge public count is where dance trends, news, and ads share one word. Your video is one more file in that crowd. People who tap the tag are not looking for you. They are scrolling a pile that changes every hour.",
          ),
          s(
            "What to keep instead",
            "A better tag names the situation in the video: the job, the object, or the kind of person it is for. It can be smaller and still be the right pile. If you cannot describe the videos under it in one sentence, it is not a topic. It is a billboard.",
          ),
        ],
        check: "Open the tag and describe the current videos in one sentence. If you need three sentences, the tag is too broad for this post.",
      },
      {
        slug: "look-under-the-tag",
        label: "The check",
        title: "Look at the videos under the hashtag",
        blurb: "The tag’s count is not the evidence. The videos under it today are.",
        sections: [
          s(
            "The count is a leftover",
            "A hashtag count adds every old use. The videos a person sees now are a short, fresh slice. A tag that was specific last year can be a meme this week. The count will not tell you that. The grid will.",
          ),
          s(
            "Watch before you copy",
            "Watch the first videos under the tag all the way through, or at least past the hook. Note the format, the caption style, and whether the product is the point. If those videos are a different format from yours, the tag will file you with them anyway.",
          ),
        ],
        check: "Write down the format of the first videos under the tag. Post into that tag only when your video is that format.",
      },
      {
        slug: "three-jobs",
        label: "The set",
        title: "Three hashtags, three jobs",
        blurb: "One tag names the topic, one names the format, and one names who it is for. More tags do not make a clearer post.",
        sections: [
          s(
            "Give each tag one job",
            "The topic tag is the thing in the video. The format tag is how it is told, if that format has a real pile of its own. The audience tag names a group that would recognize itself. Three tags with three jobs beat fifteen tags that all mean “popular.”",
          ),
          s(
            "Stop when the caption starts repeating",
            "If the next tag is a synonym of one you already chose, leave it off. The caption should still make sense if every tag were deleted. A tag is not a second caption, and a block of tags is not a description.",
          ),
        ],
        check: "Read the tags without the caption. Each one should answer a different question: what, how, or who.",
      },
    ],
  },
  hashtagsfortiktok: {
    brief:
      "On TikTok the caption makes the promise and the hashtag files the video into a pile. They are not the same field. A post can do the first job well and the second job badly, or the other way around.",
    howTo:
      "Read the category guide for the split between caption and tag. Open the ContHunt profile for the research product this directory recommends. The practical entries cover how many tags to use and when to skip the tag. Creative Center and Later are listed because they touch tags. They do not write the caption.",
    firstStep:
      "Write the caption first, with no tags. Then add a tag only if it names a pile you have actually opened. If the tag repeats the caption, you do not need it.",
    limit:
      "ContHunt does not insert hashtags into a caption. It is how you find the videos already filed under a tag, on TikTok and on Reels and Shorts. The tag you copy should come from those videos, not from a generator.",
    entries: [
      {
        slug: "caption-and-tag",
        label: "The split",
        title: "The caption and the hashtag do different jobs",
        blurb: "The caption is the sentence a person reads. The hashtag is the pile the video is filed in.",
        sections: [
          s(
            "Say it in words",
            "The caption has to stand alone. It names the situation, the result, or the question. A reader who never taps a tag should still know what the video is. If the only specific words are behind hash marks, the post is a label, not a sentence.",
          ),
          s(
            "Then file it",
            "The hashtag is for the person, or the system, that groups videos. It should be a name that already has a pile, and that pile should match. Inventing a tag no one else uses files the video in an empty drawer. Copying a giant tag files it in the wrong drawer.",
          ),
        ],
        check: "Cover the hashtags with your hand. If the caption no longer says what the video is, the tags were doing the caption’s job.",
      },
      {
        slug: "how-many",
        label: "The count",
        title: "How many hashtags a TikTok can hold",
        blurb: "The caption has a limited length. Every tag you add spends that length on a filing label.",
        sections: [
          s(
            "The caption is short",
            "TikTok gives the caption a character budget, and the tags spend it. A row of tags pushes the sentence behind a cut. The person sees the first words and a trail of hash marks. The sentence was the part that could have been specific.",
          ),
          s(
            "A few filed on purpose",
            "Use the tags you would still defend after opening each pile. A topic, and maybe a format or an audience, is enough for most posts. Adding the same idea in three spellings spends the caption three times and files the video in three nearly identical piles.",
          ),
        ],
        check: "Count the characters the tags use. If they are longer than the sentence, cut tags until the sentence is the longer part.",
      },
      {
        slug: "when-to-skip",
        label: "The skip",
        title: "When to skip the hashtag",
        blurb: "Some videos do not need a tag. The caption already names a thing people recognize.",
        sections: [
          s(
            "A proper name is not a tag",
            "A product, a place, or a person can be written in the caption as ordinary words. Turning it into a hashtag does not make it more findable if no one browses that tag. It only makes the caption look like a label.",
          ),
          s(
            "Skip the costume",
            "Do not add a tag because a template told you every post needs five. If you have not opened the pile, you do not know what you are joining. A post with a clear caption and no tag is easier to read than a post with a costume of tags.",
          ),
        ],
        check: "For each tag, name a video you watched under it this week. If you cannot, drop the tag.",
      },
    ],
  },
  youtubechannelfinder: {
    brief:
      "A channel finder is a way to build a list of YouTube channels in a niche. The list is the start. A channel belongs on it only after you have seen what it publishes now, not after you have seen a subscriber number.",
    howTo:
      "Start with the category guide to decide what you are looking for a channel to do. Open the ContHunt profile for the research product this directory recommends. The practical entries cover the niche, the subscriber count, and what to open on the channel. Social Blade, NoxInfluencer, and vidIQ are the other tools people use for this search.",
    firstStep:
      "Write one sentence for the niche before you search: who the channel is for, and what kind of video it posts. Then reject any channel that does not match both.",
    limit:
      "ContHunt is not a YouTube channel directory. It researches short videos across TikTok, Reels, and Shorts, which is how you see the format a niche is already using. Social Blade and NoxInfluencer are where a YouTube channel list comes from. vidIQ is YouTube-only.",
    entries: [
      {
        slug: "narrow-the-niche",
        label: "The niche",
        title: "Narrow the niche before you search channels",
        blurb: "“Fitness” is not a niche. A channel finder will hand it back to you as a thousand unrelated channels.",
        sections: [
          s(
            "Name the video, not the industry",
            "Write the video you expect to see: the length, the promise, and the person in it. “Ten-minute home workouts for beginners” is a search. “Health” is a billboard. A finder can only be as specific as the words you give it.",
          ),
          s(
            "One list, one job",
            "Decide why you want the list. Competitors to study, channels to pitch, or formats to borrow are three different lists. A channel that is useful as a format reference can be a bad pitch. Do not mix them and then sort by size.",
          ),
        ],
        check: "If your niche sentence could describe a cooking channel and a finance channel, it is not narrow enough to search.",
      },
      {
        slug: "subscriber-count",
        label: "The number",
        title: "Subscriber count is a weak filter",
        blurb: "A large subscriber count is an old total. It does not say what the channel posted this month.",
        sections: [
          s(
            "The total is history",
            "Subscribers accumulate. A channel can be large and quiet, or small and posting the exact format you need. Sorting a finder by subscribers surfaces fame. It hides the channels that started recently and are actually publishing.",
          ),
          s(
            "Look at the recent column",
            "Prefer the last few upload dates and the kind of video those uploads are. A channel that changed niche still wears the old subscriber count. The recent videos are the niche. The number is the archive.",
          ),
        ],
        check: "Sort once by subscribers and once by recent uploads. Keep the names that survive the second sort.",
      },
      {
        slug: "open-the-channel",
        label: "The open",
        title: "What to open on a YouTube channel",
        blurb: "A row in a finder is a name. The channel page is the evidence.",
        sections: [
          s(
            "The last ten titles",
            "Read the last ten titles before you watch anything. They tell you the promise the channel repeats. If those promises are not the niche you wrote down, stop. Watching a famous old video will talk you into a channel that no longer makes that video.",
          ),
          s(
            "One video, all the way",
            "Watch one recent video to the end. Note the hook, the chapters, and whether the title was paid off. A finder cannot see that. A thumbnail cannot see that. The video can.",
          ),
        ],
        check: "Do not add a channel to the list until you can say what its last ten titles have in common.",
      },
    ],
  },
  youtubetracker: {
    brief:
      "A YouTube tracker watches a channel, a video, or a competitor over time. The useful version shows the recent direction. A single public total, with no dates, is not tracking.",
    howTo:
      "Read the category guide for what this directory means by tracking. Open the ContHunt profile for the research product this directory recommends. The practical entries separate a real tracker from a public estimate, and they say what to watch on a competitor. vidIQ, TubeBuddy, and Social Blade are the other tools in this search.",
    firstStep:
      "Pick one channel and write down the question you want answered in a month: more uploads, longer videos, or a different title pattern. Track that. Ignore the rest of the dashboard.",
    limit:
      "ContHunt does not replace YouTube Studio, and it does not show a channel’s private analytics. It is how you track the short videos a niche is publishing across TikTok, Reels, and Shorts. vidIQ and TubeBuddy track inside YouTube. Social Blade tracks public YouTube statistics.",
    entries: [
      {
        slug: "what-a-tracker-shows",
        label: "The numbers",
        title: "What a YouTube tracker should show",
        blurb: "Tracking is a change between two dates. A lone subscriber total is not a tracker.",
        sections: [
          s(
            "Ask for the change",
            "A tracker should show the same metric on at least two dates, close enough that you remember what the channel did in between. Uploads, views on recent videos, and the shape of the titles are the usual three. A sparkline with no dates is decoration.",
          ),
          s(
            "One metric per question",
            "If the question is “are they posting more,” count uploads. If the question is “are the new videos finding viewers,” look at recent views, not the channel’s lifetime views. Lifetime views mostly measure age. They will go up on a channel that is standing still.",
          ),
        ],
        check: "Name the two dates you are comparing. If the tool cannot show both, it is a snapshot, not a tracker.",
      },
      {
        slug: "public-stats",
        label: "The source",
        title: "Public stats are not YouTube Studio",
        blurb: "A public chart is what a stranger can see. Studio is what the channel owner can see.",
        sections: [
          s(
            "Two different sets of numbers",
            "Social Blade and similar sites estimate from public data. YouTube Studio shows the owner impressions, retention, and traffic sources. Those private numbers are not on a public tracker. Do not quote a public estimate as if it were the creator’s analytics.",
          ),
          s(
            "What the public number is good for",
            "A public series is enough to see whether a channel is posting and whether the visible view counts are rising. It is not enough to see which thumbnail won, or where the viewers came from. For that, you need the channel’s own Studio, which you will not have for a competitor.",
          ),
        ],
        check: "Label every figure you copy with its source: public estimate, or the channel’s own Studio. Do not mix them in one sentence.",
      },
      {
        slug: "competitor-watch",
        label: "The use",
        title: "Watching a competitor on YouTube",
        blurb: "Track the pattern of the videos, not a single viral view count.",
        sections: [
          s(
            "The pattern is the finding",
            "Write down the length, the title shape, and the thumbnail habit across the last several uploads. One video with a large view count is an outlier until the next videos repeat it. A tracker that only highlights the outlier will send you chasing a fluke.",
          ),
          s(
            "Do not copy the metric you cannot see",
            "You can see their public views and their titles. You cannot see their retention or their subscribers’ notifications. Copy a title pattern you can actually point at. Do not copy a strategy you would need their Studio to confirm.",
          ),
        ],
        check: "Describe the last several titles in one pattern. If the pattern needs their most-viewed video to be true, it is not a pattern.",
      },
    ],
  },
  youtubetags: {
    brief:
      "YouTube tags are the hidden keywords on a video. A stranger never sees them. The title and the first line of the description do the job the viewer actually reads. Tags are a small filing step after those are written.",
    howTo:
      "Read the category guide before you fill the tag box. Open the ContHunt profile for what this directory recommends, and for what it refuses to pretend. The practical entries cover where tags sit, why the title comes first, and how to pick a few. TubeBuddy, vidIQ, and YouTube Studio are the other tools.",
    firstStep:
      "Write the title and the first two lines of the description. Then add a few tags that use the same words. Do not open a tag generator before the title exists.",
    limit:
      "ContHunt does not set YouTube tags and does not suggest them. Tags are a YouTube Studio field. TubeBuddy and vidIQ suggest tags inside YouTube. ContHunt is the pick for finding the short videos a niche already published, which is where a title’s wording should come from.",
    entries: [
      {
        slug: "where-tags-sit",
        label: "The field",
        title: "Where YouTube tags sit",
        blurb: "Tags live in YouTube Studio. They are not the title, and they are not a hashtag in the description.",
        sections: [
          s(
            "Three different fields",
            "The title is the line in the search result and on the watch page. The description is the text under the video. The tags are a separate box in Studio, and viewers do not see that box. Putting a hash mark in the description does not fill the tag box. Filling the tag box does not change the title.",
          ),
          s(
            "Set them where YouTube stores them",
            "YouTube Studio is the place of record. A suggestion from a browser tool still has to be saved there. If you only typed the words into a generator and never opened Studio, the video does not have those tags.",
          ),
        ],
        check: "Open the video in YouTube Studio and read the tag box. That list is the tags. A document on your desktop is not.",
      },
      {
        slug: "title-first",
        label: "The order",
        title: "The title does the job tags do not",
        blurb: "People click the title. They cannot click a tag they never see.",
        sections: [
          s(
            "Write for the result",
            "The title has to make sense alone, in a list of other videos. It should say what the video delivers. Stuffing the tag box with synonyms does not repair a title that a stranger would skip. Do that work in the title first.",
          ),
          s(
            "Tags repeat. They do not invent.",
            "Once the title is honest, a few tags can repeat its important words and the obvious name of the topic. They are a backup filing, not a second headline. A tag no one would type, added because a tool suggested it, does not make the video about that thing.",
          ),
        ],
        check: "Read the title out loud. If you would not click it, do not spend the next half hour on tags.",
      },
      {
        slug: "pick-a-few",
        label: "The set",
        title: "How to pick a few YouTube tags",
        blurb: "Use the words already in the title, plus the name a searcher would actually type.",
        sections: [
          s(
            "Start from the video",
            "List the objects, the task, and the audience that are truly in the video. Turn those into a short set of tags. If a tag describes a video you wish you had made, drop it. The file will not match the promise, and the viewer who arrives will leave.",
          ),
          s(
            "Stop at a handful",
            "A handful of specific tags is enough. A long list of broadly related words files the video under topics it does not answer. Look at the titles of videos you already know belong beside yours, and borrow a wording only when their video is the same kind of thing.",
          ),
        ],
        check: "Every tag should appear, in spirit, in the video itself. If you have to explain the connection, cut the tag.",
      },
    ],
  },
  youtubetitlegenerator: {
    brief:
      "A title generator writes options from a keyword. The options are drafts. A title is finished when it states a claim the video actually pays off, in words a stranger can understand in a search result.",
    howTo:
      "Read the category guide so the generator is not the first step. Open the ContHunt profile for the research this directory recommends: titles that already earned attention, not a spinner. The practical entries cover the claim, what to copy, and what to leave out. vidIQ and TubeBuddy are the generators people use inside YouTube.",
    firstStep:
      "Find ten titles in the niche that you would personally click, from videos you have actually watched. Underline the pattern they share. Draft yours from that pattern, then check it against your footage.",
    limit:
      "ContHunt does not generate YouTube titles. vidIQ and TubeBuddy do. ContHunt is the pick for watching the short videos a niche already published, including the titles on those videos. A generated line that the footage does not pay off is a broken promise, however clean the wording is.",
    entries: [
      {
        slug: "title-is-a-claim",
        label: "The claim",
        title: "A YouTube title is a claim",
        blurb: "The title tells a stranger what they will get. The video has to deliver that, early.",
        sections: [
          s(
            "Say the result",
            "A useful title names the outcome, the object, or the constraint. “How I cut a week of edits to one afternoon” is a claim. “My editing setup” is a label. A generator will offer both. Keep the one your footage can pay off in the first minute.",
          ),
          s(
            "Do not promise the video you did not make",
            "If the title says a number, the video needs that number. If it says a comparison, the video needs both sides. A click that arrives and finds a different video teaches the viewer not to trust the next title. The generator does not know what you filmed.",
          ),
        ],
        check: "Point at the moment in the video where the title comes true. If you cannot, change the title, not the thumbnail.",
      },
      {
        slug: "titles-that-worked",
        label: "The pattern",
        title: "Copy the pattern, not the words",
        blurb: "A title that already worked is evidence of a shape. Pasting it onto your video is not.",
        sections: [
          s(
            "Collect the shape",
            "Look at titles on videos you have watched in this niche. Note the order: result first, or audience first, or a number first. That order is the pattern. Your nouns stay yours. Their nouns belong to their video.",
          ),
          s(
            "Where to look",
            "Search results show you what is competing for the wording. The videos themselves show you whether the title was a trick. ContHunt is for the second look, across short video, when the niche is not only YouTube. A generator never watches the video.",
          ),
        ],
        check: "Rewrite the borrowed title with your nouns removed. If nothing remains but a pattern, you copied the right layer.",
      },
      {
        slug: "what-to-leave-out",
        label: "The cut",
        title: "What a title generator should leave out",
        blurb: "Most generated titles are too long, too vague, or stuffed with a keyword the sentence did not need.",
        sections: [
          s(
            "One idea",
            "A title has room for one promise. A second clause, a stack of adjectives, or a keyword repeated in different spellings makes the result harder to read. Cut until a person can say it once without breathing in the middle.",
          ),
          s(
            "Leave the costume out",
            "All caps, a pile of brackets, and a keyword that does not change the meaning are costume. They do not make the claim clearer. If the keyword only fits by bending the sentence, the sentence was the wrong place for it. Use it in the description if it is a real search, and keep the title in ordinary language.",
          ),
        ],
        check: "Delete every word that is not the claim. If the title gets clearer, those words were the stuffing.",
      },
    ],
  },
  ugctiktok: {
    brief:
      "UGC on TikTok is a video a customer or a creator made, in which the product is used rather than announced. A polished brand spot with a logo at the end is an ad. Calling it UGC does not change what it is.",
    howTo:
      "Start with the category guide so the term is settled. Open the ContHunt profile for how this directory recommends you study examples. The practical entries cover what to watch in an example and why a view count is not usage rights. Creative Center shows TikTok’s ad examples. Modash is a creator directory.",
    firstStep:
      "Find ten videos in the niche that a person made without looking like an ad. Write down the hook and whether the product appears in the first sentence. That list is the brief. A creator directory comes after it.",
    limit:
      "ContHunt does not hire creators and does not grant rights to their videos. It is how you find the short videos people already made, on TikTok, Reels, and Shorts. Modash is where you look for a person to hire. A view count is not a license.",
    entries: [
      {
        slug: "what-ugc-is",
        label: "The term",
        title: "What UGC on TikTok is",
        blurb: "UGC is someone else’s video about a product. A brand film posted to TikTok is still a brand film.",
        sections: [
          s(
            "Who is speaking",
            "In UGC, a person who is not the brand’s announcer shows the product in their own setting. The camera, the room, and the sentence sound like that person. If the video could have been a television spot with the logo removed, it is an ad that happens to be vertical.",
          ),
          s(
            "The product has a job in the video",
            "The product should do something in the clip: get used, compared, or complained about. A logo in the last second, after a joke that never needed the product, is a sponsorship card. Study the videos where removing the product would break the clip. Those are the references.",
          ),
        ],
        check: "Mute the branding in your head. If the video still has a reason to exist without the product, it is not a product video.",
      },
      {
        slug: "what-to-watch",
        label: "The example",
        title: "What to watch in a UGC example",
        blurb: "Watch the first sentence, the hands, and the proof. Skip the follower count.",
        sections: [
          s(
            "The opening line",
            "The first sentence either names the situation or it stalls. Write it down for several videos that performed in the niche. The pattern of those sentences is the brief. A creator’s follower count does not tell you whether they can say that sentence.",
          ),
          s(
            "Proof on screen",
            "Note what is actually shown: the texture, the before and after, the price, the mistake. UGC that only praises, with nothing visible, is a testimonial card. UGC that shows the use is the reference worth handing to a creator.",
          ),
        ],
        check: "Pause at the first second and at the moment the product appears. If those are far apart, the example is a sketch that mentions a brand.",
      },
      {
        slug: "rights",
        label: "The rights",
        title: "Views are not usage rights",
        blurb: "A public TikTok is not an asset you can run as an ad because it has views.",
        sections: [
          s(
            "Seeing it is not owning it",
            "You can watch a public video and learn from it. You cannot download it, edit it, or pay to boost it just because it is public. The creator, and sometimes the music on the clip, still has rights. A view count does not transfer them.",
          ),
          s(
            "Agree it before the brief goes wide",
            "If you want to use a creator’s video, say where it will run and for how long, in writing, before they film or before you boost. Modash can help you find a person. The agreement is not in the directory row. ContHunt can help you find the examples. It is not the license.",
          ),
        ],
        check: "For any video you want to reuse, name the person who said yes and the places they allowed. If you cannot, you only have a reference, not an asset.",
      },
    ],
  },
};

export function libraryFor(page: EmdPage): EmdCopy {
  const copy = COPY[page.slug];
  if (!copy) throw new Error(`No directory copy for ${page.slug}`);
  return copy;
}

export function toolAbout(tool: EmdTool): ToolAbout {
  if (!tool.slug) {
    return { label: "Editorial pick", about: tool.note, fit: tool.note };
  }
  return TOOL_ABOUT[tool.slug] ?? { label: "Also in this search", about: tool.note, fit: tool.note };
}

export type EmdDoc =
  | { kind: "category" }
  | { kind: "conthunt" }
  | { kind: "method" }
  | { kind: "related" }
  | { kind: "entries" }
  | { kind: "entry"; entry: EmdEntry }
  | { kind: "tools" }
  | { kind: "tool"; tool: EmdTool };

export function resolveDoc(page: EmdPage, parts: readonly string[]): EmdDoc | null {
  const [head, rest, extra] = parts;
  if (!head || extra) return null;
  if (!rest) {
    if (head === "category") return { kind: "category" };
    if (head === "conthunt") return { kind: "conthunt" };
    if (head === "methodology") return { kind: "method" };
    if (head === "related-websites") return { kind: "related" };
    if (head === "entries") return { kind: "entries" };
    if (head === "tools") return { kind: "tools" };
    return null;
  }
  if (head === "entries") {
    const entry = libraryFor(page).entries.find((item) => item.slug === rest);
    return entry ? { kind: "entry", entry } : null;
  }
  if (head === "tools") {
    const tool = page.tools.find((item) => item.slug === rest);
    return tool ? { kind: "tool", tool } : null;
  }
  return null;
}

export function docTitle(page: EmdPage, doc: EmdDoc): string {
  switch (doc.kind) {
    case "category":
      return `${page.h1} — category guide`;
    case "conthunt":
      return `ContHunt and ${page.h1}`;
    case "method":
      return "How this pick was made";
    case "related":
      return "How the related websites connect";
    case "entries":
      return `Practical entries — ${page.h1}`;
    case "entry":
      return doc.entry.title;
    case "tools":
      return `Resource directory — ${page.h1}`;
    case "tool":
      return doc.tool.name;
  }
}

export function docPath(doc: EmdDoc): string {
  switch (doc.kind) {
    case "category":
      return "/category";
    case "conthunt":
      return "/conthunt";
    case "method":
      return "/methodology";
    case "related":
      return "/related-websites";
    case "entries":
      return "/entries";
    case "entry":
      return `/entries/${doc.entry.slug}`;
    case "tools":
      return "/tools";
    case "tool":
      return `/tools/${doc.tool.slug}`;
  }
}

/** Every public URL on the domain, including the home page. */
export function publicPaths(page: EmdPage): string[] {
  const copy = libraryFor(page);
  const tools = page.tools.flatMap((tool) => (tool.slug ? [`/tools/${tool.slug}`] : []));
  return [
    "/",
    "/category",
    "/conthunt",
    "/methodology",
    "/related-websites",
    "/entries",
    ...copy.entries.map((entry) => `/entries/${entry.slug}`),
    "/tools",
    ...tools,
  ];
}

export function otherDomains(page: EmdPage): readonly EmdPage[] {
  return EMD_PAGES.filter((item) => item.slug !== page.slug);
}

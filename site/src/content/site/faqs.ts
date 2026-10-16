// Legacy FAQ ("Common Questions"), verbatim from index.html (lines 1160-1211).
// `emphasis` lists the words the legacy page wrapped in <em>. Whitespace from the HTML source is collapsed.
// Conflicts with other legacy/app copy are listed in docs/revamp/content/legacy-inventory.md.

export type FaqItem = {
  question: string;
  answer: string;
  emphasis: string[];
};

export type FaqsContent = {
  heading: string;
  items: FaqItem[];
};

export const data: FaqsContent = {
  heading: "Common Questions",
  items: [
    {
      question: "Is this just another social listening tool?",
      answer:
        "No. Listening tools tell you what people are saying. ContHunt tells you what people are watching and why. Our AI analyzes the visual and structural elements of content, not just text mentions.",
      emphasis: ["watching", "why"],
    },
    {
      question: "Which platforms do you support?",
      answer:
        "Currently, we support TikTok, YouTube Shorts, and Instagram Reels. LinkedIn video and X (Twitter) support is in beta.",
      emphasis: [],
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Absolutely. We offer monthly billing with no long-term contracts. You can export your data before you leave.",
      emphasis: [],
    },
  ],
};

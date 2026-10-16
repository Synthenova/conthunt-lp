// Legacy "Stop scrolling" giant-text statement, verbatim from index.html (lines 615-629).
// The `reference` block is the legacy "high cost of manual research" section (lines 631-702).
// It is NOT on the owner's retain list; it is kept as reference only, for the owner to decide.

export type StatementReferenceCard = {
  title: string;
  body: string;
};

export type StatementContent = {
  text: string;
  words: string[];
  reference: {
    heading: string;
    subhead: string;
    cards: StatementReferenceCard[];
  };
};

export const data: StatementContent = {
  text: "Stop scrolling to find ideas.",
  words: ["Stop", "scrolling", "to", "find", "ideas."],
  reference: {
    heading: "The high cost of manual research.",
    subhead: "Why the old way is holding you back.",
    cards: [
      {
        title: "The Problem",
        body: "You are wasting hours on manual research. Scrolling endlessly through feeds hoping to find a spark of inspiration is not a repeatable strategy.",
      },
      {
        title: "The Cost",
        body: "While you scroll, your competitors are automating their content strategy. You lose market share and miss trends before they even peak.",
      },
      {
        title: "The Solution",
        body: "An intelligent engine that scouts, filters, and analyzes viral videos for you. Turn 10 hours of manual digging into 10 minutes of execution.",
      },
    ],
  },
};

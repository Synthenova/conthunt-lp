/**
 * /support copy, shared by the page and its Markdown twin (src/lib/llm/document.ts) so the two never drift.
 * A paragraph is a list of runs: plain text, or a link.
 */
import { MCP_SERVER_URL, PRIVACY_URL, TERMS_URL } from "@/lib/links";

export type Run = string | { text: string; href: string };
export type Paragraph = Run[];

export interface SupportTopic {
  id: string;
  title: string;
  body: Paragraph[];
}

export const SUPPORT_EMAIL = "support@conthunt.app";
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;

export const SUPPORT_DESCRIPTION =
  "How to reach ContHunt support by email, what to include in your message, and help with sign-in, searches, analysis, boards, billing and the MCP connection.";

export const RESPONSE_TIME = "We reply by email, usually within two business days.";

const email: Run = { text: SUPPORT_EMAIL, href: SUPPORT_MAILTO };

export const CONTACT: Paragraph[] = [["Email ", email, ". ", RESPONSE_TIME]];

export const MESSAGE_CHECKLIST: string[] = [
  "The email address of your ContHunt account.",
  "What you were trying to do, what you tried, and what happened instead.",
  "Links to the chat or board involved.",
  "Screenshots of any error or unexpected result.",
];

export const TOPICS: SupportTopic[] = [
  {
    id: "signing-in",
    title: "Signing in",
    body: [
      [
        "If you cannot sign in, or you signed up with a different email than you expected, email ",
        email,
        " from the address you used and tell us how you signed in.",
      ],
    ],
  },
  {
    id: "searches",
    title: "Searches and Deep Search",
    body: [
      [
        "If a search or Deep Search returns no results, stops partway, or shows an error, send us a link to the chat and the words you searched for.",
      ],
    ],
  },
  {
    id: "video-analysis",
    title: "Video analysis",
    body: [
      [
        "If an analysis fails or looks wrong, send the link to the video and to the chat or board where you saw the result.",
      ],
    ],
  },
  {
    id: "boards",
    title: "Boards",
    body: [["If videos are missing from a board or a board will not open, send us the link to the board."]],
  },
  {
    id: "billing",
    title: "Billing and plans",
    body: [
      [
        "For questions about a charge, a plan change, a trial or a cancellation, email ",
        email,
        " from your account email address.",
      ],
    ],
  },
  {
    id: "mcp",
    title: "The ContHunt MCP and ChatGPT connection",
    body: [
      [
        "To connect, add ",
        { text: `${MCP_SERVER_URL}/`, href: `${MCP_SERVER_URL}/` },
        " in your client, sign in with your ContHunt account, and approve the connection.",
      ],
      ["To disconnect, remove the ContHunt connection from your client."],
    ],
  },
  {
    id: "account-deletion",
    title: "Account and data deletion",
    body: [
      [
        "To delete your account and its data, email ",
        email,
        " from your account email address and say that you want your account deleted.",
      ],
    ],
  },
  {
    id: "policies",
    title: "Privacy and terms",
    body: [
      [
        "Read our ",
        { text: "privacy policy", href: PRIVACY_URL },
        " and ",
        { text: "terms of service", href: TERMS_URL },
        ".",
      ],
    ],
  },
];

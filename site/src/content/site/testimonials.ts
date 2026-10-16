// Legacy scrolling testimonials, from index.html (lines 1033-1156).
// The legacy track renders these 4 cards twice for the infinite loop; this file keeps each card once.
// Quote text excludes the decorative straight quote marks around it.
// WARNING: the legacy page has no avatar images (empty gray circles) and no source for these names.
// Verify every quote and name with the owner before shipping; do not replace with generated people.
// Value "MISSING" = the legacy page has no value for this field.

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

export type TestimonialsContent = {
  heading: string;
  subhead: string;
  items: Testimonial[];
};

export const data: TestimonialsContent = {
  heading: "Trusted by top creators",
  subhead: "Join 5,000+ content strategists hunting smarter.",
  items: [
    {
      quote:
        "The deep research feature is insane. It's like having a dedicated strategist analyzing my niche 24/7.",
      name: "Sarah Jenkins",
      role: "Ecom Founder",
      avatar: "MISSING",
    },
    {
      quote:
        "I stopped guessing what would go viral. ContHunt just shows me the math behind the trends.",
      name: "Mark D.",
      role: "Growth Lead",
      avatar: "MISSING",
    },
    {
      quote:
        "Replaced 3 separate tools with this. The AI agent actually understands context, not just keywords.",
      name: "Alex Rivera",
      role: "Content Creator",
      avatar: "MISSING",
    },
    {
      quote:
        "Our content team output doubled because we spend zero time on ideation now.",
      name: "Elena K.",
      role: "Agency Owner",
      avatar: "MISSING",
    },
  ],
};

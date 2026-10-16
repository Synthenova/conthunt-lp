// Legacy newsletter / final CTA block, from index.html (lines 1409-1433) and its script (lines 2222-2260).
// The legacy form does NOT submit anywhere: it validates that the input contains "@", shows the
// success message client-side, then turns the button into a link to the app.
// Value "MISSING" = the legacy page has no value for this field.

export type NewsletterContent = {
  headlineLines: string[];
  subhead: string;
  input: {
    type: "email";
    placeholder: string;
  };
  submit: {
    label: string;
    successMessage: string;
    postSuccessLabel: string;
    postSuccessHref: string;
    /** Legacy submit endpoint. None: the form is client-side only. */
    endpoint: string;
  };
};

export const data: NewsletterContent = {
  headlineLines: ["Hunt content like", "a machine."],
  subhead: "Stop relying on gut feeling. Get the data-backed tool for modern creators.",
  input: {
    type: "email",
    placeholder: "Enter your email",
  },
  submit: {
    label: "JOIN NEWSLETTER",
    successMessage: "Successfully joined!",
    postSuccessLabel: "GET STARTED",
    postSuccessHref: "https://agent.conthunt.app",
    endpoint: "MISSING",
  },
};

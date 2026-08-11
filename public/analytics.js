const track = (eventName, properties = {}) => {
  if (window.posthog) {
    window.posthog.capture(eventName, properties);
  } else {
    console.warn(
      "PostHog not initialized, event skipped:",
      eventName,
      properties,
    );
  }
};

const knownBenignErrors = [
  "ResizeObserver loop completed with undelivered notifications.",
  "ResizeObserver loop limit exceeded",
];

const normalizeErrorDetail = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack || null,
    };
  }

  if (typeof value === "string") {
    return {
      message: value,
    };
  }

  try {
    return {
      message: JSON.stringify(value),
    };
  } catch (error) {
    return {
      message: String(value),
    };
  }
};

const captureBrowserSignal = (eventName, properties = {}) => {
  track(eventName, {
    url: window.location.pathname,
    page_path: window.location.pathname,
    user_agent: window.navigator.userAgent,
    ...properties,
  });
};

window.addEventListener("error", (event) => {
  const message = event?.message || "";

  if (
    knownBenignErrors.some((knownMessage) => message.includes(knownMessage))
  ) {
    event.preventDefault();
    return;
  }

  captureBrowserSignal("browser_error", {
    error_message: message || "unknown_error",
    error_source: event?.filename || null,
    error_line: event?.lineno || null,
    error_column: event?.colno || null,
    error_stack: event?.error?.stack || null,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  captureBrowserSignal("unhandled_rejection", {
    ...normalizeErrorDetail(event.reason),
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  if (!body) return;

  body.addEventListener(
    "click",
    (event) => {
      const target = event.target.closest(
        'button, a, [role="button"], input[type="submit"], input[type="button"]',
      );

      if (!target) {
        return;
      }

      let elementName =
        target.id ||
        target.getAttribute("name") ||
        target.innerText ||
        target.textContent ||
        "unknown_element";
      elementName = elementName.trim().substring(0, 50);

      const tagName = target.tagName.toLowerCase();
      const properties = {
        element_id: target.id,
        element_class: target.className,
        element_text: target.innerText
          ? target.innerText.substring(0, 100)
          : "",
        element_tag: tagName,
        element_href: target.href || null,
        element_type: target.type || null,
      };

      captureBrowserSignal("interaction_click", {
        ...properties,
        element_name: elementName,
      });

      if (target.id === "hero-waitlist-btn") {
        captureBrowserSignal("hero_cta_clicked", properties);
      } else if (target.id === "view-demo-btn") {
        captureBrowserSignal("view_demo_clicked", properties);
      } else if (target.id === "cta-waitlist-btn") {
        captureBrowserSignal("bottom_cta_clicked", properties);
      } else if (target.id === "join-newsletter-btn") {
        captureBrowserSignal("newsletter_cta_clicked", properties);
      }
    },
    true,
  );

  let maxScrollPercentage = 0;
  const scrollMilestones = [25, 50, 75, 90];
  const trackedMilestones = new Set();

  document.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent =
      docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 100;

    if (scrollPercent > maxScrollPercentage) {
      maxScrollPercentage = scrollPercent;

      scrollMilestones.forEach((milestone) => {
        if (
          maxScrollPercentage >= milestone &&
          !trackedMilestones.has(milestone)
        ) {
          trackedMilestones.add(milestone);
          captureBrowserSignal("scroll_depth_reached", {
            depth: milestone,
          });
        }
      });
    }
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          captureBrowserSignal("section_viewed", {
            section_id: entry.target.id,
            section_class: entry.target.className,
          });
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
    },
  );

  const sectionsToTrack = [
    "#cinematic-section",
    "#manual-research-section",
    "#features",
    "#workflow",
    "#pricing",
  ];

  sectionsToTrack.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      sectionObserver.observe(element);
    }
  });

  const workflowStepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const step = entry.target.dataset.step;
          captureBrowserSignal("workflow_step_viewed", {
            step_number: step,
            step_content:
              entry.target.querySelector("h3")?.innerText || "unknown",
          });
          workflowStepObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.8,
    },
  );

  document.querySelectorAll(".step-text").forEach((step) => {
    workflowStepObserver.observe(step);
  });
});

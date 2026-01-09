// Basic Tracker Helper
const track = (eventName, properties = {}) => {
    if (window.posthog) {
        window.posthog.capture(eventName, properties);
    } else {
        console.warn('PostHog not initialized, event skipped:', eventName, properties);
    }
};

// Global Event Delegation for Tracking
document.body.addEventListener('click', (event) => {
    // Find the closest interactive element
    const target = event.target.closest('button, a, [role="button"], input[type="submit"], input[type="button"]');

    if (target) {
        // Determine the element name/identifier
        let elementName = target.id || target.getAttribute('name') || target.innerText || target.textContent || 'unknown_element';
        elementName = elementName.trim().substring(0, 50); // Truncate if too long

        const tagName = target.tagName.toLowerCase();

        // Build properties object
        const properties = {
            element_id: target.id,
            element_class: target.className,
            element_text: target.innerText ? target.innerText.substring(0, 100) : '',
            element_tag: tagName,
            element_href: target.href || null,
            element_type: target.type || null
        };

        // Track the generic cliick event
        track('interaction_click', {
            ...properties,
            element_name: elementName
        });

        // Optionally track specific events based on IDs if critical
        if (target.id === 'hero-waitlist-btn') {
            track('hero_cta_clicked', properties);
        } else if (target.id === 'view-demo-btn') {
            track('view_demo_clicked', properties);
        } else if (target.id === 'cta-waitlist-btn') {
            track('bottom_cta_clicked', properties);
        }
    }
}, true); // Use capture phase to ensure we catch events before propagation might be stopped

// Scroll Depth Tracking
let maxScrollPercentage = 0;
const scrollMilestones = [25, 50, 75, 90];
const trackedMilestones = new Set();

document.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScrollPercentage) {
        maxScrollPercentage = scrollPercent;

        scrollMilestones.forEach(milestone => {
            if (maxScrollPercentage >= milestone && !trackedMilestones.has(milestone)) {
                trackedMilestones.add(milestone);
                track('scroll_depth_reached', {
                    depth: milestone,
                    url: window.location.pathname
                });
            }
        });
    }
});

// Section Visibility Tracking
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Track section view
            track('section_viewed', {
                section_id: entry.target.id,
                section_class: entry.target.className,
                url: window.location.pathname
            });

            // Only track once per session for this section
            sectionObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5 // Trigger when 50% of the section is visible
});

// Observe key sections
const sectionsToTrack = [
    '#cinematic-section', // Stop scrolling hook
    '#manual-research-section', // Pain point
    '#features', // Bento grid
    '#workflow', // How it works
    '#pricing' // Pricing
];

document.addEventListener('DOMContentLoaded', () => {
    sectionsToTrack.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            sectionObserver.observe(element);
        }
    });

    // Workflow Step Tracking (Sticky Scroll)
    const workflowStepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const step = entry.target.dataset.step;
                track('workflow_step_viewed', {
                    step_number: step,
                    step_content: entry.target.querySelector('h3')?.innerText || 'unknown',
                    url: window.location.pathname
                });
                // Optional: Don't unobserve if we want to track re-visits, 
                // but usually usually unique views are better for funnels. 
                // Let's unobserve to keep data clean.
                workflowStepObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.8 // High threshold since these are focused steps
    });

    // Observe workflow steps (text part)
    document.querySelectorAll('.step-text').forEach(step => {
        workflowStepObserver.observe(step);
    });
});


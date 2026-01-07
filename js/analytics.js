document.addEventListener('DOMContentLoaded', () => {
    // Helper to safely track events
    const track = (eventName, properties = {}) => {
        if (window.posthog) {
            window.posthog.capture(eventName, properties);
            // console.log(`[Analytics] ${eventName}`, properties); // Uncomment for debugging
        }
    };

    // --- Global Tracking ---

    // Track all link clicks
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            const text = link.innerText.trim();
            const location = link.closest('nav') ? 'navbar' :
                link.closest('footer') ? 'footer' : 'body';

            track('link_clicked', {
                destination: href,
                text: text,
                location: location
            });
        }
    });

    // --- Hero Section ---

    const heroWaitlistBtn = document.getElementById('hero-waitlist-btn');
    if (heroWaitlistBtn) {
        heroWaitlistBtn.addEventListener('click', () => {
            track('hero_cta_clicked', { type: 'waitlist' });
        });
    }

    const viewDemoBtn = document.getElementById('view-demo-btn');
    if (viewDemoBtn) {
        viewDemoBtn.addEventListener('click', () => {
            // Note: verification event is already in main.js, but good to normalize here if we refactor.
            // Leaving main.js as is for now to avoid conflict, relying on verification event there? 
            // Actually, let's track a generic 'demo_viewed' here too.
            track('demo_viewed', { source: 'hero_btn' });
        });
    }

    // --- Engagement ---

    // Simulated App Sidebar Tabs
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            track('demo_app_tab_switched', { tab: tab });
        });
    });

    // Platform Interactive Hover (Values)
    const platformBoxes = document.querySelectorAll('.platform-box');
    platformBoxes.forEach(box => {
        let hoverTimer;
        box.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                const color = box.getAttribute('data-hover-color');
                track('feature_platform_hovered', { color: color });
            }, 500); // 500ms threshold to consider it "intent"
        });
        box.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
        });
    });

    // --- Features Section ---

    // Sort Dropdown
    // Using delegation since items might be manipulated (though strictly they are static in HTML)
    const sortMenu = document.getElementById('sort-menu');
    if (sortMenu) {
        sortMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.sort-dropdown-item');
            if (item) {
                const sortValue = item.getAttribute('data-sort');
                track('feature_sort_changed', { sort: sortValue });
            }
        });
    }

    // Add to Board Buttons (Demo)
    // Delegate from a static parent if possible, or body
    document.body.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-board-btn');
        if (addBtn) {
            // Find the card content
            const card = addBtn.closest('.content-card');
            const vignette = card ? card.querySelector('.card-vignette') : null;
            // Extract some text identifier if possible, or just track generic add
            track('demo_add_to_board_clicked');
        }
    });

    // --- FAQ Section ---
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(details => {
        details.addEventListener('toggle', (e) => {
            if (details.open) {
                const summary = details.querySelector('summary span').innerText;
                track('faq_expanded', { question: summary });
            }
        });
    });

    // --- Pricing Section ---
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
        const planButtons = pricingSection.querySelectorAll('button');
        planButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Infer plan from checking siblings or context
                const planCard = btn.closest('div');
                // Creating a rough heuristic to identify plan
                const priceEl = planCard.innerText.includes('$29') ? 'Creator ($29)' : 'Pro ($79)';
                track('pricing_plan_selected', { plan: priceEl });
            });
        });
    }

    // --- Custom Event Listeners (dispatched from main.js) ---
    window.addEventListener('newsletter_signup_success', (e) => {
        track('newsletter_signup_success', { email_domain: e.detail?.email_domain });
    });

    window.addEventListener('lottie_animation_played', () => {
        track('hero_animation_played');
    });

});

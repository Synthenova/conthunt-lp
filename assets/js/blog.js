document.addEventListener('DOMContentLoaded', () => {
    const startAnalytics = () => {
        if (window.__conthuntAnalyticsStarted) return;
        window.__conthuntAnalyticsStarted = true;
        const script = document.createElement('script');
        script.src = 'https://us-assets.i.posthog.com/static/array.js';
        script.onload = () => {
            if (!window.posthog) return;
            window.posthog.init('phc_xYSuTFpO0h1u15WCJBqls5qzDc93YTmY0IXZST6t4J7', {
                api_host: '/ingest', ui_host: 'https://us.posthog.com', person_profiles: 'always', cross_subdomain_cookie: true
            });
        };
        document.head.appendChild(script);
    };
    ['pointerdown', 'keydown', 'scroll'].forEach((event) => {
        window.addEventListener(event, startAnalytics, { once: true, passive: true });
    });

    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            progressBar.style.width = `${(scrollTop / scrollHeight) * 100}%`;
        }, { passive: true });
    }

    const toc = document.querySelector('.blog-post-toc');
    if (toc) {
        const links = [...toc.querySelectorAll('a[href^="#"]')];
        const headings = links
            .map((link) => document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1))))
            .filter(Boolean);

        const setActive = () => {
            const offset = 140;
            let current = headings[0];
            headings.forEach((heading) => {
                if (heading.getBoundingClientRect().top <= offset) current = heading;
            });
            links.forEach((link) => {
                const active = current && link.getAttribute('href') === `#${current.id}`;
                link.classList.toggle('is-active', Boolean(active));
            });
        };

        window.addEventListener('scroll', setActive, { passive: true });
        setActive();
    }
});

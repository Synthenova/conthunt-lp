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

    // Reading Progress Bar
    const progressBar = document.getElementById('reading-progress');
    
    // Only run if the progress bar exists on the page
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            
            const scrollPercentage = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = `${scrollPercentage}%`;
        });
    }
});

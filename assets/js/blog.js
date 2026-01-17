document.addEventListener('DOMContentLoaded', () => {
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

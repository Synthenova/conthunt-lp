// Intersection Observer for Reveal Elements
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-element');
    elements.forEach(el => observer.observe(el));
});

// Text Scramble Effect
document.addEventListener('DOMContentLoaded', () => {
    const target = document.getElementById('changing-word');
    if (target) {
        const words = [
            'marketing strategy',
            'ecommerce',
            'content idea',
            'brand growth'
        ];
        let wordIndex = 0;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

        function scramble(newText) {
            let iteration = 0;
            clearInterval(target.interval);

            target.interval = setInterval(() => {
                target.innerText = newText
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return newText[index];
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                if (iteration >= newText.length) {
                    clearInterval(target.interval);
                    setTimeout(() => {
                        wordIndex = (wordIndex + 1) % words.length;
                        scramble(words[wordIndex]);
                    }, 3000);
                }

                iteration += 1 / 2;
            }, 30);
        }

        setTimeout(() => {
            wordIndex = (wordIndex + 1) % words.length;
            scramble(words[wordIndex]);
        }, 2000);
    }
});

// Cinematic Word Reveal Script
document.addEventListener('scroll', () => {
    const section = document.getElementById('cinematic-section');
    const words = document.querySelectorAll('.cinematic-word');
    if (!section || !words.length) return;
    const rect = section.getBoundingClientRect();
    const scrollDist = rect.height - window.innerHeight;
    let progress = 0;
    if (rect.top <= 0) {
        progress = Math.abs(rect.top) / scrollDist;
    }
    if (rect.top > 0) progress = 0;
    if (progress > 1) progress = 1;
    const activeIndex = Math.floor(progress * (words.length));
    words.forEach((word, i) => {
        if (i <= activeIndex) {
            word.style.opacity = '1';
            word.style.filter = 'blur(0px)';
        } else {
            word.style.opacity = '0.1';
            word.style.filter = 'blur(8px)';
        }
    });
});

// Light Torch Effect for Feature Cards
document.addEventListener('DOMContentLoaded', () => {
    const featureCards = document.querySelectorAll('#features .glass-panel, #manual-research-section .glass-panel');

    featureCards.forEach((card) => {
        const lightTorch = card.querySelector('.light-torch');
        if (!lightTorch) return;

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let isHovering = false;

        // Smooth animation using requestAnimationFrame
        function animate() {
            if (isHovering) {
                // Smooth interpolation for fluid movement
                currentX += (mouseX - currentX) * 0.1;
                currentY += (mouseY - currentY) * 0.1;

                lightTorch.style.left = currentX + 'px';
                lightTorch.style.top = currentY + 'px';
            }
            requestAnimationFrame(animate);
        }
        animate();

        card.addEventListener('mouseenter', () => {
            isHovering = true;
        });

        card.addEventListener('mouseleave', () => {
            isHovering = false;
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
    });
});

// Grid Torch Mouse Tracking
document.addEventListener('DOMContentLoaded', () => {
    const gridTorch = document.getElementById('grid-torch');

    if (gridTorch) {
        document.addEventListener('mousemove', (e) => {
            gridTorch.style.setProperty('--mouse-x', e.clientX + 'px');
            gridTorch.style.setProperty('--mouse-y', e.clientY + 'px');
        });
    }
});

// Manual Research Scroll Animation
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector('#manual-research-section');
    if (section) {
        const header = section.querySelector('.manual-header');
        const cards = section.querySelectorAll('.manual-card');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "center center",
                end: "+=1500",
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });

        // Header Animation
        tl.to(header, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        })
            // Staggered Cards Animation with Parallax & Blur
            .to(cards, {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: 2, // Large stagger for distinct steps during scrub
                duration: 3,
                ease: "power2.out",
                startAt: { y: 100, filter: "blur(10px)", opacity: 0 }
            }, "-=0.5");
    }
});

// Intelligence Section Scroll Animation
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const featureSection = document.querySelector('#features');
    if (featureSection) {
        const featureHeader = featureSection.querySelector('.features-header');
        const featureCards = featureSection.querySelectorAll('.features-card');

        const featureTl = gsap.timeline({
            scrollTrigger: {
                trigger: featureSection,
                start: "center center",
                end: "+=1500",
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });

        // Header Animation
        featureTl.to(featureHeader, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            startAt: { y: 30, opacity: 0 }
        })
            // Cards Animation (All at once, with parallax & blur)
            .to(featureCards, {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: 0, // No stagger, all together
                duration: 3,
                ease: "power2.out",
                startAt: { y: 100, filter: "blur(10px)", opacity: 0 }
            }, "-=0.2");
    }
});

// Steps Section Scroll Script
document.addEventListener('DOMContentLoaded', () => {
    // Ensure GSAP and ScrollTrigger are registered
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const stepImages = document.querySelectorAll('.step-image');
        const stepTexts = document.querySelectorAll('.step-text');

        if (stepImages.length > 0 && stepTexts.length > 0) {
            function setActiveStep(index) {
                stepTexts.forEach((text, i) => {
                    if (i === index) {
                        text.classList.remove('opacity-30');
                        text.classList.add('opacity-100');
                    } else {
                        text.classList.add('opacity-30');
                        text.classList.remove('opacity-100');
                    }
                });
            }

            // Initialize first step as active immediately
            setActiveStep(0);

            stepImages.forEach((img, i) => {
                ScrollTrigger.create({
                    trigger: img,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => setActiveStep(i),
                    onEnterBack: () => setActiveStep(i),
                    // markers: false
                });
            });
        }
    }
});

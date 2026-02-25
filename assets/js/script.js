// Intersection Observer Script
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

// Lazy Load Lottie Animations
document.addEventListener('DOMContentLoaded', () => {
    const lazyLotties = document.querySelectorAll('lottie-player[data-src]');

    if ('IntersectionObserver' in window) {
        const lottieObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const player = entry.target;
                    const src = player.getAttribute('data-src');
                    if (src) {
                        player.setAttribute('src', src);
                        player.removeAttribute('data-src');
                        // Autoplay once loaded
                        if (player.play) {
                            player.play();
                        } else {
                            player.addEventListener('ready', () => {
                                player.play();
                            });
                        }
                    }
                    observer.unobserve(player);
                }
            });
        }, {
            rootMargin: '200px 0px', // Start loading 200px before entering viewport
            threshold: 0
        });

        lazyLotties.forEach(player => {
            lottieObserver.observe(player);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyLotties.forEach(player => {
            const src = player.getAttribute('data-src');
            if (src) {
                player.setAttribute('src', src);
            }
        });
    }
});

// Interactive Button Script
document.addEventListener('DOMContentLoaded', () => {
    const interactiveButtons = document.querySelectorAll('.glass-button-interactive');
    interactiveButtons.forEach(btn => {
        let currentAngle = 120; // Track current angle to avoid wrap-around jumps

        btn.addEventListener('mouseenter', () => {
            // Remove returning class for responsive tracking
            btn.classList.remove('returning');
        });

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Calculate angle in degrees (atan2 returns -180 to 180)
            let angle = Math.atan2(y, x) * (180 / Math.PI);

            // Normalize to 0-360 range
            if (angle < 0) angle += 360;

            // Position gradient opposite to mouse (add 180) and adjust for CSS conic coords
            let targetAngle = (angle + 180 + 90) % 360;

            // Calculate shortest path to avoid 0/360 wrap-around jump
            let diff = targetAngle - currentAngle;

            // If diff is greater than 180, go the other way
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            currentAngle += diff;

            btn.style.setProperty('--border-angle', `${currentAngle}deg`);
        });

        btn.addEventListener('mouseleave', () => {
            // Add returning class for smooth return animation
            btn.classList.add('returning');
            // Reset to default angle when mouse leaves
            currentAngle = 120;
            btn.style.setProperty('--border-angle', '120deg');
        });
    });
});

// Billing Toggle Script
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('annual-toggle');
    const toggleKnob = document.getElementById('annual-toggle-knob');
    const annualLabel = document.getElementById('annual-label');

    const creatorPriceEl = document.getElementById('creator-price');
    const proPriceEl = document.getElementById('pro-price');
    const billingTexts = document.querySelectorAll('.billing-period-text');

    let isAnnual = false;

    // Smooth counting animation for numbers
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Easing function: easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentVal = Math.floor(easeProgress * (end - start) + start);
            obj.textContent = currentVal;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = end; // Ensure final value is exact
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateState() {
        // 1. Toggle Button UI
        if (isAnnual) {
            toggleBtn.setAttribute('aria-pressed', 'true');
            // Move knob to right: calc(100% - 1.5rem - 4px) -> approx 24px/28px
            // Since w-14 (3.5rem=56px) and knob w-6 (1.5rem=24px), left-1 (4px).
            // Max translation = 56 - 24 - 8 = 24px.
            toggleKnob.style.transform = 'translateX(24px)';

            // Make label active
            annualLabel.classList.replace('text-neutral-400', 'text-white');
        } else {
            toggleBtn.setAttribute('aria-pressed', 'false');
            toggleKnob.style.transform = 'translateX(0)';

            annualLabel.classList.replace('text-white', 'text-neutral-400');
        }

        // 2. Update Billing Subtext
        billingTexts.forEach(el => {
            el.textContent = isAnnual ? 'Billed Annually' : 'Billed Monthly';
        });

        // 3. Update Prices with Animation
        [creatorPriceEl, proPriceEl].forEach(el => {
            const startVal = parseInt(el.textContent);
            const endVal = isAnnual ? parseInt(el.dataset.yearly) : parseInt(el.dataset.monthly);

            // Only animate if value changes
            if (startVal !== endVal) {
                animateValue(el, startVal, endVal, 500);
            }
        });
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isAnnual = !isAnnual;
            updateState();
        });
    }
});

// Changing Word Animation
document.addEventListener('DOMContentLoaded', () => {
    const target = document.getElementById('changing-word');
    if (!target) return;

    target.innerText = 'marketing';

    const words = [
        'marketing',
        'ecommerce',
        'content idea',
        'brand growth'
    ];
    let wordIndex = 0;
    const chars =
        'abcdefghijklmnopqrstuvwxyz';

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
});

// Cinematic Scroll Animation
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

// Tab Switching Script
document.addEventListener('DOMContentLoaded', () => {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    /*
    sidebarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Update sidebar button styles
        sidebarBtns.forEach(b => {
          b.classList.remove('bg-indigo-500/10', 'text-indigo-400');
          b.classList.add('text-neutral-600');
        });
        btn.classList.remove('text-neutral-600');
        btn.classList.add('bg-indigo-500/10', 'text-indigo-400');

        // Update tab content visibility
        tabContents.forEach(tab => {
          if (tab.id === `${targetTab}`) {
            tab.classList.remove('hidden');
            tab.classList.add('active');
          } else {
            tab.classList.add('hidden');
            tab.classList.remove('active');
          }
        });
      });
    });
    */
});

// Card Hover Effects and Sort Dropdown Script
document.addEventListener('DOMContentLoaded', () => {
    const sortBtn = document.getElementById('sort-btn');
    const sortMenu = document.getElementById('sort-menu');
    const sortValue = document.getElementById('sort-value');
    const sortItems = document.querySelectorAll('.sort-dropdown-item');
    const cardsContainer = document.getElementById('cards-container');

    if (sortBtn) {
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortMenu.classList.toggle('hidden');
        });
    }

    document.addEventListener('click', () => {
        if (sortMenu) sortMenu.classList.add('hidden');
    });

    sortItems.forEach((item) => {
        item.addEventListener('click', () => {
            const value = item.getAttribute('data-sort');
            sortValue.textContent = value;
            sortMenu.classList.add('hidden');

            const cards = Array.from(cardsContainer.children);
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                cardsContainer.appendChild(cards[j]);
                cards.splice(j, 1);
            }
        });
    });

    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            const cardText = card.querySelector('.card-text');
            const cardVignette = card.querySelector('.card-vignette');
            const addBtn = card.querySelector('.add-to-board-btn');
            if (cardText) cardText.style.opacity = '0';
            if (cardVignette) cardVignette.style.opacity = '0';
            if (addBtn) {
                addBtn.style.opacity = '1';
                addBtn.style.transform = 'translateY(0)';
            }
        });

        card.addEventListener('mouseleave', () => {
            const cardText = card.querySelector('.card-text');
            const cardVignette = card.querySelector('.card-vignette');
            const addBtn = card.querySelector('.add-to-board-btn');
            if (cardText) cardText.style.opacity = '1';
            if (cardVignette) cardVignette.style.opacity = '1';
            if (addBtn) {
                addBtn.style.opacity = '0';
                addBtn.style.transform = 'translateY(10px)';
            }
        });
    });
});

// Light Torch Effect Script for Feature Cards
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

// Navbar Hide/Show on Scroll Script
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let scrollDistance = 0;

    function updateNavbar() {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY;

        // Reset accumulator if we change scroll direction
        if ((diff > 0 && scrollDistance < 0) || (diff < 0 && scrollDistance > 0)) {
            scrollDistance = 0;
        }

        scrollDistance += diff;

        if (scrollDistance >= 30 && currentScrollY > 100) {
            nav.style.transform = 'translateY(-200%)';
            scrollDistance = 0;
        } else if (scrollDistance <= -15 || currentScrollY <= 10) {
            nav.style.transform = 'translateY(0)';
            scrollDistance = 0;
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
});

// Manual Research Scroll Animation
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const section = document.querySelector('#manual-research-section');
        if (!section) return;

        const header = section.querySelector('.manual-header');
        const cards = section.querySelectorAll('.manual-card');

        ScrollTrigger.matchMedia({
            // DESKTOP: Original Scroll-Jacked Animation
            "(min-width: 769px)": function () {
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
                        startAt: {
                            y: 100,
                            filter: "blur(10px)",
                            opacity: 0
                        }
                    }, "-=0.5");
            },

            // MOBILE: Simple Fade-In with Blur (No Scroll-Jacking)
            "(max-width: 768px)": function () {
                // Animate header simply when it enters viewport
                gsap.to(header, {
                    scrollTrigger: {
                        trigger: section,
                        start: "top 70%", // Start earlier on mobile
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });

                // Animate cards staggered
                gsap.to(cards, {
                    scrollTrigger: {
                        trigger: section, // animate all cards when section enters
                        start: "top 60%",
                    },
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    stagger: 0.2, // Faster stagger for standard scroll
                    duration: 0.8,
                    ease: "power2.out",
                    startAt: {
                        y: 50,
                        filter: "blur(10px)",
                        opacity: 0
                    }
                });
            }
        });
    }
});

// Intelligence Section Scroll Animation
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const featureSection = document.querySelector('#features');
        if (!featureSection) return;

        const featureHeader = featureSection.querySelector('.features-header');
        const featureCards = featureSection.querySelectorAll('.features-card');

        ScrollTrigger.matchMedia({
            // DESKTOP: Original Scroll-Jacked Animation
            "(min-width: 769px)": function () {
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
                    startAt: {
                        y: 30,
                        opacity: 0
                    }
                })
                    // Cards Animation (All at once, with parallax & blur)
                    .to(featureCards, {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        stagger: 0, // No stagger, all together
                        duration: 3,
                        ease: "power2.out",
                        startAt: {
                            y: 100,
                            filter: "blur(10px)",
                            opacity: 0
                        }
                    }, "-=0.2");
            },

            // MOBILE: Simple Fade-In with Blur (No Scroll-Jacking)
            "(max-width: 768px)": function () {
                // Animate header
                gsap.to(featureHeader, {
                    scrollTrigger: {
                        trigger: featureSection,
                        start: "top 70%",
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });

                // Animate cards
                gsap.to(featureCards, {
                    scrollTrigger: {
                        trigger: featureSection,
                        start: "top 60%",
                    },
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power2.out",
                    startAt: {
                        y: 50,
                        filter: "blur(10px)",
                        opacity: 0
                    }
                });
            }
        });
    }
});

// Platform Box Hover Effects
document.addEventListener('DOMContentLoaded', () => {
    const platformBoxes = document.querySelectorAll('.platform-box');

    platformBoxes.forEach((box) => {
        const hoverGradient = box.getAttribute('data-hover-gradient');
        const hoverColor = box.getAttribute('data-hover-color');

        box.addEventListener('mouseenter', () => {
            if (hoverGradient) {
                box.style.background = hoverGradient;
            }
            if (hoverColor) {
                box.style.color = hoverColor;
                box.style.borderColor = hoverColor + '30';
            }
        });

        box.addEventListener('mouseleave', () => {
            box.style.background = '';
            box.style.color = '';
            box.style.borderColor = '';
        });
    });
});

// Grid Torch Mouse Tracking
document.addEventListener('DOMContentLoaded', () => {
    const gridTorch = document.getElementById('grid-torch');
    if (!gridTorch) return;

    document.addEventListener('mousemove', (e) => {
        gridTorch.style.setProperty('--mouse-x', e.clientX + 'px');
        gridTorch.style.setProperty('--mouse-y', e.clientY + 'px');
    });
});

// Steps Section Scroll Script
document.addEventListener('DOMContentLoaded', () => {
    // Ensure GSAP and ScrollTrigger are registered
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const stepImages = document.querySelectorAll('.step-image');
        const stepTexts = document.querySelectorAll('.step-text');

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
});

// Main Lottie Control Script
document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('main-lottie');
    const replayBtn = document.getElementById('lottie-replay-btn');

    if (player) {
        let hasPlayed = false;

        // Intersection Observer for playing only when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasPlayed) {
                    // Check if player is ready
                    if (player.play) {
                        player.play();
                        hasPlayed = true;
                    } else {
                        player.addEventListener('ready', () => {
                            if (!hasPlayed) {
                                player.play();
                                hasPlayed = true;
                            }
                        });
                    }
                }
            });
        }, { threshold: 0.5 });

        observer.observe(player);

        // Show Replay button when animation completes
        player.addEventListener('complete', () => {
            if (replayBtn) {
                replayBtn.classList.remove('hidden');
                replayBtn.classList.add('flex');
            }
        });

        // Replay functionality
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                replayBtn.classList.add('hidden');
                replayBtn.classList.remove('flex');
                player.stop();
                player.play();
            });
        }
    }

    // View Demo functionality
    const viewDemoBtn = document.getElementById('view-demo-btn');
    const simulatedAppFrame = document.getElementById('simulated-app-frame');

    if (viewDemoBtn && simulatedAppFrame) {
        viewDemoBtn.addEventListener('click', () => {
            simulatedAppFrame.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // Newsletter Flow / Waitlist API
    const newsletterBtn = document.getElementById('join-newsletter-btn');
    const newsletterInput = document.getElementById('newsletter-email-input');
    const newsletterContainer = document.getElementById('newsletter-form-container');

    if (newsletterBtn && newsletterInput && newsletterContainer) {
        // Trigger button click on Enter key
        newsletterInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                newsletterBtn.click();
            }
        });

        newsletterBtn.addEventListener('click', async () => {
            // If button is already in "Get Started" state, redirect
            if (newsletterBtn.dataset.state === 'success') {
                window.location.href = 'https://agent.conthunt.app';
                return;
            }

            const email = newsletterInput.value;
            // Basic email validation
            if (!email || !email.includes('@')) {
                newsletterInput.style.borderColor = '#ef4444'; // red-500
                newsletterInput.classList.add('animate-shake'); // Add shake animation if available, or just red border
                setTimeout(() => {
                    newsletterInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    newsletterInput.classList.remove('animate-shake');
                }, 2000);
                return;
            }

            // Set loading state
            const originalBtnText = newsletterBtn.textContent;
            newsletterBtn.innerHTML = '<iconify-icon icon="lucide:loader-2" class="animate-spin text-xl"></iconify-icon>';
            newsletterBtn.disabled = true;
            newsletterInput.disabled = true;

            try {
                const response = await fetch('https://conthunt-976912795426.us-central1.run.app/v1/waitlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });

                const data = await response.json();

                if (response.ok) {
                    // Success or Already Joined
                    const isAlreadyJoined = data.already_joined === true;
                    const successText = isAlreadyJoined ? "You're already on the list!" : "You're on the list!";
                    const icon = isAlreadyJoined ? "lucide:check-circle" : "lucide:sparkles";

                    // Premium Success UI
                    // We'll replace the input and button with a unified success badge
                    newsletterContainer.innerHTML = `
                        <div class="reveal-element flex items-center gap-3 bg-neutral-900/50 border border-green-500/30 text-white px-6 py-3 rounded-full h-[52px] shadow-[0_0_15px_rgba(34,197,94,0.1)] animate-in fade-in zoom-in duration-300">
                            <div class="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <iconify-icon icon="${icon}" width="14"></iconify-icon>
                            </div>
                            <span class="font-medium text-sm text-neutral-200 tracking-wide">${successText}</span>
                        </div>
                        <a href="https://agent.conthunt.app"
                           class="glass-button px-6 py-3 text-[0.85rem] font-bold font-nav h-[52px] animate-in fade-in slide-in-from-right-4 duration-500 delay-100 flex items-center gap-2">
                           OPEN AGENT <iconify-icon icon="lucide:arrow-right" width="14"></iconify-icon>
                        </a>
                    `;

                    // Re-attach countdown modal check if needed, but for now direct link is fine or we can re-bind the click manually 
                    // (simplified for reliability)

                } else if (response.status === 429) {
                    // Rate Limited
                    alert('Too many requests. Please try again later.');
                    resetForm();
                } else if (response.status === 422) {
                    // Validation Error (Backend rejected email)
                    newsletterInput.style.borderColor = '#ef4444';
                    setTimeout(() => newsletterInput.style.borderColor = 'rgba(255, 255, 255, 0.1)', 2000);
                    resetForm();
                } else {
                    // Generic Error
                    console.error('Waitlist Error:', data);
                    alert('Something went wrong. Please try again.');
                    resetForm();
                }

            } catch (error) {
                console.error('Network Error:', error);
                alert('Connection error. Please check your internet.');
                resetForm();
            }

            function resetForm() {
                newsletterBtn.textContent = originalBtnText;
                newsletterBtn.disabled = false;
                newsletterInput.disabled = false;
            }
        });
    }
});

// Step 3 Video Playback Control Script
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('step3-video');
    if (!video) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.currentTime = 0;
                video.play().catch(error => {
                    console.log("Video playback failed:", error);
                });
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.2 // Trigger when at least 20% of the video is visible
    });

    observer.observe(video);
});

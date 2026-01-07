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

// Navbar Hide/Show on Scroll Script
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    if (nav) {
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

// General UI Interactions (Sort Menu, Content Cards, Newsletter, Main Lottie)
document.addEventListener('DOMContentLoaded', () => {
    // Sort Menu Logic
    const sortBtn = document.getElementById('sort-btn');
    const sortMenu = document.getElementById('sort-menu');
    const sortValue = document.getElementById('sort-value');
    const sortItems = document.querySelectorAll('.sort-dropdown-item');
    const cardsContainer = document.getElementById('cards-container');

    if (sortBtn && sortMenu) {
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            sortMenu.classList.add('hidden');
        });

        sortItems.forEach((item) => {
            item.addEventListener('click', () => {
                const value = item.getAttribute('data-sort');
                sortValue.textContent = value;
                sortMenu.classList.add('hidden');

                if (cardsContainer) {
                    const cards = Array.from(cardsContainer.children);
                    for (let i = cards.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        cardsContainer.appendChild(cards[j]);
                        cards.splice(j, 1);
                    }
                }
            });
        });
    }

    // Content Cards Hover Effects
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

    // Main Lottie Control
    const player = document.getElementById('main-lottie');
    const replayBtn = document.getElementById('lottie-replay-btn');
    let hasPlayed = false;

    if (player) {
        // Intersection Observer for playing only when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasPlayed) {
                    // Check if player is ready
                    if (player.play) {
                        player.play();
                        hasPlayed = true;
                        window.dispatchEvent(new CustomEvent('lottie_animation_played'));
                    } else {
                        player.addEventListener('ready', () => {
                            if (!hasPlayed) {
                                player.play();
                                hasPlayed = true;
                                window.dispatchEvent(new CustomEvent('lottie_animation_played'));
                            }
                        });
                    }
                }
            });
        }, { threshold: 0.5 });

        observer.observe(player);

        if (replayBtn) {
            // Show Replay button when animation completes
            player.addEventListener('complete', () => {
                replayBtn.classList.remove('hidden');
                replayBtn.classList.add('flex');
            });

            // Replay functionality
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
            if (window.posthog) {
                window.posthog.capture('view_demo_clicked', { source: 'landing_page_button' });
                console.log('PostHog event captured: view_demo_clicked');
            }
            simulatedAppFrame.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // Hero Get Started Button Redirect
    const heroWaitlistBtn = document.getElementById('hero-waitlist-btn');
    if (heroWaitlistBtn) {
        heroWaitlistBtn.addEventListener('click', () => {
            window.location.href = 'https://agent.conthunt.app';
        });
    }

    // Newsletter Flow
    const newsletterBtn = document.getElementById('join-newsletter-btn');
    const newsletterInput = document.getElementById('newsletter-email-input');
    const newsletterContainer = document.getElementById('newsletter-form-container');

    if (newsletterBtn && newsletterInput && newsletterContainer) {
        newsletterBtn.addEventListener('click', () => {
            // If button is already in "Get Started" state, redirect
            if (newsletterBtn.dataset.state === 'success') {
                window.location.href = 'https://agent.conthunt.app';
                return;
            }

            const email = newsletterInput.value;
            if (email && email.includes('@')) {
                // Simulate API call/Success state
                // Replace input with success message
                const successMsg = document.createElement('span');
                successMsg.className = 'text-green-400 font-medium flex items-center h-[52px] px-4';
                successMsg.textContent = 'Successfully joined!';

                newsletterInput.style.display = 'none';
                newsletterContainer.insertBefore(successMsg, newsletterBtn);

                // Change button text and state
                newsletterBtn.textContent = 'GET STARTED';
                newsletterBtn.dataset.state = 'success';

                // Optional: Clear input (though it's hidden)
                newsletterInput.value = '';

                // Dispatch Analytics Event
                const domain = email.split('@')[1];
                window.dispatchEvent(new CustomEvent('newsletter_signup_success', {
                    detail: { email_domain: domain }
                }));
            } else {
                // Basic validation visual feedback
                newsletterInput.style.borderColor = '#ef4444'; // red-500
                setTimeout(() => {
                    newsletterInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            }
        });
    }
});

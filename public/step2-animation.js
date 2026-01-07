// Step 2 Code Generation Animation - Performance Optimized
document.addEventListener('DOMContentLoaded', () => {
  const codeContent = document.getElementById('code-content');
  const codeStatus = document.getElementById('code-status');
  const codeWindow = document.getElementById('code-window');

  if (!codeContent || !codeStatus || !codeWindow) return;

  let animationTimer = null;
  let isAnimating = false;

  // Clean syntax highlighting
  const createHighlightedLine = (line) => {
    const span = document.createElement('span');
    span.className = 'break-all';

    const tokens = line.split(/(\s+|[{}()\[\];,.])/);
    tokens.forEach(token => {
      const el = document.createElement('span');

      if (/^(const|let|await|async|return|if)$/.test(token)) {
        el.className = 'text-purple-400';
      } else if (/^['"`].*['"`]$/.test(token)) {
        el.className = 'text-green-400';
      } else if (/^\d+$/.test(token)) {
        el.className = 'text-blue-400';
      } else if (/^[{}()\[\];,.]$/.test(token)) {
        el.className = 'text-yellow-400/70';
      } else if (/^\/\//.test(token)) {
        el.className = 'text-neutral-500';
      } else {
        el.className = 'text-neutral-300';
      }

      el.textContent = token;
      span.appendChild(el);
    });

    return span;
  };

  // Reduced code sequences - 6-8 lines each for better performance
  const CODE_SEQUENCES = [
    {
      status: "Parsing search parameters",
      lines: [
        "const query = {",
        "  topic: 'organic skincare',",
        "  format: 'viral ad video',",
        "  minViews: 500000,",
        "  minComments: 300",
        "};",
        "// Expanded to 847 keywords"
      ]
    },
    {
      status: "Scanning TikTok, Reels, Shorts",
      lines: [
        "const platforms = ['tiktok', 'instagram', 'youtube'];",
        "const results = await scanAll(platforms, query);",
        "",
        "console.log('Found', results.length, 'videos');",
        "// Scanned 24,847 videos"
      ]
    },
    {
      status: "Filtering viral content",
      lines: [
        "const viral = results.filter(v => {",
        "  return v.views > 500000 &&",
        "         v.comments > 300 &&",
        "         v.velocity > 10000;",
        "});",
        "// 127 high-potential matches"
      ]
    },
    {
      status: "Analyzing hook patterns",
      lines: [
        "const analyzed = await analyzeHooks(viral);",
        "const top = analyzed",
        "  .sort((a, b) => b.score - a.score)",
        "  .slice(0, 12);",
        "",
        "// Report ready: 12 videos identified"
      ]
    }
  ];

  let currentSequenceIndex = 0;
  let currentLineIndex = 0;
  let lineNumber = 1;

  const addLine = () => {
    if (!isAnimating) return; // Stop if animation is paused

    const sequence = CODE_SEQUENCES[currentSequenceIndex];

    // Update status
    if (codeStatus.textContent !== sequence.status + "...") {
      codeStatus.style.transition = 'opacity 0.2s ease';
      codeStatus.style.opacity = '0';
      setTimeout(() => {
        if (!isAnimating) return;
        codeStatus.textContent = sequence.status + "...";
        codeStatus.style.opacity = '1';
      }, 200);
    }

    if (currentLineIndex < sequence.lines.length) {
      const lineText = sequence.lines[currentLineIndex];
      const lineDiv = document.createElement('div');
      lineDiv.className = 'flex gap-4';

      lineDiv.style.opacity = '0';
      lineDiv.style.transform = 'translateY(8px)';
      lineDiv.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';

      const lineNumSpan = document.createElement('span');
      lineNumSpan.className = 'text-neutral-600 select-none w-6 text-right shrink-0 text-[10px] pt-0.5';
      lineNumSpan.textContent = lineText.trim() === '' ? '' : lineNumber;
      if (lineText.trim() !== '') lineNumber++;

      lineDiv.appendChild(lineNumSpan);
      lineDiv.appendChild(createHighlightedLine(lineText));

      codeContent.appendChild(lineDiv);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isAnimating) return;
          lineDiv.style.opacity = '1';
          lineDiv.style.transform = 'translateY(0)';
        });
      });

      // Keep max 10 visible lines (reduced from 12)
      if (codeContent.children.length > 10) {
        const firstChild = codeContent.firstElementChild;
        firstChild.style.transition = 'opacity 0.2s ease-out';
        firstChild.style.opacity = '0';
        setTimeout(() => {
          if (firstChild.parentNode) firstChild.remove();
        }, 200);
      }

      currentLineIndex++;
      animationTimer = setTimeout(addLine, 150); // Slightly slower for better performance
    } else {
      animationTimer = setTimeout(() => {
        if (!isAnimating) return;
        currentSequenceIndex = (currentSequenceIndex + 1) % CODE_SEQUENCES.length;
        currentLineIndex = 0;
        if (currentSequenceIndex === 0) lineNumber = 1;
        addLine();
      }, 1000);
    }
  };

  const startAnimation = () => {
    if (isAnimating) return;
    isAnimating = true;
    addLine();
  };

  const stopAnimation = () => {
    isAnimating = false;
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = null;
    }
  };

  const resetAnimation = () => {
    stopAnimation();
    codeContent.innerHTML = '';
    currentSequenceIndex = 0;
    currentLineIndex = 0;
    lineNumber = 1;
    codeStatus.textContent = 'Initializing search...';
  };

  // Intersection Observer - only animate when in viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Element is visible - start animation
        startAnimation();
      } else {
        // Element is not visible - stop animation to save performance
        stopAnimation();
      }
    });
  }, {
    threshold: 0.3, // Start when 30% visible
    rootMargin: '0px'
  });

  // Observe the code window container
  observer.observe(codeWindow);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
    stopAnimation();
  });
});

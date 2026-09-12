(function () {
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject();
  }

  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    const buttons = Array.from(root.querySelectorAll('[data-tab]'));
    const panels = Array.from(root.querySelectorAll('[data-panel]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const id = button.getAttribute('data-tab');
        buttons.forEach(function (item) { item.classList.toggle('is-active', item === button); });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.getAttribute('data-panel') === id);
        });
      });
    });
  });

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', async function () {
      const target = button.getAttribute('data-copy');
      let text = '';
      if (target) {
        const el = document.getElementById(target);
        text = el ? el.textContent : '';
      } else {
        const code = button.parentElement && button.parentElement.querySelector('code');
        text = code ? code.textContent : '';
      }
      try {
        await copyText(text.trim());
        const original = button.textContent;
        button.textContent = 'Copied';
        button.classList.add('is-copied');
        setTimeout(function () {
          button.textContent = original;
          button.classList.remove('is-copied');
        }, 1600);
      } catch (error) {
        button.textContent = 'Copy failed';
      }
    });
  });
})();

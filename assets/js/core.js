export function initCore() {
  window.addEventListener('load', () => {
    insertLoadTimeIntoFooter();
    setActiveNavLink();
  });
}

function insertLoadTimeIntoFooter() {
  const footer = document.querySelector('footer');

  if (!footer) {
    return;
  }

  const loadMs = getLoadTimeMs();
  const paragraph = document.createElement('p');
  paragraph.className = 'load-time';
  paragraph.textContent =
    loadMs === null
      ? 'Время загрузки страницы определить не удалось.'
      : `Время загрузки страницы: ${loadMs.toFixed(0)} мс`;

  footer.appendChild(paragraph);
}

function getLoadTimeMs() {
  const navigationEntries =
    performance.getEntriesByType?.('navigation') ?? [];

  if (navigationEntries.length > 0) {
    const navigation = navigationEntries[0];

    if (typeof navigation.duration === 'number' && navigation.duration > 0) {
      return navigation.duration;
    }
  }

  if (typeof performance.now === 'function') {
    return performance.now();
  }

  return null;
}

function setActiveNavLink() {
  const links = document.querySelectorAll('nav a[href]');
  const currentPath = normalizePath(document.location.pathname);

  links.forEach((link) => {
    const href = link.getAttribute('href');

    if (!href) {
      return;
    }

    const linkPath = normalizePath(new URL(href, document.baseURI).pathname);

    if (linkPath === currentPath) {
      link.classList.add('nav__link--active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('nav__link--active');
      link.removeAttribute('aria-current');
    }
  });
}

function normalizePath(pathname) {
  return pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
}

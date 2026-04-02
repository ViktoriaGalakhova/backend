'use strict';

export function initMain() {
    window.addEventListener('load', () => {
        insertLoadTimeIntoFooter();
        setActiveNavLink();
        initFeedbackPageIfPresent();
    });
}

function insertLoadTimeIntoFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const loadMs = getLoadTimeMs();
    const p = document.createElement('p');
    p.className = 'load-time';

    p.textContent = (loadMs === null)
        ? 'Время загрузки: недоступно'
        : `Время загрузки: ${loadMs.toFixed(0)} мс`;

    footer.appendChild(p);
}

function getLoadTimeMs() {
    const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
        const nav = navEntries[0];

        if (typeof nav.duration === 'number' && nav.duration > 0) return nav.duration;

        if (typeof nav.loadEventEnd === 'number' && nav.loadEventEnd > 0) return nav.loadEventEnd - nav.startTime;
    }

    const t = performance.timing;
    if (t && t.loadEventEnd && t.navigationStart) {
        return t.loadEventEnd - t.navigationStart;
    }

    if (typeof performance.now === 'function') {
        return performance.now();
    }

    return null;
}

function setActiveNavLink() {
    const links = document.querySelectorAll('nav a[href]');
    if (!links.length) return;

    const currentPath = normalizePath(document.location.pathname);

    links.forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#')) return;

        const linkPath = normalizePath(new URL(href, document.baseURI).pathname);

        if (linkPath === currentPath) {
            a.classList.add('nav__link--active');
            a.setAttribute('aria-current', 'page');
        } else {
            a.classList.remove('nav__link--active');
            a.removeAttribute('aria-current');
        }
    });
}

function normalizePath(pathname) {

    return pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');
}

function initFeedbackPageIfPresent() {
    const form = document.getElementById('feedbackForm');
    const list = document.getElementById('feedbackList');
    const tpl = document.getElementById('feedbackItemTemplate');

    if (!form || !list || !tpl) return;

    const errorEl = document.getElementById('formError');
    const nameEl = document.getElementById('fbName');
    const emailEl = document.getElementById('fbEmail');
    const textEl = document.getElementById('fbText');
    const STORAGE_KEY = 'bcs_feedback_v1';
    const items = loadItems(STORAGE_KEY);
    items.forEach(item => renderItem(item, list, tpl));
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (errorEl) errorEl.textContent = '';
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const name = (nameEl.value || '').trim();
        const email = (emailEl.value || '').trim();
        const text = (textEl.value || '').trim();
        const jsError = validateFeedback(name, email, text);
        if (jsError) {
            if (errorEl) errorEl.textContent = jsError;
            return;
        }
        const newItem = { id: makeId(), name, email, text };
        const current = loadItems(STORAGE_KEY);
        current.unshift(newItem);
        saveItems(STORAGE_KEY, current);
        renderItem(newItem, list, tpl);
        form.reset();
    });
    list.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        const itemEl = target.closest('.item');
        if (!itemEl) return;
        const id = itemEl.getAttribute('data-id');

        if (target.classList.contains('js-delete')) {
            deleteItem(STORAGE_KEY, id);
            itemEl.remove();
        }

        if (target.classList.contains('js-edit')) startEdit(itemEl);

        if (target.classList.contains('js-cancel')) cancelEdit(itemEl);
    });
    list.addEventListener('submit', (e) => {
        const editForm = e.target;
        if (!(editForm instanceof HTMLFormElement)) return;
        if (!editForm.classList.contains('edit-form')) return;

        e.preventDefault();

        const itemEl = editForm.closest('.item');
        if (!itemEl) return;

        const id = itemEl.getAttribute('data-id');

        const textarea = itemEl.querySelector('.edit-text');
        const err = itemEl.querySelector('.edit-error');

        if (!(textarea instanceof HTMLTextAreaElement)) return;

        if (err) err.textContent = '';
        if (!editForm.checkValidity()) {
            editForm.reportValidity();
            return;
        }
        const newText = (textarea.value || '').trim();
        const jsError = validateEditText(newText);
        if (jsError) {
            if (err) err.textContent = jsError;
            return;
        }
        updateItemText(STORAGE_KEY, id, newText);
        const textP = itemEl.querySelector('.item-text');
        if (textP) textP.textContent = newText;
        cancelEdit(itemEl);
    });
}

function validateFeedback(name, email, text) {
    if (name.length < 2) return 'Имя должно быть не короче 2 символов.';
    if (name.length > 40) return 'Имя должно быть не длиннее 40 символов.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Введите корректный email.';

    if (text.length < 10) return 'Отзыв должен быть не короче 10 символов.';
    if (text.length > 300) return 'Отзыв должен быть не длиннее 300 символов.';
    return '';
}

function validateEditText(text) {
    if (text.length < 10) return 'Текст должен быть не короче 10 символов.';
    if (text.length > 300) return 'Текст должен быть не длиннее 300 символов.';
    return '';
}

function renderItem(item, list, tpl) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.setAttribute('data-id', item.id);
    const title = node.querySelector('.item-title');
    const sub = node.querySelector('.item-sub');
    const text = node.querySelector('.item-text');
    const editText = node.querySelector('.edit-text');
    if (title) title.textContent = `${item.name}`;
    if (sub) sub.textContent = `${item.email}`;
    if (text) text.textContent = item.text;
    if (editText) editText.value = item.text;
    list.prepend(node);
}

function startEdit(itemEl) {
    const editForm = itemEl.querySelector('.edit-form');
    const textP = itemEl.querySelector('.item-text');
    const textarea = itemEl.querySelector('.edit-text');
    const err = itemEl.querySelector('.edit-error');

    if (err) err.textContent = '';
    if (textarea && textP) textarea.value = textP.textContent || '';
    if (editForm) editForm.classList.remove('is-hidden');
    if (textP) textP.classList.add('is-hidden');
}

function cancelEdit(itemEl) {
    const editForm = itemEl.querySelector('.edit-form');
    const textP = itemEl.querySelector('.item-text');
    const err = itemEl.querySelector('.edit-error');

    if (err) err.textContent = '';

    if (editForm) editForm.classList.add('is-hidden');

    if (textP) textP.classList.remove('is-hidden');
}

function loadItems(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveItems(key, items) {
    localStorage.setItem(key, JSON.stringify(items));
}

function deleteItem(key, id) {
    const current = loadItems(key);
    const next = current.filter(x => x.id !== id);
    saveItems(key, next);
}

function updateItemText(key, id, newText) {
    const current = loadItems(key);
    const next = current.map(x => (x.id === id ? { ...x, text: newText } : x));
    saveItems(key, next);
}

function makeId() {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
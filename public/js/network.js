'use strict';

export function initNetwork() {
    window.addEventListener('load', () => {
        initLivePostsIfPresent();
    });
}

function initLivePostsIfPresent() {
    const btn = document.getElementById('loadPostsBtn');
    const list = document.getElementById('postsList');
    const tpl = document.getElementById('postTemplate');
    const loader = document.getElementById('postsLoader');
    const error = document.getElementById('postsError');
    const filterInfo = document.getElementById('filterInfo');

    if (!btn || !list || !tpl || !loader || !error) return;

    btn.addEventListener('click', () => {
        loadPosts({ list, tpl, loader, error, filterInfo });
    });

    loadPosts({ list, tpl, loader, error, filterInfo });
}

async function loadPosts({ list, tpl, loader, error, filterInfo }) {
    showError(error, '');
    setLoading(loader, true);
    clearList(list);

    const userId = randomInt(1, 50);
    if (filterInfo) filterInfo.textContent = `Фильтр: userId = ${userId}`;

    const url = `https://dummyjson.com/posts/user/${userId}`;

    try {
        const res = await fetch(url, { method: 'GET' });

        if (!res.ok) {
            if (res.status === 404) showError(error, 'Ошибка: ресурс не найден (404).');
            else showError(error, `Ошибка API: ${res.status} ${res.statusText}`);
            return;
        }

        const data = await res.json();
        const posts = Array.isArray(data.posts) ? data.posts : [];

        if (posts.length === 0) {
            showError(error, 'По выбранному фильтру постов нет. Нажми “Обновить новости”.');
            return;
        }

        posts.forEach((post) => {
            renderPost(post, list, tpl);
        });
    } catch (e) {
        if (e instanceof TypeError) {
            showError(error, 'Ошибка сети: не удалось выполнить запрос. Проверь интернет/доступ к API.');
        } else {
            showError(error, 'Неизвестная ошибка при выполнении запроса.');
        }
    } finally {
        setLoading(loader, false);
    }
}

function renderPost(post, list, tpl) {
    const node = tpl.content.firstElementChild.cloneNode(true);

    const title = node.querySelector('.js-post-title');
    const sub = node.querySelector('.js-post-sub');
    const body = node.querySelector('.js-post-body');

    if (title) title.textContent = post.title || '(без заголовка)';
    if (sub) sub.textContent = `postId: ${post.id}`;
    if (body) body.textContent = post.body || '';

    list.appendChild(node);
}

function setLoading(loader, isLoading) {
    if (isLoading) loader.classList.remove('is-hidden');
    else loader.classList.add('is-hidden');
}

function showError(errorEl, message) {
    if (!message) {
        errorEl.textContent = '';
        errorEl.classList.add('is-hidden');
        return;
    }
    errorEl.textContent = message;
    errorEl.classList.remove('is-hidden');
}

function clearList(list) {
    list.innerHTML = '';
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
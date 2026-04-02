'use strict';
// 'use strict' включает строгий режим JavaScript.
// В ES-модулях строгий режим и так включён по умолчанию,
// но оставлять строку можно — она не мешает и явно фиксирует намерение.

export function initMarkdown() {
    // Мы делаем инициализацию после построения DOM (DOMContentLoaded),
    // чтобы элементы <textarea id="fbText"> и <div id="mdPreview"> точно существовали.
    document.addEventListener('DOMContentLoaded', () => {

        // Ищем поле ввода отзыва (textarea) на странице feedback6.html.
        const textarea = document.getElementById('fbText');

        // Ищем блок для предпросмотра Markdown.
        const preview = document.getElementById('mdPreview');

        // Если мы не на странице отзывов (или разметка изменилась),
        // то нужных элементов нет — модуль не должен ломаться.
        // Просто выходим.
        if (!textarea || !preview) return;

        // --- СТОРОННЯЯ БИБЛИОТЕКА Marked ---
        // Marked — парсер Markdown.
        // Он берёт текст (Markdown) и превращает его в HTML-строку.
        //
        // setOptions задаёт режим парсинга.
        // gfm: true  -> включаем GitHub Flavored Markdown:
        //             списки, таблицы, зачёркивание и т.п. работают “как на GitHub”.
        // breaks: true -> одиночный перевод строки превращается в <br>,
        //                иначе обычно нужен пустой ряд между абзацами.
        marked.setOptions({
            gfm: true,
            breaks: true
        });

        // Функция render отвечает за обновление предпросмотра.
        // Она будет вызываться:
        // 1) при каждом вводе символа (input)
        // 2) один раз сразу при старте, чтобы предпросмотр не был пустой “рамкой”
        const render = () => {

            // Берём текущий текст из textarea.
            // Если вдруг textarea.value пустой/undefined, подставляем пустую строку.
            const markdownText = textarea.value || '';

            // --- Marked: Markdown -> HTML ---
            // marked.parse(...) возвращает HTML-строку.
            //
            // ВАЖНО: мы используем innerHTML, потому что нам нужно вставить HTML.
            // Это нормально для учебного проекта,
            // но в “боевом” продукте обычно добавляют санитайзер (очистку HTML),
            // чтобы защититься от XSS, если пользователи могут вставлять HTML.
            preview.innerHTML = marked.parse(markdownText);

            // --- highlight.js: подсветка кода ---
            // В Markdown блоки кода превращаются в:
            // <pre><code> ... </code></pre>
            //
            // Мы находим все такие блоки внутри предпросмотра
            // и вызываем hljs.highlightElement для каждого.
            preview.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        };

        // Подписываемся на событие input:
        // оно срабатывает при любых изменениях текста (ввод/вставка/удаление).
        textarea.addEventListener('input', render);

        // Первый рендер сразу.
        // Это делает UX лучше: пользователь сразу видит, что предпросмотр работает.
        render();
    });
}
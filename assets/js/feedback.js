export function initFeedbackPage() {
  window.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('feedbackList');
    const template = document.getElementById('reviewTemplate');

    if (!(list instanceof HTMLElement) || !(template instanceof HTMLTemplateElement)) {
      return;
    }

    const textarea = document.getElementById('fbText');
    const preview = document.getElementById('mdPreview');
    const emptyState = document.getElementById('reviewsEmptyState');
    const status = document.getElementById('reviewStatus');
    const currentUserId = Number(list.dataset.userId || 0);

    if (textarea instanceof HTMLTextAreaElement && preview instanceof HTMLElement) {
      syncPreview(textarea, preview);
      textarea.addEventListener('input', () => syncPreview(textarea, preview));
    }

    list.addEventListener('click', (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const review = target.closest('.review-item');

      if (!(review instanceof HTMLElement)) {
        return;
      }

      if (target.classList.contains('js-edit')) {
        openEditMode(review);
      }

      if (target.classList.contains('js-cancel')) {
        closeEditMode(review);
      }

      if (target.classList.contains('js-delete')) {
        void deleteReview(review, emptyState, status);
      }
    });

    list.addEventListener('submit', (event) => {
      const target = event.target;

      if (!(target instanceof HTMLFormElement) || !target.classList.contains('edit-form')) {
        return;
      }

      event.preventDefault();
      const review = target.closest('.review-item');

      if (!(review instanceof HTMLElement)) {
        return;
      }

      void saveReview(review, emptyState, status);
    });

    updateEmptyState(list, emptyState);
    connectReviewsStream(list, template, emptyState, status, currentUserId);
  });
}

function syncPreview(textarea, preview) {
  const text = textarea.value.trim();

  if (!text) {
    preview.textContent = 'Здесь появится предварительный просмотр текста.';
    return;
  }

  preview.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
}

function openEditMode(review) {
  const form = review.querySelector('.edit-form');
  const text = review.querySelector('.item-text');
  const textarea = review.querySelector('.edit-text');

  if (!(form instanceof HTMLFormElement) || !(text instanceof HTMLElement) || !(textarea instanceof HTMLTextAreaElement)) {
    return;
  }

  textarea.value = text.textContent ?? '';
  form.classList.remove('is-hidden');
  text.classList.add('is-hidden');
}

function closeEditMode(review) {
  const form = review.querySelector('.edit-form');
  const text = review.querySelector('.item-text');
  const error = review.querySelector('.edit-error');

  if (form instanceof HTMLFormElement) {
    form.classList.add('is-hidden');
  }

  if (text instanceof HTMLElement) {
    text.classList.remove('is-hidden');
  }

  if (error instanceof HTMLElement) {
    error.textContent = '';
  }
}

async function saveReview(review, emptyState, status) {
  const reviewId = review.dataset.reviewId;
  const textarea = review.querySelector('.edit-text');
  const error = review.querySelector('.edit-error');

  if (!reviewId || !(textarea instanceof HTMLTextAreaElement)) {
    return;
  }

  const comment = textarea.value.trim();

  if (comment.length < 10 || comment.length > 300) {
    if (error instanceof HTMLElement) {
      error.textContent = 'Текст должен быть длиной от 10 до 300 символов.';
    }
    return;
  }

  try {
    const response = await fetch(`/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      throw new Error(await extractError(response));
    }

    const { review: reviewData } = await response.json();
    upsertReview(reviewData, document.getElementById('feedbackList'), document.getElementById('reviewTemplate'), emptyState);
    closeEditMode(review);
    setStatus(status, 'Отзыв сохранён.');
    showToast('Отзыв обновлён.');
  } catch (errorValue) {
    if (error instanceof HTMLElement) {
      error.textContent = errorValue instanceof Error ? errorValue.message : 'Не удалось сохранить изменения.';
    }
  }
}

async function deleteReview(review, emptyState, status) {
  const reviewId = review.dataset.reviewId;

  if (!reviewId) {
    return;
  }

  if (!window.confirm('Удалить этот отзыв?')) {
    return;
  }

  try {
    const response = await fetch(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(await extractError(response));
    }

    review.remove();
    updateEmptyState(document.getElementById('feedbackList'), emptyState);
    setStatus(status, 'Отзыв удалён.');
    showToast('Отзыв удалён.');
  } catch (errorValue) {
    showToast(errorValue instanceof Error ? errorValue.message : 'Не удалось удалить отзыв.');
  }
}

function connectReviewsStream(list, template, emptyState, status, currentUserId) {
  const source = new EventSource('/reviews/events');

  source.addEventListener('reviews', (event) => {
    const payload = JSON.parse(event.data);
    const review = payload.review;
    review.canManage = review.authorId === currentUserId;

    if (payload.type === 'deleted') {
      const existing = list.querySelector(`[data-review-id="${review.id}"]`);

      if (existing instanceof HTMLElement) {
        existing.remove();
      }

      updateEmptyState(list, emptyState);
      setStatus(status, 'Лента отзывов обновилась.');
      showToast('Один из отзывов был удалён.');
      return;
    }

    upsertReview(review, list, template, emptyState);
    setStatus(status, 'Лента отзывов обновилась.');
    showToast(payload.type === 'created' ? 'Появился новый отзыв.' : 'Один из отзывов был изменён.');
  });

  source.onerror = () => {
    setStatus(status, 'Онлайн-обновления временно недоступны. Попробуйте обновить страницу.');
  };
}

function upsertReview(review, list, template, emptyState) {
  if (!(list instanceof HTMLElement) || !(template instanceof HTMLTemplateElement)) {
    return;
  }

  const existing = list.querySelector(`[data-review-id="${review.id}"]`);
  const node = buildReviewNode(template, review);

  if (existing instanceof HTMLElement) {
    existing.replaceWith(node);
  } else {
    list.prepend(node);
  }

  updateEmptyState(list, emptyState);
}

function buildReviewNode(template, review) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.reviewId = String(review.id);
  node.dataset.authorId = String(review.authorId);

  const author = node.querySelector('.js-review-author');
  const email = node.querySelector('.js-review-email');
  const created = node.querySelector('.js-review-created');
  const updated = node.querySelector('.js-review-updated');
  const text = node.querySelector('.js-review-text');
  const actions = node.querySelector('.item-actions');
  const editTextarea = node.querySelector('.edit-text');

  if (author) author.textContent = review.authorName;
  if (email) email.textContent = review.authorEmail;
  if (created) created.textContent = review.createdAtLabel;
  if (text) text.textContent = review.comment;
  if (editTextarea) editTextarea.value = review.comment;

  if (updated) {
    if (review.wasEdited) {
      updated.textContent = `Обновлено: ${review.updatedAtLabel}`;
      updated.classList.remove('is-hidden');
    } else {
      updated.textContent = '';
      updated.classList.add('is-hidden');
    }
  }

  if (actions) {
    if (review.canManage) {
      actions.classList.remove('is-hidden');
    } else {
      actions.classList.add('is-hidden');
    }
  }

  return node;
}

function updateEmptyState(list, emptyState) {
  if (!(list instanceof HTMLElement) || !(emptyState instanceof HTMLElement)) {
    return;
  }

  const hasReviews = list.querySelector('.review-item');

  if (hasReviews) {
    emptyState.classList.add('is-hidden');
  } else {
    emptyState.classList.remove('is-hidden');
  }
}

function setStatus(status, message) {
  if (status instanceof HTMLElement) {
    status.textContent = message;
  }
}

function showToast(message) {
  const container = document.getElementById('toastContainer');

  if (!(container instanceof HTMLElement)) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('toast--leaving');
    window.setTimeout(() => toast.remove(), 250);
  }, 2600);
}

async function extractError(response) {
  try {
    const payload = await response.json();
    return typeof payload.message === 'string'
      ? payload.message
      : 'Произошла ошибка.';
  } catch {
    return 'Произошла ошибка.';
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

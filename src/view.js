import onChange from 'on-change';
import {
  renderRssFeed,
  initRssFeed,
  initRssPosts,
  renderRssPosts,
} from './renderRss.js';

const renderErrors = (elements, error, i18nInstance) => {
  elements.feedback.classList.remove('text-success');
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = i18nInstance.t(error);
};

const showPostInModal = (postId, elements, posts) => {
  const currentPost = posts.find((post) => post.id === postId);
  elements.modalTitle.textContent = currentPost.title;
  elements.modalBody.textContent = currentPost.description;
  elements.articleButton.href = currentPost.link;
};

const makePostWatched = (postsIds) => {
  postsIds.forEach((postId) => {
    const watchedPost = document.querySelector(`a[data-id="${postId}"]`);
    watchedPost.classList.remove('fw-bold');
    watchedPost.classList.add('fw-normal');
  });
};

const watchState = (state, elements, i18nInstance) => {
  switch (state) {
    case 'sending':
      elements.submitBtn.disabled = true;
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = '';
      break;

    case 'error':
      elements.submitBtn.disabled = false;
      break;

    case 'success':
      elements.feedback.classList.remove('text-danger');
      elements.input.classList.remove('is-invalid');
      elements.input.value = '';
      elements.input.focus();
      initRssFeed(elements, i18nInstance);
      initRssPosts(elements, i18nInstance);
      elements.submitBtn.disabled = false;
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18nInstance.t('success');
      break;

    case 'filling':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.remove('text-success');
      elements.submitBtn.disabled = false;
      break;

    default:
      throw new Error(`Unknown process state: ${state}`);
  }
};

export default (state, elements, i18nInstance) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'process.processError':
        renderErrors(elements, watchedState.process.processError, i18nInstance);
        break;

      case 'data.feeds':
        renderRssFeed(value, watchedState, elements.feeds);
        break;

      case 'data.posts':
        renderRssPosts(value, watchedState, elements, i18nInstance);
        break;

      case 'process.processState':
        watchState(watchedState.process.processState, elements, i18nInstance);
        break;

      case 'uiState.watchedPostsIds':
        makePostWatched(watchedState.uiState.watchedPostsIds);
        break;

      case 'uiState.showedPostInModal':
        showPostInModal(watchedState.uiState.showedPostInModal, elements, watchedState.data.posts);
        break;

      default:
        throw new Error(`Unknown state ${path}`);
    }
  });
  return watchedState;
};

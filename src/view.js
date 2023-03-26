import onChange from 'on-change';
import {
  renderRssFeed,
  initRssFeed,
  initRssPosts,
  renderRssPosts,
  getData,
} from './renderRss.js';

const renderErrors = (elements, error, i18nInstance) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.remove('text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = i18nInstance.t(error);
};

const makePostWatched = (posts) => {
  posts.forEach((post) => {
    const watchedPost = document.querySelector(`a[data-id="${post.id}"]`);
    watchedPost.classList.remove('fw-bold');
    watchedPost.classList.add('fw-normal');
  });
};

const watchState = (state, elements, i18nInstance) => {
  switch (state) {
    case 'sending':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = '';
      break;

    case 'error':
      elements.submitBtn.disabled = false;
      break;

    case 'filling':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.remove('text-success');
      elements.submitBtn.disabled = false;
      elements.feedback.classList.add('text-success');
      elements.feedback.textContent = i18nInstance.t('success');
      break;

    default:
      throw new Error(`Unknown process state: ${state}`);
  }
};

export default (state, elements, i18nInstance) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'uiState.processError':
        renderErrors(elements, watchedState.uiState.processError, i18nInstance);
        break;

      case 'uiState.valid':
        initRssFeed(elements, i18nInstance);
        initRssPosts(elements, i18nInstance);
        break;

      case 'data.currentUrl':
        getData(watchedState);
        break;

      case 'data.feeds':
        renderRssFeed(value, watchedState, elements.feeds);
        break;

      case 'data.posts':
        renderRssPosts(value, watchedState, elements, i18nInstance);
        break;

      case 'uiState.processState':
        watchState(watchedState.uiState.processState, elements, i18nInstance);
        break;

      case 'data.watchedPosts':
        makePostWatched(watchedState.data.watchedPosts);
        break;

      default:
        break;
    }
  });
  return watchedState;
};

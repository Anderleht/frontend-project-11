import onChange from 'on-change';
import axios from 'axios';
import parse from './parse.js';
import {
  renderRssFeed,
  initRssFeed,
  initRssPosts,
  normalizeData,
  renderRssPosts,
} from './renderRss.js';

const renderErrors = (elements, error, i18nInstance) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.remove('text-danger');
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = i18nInstance.t(error);
};

const getData = (watchedState) => {
  axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${watchedState.form.fields.currentUrl}`)}`)
    .then((response) => {
      const data = parse(response.data.contents, watchedState);
      if (data !== null) {
        watchedState.form.processState = 'filling';
        if (watchedState.form.valid === false) {
          watchedState.form.valid = true;
        }
      }
      normalizeData(data, watchedState);
    })
    .catch(() => {
      watchedState.form.processError = 'networkError';
      watchedState.form.processState = 'error';
    });
};

const makePostWatched = (post) => {
  console.log(post);
  const watchedPost = document.querySelector(`a[data-id="${post.postId}"]`);
  watchedPost.classList.remove('fw-bold');
  watchedPost.classList.add('fw-normal');
};

const watchState = (state, elements, i18nInstance) => {
  switch (state) {
    case 'sending':
      elements.input.classList.remove('is-invalid');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.textContent = '';
      elements.submitBtn.disabled = true;
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
      case 'form.processError':
        renderErrors(elements, watchedState.form.processError, i18nInstance);
        break;

      case 'form.valid':
        initRssFeed(elements, i18nInstance);
        initRssPosts(elements, i18nInstance);
        break;

      case 'form.fields.currentUrl':
        getData(watchedState);
        break;

      case 'form.fields.feeds':
        renderRssFeed(value, watchedState, elements.feeds);
        break;

      case 'form.fields.posts':
        renderRssPosts(value, watchedState, elements, i18nInstance);
        break;

      case 'form.processState':
        watchState(watchedState.form.processState, elements, i18nInstance);
        break;

      case 'form.fields.watchedPost':
        makePostWatched(watchedState.form.fields.watchedPost);
        break;

      default:
        break;
        // throw new Error(`Unknown process state: ${watchedState.form.processState}`);
    }
  });
  return watchedState;
};

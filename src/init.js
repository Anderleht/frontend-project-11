import * as yup from 'yup';
import i18n from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';
import { checkRssUpdates } from './renderRss.js';

const schema = yup.string().trim().required().url();
const validate = (fields) => schema.validate(fields);

export default () => {
  const defLang = 'ru';
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defLang,
    debug: false,
    resources,
  });
  const initialState = {
    uiState: {
      valid: false,
      processState: 'filling',
      processError: null,
    },
    data: {
      currentUrl: '',
      feeds: [],
      posts: [],
      watchedPosts: [],
    },
  };

const elements = {
    rssForm: document.querySelector('.rss-form'),
    content: document.querySelector('.container-fluid'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitBtn: document.querySelector('[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalBody: document.querySelector('.modal-body'),
    modalTitle: document.querySelector('.modal-title'),
    articleButton: document.querySelector('.full-article'),
  };
  const watchedState = watch(initialState, elements, i18nInstance);
  checkRssUpdates(watchedState);
  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    elements.submitBtn.disabled = true;
    validate(url).then((validUrl) => {
      if (watchedState.data.feeds.length !== 0) {
        const usedUrls = watchedState.data.feeds.map((feed) => feed.url);
        if (usedUrls.includes(validUrl)) {
          watchedState.uiState.processState = 'error';
          watchedState.uiState.processError = 'urlExists';
        }
      }
        watchedState.uiState.processState = 'sending';
        watchedState.data.currentUrl = validUrl;
        e.target.reset();
        elements.input.focus();
    }).catch(() => {
      watchedState.uiState.processState = 'error';
      watchedState.uiState.processError = 'notValidUrl';
    });
  });
};

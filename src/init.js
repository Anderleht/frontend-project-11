import * as yup from 'yup';
import axios from 'axios';
import { uniqueId } from 'lodash';
import i18n from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';
import { buildUrl, checkRssUpdates } from './renderRss.js';
import parse from './parse.js';

const changeError = (error, watchedState) => {
  watchedState.process.processState = 'error';
  watchedState.process.processError = error;
};

const validate = (newUrl, urls) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(urls);
  return schema.validate(newUrl);
};

export const getData = (url, watchedState) => {
  axios.get(buildUrl(url))
    .then((response) => {
      const data = parse(response.data.contents);
      watchedState.process.processState = 'success';
      watchedState.process.valid = true;
      const { feed, posts } = data;
      feed.id = uniqueId();
      feed.url = url;
      watchedState.data.feeds.push(feed);
      const postWithId = posts.map((post) => {
        post.id = uniqueId();
        return post;
      });
      watchedState.data.posts = [...postWithId];
    })
    .catch((e) => {
      if (e.message === 'notValidRss') {
        changeError(e.message, watchedState);
      } else {
        changeError('networkError', watchedState);
      }
    });
};

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    resources,
  });
  const initialState = {
    process: {
      valid: false,
      processState: 'filling',
      processError: null,
    },
    uiState: {
      watchedPostsIds: [],
      showedPostInModal: null,
    },
    data: {
      feeds: [],
      posts: [],
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
    const usedUrls = watchedState.data.feeds.map((feed) => feed.url);
    validate(url, usedUrls).then(() => {
      watchedState.process.processState = 'sending';
      getData(url, watchedState);
    }).catch((error) => {
      changeError(error.type, watchedState);
    });
  });
};

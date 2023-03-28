import * as yup from 'yup';
import i18n from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';
import { buildUrl, checkRssUpdates } from "./renderRss.js";
import axios from "axios";
import parse from "./parse.js";
import { uniqueId } from "lodash";

const switchError = (error, watchedState) => {
  if (watchedState.uiState.processState === 'error') {
    watchedState.uiState.processState = 'filling';
    watchedState.uiState.processError = null;
  }
  watchedState.uiState.processState = 'error';
  watchedState.uiState.processError = error;
};

const schema = yup.string().trim().required().url();
const validate = (fields) => schema.validate(fields);

export const getData = (url, watchedState) => {
  axios.get(buildUrl(url))
    .then((response) => {
      const data = parse(response.data.contents);
      if (data !== null) {
        watchedState.uiState.processState = 'success';
        if (watchedState.uiState.valid === false) {
          watchedState.uiState.valid = true;
        }
        const { feed, posts } = data;
        feed.id = uniqueId();
        feed.url = url;
        watchedState.data.feeds.push(feed);
        posts.forEach((post) => {
          post.id = uniqueId();
          watchedState.data.posts.push(post);
        });
      } else {
        switchError('notValidRss', watchedState);
      }
    })
    .catch((e) => {
      console.log(e);
      switchError('networkError', watchedState);
    });
};

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
    validate(url).then((validUrl) => {
      const usedUrls = watchedState.data.feeds.map((feed) => feed.url);
      if (usedUrls.includes(validUrl)) {
        switchError('urlExists', watchedState);
      } else {
        watchedState.uiState.processState = 'sending';
        getData(validUrl, watchedState);
      }
    }).catch(() => {
      switchError('notValidUrl', watchedState);
    });
  });
};

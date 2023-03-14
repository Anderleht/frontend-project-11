import 'bootstrap';
import * as yup from 'yup';
import i18n from 'i18next';
import resources from './locales/index.js';
import watch from './view.js';

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
    form: {
      valid: true,
      processState: 'filling',
      processError: null,
      fields: {
        currentUrl: '',
        urls: [],
      },
    },
  };
  const elements = {
    rssForm: document.querySelector('.rss-form'),
    content: document.querySelector('.container-fluid'),
    input: document.querySelector('#url-input'),
  }
  const watchedState = watch(initialState, elements, i18nInstance);
  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');
    validate(url).then((validUrl) => {
      watchedState.form.fields.currentUrl = validUrl;
    }).catch(() => {
      watchedState.form.processError = 'NotValidUrl';
    })
  })
};
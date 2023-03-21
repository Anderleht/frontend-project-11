export default (data, watchedState) => {
  const parser = new DOMParser();
  const rssData = parser.parseFromString(data, 'application/xml');
  const errorNode = rssData.querySelector('parsererror');
  if (errorNode) {
    watchedState.form.processError = 'notValidRss';
    watchedState.form.processState = 'error';
    return null;
  }
  watchedState.form.fields.urls.push(watchedState.form.fields.currentUrl);
  return rssData;
};

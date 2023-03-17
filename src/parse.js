export default (data, watchedState) => {
  const parser = new DOMParser();
  const rssData = parser.parseFromString(data,'application/xml');
  const errorNode = rssData.querySelector('parsererror');
  if (errorNode) {
    watchedState.form.processError = 'notValidRss';
    return null;
  } else {
    return rssData;
  }
};

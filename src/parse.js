import { uniqueId } from "lodash";

export default (data, watchedState) => {
  const parser = new DOMParser();
  const rssData = parser.parseFromString(data, 'application/xml');
  const errorNode = rssData.querySelector('parsererror');
  if (errorNode) {
    watchedState.form.processError = 'notValidRss';
    watchedState.form.processState = 'error';
    return null;
  }
  const feed = [];
  const posts = [];
  const feedTitle = rssData.querySelector('title');
  const descriptionOfTitle = feedTitle.nextElementSibling;
  feed.push({
    url: watchedState.form.fields.currentUrl,
    title: feedTitle.textContent,
    description: descriptionOfTitle.textContent,
  });
  const items = rssData.querySelectorAll('item');
  items.forEach((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    const itemDescription = item.querySelector('description');
    posts.push({
      postId: uniqueId(),
      title: itemTitle.textContent,
      link: itemLink.textContent,
      description: itemDescription.textContent,
      watched: false,
    });
  });
  return  { feed, posts };
};

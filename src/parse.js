const extractFeeds = (rssData) => {
  const feedTitle = rssData.querySelector('title');
  const descriptionOfTitle = feedTitle.nextElementSibling;
  return {
    title: feedTitle.textContent,
    description: descriptionOfTitle.textContent,
  };
};

const extractPosts = (rssData) => {
  const items = rssData.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    const itemDescription = item.querySelector('description');
    return {
      title: itemTitle.textContent,
      link: itemLink.textContent,
      description: itemDescription.textContent,
    };
  });
  return posts;
};

export default (data) => {
  const parser = new DOMParser();
  const rssData = parser.parseFromString(data, 'application/xml');
  const errorNode = rssData.querySelector('parsererror');
  if (errorNode) {
    return null;
  }
  const feed = extractFeeds(rssData);
  const posts = extractPosts(rssData);
  return  { feed, posts };
};

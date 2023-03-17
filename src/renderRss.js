import uniqueId from 'lodash/uniqueId.js'

export const renderRssFeed = (rssFeed, watchedState, body) => {
  rssFeed.forEach((currentFeed) => {
    if (!watchedState.form.fields.renderedFeeds.includes(currentFeed)) {
      const bodyFeeds = body.querySelector('.list-group');
      const feedLi = document.createElement('li');
      feedLi.classList.add('list-group-item', 'border-0', 'border-end-0');
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = currentFeed.description;
      const h = document.createElement('h');
      h.classList.add('h6', 'm-0');
      h.textContent = currentFeed.title;
      bodyFeeds.append(feedLi);
      feedLi.append(h, p);
      watchedState.form.fields.renderedFeeds.push(currentFeed);
    }
  })
};

export const renderRssPosts = (rssPosts, watchedState, body, i18nInstance) => {
  rssPosts.forEach((currentPost) => {
    if (!watchedState.form.fields.renderedPosts.includes(currentPost)) {
      const bodyPosts = body.querySelector('.list-group');
      const postLi = document.createElement('li');
      postLi.classList.add('list-group-item', 'border-0', 'border-end-0', 'd-flex', 'justify-content-between', 'align-items-start');
      const a = document.createElement('a');
      a.href = currentPost.link;
      a.classList.add('fw-bold');
      a.setAttribute('data-id', currentPost.postId);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = currentPost.title;
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.setAttribute('data-id', currentPost.postId);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18nInstance.t('watchButton');
      postLi.append(a, button);
      bodyPosts.append(postLi);
      watchedState.form.fields.renderedPosts.push(currentPost);
    }
  })
};

export const initRssFeed = (elements, i18nInstance) => {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  const ulFeeds = document.createElement('ul');
  ulFeeds.classList.add('list-group', 'border-o', 'rounded-0');
  cardBody.classList.add('card-body');
  const feedsTitle = document.createElement('h2');
  feedsTitle.classList.add('card-tittle', 'h4');
  feedsTitle.textContent = i18nInstance.t('feeds');
  elements.feeds.append(cardDiv);
  cardDiv.append(cardBody);
  cardDiv.append(ulFeeds);
  cardBody.append(feedsTitle);
};

export const initRssPosts = (elements, i18nInstance) => {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  const ulPosts = document.createElement('ul');
  ulPosts.classList.add('list-group', 'border-o', 'rounded-0');
  cardBody.classList.add('card-body');
  const postsTitle = document.createElement('h2');
  postsTitle.classList.add('card-tittle', 'h4');
  postsTitle.textContent = i18nInstance.t('posts');
  elements.posts.append(cardDiv);
  cardDiv.append(cardBody);
  cardDiv.append(ulPosts);
  cardBody.append(postsTitle);
};

export const normalizeData = (rssData, watchedState) => {
  if (rssData === null) {
    watchedState.form.processState = 'error';
    watchedState.form.processError = 'notValidRss';
    return;
  }
  const feedTitle = rssData.querySelector('title');
  const descriptionOfTitle = feedTitle.nextElementSibling;
  const feedId = uniqueId();
  watchedState.form.fields.feeds.push({
    id: feedId,
    title: feedTitle.textContent,
    description: descriptionOfTitle.textContent,
  });
  const items = rssData.querySelectorAll('item');
  items.forEach((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    const itemDescription = item.querySelector('description');
    watchedState.form.fields.posts.push({
      feedId,
      postId: uniqueId(),
      title: itemTitle.textContent,
      link: itemLink.textContent,
      description: itemDescription.textContent,
    });
  });
};
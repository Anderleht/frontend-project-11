const renderedElements = {
  renderedPosts: [],
  renderedFeeds: [],
};


export const renderRssFeed = (rssFeed, watchedState, body) => {
  rssFeed.forEach((currentFeed) => {
    if (!renderedElements.renderedFeeds.includes(currentFeed)) {
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
      renderedElements.renderedFeeds.push(currentFeed);
    }
  });
};

export const renderRssPosts = (rssPosts, watchedState, elements, i18nInstance) => {
  rssPosts.forEach((currentPost) => {
    if (!renderedElements.renderedPosts.includes(currentPost)) {
      const bodyPosts = elements.posts.querySelector('.list-group');
      const postLi = document.createElement('li');
      postLi.classList.add('list-group-item', 'border-0', 'border-end-0', 'd-flex', 'justify-content-between', 'align-items-start');
      const a = document.createElement('a');
      a.href = currentPost.link;
      a.classList.add('fw-bold');
      a.setAttribute('data-id', currentPost.id);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = currentPost.title;
      a.addEventListener('click', () => {
        watchedState.uiState.watchedPostsIds.push(currentPost.id);
      });
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.setAttribute('data-id', currentPost.postId);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18nInstance.t('watchButton');
      button.addEventListener('click', () => {
        watchedState.uiState.watchedPostsIds.push(currentPost.id);
        watchedState.uiState.showedPostInModal = currentPost.id;
      });
      postLi.append(a, button);
      bodyPosts.append(postLi);
      renderedElements.renderedPosts.push(currentPost);
    }
  });
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


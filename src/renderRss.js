import { uniqueId, differenceWith, isEqual } from 'lodash';
import axios from 'axios';
import parse from './parse.js';

const renderedElements = {
  renderedPosts: [],
  renderedFeeds: [],
};

export const buildUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const proxyURL = new URL(`${proxy}/get?url=${encodeURIComponent(url)}`);
  proxyURL.searchParams.append('disableCache', 'true');
  return proxyURL.href;
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
        watchedState.data.watchedPosts.push(currentPost);
      });
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.setAttribute('data-id', currentPost.postId);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18nInstance.t('watchButton');
      button.addEventListener('click', () => {
        watchedState.data.watchedPosts.push(currentPost);
        elements.modalTitle.textContent = currentPost.title;
        elements.modalBody.textContent = currentPost.description;
        elements.articleButton.href = currentPost.link;
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

export const checkRssUpdates = (watchedState) => {
  if (watchedState.data.posts.length === 0) {
    setTimeout(() => checkRssUpdates(watchedState), 5000);
    return;
  }
  const promises = watchedState.data.feeds.map((feed) => axios.get(buildUrl(feed.url))
    .then((response) => {
      const data = parse(response.data.contents);
      const { posts } = data;

      const viewedPosts = watchedState.data.posts.map((post) => {
        const { title, link, description } = post;
        return { title, link, description };
      });

      const newPosts = differenceWith(posts, viewedPosts, isEqual);
      const postsWithId = newPosts.map((post) => {
        const id = uniqueId();
        post.id = id;
        return post;
      });

      watchedState.data.posts.push(...postsWithId);
    }).catch((e) => {
      console.log(e);
    }));
  Promise.all(promises).finally(setTimeout(() => checkRssUpdates(watchedState), 5000));
};

export const getData = (watchedState) => {
  axios.get(buildUrl(watchedState.data.currentUrl))
    .then((response) => {
      const data = parse(response.data.contents);
      if (data !== null) {
        watchedState.uiState.processState = 'filling';
        if (watchedState.uiState.valid === false) {
          watchedState.uiState.valid = true;
        }
        const { feed, posts } = data;
        feed.id = uniqueId();
        feed.url = watchedState.data.currentUrl;
        watchedState.data.feeds.push(feed);
        posts.forEach((post) => {
          post.id = uniqueId();
          watchedState.data.posts.push(post);
        });
      } else {
        watchedState.uiState.processState = 'error';
        watchedState.uiState.processError = 'notValidRss';
      }
    })
    .catch((e) => {
      console.log(e);
      watchedState.uiState.processError = 'networkError';
      watchedState.uiState.processState = 'error';
    });
};

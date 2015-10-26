// this eslint rule is disabled because this line is necessary to enable
// Chrome's ES6 features
'use strict'; // eslint-disable-line strict

import HnCommentParser from './hn-parser';

function attachCommentWithChildren(comment, parent) {
  const element = comment.element;
  const body = element.querySelector('.body');
  comment.children.forEach(child => attachCommentWithChildren(child, body));
  parent.appendChild(element);
}

const stylesheets = Array.from(document.querySelectorAll('link[rel=stylesheet]'));
stylesheets.forEach(stylesheet => stylesheet.remove());

const rootNode = document.body;
const comments = new HnCommentParser(rootNode).parse();

rootNode.innerHTML = '';
const container = document.createElement('div');
container.className = 'container';
comments.forEach(comment => attachCommentWithChildren(comment, container));
rootNode.appendChild(container);

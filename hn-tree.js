(function hnTreeView() {
  // this eslint rule is disabled because this line is necessary to enable
  // Chrome's ES6 features
  'use strict'; // eslint-disable-line strict

  // todo: looks like chrome doesn't yet support ES6 modules...
  class HnComment {
    constructor($comment, indentLevel, parent) {
      this.$header = $comment.querySelector('.comhead');
      this.$comment = $comment.querySelector('.comment');
      this.$containingSpan = this.$comment.querySelector('span');
      this.isDead = !this.$containingSpan;
      this.indentLevel = indentLevel;
      this.children = [];
      this.parent = parent;
      this.header = this.getHeader();
      this.body = this.getBody();
      this.element = this.createElement(this.body, this.header);
    }

    createElement(body, header) {
      const element = document.createElement('div');
      element.className = this.getCommentClassName();
      element.appendChild(header);
      element.appendChild(body);
      return element;
    }

    getCommentClassName() {
      const parity = this.indentLevel % 2 === 0 ? 'even' : 'odd';
      let state;
      if (this.isDead) {
        state = 'deleted';
      } else {
        state = this.$containingSpan.className === 'c00' ? 'healthy' : 'dead';
      }
      return `comment comment--${parity} comment--${state}`;
    }

    getBody() {
      function quotify(node) {
        const text = node.textContent.trim();
        if (text.startsWith('>')) {
          const quote = document.createElement('blockquote');
          quote.innerText = text.substring(1);
          return quote;
        }
        return node;
      }

      function removeSpan(element) {
        const span = element.querySelector('span');
        if (span) {
          span.remove();
        }
        return element;
      }

      function createParagraph(nodes) {
        const paragraph = document.createElement('p');
        nodes.forEach(node => {
          if (node.nodeType === 3) { // text
            paragraph.appendChild(quotify(node));
          } else {
            paragraph.appendChild(removeSpan(node));
          }
        });
        return paragraph;
      }

      function createParagraphs(nodes) {
        return nodes
          .filter(node => node.textContent.trim() !== '')
          .map(node => createParagraph([node]));
      }

      function createReply(element) {
        const link = element.querySelector('a');
        const reply = document.createElement('p');
        reply.appendChild(link);
        reply.className = 'reply';
        return reply;
      }

      const body = document.createElement('div');
      body.className = 'body';

      if (this.isDead) {
        const deadParagraph = document.createElement('p');
        deadParagraph.innerText = this.$comment.innerText.trim();
        body.appendChild(createParagraph([deadParagraph]));
        return body;
      }

      const children = Array.from(this.$containingSpan.childNodes);
      const idx = children.findIndex(child => child.nodeName === 'P');
      const firstParagraph = createParagraph(children.slice(0, idx));
      const hasReply = this.$comment.querySelector('.reply a') !== null;
      if (hasReply) {
        const reply = createReply(children.pop());
        const otherParagraphs = createParagraphs(children.slice(idx));
        const allParagraphs = [firstParagraph, ...otherParagraphs, reply];
        allParagraphs.forEach(paragraph => body.appendChild(paragraph));
        return body;
      }
      const otherParagraphs = createParagraphs(children.slice(idx));
      const allParagraphs = [firstParagraph, ...otherParagraphs];
      allParagraphs.forEach(paragraph => body.appendChild(paragraph));
      return body;
    }

    getHeader() {
      const userLink = this.$header.querySelector('a[href*=user]');
      const timeSubmitted = this.$header.querySelector('a[href*=item]');
      const toggle = document.createElement('a');
      toggle.innerText = '[-]';
      toggle.className = 'toggle';
      const header = document.createElement('div');
      header.className = 'header';
      header.appendChild(toggle);
      const comment = this;
      header.onclick = function onclick() {
        if (comment.collapsed) {
          comment.expand();
        } else {
          comment.collapse();
        }
      };

      if (userLink) {
        header.appendChild(userLink);
        header.appendChild(timeSubmitted);
      } else {
        header.className = 'header dead';
        const deadText = document.createElement('span');
        deadText.innerText = '[dead]';
        header.appendChild(deadText);
      }
      const childCount = document.createElement('span');
      childCount.className = 'child-count';
      header.appendChild(childCount);
      return header;
    }

    collapse() {
      this.collapsed = true;
      this.element.querySelector('.body').style.display = 'none';
      this.header.querySelector('.toggle').innerText = '[+]';
      const childCount = `(${this.childCount} children)`;
      this.header.querySelector('.child-count').innerText = childCount;
    }

    expand() {
      this.collapsed = false;
      this.element.querySelector('.body').style.display = 'block';
      this.header.querySelector('.toggle').innerText = '[-]';
      this.header.querySelector('.child-count').innerText = '';
    }

    get childCount() {
      return this.children.reduce((acc, child) => acc + 1 + child.childCount, 0);
    }
  }

  class HnCommentParser {
    constructor(rootNode) {
      this.rootNode = rootNode;
    }

    parse() {
      const comments = [];
      const potentialParents = [];
      const $comments = Array.from(this.rootNode.querySelectorAll('tr.athing'));

      // skip the first on purpose (it's the post submission details)
      $comments.slice(1).forEach($comment => {
        const indentLevel = this.getCommentIndentLevel($comment);
        const parent = this.getCommentParent(potentialParents, indentLevel);
        const comment = new HnComment($comment, indentLevel, parent);

        if (!parent) {
          comments.push(comment);
        } else {
          parent.children.push(comment);
        }

        potentialParents.push(comment);
      });

      return comments;
    }

    getCommentIndentLevel($comment) {
      return $comment.querySelector('.ind > img').getAttribute('width') / 40;
    }

    getCommentParent(potentialParents, indentLevel) {
      while (potentialParents.length > 0) {
        const potentialParent = potentialParents.slice(-1)[0];
        if (potentialParent.indentLevel === indentLevel - 1) {
          return potentialParent;
        }
        potentialParents.pop();
      }
    }
  }

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
})();


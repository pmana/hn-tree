(function() {
  'use strict'

  // todo: looks like chrome doesn't yet support ES6 modules...
  class Comment {
    constructor($comment, indentLevel, parent) {
      this.$header = $comment.querySelector('.comhead')
      this.$comment = $comment.querySelector('.comment')
      this.$containingSpan = this.$comment.querySelector('span')
      this.isDead = !this.$containingSpan
      this.indentLevel = indentLevel
      this.children = []
      this.parent = parent
      this.element = this.createElement()
    }

    createElement() {
      let elm = document.createElement('div')
      elm.className = this.getCommentClassName()
      elm.appendChild(this.getHeader())
      this.getBody().forEach(x => elm.appendChild(x))
      let that = this // todo: thought we didn't need to do this any more with es6?
      elm.onclick = function(e) {
        that.onClick()
        e.stopPropagation()
      }
      return elm
    }

    getCommentClassName() {
      let parity = this.indentLevel % 2 === 0 ? 'even' : 'odd'
      let state = this.isDead
        ? 'deleted'
        : this.$containingSpan.className == 'c00' ? 'healthy' : 'dead'
      return `comment comment--${parity} comment--${state}`
    }

    getBody() {
      if (this.isDead) {
        let deadParagraph = document.createElement('p')
        deadParagraph.innerText = this.$comment.innerText.trim()
        return [createParagraph([deadParagraph])]
      }

      let children = Array.from(this.$containingSpan.childNodes)
      let idx = children.findIndex(x => x.nodeName === 'P')
      let firstParagraph = createParagraph(children.slice(0, idx))
      let hasReply = this.$comment.querySelector('.reply a') !== null
      if (hasReply) {
        let reply = createReply(children.pop())
        let otherParagraphs = createParagraphs(children.slice(idx))
        return [firstParagraph, ...otherParagraphs, reply]
      }
      let otherParagraphs = createParagraphs(children.slice(idx))
      return [firstParagraph, ...otherParagraphs]

      function createParagraph(nodes) {
        let p = document.createElement('p')
        nodes.forEach(x => {
          if (x.nodeType === 3) { // text
            p.appendChild(quotify(x))
          } else {
            p.appendChild(removeSpan(x))
          }
        })
        return p
      }

      function createParagraphs(nodes) {
        return nodes
          .filter(x => x.textContent.trim() !== '')
          .map(x => createParagraph([x]))
      }

      function quotify(node) {
        let text = node.textContent.trim()
        if (text.startsWith('>')) {
          let quote = document.createElement('blockquote')
          quote.innerText = text.substring(1)
          return quote
        }
        return node
      }

      function removeSpan(element) {
        let span = element.querySelector('span')
        if (span) {
          span.remove()
        }
        return element
      }

      function createReply(element) {
        let link = element.querySelector('a')
        let p = document.createElement('p')
        p.appendChild(link)
        p.className = 'reply'
        return p
      }
    }

    getHeader() {
      let userLink = this.$header.querySelector('a[href*=user]')
      let timeSubmitted = this.$header.querySelector('a[href*=item]')
      let collapser = document.createElement('a')
      collapser.innerText = '[-]'
      let collapsed = false
      collapser.onclick = function() {
        if (!collapsed) {
          console.log('collapse', userLink)
        } else {
          console.log('expand', userLink)
        }
      }
      let header = document.createElement('div')
      header.className = 'header'
      header.appendChild(collapser)
      if (userLink) {
        header.appendChild(userLink)
        header.appendChild(timeSubmitted)
      } else {
        header.className = 'header dead'
        let deadText = document.createElement('span')
        deadText.innerText = '[dead]'
        header.appendChild(deadText)
      }
      return header
    }

    onClick() {
      // this.element.style.display = 'none'
    }
  }

  class CommentParser {
    constructor(rootNode) {
      this.rootNode = rootNode
    }

    parse() {
      let comments = []
      let potentialParents = []
      let $comments = Array.from(rootNode.querySelectorAll('tr.athing'))

      // skip the first on purpose (it's the post submission details)
      $comments.slice(1).forEach($comment => {
        let indentLevel = this.getCommentIndentLevel($comment)
        let parent = this.getCommentParent(potentialParents, indentLevel)
        let comment = new Comment($comment, indentLevel, parent)

        if (!parent) {
          comments.push(comment)
        } else {
          parent.children.push(comment)
        }

        potentialParents.push(comment)
      })

      return comments
    }

    getCommentIndentLevel($comment) {
      return $comment.querySelector('.ind > img').getAttribute('width') / 40
    }

    getCommentParent(potentialParents, indentLevel) {
      while (potentialParents.length > 0) {
        let potentialParent = potentialParents.slice(-1)[0]
        if (potentialParent.indentLevel == indentLevel - 1) {
          return potentialParent
        }
        potentialParents.pop()
      }
    }
  }

  let stylesheets = Array.from(document.querySelectorAll('link[rel=stylesheet]'))
  stylesheets.forEach(x => x.remove())

  let rootNode = document.body
  let comments = new CommentParser(rootNode).parse()

  rootNode.innerHTML = ''
  let container = document.createElement('div')
  container.className = 'container'
  comments.forEach(comment => attachCommentWithChildren(comment, container))
  rootNode.appendChild(container)

  function attachCommentWithChildren(comment, parent) {
    let elm = comment.element
    comment.children.forEach(child => attachCommentWithChildren(child, elm))
    parent.appendChild(elm)
  }
})()


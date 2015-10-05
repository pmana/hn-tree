(function() {
  'use strict'

  // todo: looks like chrome doesn't yet support ES6 modules...
  class Comment {
    constructor($comment, indentLevel, parent) {
      this.$header = $comment.querySelector('.comhead')
      this.$comment = $comment.querySelector('.comment')
      this.indentLevel = indentLevel
      this.children = []
      this.parent = parent
      this.element = this.createElement()
    }

    createElement() {
      var elm = document.createElement('div')
      elm.className = this.getCommentClassName()
      elm.innerHTML = this.$comment.innerText
      var that = this // todo: thought we didn't need to do this any more with es6?
      elm.onclick = function(e) {
        that.onClick()
        e.stopPropagation()
      }
      return elm
    }

    getCommentClassName() {
      var parity = this.indentLevel % 2 === 0 ? 'even' : 'odd'
      return `comment comment--${parity}`
    }

    onClick() {
      this.element.style.display = 'none'
    }
  }

  class CommentParser {
    constructor(rootNode) {
      this.rootNode = rootNode
    }

    parse() {
      var comments = []
      var potentialParents = []
      var $comments = Array.from(rootNode.querySelectorAll('tr.athing'))

      // skip the first on purpose (it's the post submission details)
      $comments.slice(1).forEach($comment => {
        var indentLevel = this.getCommentIndentLevel($comment)
        var parent = this.getCommentParent(potentialParents, indentLevel)
        var comment = new Comment($comment, indentLevel, parent)

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
        var potentialParent = potentialParents.slice(-1)[0]
        if (potentialParent.indentLevel == indentLevel - 1) {
          return potentialParent
        }
        potentialParents.pop()
      }
    }
  }

  var rootNode = document.body
  var comments = new CommentParser(rootNode).parse()

  rootNode.innerHTML = ''
  var container = document.createElement('div')
  container.className = 'container'
  comments.forEach(comment => attachCommentWithChildren(comment, container))
  rootNode.appendChild(container)

  function attachCommentWithChildren(comment, parent) {
    var elm = comment.element
    comment.children.forEach(child => attachCommentWithChildren(child, elm))
    parent.appendChild(elm)
  }
})()


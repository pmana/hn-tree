(function() {
  var comments = [];
  var potentialParents = [];
  var $comments = document.querySelectorAll('tr.athing');

  // skip the first on purpose (it's the post submission details)
  for (var i = 1; i < $comments.length; i++) {
    var $comment = $comments[i];
    var indentLevel = getCommentIndentLevel($comment);
    var parent = getCommentParent(indentLevel);

    var comment = {
      $header: getCommentHeader($comment),
      $comment: getCommentBody($comment),
      indentLevel: indentLevel,
      id: i,
      children: [],
      parent: parent
    };

    if (!parent) {
      comments.push(comment);
    } else {
      parent.children.push(comment);
    }

    potentialParents.push(comment);
  }

  document.body.innerHTML = '';
  var container = document.createElement('div');
  container.className = 'container';
  document.body.appendChild(container);

  for (var topLevelComment of comments) {
    addCommentWithChildren(topLevelComment, container);
  }

  function addCommentWithChildren(comment, parent) {
    var div = createCommentDiv(comment);

    for (var childComment of comment.children) {
      addCommentWithChildren(childComment, div);
    }

    parent.appendChild(div);
  }

  function createCommentDiv(comment) {
    var div = document.createElement('div');
    div.className = getCommentClassName(comment);
    div.id = comment.id;
    div.innerHTML = comment.$comment.innerText;
    div.onclick = function(e) {
      onCommentClick(comment, div);
      e.stopPropagation();
    };
    return div;
  }

  function getCommentClassName(comment) {
    return 'comment ' +
      (comment.indentLevel % 2 === 0 ? 'comment--even' : 'comment--odd');
  }

  function onCommentClick(comment, element) {
      element.style.display = 'none';
  }

  function getCommentHeader($comment) {
    return $comment.querySelector('.comhead');
  }

  function getCommentBody($comment) {
    return $comment.querySelector('.comment');
  }

  function getCommentIndentLevel($comment) {
    return $comment.querySelector('.ind > img').getAttribute('width') / 40;
  }

  function getCommentParent(indentLevel) {
    while (potentialParents.length > 0) {
      var potentialParent = potentialParents.slice(-1)[0];
      if (potentialParent.indentLevel == indentLevel - 1) {
        return potentialParent;
      }
      potentialParents.pop();
    }
  }
})();

(function() {
  var comments = [];
  var indentLevels = {};
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

    indentLevels[indentLevel] = indentLevels[indentLevel] || [];
    indentLevels[indentLevel].push(comment);

    if (!parent) {
      comments.push(comment);
    } else {
      parent.children.push(comment);
    }
  }

  console.log(comments);

  // add a [-] element (hover: pointer) that when clicked replaces the contents of the <table>
  // with the comment header, including [+] and (5 children)

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
    if (indentLevels[indentLevel - 1]) {
      return indentLevels[indentLevel - 1].slice(-1)[0];
    } else {
      return null;
    }
  }
})();

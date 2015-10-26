import HnComment from './hn-comment';

export default class HnCommentParser {
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

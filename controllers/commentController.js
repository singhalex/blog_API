exports.comments_get = (req, res, next) => {
  res.send("ALL COMMENTS");
};

exports.single_comment_get = (req, res, next) => {
  res.send("SINGLE COMMENT");
};

exports.create_comment_post = (req, res, next) => {
  res.send("COMMENT CREATED");
};

exports.delete_comment_post = (req, res, next) => {
  res.send("COMMENT DELETED");
};

exports.edit_comment_post = (req, res, next) => {
  res.send("COMMENT UPDATED");
};

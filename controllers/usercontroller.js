const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ omit: { user: { password: true } } });

const checkAuth = (userId, params, res) => {
  if (!userId) {
    res.status(401).json({ msg: "You must be logged in to view user info" });
    return false;
  }

  if (userId !== params) {
    res
      .status(401)
      .json({ msg: "You are not authorized to view this user data" });
    return false;
  }

  return true;
};

// Return all users
exports.users_get = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "You must be logged in to view users" });
  }
  if (req.user.role === "AUTHOR") {
    try {
      const users = await prisma.user.findMany({
        include: {
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
      });
      return res.json(users);
    } catch (err) {
      next(err);
    }
  }

  return res.status(402).json({
    msg: "You are not authorized to view users",
  });
};

// Get own user info
exports.user_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { posts: { select: { id: true, title: true } } },
      });
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }

  return;
};

// Get all posts of a user
exports.user_posts_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const posts = await prisma.post.findMany({
        where: { authorId: req.user.id },
      });
      return res.json(posts);
    } catch (err) {
      next(err);
    }
  }

  return;
};

// Get all comments of a user
exports.user_comments_get = async (req, res, next) => {
  const isAuthorized = checkAuth(req.user.id, req.params.userId, res);
  if (isAuthorized) {
    try {
      const comments = await prisma.comment.findMany({
        where: { authorId: req.user.id },
      });
      return res.json(comments);
    } catch (err) {
      next(err);
    }
  }
};

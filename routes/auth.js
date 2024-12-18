const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// TO-DO
router.post("/log-in", (req, res, next) => {
  console.log(`You are logged in ${req}`);
  res.json({
    msg: "You are logged in",
  });
});

// TO-DO
router.post("/sign-up", (req, res, next) => {
  console.log(`User created: ${req.body.password}`);
  res.json({
    msg: "User created",
  });
});

module.exports = router;

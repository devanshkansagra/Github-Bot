const express = require("express");
const router = express.Router();
const githubController = require("../controllers/githubController");

router.get("/webhook", githubController.getGithubWebHook);

module.exports = router;

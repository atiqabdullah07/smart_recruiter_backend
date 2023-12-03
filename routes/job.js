var express = require("express");
const { createJob } = require("../controllers/job");
var router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");

router.route("/job/upload").post(createJob);

router.route("/job/post").post(isAuthenticated, createJob);

module.exports = router;

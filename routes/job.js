var express = require("express");
const {
  createJob,
  deleteJob,

  getAllJobs,
  searchJobs,
} = require("../controllers/job");
var router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");

router.route("/job/upload").post(createJob);
router.route("/job/post").post(isAuthenticated, createJob);
router.route("/job/getJobs").get(getAllJobs);
router.route("/job/searchjob").post(searchJobs);
router.route("/job/:id").delete(isAuthenticated, deleteJob);

module.exports = router;

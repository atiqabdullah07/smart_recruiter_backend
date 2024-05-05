var express = require("express");
const {
  createJob,
  deleteJob,
  getJobById,
  getAllJobs,
  searchJobs,
  videoAnalysis,
} = require("../controllers/job");
var router = express.Router();
const { isAuthenticated, isCandidateAuthenticated } = require("../middlewares/auth");

router.route("/job/upload").post(createJob);
router.route("/job/post").post(isAuthenticated, createJob);
router.route("/job/getJobs").get(getAllJobs);
router.route("/job/searchjob").post(searchJobs);
router.route("/job/getJobById/:id").get(getJobById);
router.route("/job/:id").delete(isAuthenticated, deleteJob);
router.route("/job/videoAnalysis/:id").post(isCandidateAuthenticated,videoAnalysis);
module.exports = router;

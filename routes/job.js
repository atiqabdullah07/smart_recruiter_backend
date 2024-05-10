var express = require("express");
const {
  createJob,
  deleteJob,
  getJobById,
  getAllJobs,
  searchJobs,
  videoAnalysis,
  getJobInterviewAnalysisData,
  hireApplicant,
  recognizeSpeech,
} = require("../controllers/job");
var router = express.Router();
const { isAuthenticated, isCandidateAuthenticated } = require("../middlewares/auth");

router.route("/job/upload").post(createJob);
router.route("/job/post").post(isAuthenticated, createJob);
router.route("/job/getJobs").get(getAllJobs);
router.route("/job/searchjob").post(searchJobs);
router.route("/job/getJobById/:id").get(getJobById);
router.route("/job/analysis/:id/:applicant").get(getJobInterviewAnalysisData);
router.route("/job/:id").delete(isAuthenticated, deleteJob);
router.route("/job/videoAnalysis/:id").post(isCandidateAuthenticated,videoAnalysis);
router.route("/job/recognizeSpeech/:id").post(isCandidateAuthenticated,recognizeSpeech);
router.route("/job/hire/:id/:applicant").get(isAuthenticated,hireApplicant);

module.exports = router;

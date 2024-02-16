var express = require("express");
var router = express.Router();

const {
  isCandidateAuthenticated,
} = require("../middlewares/auth");

const {
  registerCandidate,
  loginCandidate,
  getMyCandidateProfile,
  logoutCandidate,
  applyOnJob,
  updateCandidateProfile,
  alreadyApplyOnJob,
  myAppliedJobs,
  continueWithGoogle,
  forgetPassword,
  resetPassword
} = require("../controllers/candidate");

/* GET users listing. */
router.get("/canddiate", function (req, res, next) {
  res.send("Hello its candidate");
});

router.route("/candidate/register").post(registerCandidate);
router.route("/candidate/login").post(loginCandidate);
router.route("/candidate/logout").get(logoutCandidate);

//Google Auth
router.route("/candidate/continueWithGoogle").post(continueWithGoogle)

//Forget Password
router.route("/candidate/forgetpassword").post(forgetPassword)
//Reset Password
router.route("/candidate/resetpassword/:token").put(resetPassword)

router
  .route("/candidate/myprofile")
  .get(isCandidateAuthenticated, getMyCandidateProfile);
router
  .route("/candidate/updateprofile")
  .put(isCandidateAuthenticated, updateCandidateProfile);

router
  .route("/candidate/applyjob/:id")
  .post(isCandidateAuthenticated,applyOnJob);
router
  .route("/candidate/alreadyApplyJob")
  .post(isCandidateAuthenticated,alreadyApplyOnJob);
router
  .route("/candidate/myAppliedJobs")
  .get(isCandidateAuthenticated,myAppliedJobs);

module.exports = router;

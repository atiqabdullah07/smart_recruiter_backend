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
} = require("../controllers/candidate");

/* GET users listing. */
router.get("/canddiate", function (req, res, next) {
  res.send("Hello its candidate");
});

router.route("/candidate/register").post(registerCandidate);
router.route("/candidate/login").post(loginCandidate);
router.route("/candidate/logout").get(logoutCandidate);

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

module.exports = router;

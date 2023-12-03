var express = require("express");

var router = express.Router();
const {
  isCaAuthenticated,
  isCandidateAuthenticated,
} = require("../middlewares/auth");
const { register } = require("../controllers/user");
const {
  registerCandidate,
  loginCandidate,
  getMyCandidateProfile,
  logoutCandidate,
  applyOnJob,
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
  .route("/candidate/applyjob/:id")
  .post(isCandidateAuthenticated, applyOnJob);

module.exports = router;

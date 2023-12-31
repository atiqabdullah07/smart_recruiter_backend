var express = require("express");
const {
  registerRecruiter,
  loginRecruiter,
  logoutRecruiter,
  getMyRecruiterProfile,
  updateRecruiterProfile,
} = require("../controllers/recruiter");
var router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");

/* GET users listing. */
router.get("/recruiter", function (req, res, next) {
  res.send("Hello its recruiter");
});

router.route("/recruiter/register").post(registerRecruiter);
router.route("/recruiter/login").post(loginRecruiter);
router.route("/recruiter/logout").get(logoutRecruiter);
router
  .route("/recruiter/updateprofile")
  .put(isAuthenticated, updateRecruiterProfile);
router
  .route("/recruiter/myprofile")
  .get(isAuthenticated, getMyRecruiterProfile);

module.exports = router;

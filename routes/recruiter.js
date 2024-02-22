var express = require("express");
const {
  registerRecruiter,
  loginRecruiter,
  logoutRecruiter,
  getMyRecruiterProfile,
  updateRecruiterProfile,
  resumeAnalysis,
  continueWithGoogle,
  forgetPassword,
  resetPassword,
  setNewPassword
  
} = require("../controllers/recruiter");
var router = express.Router();
const { isAuthenticated } = require("../middlewares/auth");

/* GET users listing. */
router.get("/recruiter", function (req, res, next) {
  res.send("Hello its recruiter");
});

router.route("/recruiter/register").post(registerRecruiter);
router.route("/recruiter/login").post(loginRecruiter);
router.route("/recruiter/continueWithGoogle").post(continueWithGoogle)

//Forget Password
router.route("/recruiter/forgetpassword").post(forgetPassword)
//Verify Reset Password 6 digit Code that was sent to email
router.route("/recruiter/resetpassword").post(resetPassword)
//Set New Password
router.route("/recruiter/setnewpassword").put(setNewPassword)

router.route("/recruiter/logout").get(logoutRecruiter);
router.route("/recruiter/resumeAnalysis").post(resumeAnalysis);
router
  .route("/recruiter/updateprofile")
  .put(isAuthenticated, updateRecruiterProfile);
router
  .route("/recruiter/myprofile")
  .get(isAuthenticated, getMyRecruiterProfile);


module.exports = router;

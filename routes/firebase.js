const { uploadFile, googleAuth } = require("../controllers/firebase");

var express = require("express");
var router = express.Router();
  
router.route("/uploadFile").post(uploadFile);
router.route("/googleAuth").get(googleAuth);

module.exports = router;
  
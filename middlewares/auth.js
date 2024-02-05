const Candidates = require("../models/candidate");
const Recruiters = require("../models/recruiter");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        message: "Please Login First",
      });
    }

    const decoded = await jwt.verify(token, "creatingatestJWTkey");

    req.recruiter = await Recruiters.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.isCandidateAuthenticated = async (req, res, next) => {
  try {
    
    const {token}  = req.cookies;
   
    if (!token) {
      return res.status(401).json({
        message: "Please Login First",
      });
    }

    const decoded = await jwt.verify(token, "creatingatestJWTkey");

    req.candidate = await Candidates.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

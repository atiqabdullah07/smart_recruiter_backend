const Candidates = require("../models/candidate");
const Jobs = require("../models/jobs");

exports.loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const candidate = await Candidates.findOne({ email }).select("+password");

    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: "User with this email does not exists",
      });
    }
    const isMatch = await candidate.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }
    const options = {
      
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    const token = await candidate.generateToken();
    res.status(200).cookie("token", token, options).json({
      success: true,
      candidate,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logoutCandidate = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Candidate Loged Out",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.registerCandidate = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    let candidate = await Candidates.findOne({ email });
    if (candidate) {
      return res.status(400).json({
        success: false,
        message: "User(candidate) already Exists",
      });
    }

    candidate = await Candidates.create({
      name,
      email,
      password,
      avatar,
    });

    await candidate.save()

    res.status(201).json({ success: true, candidate });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidates.findById(req.candidate._id);
    res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.applyOnJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const candidateId = req.candidate._id;
    const job = await Jobs.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "job Not Found",
      });
    }
    // Check if the candidate has already applied
    const isAlreadyApplied = job.applicants.some(
      (applicant) => String(applicant.applicant) === String(candidateId)
    );

    if (isAlreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job.",
      });
    }
    job.applicants.push({
      applicant: candidateId, 
      resumeFile: req.body.resumeFile,
    });

    await job.save();
    return res.status(200).json({
      success: true,
      message: "Applied Successfully on the Job",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

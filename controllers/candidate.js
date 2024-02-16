const { sendEmail } = require("../middlewares/sendEmail");
const Candidates = require("../models/candidate");
const Jobs = require("../models/jobs");
const axios = require("axios")
const crypto = require("crypto");



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
exports.continueWithGoogle = async (req, res) => {
  try {
    const {googleAccessToken} = req.body;
    console.log(googleAccessToken)

    axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {

          headers: {
              "Authorization": `Bearer ${googleAccessToken}`
          }
        })
        .then(async response => {
            const name = response.data.name;
            const email = response.data.email;
            const avatar = response.data.picture;

            let candidate = await Candidates.findOne({ email });
            if (candidate===null) {
              //Create new Candidate
              candidate = await Candidates.create({
                name,
                email,
                avatar,
              });
  
              await candidate.save()
              
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


           
            
        })
        .catch(err => {
            res
                .status(400)
                .json({message: "Invalid access token!"})
        })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidates.findById(req.candidate._id);
    const { name, email, avatar } = req.body;
    if (name) {
      candidate.name = name;
    }
    if (email) {
      candidate.email = email;
    }
    if (avatar) {
      candidate.avatar = avatar;
    }
    await candidate.save();

    res.status(200).json({
      success: true,
      candidate,
      message: "Profile Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.forgetPassword = async (req,res)=>{
  try {
    const {email} = req.body;
    const candidate = await Candidates.findOne({email});
    if(!candidate){
      return res.status(400).json({
        success: false,
        message: "User with this email does not exists",
      });
    }
    const resetToken = await candidate.getResetPasswordToken();
    await candidate.save()
    await sendEmail({
      email: candidate.email,
      subject: "Reset Password",
      message: `Click on the link below to reset your password. ${process.env.NEXTJS_FRONTEND_URL}/resetpassword/${resetToken} . If you have not requested this email then please ignore it`,
    })
    res.status(200).json({
      success: true,
      resetToken,
      message: `Reset Password Token Sent to ${email}`,
    });
  }   
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
exports.resetPassword = async (req,res)=>{
  try {
    const {password} = req.body;
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    
    const user = await Candidates.findOne({
      resetPasswordToken,
      resetPasswordDate: { $gt: Date.now() },
    });
    console.log(user)
  
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset Password Token is invalid or has been expired",
      });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordDate = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  }catch(err){
    console.log(err);
    res.sendStatus(400);
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
      resumeAnalysisScore:req.body.resumeAnalysisScore
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
exports.alreadyApplyOnJob = async (req, res) => {
  try {
    const {jobId} = req.body;
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
    

    
    return res.status(200).json({
      success: true,
      message: "You can apply on the Job",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.myAppliedJobs = async (req, res) => {
  try {
    const candidateId = req.candidate._id;

    // Find jobs where the candidate has applied
    const jobs = await Jobs.find({ 'applicants.applicant': candidateId }).populate('owner');

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No applied jobs found",
      });
    }

    return res.status(200).json({
      success: true,
      jobs,
      message: "Applied Jobs",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

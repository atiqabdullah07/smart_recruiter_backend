const Recruiters = require("../models/recruiter");
const axios = require("axios")
const { sendEmail } = require("../middlewares/sendEmail");
const crypto = require("crypto");

exports.loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const recruiter = await Recruiters.findOne({ email }).select("+password");

    if (!recruiter) {
      return res.status(400).json({
        success: false,
        message: "User with this email does not exists",
      });
    }
    const isMatch = await recruiter.matchPassword(password);

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
    const token = await recruiter.generateToken();
    res.status(200).cookie("token", token, options).json({
      success: true,
      recruiter,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logoutRecruiter = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Recruiter Loged Out",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.registerRecruiter = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    let recruiter = await Recruiters.findOne({ email });
    if (recruiter) {
      return res.status(400).json({
        success: false,
        message: "User already Exists",
      });
    }

    recruiter = await Recruiters.create({
      name,
      email,
      password,
      avatar,

      
    });

    res.status(201).json({ success: true, recruiter });
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
    const recruiter = await Recruiters.findOne({email});
    if(!recruiter){
      return res.status(400).json({
        success: false,
        message: "Recruiter with this email does not exists",
      });
    }
    const resetToken = await recruiter.getResetPasswordCode();
    await recruiter.save()
    await sendEmail({
      email: recruiter.email,
      subject: "Verification Code",
      message: `Dear ${recruiter.name},
    
    Please use the following verification code to proceed with your account reset password request:
    
    Verification Code: ${resetToken}
    
    If you did not request this code, please ignore this email.
        
    Regards,
    Team Smart Recruiter`,
    })
    
    res.status(200).json({
      success: true,
      resetToken,
      message: `Reset password verification code sent to ${email}`,
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
    const {resetPasswordToken} = req.body;
    
    
    const user = await Recruiters.findOne({
      resetPasswordToken,
      resetPasswordDate: { $gt: Date.now() },
    });
    console.log(user)
  
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset password verification code is invalid or has been expired",
      });
    }
    user.resetPasswordToken = undefined;
    user.resetPasswordDate = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      email:user.email, //user email to use for new password reset
      message: "Code verified successfully",

    });
  }catch(err){
    console.log(err);
    res.sendStatus(400);
  }
};
exports.setNewPassword = async (req,res)=>{
  try {
    const {email,password} = req.body;
    console.log(email)
    console.log(password)
    const recruiter = await Recruiters.findOne({ email });
    recruiter.password = password
    await recruiter.save()
    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });
  }catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.updateRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiters.findById(req.recruiter._id);
    const { name, password, avatar } = req.body;
    if (name) {
      recruiter.name = name;
    }
    if (password) {
      recruiter.password = password;
    }
    if (avatar) {
      recruiter.avatar = avatar;
    }
    await recruiter.save();

    res.status(200).json({
      success: true,
      recruiter,
      message: "Profile Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiters.findById(req.recruiter._id).populate(
      "jobs"
    );
    res.status(200).json({
      success: true,
      recruiter,
    });
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

            let recruiter = await Recruiters.findOne({ email });
            console.log(recruiter)
            if (recruiter===null) {
              //Create new recruiter
              recruiter = await Recruiters.create({
                name,
                email,
                avatar,
              });
  
              await recruiter.save()
              
            }
            const options = {
              
              expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              httpOnly: true,
            };
            const token = await recruiter.generateToken();
            res.status(200).cookie("token", token, options).json({
              success: true,
              recruiter,
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


exports.resumeAnalysis = async (req, res) => {
  try {
    console.log(req.body)
    const { resumeUrl, jobDescriptionUrl } = req.body;

    // Check if both URLs are provided
    if (!resumeUrl || !jobDescriptionUrl) {
      return res.status(400).json({ error: 'Both resumeUrl and jobDescriptionUrl are required.' });
    }

   

    // Send files to Flask API
    const flaskApiResponse = await fetch(`${process.env.FLASK_URL}/api/calculate_similarity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeUrl,
        jobDescriptionUrl,
      }),
    });

    // Return the response from Flask API
    const flaskApiResponseJson = await flaskApiResponse.json();
    console.log(flaskApiResponseJson)
    res.status(200).json(flaskApiResponseJson);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Analysis Error' });
  }
};
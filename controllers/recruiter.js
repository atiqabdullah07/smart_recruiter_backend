const Recruiters = require("../models/recruiter");

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

exports.updateRecruiterProfile = async (req, res) => {
  try {
    const recruiter = await Recruiters.findById(req.recruiter._id);
    const { name, email } = req.body;
    if (name) {
      recruiter.name = name;
    }
    if (email) {
      recruiter.email = email;
    }
    await recruiter.save();

    res.status(200).json({
      success: true,
      message: "Profile Updated",
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


exports.resumeAnalysis = async (req, res) => {
  try {
    console.log(req.body)
    const { resumeUrl, jobDescriptionUrl } = req.body;

    // Check if both URLs are provided
    if (!resumeUrl || !jobDescriptionUrl) {
      return res.status(400).json({ error: 'Both resumeUrl and jobDescriptionUrl are required.' });
    }

    // Fetch files from URLs
    const [resumeFile, jobDescriptionFile] = await Promise.all([
      fetch(resumeUrl).then(response => response.buffer()),
      fetch(jobDescriptionUrl).then(response => response.buffer()),
    ]);

    // Send files to Flask API
    const flaskApiResponse = await fetch('http://127.0.0.1:5000/api/calculate_similarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeFile: resumeFile.toString('base64'),
        jobDescriptionFile: jobDescriptionFile.toString('base64'),
      }),
    });

    // Return the response from Flask API
    const flaskApiResponseJson = await flaskApiResponse.json();
    res.json(flaskApiResponseJson);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
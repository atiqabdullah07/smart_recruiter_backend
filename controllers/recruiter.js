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

const Jobs = require("../models/jobs");
const Post = require("../models/posts");
const Recruiters = require("../models/recruiter");
const User = require("../models/user");

exports.createJob = async (req, res) => {
  try {
    const newJobData = {
      title: req.body.title,
      Image: {
        public_id: "req.body.public_id",
        url: "req.body.url",
      },
      owner: req.recruiter._id,
    };
    const newJob = await Jobs.create(newJobData);
    const recruiter = await Recruiters.findById(req.recruiter._id);
    recruiter.jobs.push(newJob._id);
    await recruiter.save();

    res.status(201).json({
      success: true,
      job: newJob,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log(error);
  }
};

const Jobs = require("../models/jobs");

const Recruiters = require("../models/recruiter");

exports.createJob = async (req, res) => {
  try {
    const newJobData = {
      title: req.body.title,
      experienceLevel: req.body.experienceLevel,
      jobType: req.body.jobType,
      skills: req.body.skills,

      
      descriptionFile: req.body.descriptionFile,
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

exports.deleteJob = async (req, res) => {
  try {
    const job = await Jobs.findById(req.params.id); // Params.id means the id we'll pass after the url
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }

    if (job.owner.toString() !== req.recruiter._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "UnAuthorized",
      });
    } else {
      await job.deleteOne();
      const recruiter = await Recruiters.findById(req.recruiter._id);
      const index = recruiter.jobs.indexOf(req.params.id);
      recruiter.jobs.splice(index, 1);
      await recruiter.save();

      return res.status(200).json({
        success: true,
        message: "Job Deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Jobs.find().populate("owner");

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.searchJobs = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Job title is required for search.",
      });
    }

    const jobs = await Jobs.find({ title: { $regex: new RegExp(title, "i") } });

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Jobs.findById(req.params.id).populate("owner"); // Params.id means the id we'll pass after the url
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
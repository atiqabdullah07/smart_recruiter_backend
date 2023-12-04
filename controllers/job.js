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

exports.likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // Params.id means the id we'll pass after the url
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }
    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);
      post.likes.splice(index, 1);
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Unliked",
      });
    } else {
      post.likes.push(req.user._id);
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Jobs.findById(req.params.id); // Params.id means the id we'll pass after the url
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
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
        message: "Post Deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: "Un Authorized User",
      });
    }
    post.title = req.body.title;
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

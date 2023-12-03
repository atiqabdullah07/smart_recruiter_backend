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

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // Params.id means the id we'll pass after the url
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "UnAuthorized",
      });
    } else {
      await post.deleteOne();
      const user = await User.findById(req.user._id);
      const index = user.posts.indexOf(req.params.id);
      user.posts.splice(index, 1);
      await user.save();

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

exports.getPostsOfFollowing = async (req, res) => {
  try {
    // const user = await User.findById(req.user._id).populate(
    //   "following",
    //   "posts"
    // ); // we had the id of the following user the populate function will give us all the data of the ID

    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    });

    res.status(200).json({
      success: true,
      posts,
    });
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

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }
    post.Comments.push({
      user: req.user._id,
      comment: req.body.comment,
    });

    await post.save();
    return res.status(200).json({
      success: true,
      message: "Comment Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post Not Found",
      });
    }
    if (post.owner.toString() === req.user._id.toString()) {
      post.Comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.Comments.splice(index, 1);
        }
      });

      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post owner has deleted the comment",
      });
    } else {
      post.Comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          if (item._id.toString() === req.body.commentId.toString()) {
            return post.Comments.splice(index, 1);
          }
        }
      });
      await post.save();
      return res.status(200).json({
        success: true,
        message: "comment owner has deleted the comment",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

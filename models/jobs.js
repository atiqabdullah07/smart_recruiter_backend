var mongoose = require("mongoose");

var jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  descriptionFile: String,
  jobType: String,
  experienceLevel: String,
  image: {
    public_id: String,
    url: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recruiter", // It refers to the Recruiter model that we have created
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  applicants: [
    {
      applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
      },
      resumeFile: {
        type: String,
      },
      score: {
        type: String,
      },
    },
  ],
});

const Jobs = mongoose.model("Job", jobSchema);

module.exports = Jobs;

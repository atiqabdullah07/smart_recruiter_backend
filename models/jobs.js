var mongoose = require("mongoose");

var jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  descriptionFile: String,
  jobType: String,
  experienceLevel: String,
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recruiter", // It refers to the Recruiter model that we have created
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  skills: {
    type: [String], // This specifies an array of strings
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

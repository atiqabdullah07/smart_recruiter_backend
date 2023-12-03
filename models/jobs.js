var mongoose = require("mongoose");

var jobSchema = new mongoose.Schema({
  title: String,
  description: String,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
  ],
});

const Jobs = mongoose.model("Job", jobSchema);

module.exports = Jobs;

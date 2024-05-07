var mongoose = require("mongoose");
// Define sub-schema for video analysis result
const videoAnalysisSchema = new mongoose.Schema({
  Angry: Number,
  ConfidenceScore: Number,
  ConfidenceState: String,
  Disgust: Number,
  Fear: Number,
  Happy: Number,
  LackOfEnthusiasm: Number,
  NervousnessScore: Number,
  NervousnessState: String,
  Neutral: Number,
  Posture: String,
  Sentiment: String,
  SmileIndex: Number,
  Surprise: Number,
  
});
var jobSchema = new mongoose.Schema({
  title: String,
  avatar:String,
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
  interviewQuestions:{
    type: [String], // This specifies an array of string interview Questions
  },
  interviewQuestionsVideos:{
    type: [String],
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
      resumeAnalysisScore: {
        type: String,
      },
      videoAnalysisScore: {
        type: Number,
      },
      videoAnalysis: {
        type: videoAnalysisSchema, // Embed the video analysis sub-schema
      },
    },
  ],
});

const Jobs = mongoose.model("Job", jobSchema);

module.exports = Jobs;

var mongoose = require("mongoose");
// Define sub-schema for video analysis result
const videoAnalysisSchema = new mongoose.Schema({
  ConfidenceScore: Number,
  ConfidenceState: String,
  NervousnessScore: Number,
  NervousnessState: String,

  Angry: Number,
  Disgust: Number,
  Fear: Number,
  Happy: Number,
  Sad: Number,
  Surprise: Number,
  Neutral: Number,

  Posture: String,
  SmileIndex: Number,

  Sentiment: String,
  PositiveSentiment: String,
  NegativeSentiment: String,
  NeutralSentiment: String,
  
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
      responseAnalysisScore:{
        type: Number,
      },
      responses:{
        type:[String]
      }
    },
  ],
  hiredApplicants:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
  }]
});

const Jobs = mongoose.model("Job", jobSchema);

module.exports = Jobs;

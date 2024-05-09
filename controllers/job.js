const Jobs = require("../models/jobs");
const fetch = require('node-fetch');
const Recruiters = require("../models/recruiter");
const Candidates = require("../models/candidate");
const { sendEmail } = require("../middlewares/sendEmail");

exports.createJob = async (req, res) => {
  try {
    // var videoIds = []
    // if(req.body.interviewQuestions){

    //   videoIds = await generateInterviewQuestionVideos(req.body.interviewQuestions)
    //   console.log("Video IDs Retrieved")
    //   console.log(videoIds)
    // }
    
    // console.log("Retrieving Video URLs from IDs");
    // const videoURLs = await retrieveInterviewQuestionVideos(videoIds)
    // console.log(videoURLs)
    const newJobData = {
      title: req.body.title,
      experienceLevel: req.body.experienceLevel,
      jobType: req.body.jobType,
      skills: req.body.skills,
      //interviewQuestions: req.body.interviewQuestions,
      //interviewQuestionsVideos: videoIds,
      avatar:req.recruiter.avatar,
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

const generateInterviewQuestionVideos = async (interviewQuestions) => {
  var videoIds = [];

  for (const question of interviewQuestions) {
      try {
          const options = {
              method: 'POST',
              headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  'x-api-key': process.env.HEY_GEN_API_E
              },
              body: JSON.stringify({
                  test: true,
                  caption: false,
                  title: 'Interview',
                  dimension: { width: 1920, height: 1080 },
                  video_inputs: [
                      {
                          character: {
                              type: 'avatar',
                              avatar_id: 'Anna_public_3_20240108',
                              scale: 1,
                              avatar_style: 'closeUp',
                          },
                          voice: {
                              type: "text",
                              voice_id: "1bd001e7e50f421d891986aad5158bc8",
                              input_text: question
                          },
                          background: {
                              type: "color",
                              value: '#ffffff'
                          }
                      }
                  ]
              })
          };

          const response = await fetch('https://api.heygen.com/v2/video/generate', options);
          const responseData = await response.json();

          console.log(responseData);
          const videoId = responseData.data.video_id;
          videoIds.push(videoId)

          
      } catch (error) {
          console.error(error);
      }
  }

  return videoIds;
};
const retrieveInterviewQuestionVideos = async (videoIds) => {
  var videoURLs = []
  for (let i = 0; i < videoIds.length; i++) {
    
    try{
      const videoOptions = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-api-key': process.env.HEY_GEN_API_E
            
        }
    };

    const videoResponse =await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoIds[i]}`, videoOptions);
    const videoData = await videoResponse.json();

    console.log(videoData);
    videoURLs.push(videoData.data.video_url);

    }catch(err){
      console.log(err)
    }
  }
  return videoURLs
}

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

    const jobs = await Jobs.find({ title: { $regex: new RegExp(title, "i") } }).populate("owner");

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
    const job = await Jobs.findById(req.params.id).populate(["owner",{
      path: "applicants",
      populate: {
        path: "applicant",
      }
    }]); // Params.id means the id we'll pass after the url
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }
    // console.log("Retrieving Video URLs from IDs");
    // const videoURLs = await retrieveInterviewQuestionVideos(job.interviewQuestionsVideos)
    // console.log(videoURLs)

    res.status(200).json({
      success: true,
      job
      
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getJobInterviewAnalysisData = async (req, res) => {
  try {
    const job = await Jobs.findById(req.params.id).populate(["owner",{
      path: "applicants",
      populate: {
        path: "applicant",
      }
    }]); // Params.id means the id we'll pass after the url
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }
    
    const ApplicantData = job.applicants.find(
      (applicant) => String(applicant.applicant._id) === String(req.params.applicant)
    );

    
    res.status(200).json({
      success: true,
      job,
      ApplicantData
      
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.hireApplicant = async (req, res) => {
  try {
    const job = await Jobs.findById(req.params.id).populate(["owner",{
      path: "applicants",
      populate: {
        path: "applicant",
      }
    }]); // Params.id means the id we'll pass after the url
    const candidate = await Candidates.findById(req.params.applicant);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }
    
    const ApplicantData = job.applicants.find(
      (applicant) => String(applicant.applicant._id) === String(req.params.applicant)
    );
    if(!ApplicantData){
      return res.status(404).json({
        success: false,
        message: "Applicant has not applied for this job",
      });
    }
    const alreadyAppliedCandidate = job.hiredApplicants.find(
      (applicant) => String(applicant) === String(req.params.applicant)
    );

    if(alreadyAppliedCandidate){
      return res.status(404).json({
        success: false,
        message: "Applicant has already sent invitation",
      });
    }

    job.hiredApplicants.push(ApplicantData.applicant._id)
    candidate.jobOffers.push(job._id)

    await sendEmail({
      email: candidate.email,
      subject: "Job Application Status",
      message: `Dear ${candidate.name} , 

      We hope this email finds you well. We are writing to extend our warmest congratulations on behalf of ${job.owner.name} for being selected as our newest ${job.title}. After carefully reviewing your Resume and Video Interview insights on Smart Recruiter platform, we are delighted to offer you this opportunity to join our team.
      
      In the following days, our HR department will be in touch to discuss the formalities of your employment, including paperwork, benefits enrollment, and any other necessary arrangements. Should you have any questions or require further information in the meantime, please don't hesitate to reach out.

      Once again, congratulations on your appointment to this position. We believe that you will thrive in our dynamic work environment, and we are excited about the positive impact you will undoubtedly make.

      We eagerly anticipate the opportunity to work together and achieve great things.

      Warm regards,
      ${job.owner.name}
      `

    })

    await job.save()
    await candidate.save()
    
    
    res.status(200).json({
      success: true,
      candidate,
      job,
      message: "An email has been sent to this applicant."
      
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const multer = require('multer');
const FormData = require('form-data');

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

exports.videoAnalysis = async (req, res) => {
  try {
    const jobId = req.params.id;
    const candidateId = req.candidate._id;
    const job = await Jobs.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job Not Found",
      });
    }

    // Check if the candidate has already applied and recorded their interview
    const existingApplicant = job.applicants.find(
      (applicant) => String(applicant.applicant) === String(candidateId)
    );

    if (existingApplicant && existingApplicant.videoAnalysis) {
      return res.status(400).json({
        success: false,
        message: "You have already recorded your interview for this job.",
      });
    }

    // Handle file upload using multer middleware
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error.' });
      } else if (err) {
        return res.status(500).json({ error: 'Internal server error.' });
      }

      // Ensure that the file is provided in the request body
      if (!req.file) {
        return res.status(400).json({ error: 'File is required.' });
      }

      // Prepare formData to send the file to Flask server
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: 'recorded_video.webm',
        contentType: req.file.mimetype,
      });

      // Send the file to Flask API
      const flaskApiResponse = await fetch(`${process.env.FLASK_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      // Return the response from Flask API
      const flaskApiResponseJson = await flaskApiResponse.json();
      console.log(flaskApiResponseJson)

      // Find the applicant within the applicants array
      let applicantToUpdate = job.applicants.find(
        (applicant) => String(applicant.applicant) === String(candidateId)
      );

      // Update the existing applicant's video analysis
      applicantToUpdate.videoAnalysis = flaskApiResponseJson;
      applicantToUpdate.videoAnalysisScore = flaskApiResponseJson.OverallScore;
      

      await job.save();
      return res.status(200).json({
        success: true,
        message: "Interview Recorded Successfully",
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Analysis Error' });
  }
};

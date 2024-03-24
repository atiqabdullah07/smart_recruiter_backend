const Jobs = require("../models/jobs");

const Recruiters = require("../models/recruiter");

exports.createJob = async (req, res) => {
  try {
    
    const videoIds = await generateInterviewQuestionVideos(req.body.interviewQuestions)
    console.log("Video IDs Retrieved")
    console.log(videoIds)
    
    // console.log("Retrieving Video URLs from IDs");
    // const videoURLs = await retrieveInterviewQuestionVideos(videoIds)
    // console.log(videoURLs)
    const newJobData = {
      title: req.body.title,
      experienceLevel: req.body.experienceLevel,
      jobType: req.body.jobType,
      skills: req.body.skills,
      interviewQuestions: req.body.interviewQuestions,
      interviewQuestionsVideos: videoIds,
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
  const videoIds = [];

  for (const question of interviewQuestions) {
      try {
          const options = {
              method: 'POST',
              headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  'x-api-key': process.env.HEY_GEN_API
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
  const videoURLs = []
  for (let i = 0; i < videoIds.length; i++) {
    
    try{
      const videoOptions = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-api-key': process.env.HEY_GEN_API
            
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
    console.log("Retrieving Video URLs from IDs");
    const videoURLs = await retrieveInterviewQuestionVideos(job.interviewQuestionsVideos)
    console.log(videoURLs)

    res.status(200).json({
      success: true,
      job,
      videoURLs
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// exports.getJobByIdForInterview = async (req, res) => {
//   try {
//     const job = await Jobs.findById(req.params.id).populate(["owner",{
//       path: "applicants",
//       populate: {
//         path: "applicant",
//       }
//     }]); // Params.id means the id we'll pass after the url
//     if (!job) {
//       return res.status(404).json({
//         success: false,
//         message: "Job Not Found",
//       });
//     }
//     console.log("Retrieving Video URLs from IDs");
//     const videoURLs = await retrieveInterviewQuestionVideos(job.interviewQuestionsVideos)
//     console.log(videoURLs)

//     res.status(200).json({
//       success: true,
//       job,
//       videoURLs
//     });
    
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
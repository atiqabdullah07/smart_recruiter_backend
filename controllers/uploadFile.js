const Jobs = require("../models/jobs");
const { initializeApp } = require("firebase/app");
const { firebaseConfig } = require("../config/firebase_config");
const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");
const multer = require("multer");

initializeApp(firebaseConfig);

const storage = getStorage();

// Define a file filter function
const fileFilter = (req, file, cb) => {
  // Check if the file format is either pdf or docx
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error("Invalid file format. Only PDF or DOCX files are allowed."),
      false
    ); // Reject the file
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
}).single("filename");

const givedateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
  const dateTime = date + "-" + time;
  return dateTime;
};

exports.uploadFile = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      const file = req.file;
      const dateTime = givedateTime();
      const storageRef = ref(storage, `files/${dateTime}_${file.originalname}`);
      const uploadTask = await uploadBytesResumable(storageRef, file.buffer);

      // Check if uploadTask.snapshot is defined before accessing its properties
      if (uploadTask.ref) {
        console.log("File uploaded successfully. Retrieving download URL...");

        // Use a separate try-catch block for the getDownloadURL operation
        try {
          const downloadURL = await getDownloadURL(uploadTask.ref);
          console.log("Download URL retrieved successfully.");

          res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            url: downloadURL,
            public_id: uploadTask.ref.fullPath,
          });
        } catch (urlError) {
          console.error("Error retrieving download URL:", urlError);
          res.status(500).json({
            success: false,
            message: "Failed to retrieve download URL.",
          });
        }
      } else {
        // Log an error message and send an appropriate response
        console.error("Upload task snapshot or ref is undefined.");
        res.status(500).json({
          success: false,
          message: "Failed to retrieve download URL.",
        });
      }
    });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

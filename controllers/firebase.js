const {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} = require("firebase/storage");
const multer = require("multer");

const { initializeApp } = require("firebase/app");
const { firebaseConfig } = require("../config/firebase_config");

const app = initializeApp(firebaseConfig);
const storage = getStorage();



const upload = multer({
  storage: multer.memoryStorage(),
  //  fileFilter: fileFilter,
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
      // Set metadata with the MIME type
      // Set metadata with the MIME type
      const metadata = {
        contentType: file.mimetype,
      };
      // Upload file with metadata
      const uploadTask = await uploadBytesResumable(storageRef, file.buffer, metadata);


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



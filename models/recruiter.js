var mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
var recruiterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
  },

  email: {
    type: String,
    required: [true, "Please enter an Email"],
    unique: [true, "Email already Exists"],
  },
  password: {
    type: String,
    //required: [true, "Please enter a password"],
    //minLength: [6, "Password must be atleast 6 chars"],
    select: false, // Means when we'll Access user's data we'll get all user information except this (i.e Password)
  },
  jobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  ],

  resetPasswordToken: String,
  resetPasswordDate: Date,
});

recruiterSchema.pre("save", async function (next) {
  // It means bcrypt the password on saving
  if (this.isModified("password")) {
    // Do only when password is modified
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

recruiterSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

recruiterSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, "creatingatestJWTkey");
};

recruiterSchema.methods.getResetPasswordCode = function () {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10); // Generate a random digit between 0 and 9
  }
  this.resetPasswordToken = code;
  this.resetPasswordDate = Date.now() + 10 * 60 * 1000; // 10 mins

  return code;
};

const Recruiters = mongoose.model("Recruiter", recruiterSchema);

module.exports = Recruiters;

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

const mongoose = require("mongoose");
var cors = require("cors");

//Step2 Write all the routers here
var indexRouter = require("./routes/index");
var jobRouter = require("./routes/job");
var recruiterRouter = require("./routes/recruiter");
var firebaseRouter = require("./routes/firebase");
var candidateRouter = require("./routes/candidate");

var app = express();


const connection = mongoose.connect(
  ""
);
console.log("Connecting..");

connection.then(
  (db) => {
    console.log("Connected Successfully");
  },
  (error) => {
    console.log("Error in connectivity");
    console.log(error);
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(cors({ credentials:true, origin: "http://localhost:3001" }));
//app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  // other headers...
  next();
});
// Step 3  Using Routes
app.use("/", indexRouter);
app.use("/api/v1", jobRouter);
app.use("/api/v1", recruiterRouter);
app.use("/api/v1", firebaseRouter);
app.use("/api/v1", candidateRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var compression = require("compression");
var helmet = require("helmet");
var layout = require("express-ejs-layouts");
var mongoose = require("mongoose");

require("dotenv").config();

// variables
let isAdmin = false;
const { ADMIN_PASSWORD = "Name of famous Slovak Tour de France cyclist. Format:<Firstname> <Lastname>", MONGODB_URI } = process.env;

// router variables
var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var shopRouter = require("./routes/shop");

// crate app
var app = express();

// connect to db
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(helmet());
app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req,res,next) =>{
  res.header("Content-Security-Policy", "*");
  next();
})

app.use(layout);
app.set("layout", "layouts/main");

app.use((req, res, next) => {
  if (req.body.password === ADMIN_PASSWORD) isAdmin = true;
  res.locals.isAdmin = isAdmin;
  next();
});
app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/shop", shopRouter);

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
  res.render("error", { layout: false });
});

module.exports = app;

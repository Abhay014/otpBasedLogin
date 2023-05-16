// requiring packages

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const loginRoute = require("./routes/login");

//creating express app
const app = express();

//configuring env file and initialzing vairables
const dotenv = require("dotenv");
dotenv.config();
const mongodb_url = process.env.MONGODB_URL;

//cross site resource sharing passport for authenticaiton parser 
app.use(cors());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));


// listing and running the server on a port
const PORT = 8004;

app.listen(PORT, (error) => {
  if (!error) {
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  } else console.log("Error occurred, server can't start", error);
});



// connecting mongoose with mongodb
mongoose.set("strictQuery", true);
mongoose.connect(
  `${mongodb_url}`
);


//checking for conformation of connectivity for database

const db = mongoose.connection;
db.on(
  "error",
  console.error.bind(
    console,
    "connection error: failed"
  )
);
db.on("open", () => {
  console.log("database connected!!");
});


// home route

app.get("/", (req, res) => {
  res.send("hello");
});
//using login routes and controller 
app.use("/otpBasedLogin/api", loginRoute);




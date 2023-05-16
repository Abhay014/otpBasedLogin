// requirements

const jwt = require("jsonwebtoken");
const nodemail = require("nodemailer")
const otpModel = require("../models/otp")
const blockedModel = require("../models/blocked")
//env
const env = require('dotenv');
env.config();

// controller for generating otp
module.exports.genrateOtp = async (req, res) => {
  try {
    
    // getting data
    const email = req.body.email;
    // checking if the user is not blocked
    if (await blockedModel.findOne({ email: email })) {

      return res.status(200).send({"message":"email is blocked try again in 1 hour "});
      
    }
    // initializing email sender and credentials
    const senderEmail = process.env.SENDER_EMAIL
    const senderPassword = process.env.SENDER_PASSWORD
    const transporter = nodemail.createTransport({
      service: "hotmail",
      auth: {
        user: `${senderEmail}`,
        pass:`${senderPassword}`
      }
    })

    //generating otp
    const otp = Math.floor(100000 + Math.random() * 900000);
    // checking for 1 minute compleiton and clearing database to remove otp repitiion
        try {
        
          const records = await otpModel.findOne({ email: email });
          // if otp already sent 
          if (records) {
            //getting otp time and current time
            const otpTime = records.timestamp.getTime()
            const presentTime = new Date().getTime()

            //if time grater than one minute
            if ((presentTime - otpTime)>60000) {
              // deleting old otp
            await otpModel.deleteMany({ email: email });
            } else {
              // sending one minute response
             return res.status(200).send({ "message":"You can only request for otp after one minute please wait"});
              
            }
           
        } 
      } catch (e) {
        return res.status(400).send("Not OK! : " + e);
      }
// email template
    const options = {
      from: `${senderEmail}`,
      to: `${email}`,
      subject: "Sending email with node.js for otp based login assignment ",
      text: `Hello, we are from a great company thank you for login in here is your otp please login withen one minute OTP: ${otp} `
    }


     const sentMail =await transporter.sendMail(options)
    if (sentMail.accepted ) {
      //saving otp and email in database if email is sent
      try {
              let dummyData = {
                otp: otp,
                email: email,
                timestamp:new Date(),
                otpCount: 0
        };
               
          const otpData = new otpModel(dummyData);
          await otpData.save();
        
            } catch (e) {
        return res.status(400).send({ "Not OK! : " :e.message });
            }
    }
// email sent response
    return res.status(200).send({ "message":"email sent"});
    
    
  } catch (e) {
    return res.status(400).send({ "Not OK! : ": e.message });
  }
}

//controller for login
module.exports.login = async (req, res) => {
  try {
    //getting data
    const email= req.body.email;
    const otp = req.body.otp;

   //checking for data in database
    const otpRecord = await otpModel.findOne({
      email: email,
    });
    
    
 
    if (otpRecord) {
      //if otp is sent
      
      if (otpRecord.otp === otp) {
          //if otp is correct creating jwt token
          const user = {
            email:email
          }
          let token = await jwt.sign({ user }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d",
          });
        //deleting otp from database
        await otpModel.deleteMany({ email: email });
        //sending jwt token in response
          return res
            .status(200)
            .send({ message: "login successful", token: token });
    
        } else {
          // updating count or number of wrong attempts
          const updateCount = otpRecord.otpCount + 1;
        
       await otpModel.findOneAndUpdate({ email: email }, { otpCount: updateCount })
       const updatedRecord = await otpModel.findOne({
        email: email,
       });
        //if 5 wrong attempts blocking user email
          if (updatedRecord.otpCount >=5) {

            await otpModel.deleteMany({ email: email });

          const blockedData = new blockedModel({ email: email });
          await blockedData.save();
          return res.status(200).send({"message":"to many attempts account blocked for 1 hour"});
          } else {
            //response for warning user of number or wrong attempts
            return res.status(200).send({"message":`invalid otp this is your ${updatedRecord.otpCount} incorrect attempt.  5 incorrect attempts and your account will be blocked for 1 hour`})
          }
        }
            
    } else {

      //if user takes more than 5 minutes or wrong email is given
  return res.status(400).send({"message":"no data for this email wrong email or late attempt please try again"})

    }
    

  } catch (error) {
    return res.status(400).send({ "Not OK! : ": error.message });
  }
};
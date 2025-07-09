// SOURCE: https://www.youtube.com/watch?v=i4HZg2TufcM

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const moment = require("moment");

dotenv.config();

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.OAUTH_CLIENTID,
//   process.env.OAUTH_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );

// oAuth2Client.setCredentials({
//   access_token: process.env.OAUTH_ACCESS_TOKEN,
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    // type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    // clientId: process.env.OAUTH_CLIENTID,
    // clientSecret: process.env.OAUTH_CLIENT_SECRET,
    // refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    // accessToken: oAuth2Client.getAccessToken(),
    // access_type: "offline",
  },
});

const FormatMail = (email, link) => {
  const html =
    `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  background-color: #f0f0f0;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 5px;
                  overflow: hidden;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  background-color: #4CAF50;
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
              }
              .content {
                  padding: 20px;
              }
              .footer {
                  background-color: #4CAF50;
                  color: #ffffff;
                  text-align: center;
                  padding: 10px;
                  font-size: 12px;
              }
              h1 {
                  margin: 0;
              }
              .button {
                  display: inline-block;
                  background-color: #4CAF50;
                  color: #ffffff !important;
                  text-decoration: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  margin-top: 5px;
                  margin-bottom: 10px;
                  font-weight: bold;
              }
              .button:hover,
              .button:visited,
              .button:active {
                  background-color: #45a049;
                  color: #ffffff !important;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Password Reset</h1>
              </div>
              <div class="content">
                  <h2>Reset Your Password</h2>
                  <p>Hello ${email},</p>
                  <p>We received a request to reset your password. If you didn't make this request, you can report this email to our support team.</p>
                  <p>To reset your password, please click the button below:</p>
                  <a href="${link}" class="button">Reset Password</a>
                  <p>This link will expire in 30 minutes for security reasons.</p>
                  <p>If you need further assistance, please contact our support team.</p>
              </div>
              <div class="footer">
                  <p>&copy; 2025 Cavite State University - Bacoor Campus. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `

  return html
};

const MailForApplicantStatus = (email, status) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #4CAF50;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .content {
                padding: 20px;
            }
            .footer {
                background-color: #4CAF50;
                color: #ffffff;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }
            h2 {
                margin: 0 0 10px;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: #ffffff !important;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
            }
            .button:hover {
                background-color: #45a049;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Application Status Update</h1>
            </div>
            <div class="content">
                <h4>Hello ${email},</h4>
                <p>We wanted to let you know that your application status has been updated.</p>
                <p><strong>New Status:</strong> ${status}</p>
                <p>To view the full details and next steps, please log in to the Applicant Portal:</p>
                <a href="https://cvsu-bacoor.netlify.app/" class="button">View Application</a>
                <p>If you did not initiate this application or have concerns, please contact our admissions team immediately.</p>
                <p>Thank you for choosing Cavite State University – Bacoor Campus.</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Cavite State University - Bacoor Campus. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return html;
};

const MailForApplicantExamDetails = (email, examDetails) => {
  const { batch_no, date, time, venue } = examDetails;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #4CAF50;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .content {
                padding: 20px;
            }
            .footer {
                background-color: #4CAF50;
                color: #ffffff;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }
            h2, h4 {
                margin: 0 0 10px;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: #ffffff !important;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
            }
            .button:hover {
                background-color: #45a049;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>College Admission Exam Schedule</h1>
            </div>
            <div class="content">
                <h4>Hello ${email},</h4>
                <p>Your entrance examination schedule has been successfully assigned. Below are the details:</p>
                <p><strong>Batch No:</strong> ${batch_no}</p>
                <p><strong>Date:</strong> ${moment(date).format("MMMM DD, YYYY")}</p>
                <p><strong>Time:</strong> ${moment(`2000-01-01T${time}`).format("h:mm A")}</p>
                <p><strong>Venue:</strong> ${venue}</p>
                <p>A test permit has also been generated for you. Please download it from the Applicant Portal and bring a printed copy on the day of your exam.</p>
                <a href="https://cvsu-bacoor.netlify.app/" class="button">Go to Applicant Portal</a>
                <p>If you have questions or concerns, please contact our admissions office.</p>
                <p>Best of luck, and thank you for choosing Cavite State University – Bacoor Campus.</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Cavite State University - Bacoor Campus. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return html;
};

const MailForApplicationUpdate = (email, title, message) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #1565c0;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
            }
            .content {
                padding: 20px;
            }
            .footer {
                background-color: #1565c0;
                color: #ffffff;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }
            .button {
                display: inline-block;
                background-color: #1565c0;
                color: #ffffff !important;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
            }
            .button:hover {
                background-color: #0d47a1;
            }
            h2 {
                margin-top: 0;
            }
            .message-box {
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title}</h1>
            </div>
            <div class="content">
                <h3>Hello ${email},</h3>
                <p>There has been an update regarding your application with Cavite State University – Bacoor Campus.</p>
                <div class="message-box">
                  <p>${message}</p>
                </div>
                <p>Please log in to your Applicant Portal to view the latest messages regarding your application status.</p>
                <a href="https://cvsu-bacoor.netlify.app/auth" class="button">Open Applicant Portal</a>
                <p>Thank you!</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Cavite State University - Bacoor Campus. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return html;
};

const MailForInitialStudentCredentials = (email, studentId) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #2e7d32;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .header h1, .header h2 {
                margin: 0;
                line-height: 1.4;
            }
            .header h2 {
                font-weight: normal;
                font-size: 1.5em;
            }
            .content {
                padding: 20px;
            }
            .footer {
                background-color: #2e7d32;
                color: #ffffff;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }
            h2, h4 {
                margin: 0 0 10px;
            }
            .credentials-box {
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                padding: 15px;
                margin: 15px 0;
                border-radius: 4px;
            }
            .button {
                display: inline-block;
                background-color: #2e7d32;
                color: #ffffff !important;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
            }
            .button:hover {
                background-color: #256428;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Cavite State University</h1>
                <h2>Bacoor Campus</h2>
            </div>
            <div class="content">
                <h4>Congratulations! ${email},</h4>
                <p>We are thrilled to inform you that you have successfully completed all admission requirements and are now officially a student of Cavite State University – Bacoor Campus!</p>
                <p>Below are your initial login credentials for the Student Portal:</p>
                <div class="credentials-box">
                    <p><strong>Student ID / Initial Username:</strong> ${studentId}</p>
                    <p><strong>Temporary Password:</strong> User12345</p>
                </div>
                <p>Please log in and update your password upon first access to secure your account.</p>
                <a href="https://cvsu-bacoor.netlify.app/auth" class="button">Access Student Portal</a>
                <p>Note: Your applicant account is now disabled and you will no longer be able to access it.</p>
                <p>If you have any questions or need assistance, feel free to contact the Admin Support of the university.</p>
                <p>We look forward to having you on campus and being part of your academic journey.</p>
                <p><strong>Welcome to CvSU – Bacoor Campus!</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Cavite State University - Bacoor Campus. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return html;
};

const MailForOTP = (email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
                line-height: 1.6;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #2e7d32;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
            .header h1, .header h2 {
                margin: 0;
                line-height: 1.4;
            }
            .header h2 {
                font-weight: normal;
                font-size: 1.5em;
            }
            .content {
                padding: 20px;
            }
            .otp-box {
                background-color: #f9f9f9;
                border: 1px dashed #2e7d32;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                text-align: center;
                font-size: 24px;
                letter-spacing: 6px;
                font-weight: bold;
                color: #2e7d32;
            }
            .footer {
                background-color: #2e7d32;
                color: #ffffff;
                text-align: center;
                padding: 10px;
                font-size: 12px;
            }
            p {
                margin-bottom: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Cavite State University</h1>
                <h2>Bacoor Campus</h2>
            </div>
            <div class="content">
                <h4>Hello ${email},</h4>
                <p>To complete your verification, please use the One-Time Password (OTP) provided below:</p>
                <div class="otp-box">${otp}</div>
                <p>This OTP is valid for the next 5 minutes. Do not share this code with anyone for security reasons.</p>
                <p>If you did not request this, please ignore this email or contact support immediately.</p>
                <p>Thank you for using our services.</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Cavite State University - Bacoor Campus. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return html;
};

const Send = async (email, link) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "ERS | Cavite State University - Bacoor Campus",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: "Reset Password Access",
          html: FormatMail(email, link), // html body
        },
        (err, info) => {
          if (err) {
            reject(err);
            return err.message
          } else {
            // console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    return err.message;
  }
};

const SendOTP = async (email, otp) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "ERS | Cavite State University - Bacoor Campus",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: "Login Verification",
          html: MailForOTP(email, otp), // html body
        },
        (err, info) => {
          if (err) {
            reject(err);
            return err.message
          } else {
            // console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    return err.message;
  }
};

const SendApplicantStatus = async (email, status) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "Admissions | Cavite State University - Bacoor Campus",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: "Applicant Status Update",
          html: MailForApplicantStatus(email, status), // html body
        },
        (err, info) => {
          if (err) {
            reject(err);
            return err.message
          } else {
            // console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    return err.message;
  }
};

const SendApplicantExamDetails = async (email, examDetails) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "Admissions | Cavite State University - Bacoor Campus",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: "Applicant Exam Update",
          html: MailForApplicantExamDetails(email, examDetails), // html body
        },
        (err, info) => {
          if (err) {
            reject(err);
            return err.message
          } else {
            // console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    return err.message;
  }
};

const SendApplicantUpdates = async (email, title, message) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "Admissions | Cavite State University - Bacoor Campus",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: "Applicant Update",
          html: MailForApplicationUpdate(email, title, message), // html body
        },
        (err, info) => {
          if (err) {
            reject(err);
            return err.message
          } else {
            // console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    return err.message;
  }
};

const SendStudentAccount = async (email, studentId) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "Cavite State University - Bacoor Campus",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: "Student Account",
          html: MailForInitialStudentCredentials(email, studentId), // html body
        },
        (err, info) => {
          if (err) {
            reject(err);
            return err.message
          } else {
            // console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    return err.message;
  }
};

// const SendEmail = async (email, subject, text, status) => {
//   try {
//     const result = await new Promise((resolve, reject) => {
//       transporter.sendMail(
//         {
//           from: {
//             name: "ERS | Cavite State University",
//             address: process.env.MAIL_USERNAME,
//           },
//           to: email,
//           subject: subject,
//           text: text,
//           html: FormatSendEmail(email, status), // html body
//         },
//         (err, info) => {
//           if (err) {
//             console.error(err);
//             reject(err);
//           } else {
//             console.log("email sent");
//             resolve(info);
//           }
//         }
//       );
//     });

//     return result;
//   } catch (err) {
//     console.log(err);
//   }
// };


module.exports = {
  Send,
  SendApplicantStatus,
  SendApplicantUpdates,
  SendApplicantExamDetails,
  SendStudentAccount,
  SendOTP
  //SendEmail
};
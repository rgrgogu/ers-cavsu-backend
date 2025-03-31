const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')

const User = require("./model");
const Profile = require("../../applicant/profile/app_profile.model")

const BCrypt = require("../../../global/config/BCrypt");
const { CreateEmailToken, VerifyTokenInReset, CreateAccessToken, CreateRefreshToken, VerifyRefreshToken } = require("../../../global/functions/CreateToken");
const CheckUser = require("../../../global/functions/CheckUser");
const { Send } = require("../../../global/config/Nodemailer")

const STATIC_ROLE = "student"

const Login = async (req, res) => {
  try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: username });

      const checkResult = await CheckUser(user, password, "Student");

      if (checkResult.isValid) {
          if (user.isArchived) throw new Error('User deactivated. Please contact the admin.');

          const accessToken = CreateAccessToken(user._id, STATIC_ROLE);
          const refreshToken = CreateRefreshToken(user._id, STATIC_ROLE);

          // Assigning refresh token in http-only cookie 
          res.cookie('refreshToken', refreshToken, {
              httpOnly: true,
              sameSite: 'None',
              secure: true,
              maxAge: 24 * 60 * 60 * 1000
          });

          if (checkResult.mustResetPassword) {
              // Return a specific status and message for password reset
              return res.status(200).json({
                  mustResetPassword: true,
                  message: "Login successful, but please reset your default password before proceeding.",
                  user: user, // Optionally include user data if needed for reset flow
                  accessToken
              });
          }

          res.status(200).json({ 
              user: user, 
              accessToken 
          });
      }
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
}

const Refresh = async (req, res) => {
  if (req.cookies?.refreshToken) {
    // Destructuring refreshToken from cookie
    const { id } = req.params;
    const refreshToken = req.cookies.refreshToken;
    const valid = VerifyRefreshToken(refreshToken)

    if (valid) {
      // Correct token we send a new access token
      const accessToken = CreateAccessToken(id, STATIC_ROLE)
      return res.json({ accessToken });
    }
    else
      // Wrong Refesh Token
      return res.status(406).json({ message: 'Unauthorized' });
  } else {
    console.log(req.cookies)
    return res.status(406).json({ message: 'Unauthorized' });
  }
}

const Register = async (req, res) => {
  try {
    const count = await User.countDocuments() + 1; // Get the next count
    const year = new Date().getFullYear();

    // Format count with leading zeros to be 6 digits
    const paddedCount = count.toString().padStart(6, '0');
    const user_id = `${year}${paddedCount}`; // e.g., 2025000001

    const acc = req.body;
    acc.username = user_id

    acc.password = await BCrypt.hash(process.env.DEFAULT_PASS)
    const data = await User.create({ ...acc, student_id: student_id })

    // await Profile.create({ user_id: data.id })

    res.status(201).json({ message: 'User created', data });
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const RequestReset = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      res.status(400).send({
        message: "Invalid email address.",
      });
    }

    const find = await User.findOne({ email: email })

    if (find) {
      const token = CreateEmailToken(email);
      const link = `${process.env.DEV_LINK || process.env.PROD_LINK}/${STATIC_ROLE}/verify/${token}`
      await Send(email, link);

      res.status(200).json({ message: 'Sent password successfully' });
    }
    else {
      res.status(400).json({ message: 'Email doesn\'t exist.' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const Verify = async (req, res) => {
  try {
    const token = req.params.token;
    VerifyTokenInReset(token)
    res.status(200).send("Verfication successful");
  } catch (error) {
    res.status(401).send(error.message);
  }
}

const ChangePass = async (req, res) => {
  try {
    const token = req.params.token;
    const data = req.body;

    const email = VerifyTokenInReset(token)

    if (email && data.confirm === data.password) {
      await User.findOneAndUpdate(
        { email: email },
        { password: await BCrypt.hash(data.password) },
      )

      res.status(200).json("Password successfully changed");
    }
    else
      res.status(400).json("Password doesn't matched.");
  } catch (error) {
    res.status(400).send(error);
  }
}

module.exports = {
  Login,
  Refresh,
  Register,
  RequestReset,
  Verify,
  ChangePass,
};

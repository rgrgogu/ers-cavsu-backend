const mongoose = require("mongoose");

const User = require("./adm_login.model");

const BCrypt = require("../../../global/config/BCrypt");

const { CreateAccessToken, CreateRefreshToken, VerifyRefreshToken } = require("../../../global/functions/CreateToken");
const CheckUser = require("../../../global/functions/CheckUser");

const Login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.find({ username: username },);
    const valid = await CheckUser(user, password, "Admin");

    if (valid) {
      const accessToken = CreateAccessToken(user._id)
      const refreshToken = CreateRefreshToken(user._id)

      // Assigning refresh token in http-only cookie 
      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          sameSite: 'None', secure: true,
          maxAge: 24 * 60 * 60 * 1000
      });

      res.status(200).json({ user: user[0], accessToken })
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const Refresh = async (req, res) => {
  if (req.cookies?.refreshToken) {
    // Destructuring refreshToken from cookie
    const {id} = req.params;
    const refreshToken = req.cookies.refreshToken;
    const valid = VerifyRefreshToken(refreshToken)

    if(valid){
      // Correct token we send a new access token
      const accessToken = CreateAccessToken(id)
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
    const user_id = `${year}ADMIN${paddedCount}`; // e.g., 2025A000001

    const acc = req.body;
    acc.password = await BCrypt.hash(acc.password)
    const data = await User.create({...acc, user_id: user_id})
    res.status(201).json({ message: 'User created', data });
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  Login,
  Refresh,
  Register,
};

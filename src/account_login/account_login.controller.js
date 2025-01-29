const mongoose = require("mongoose");

const User = require("./account_login.model");
const Profile = require("../profile/profile.model")

const BCrypt = require("../../global/config/BCrypt");
// const { Send, sendEmail } = require("../../global/config/Nodemailer");

const GenerateID = require("../../global/functions/GenerateID");
// const GeneratePIN = require("../../global/functions/GeneratePIN");
const GetAccountType = require("../../global/functions/GetAccountType");
const ReturnValidID = require("../../global/functions/ReturnValidID");
const CreateToken = require("../../global/functions/CreateToken");
const ValidateInput = require("../../global/functions/ValidateInput");
const CheckUser = require("../../global/functions/CheckUser");

const Login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const type = ValidateInput(username)

    if (type === "email") {
      res.status(200).json("hahaha xD")
    }
    else if (type === "contact") {
      res.status(200).json("hahaha xD")
    }
    else {
      const user = await User.find(
        { username: username },
        { _id: 1, acc_status: 1, password: 1, isArchived: 1, account_type: 1, brgy: 1, }
      );

      const valid = await CheckUser(user, password, res);

      if (valid) {
        const token = CreateToken(user._id)
        res.status(200).json({ user: user[0], token: token })
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const RegisterWithVerify = async (req, res) => {
  try {
    const { verification_folder_id } = req.query;
    const { body, files } = req;
    const user = JSON.parse(body.user);
    const selfie = files.pop();

    const increment = await Profile.countDocuments({}).exec();
    const brgys = await BrgyInfo.find({}).sort({ createdAt: 1 }).exec();
    const index = brgys.findIndex((item) => item.brgy === user.brgy) + 1;

    if (index === -1) {
      res.status(400).json({ error: 'Barangay not found. Try again' });
    }

    const user_id = GenerateID(index + 1, "resident", increment + 1);

    const created_user = await Profile.create({
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      birthday: user.birthday,
      address: user.address,
      verification: await ReturnValidID(user_id, user.verification, files, verification_folder_id, selfie),
    })

    if (!created_user)
      res.status(400).json({ error: 'User cannot create. Try again' })

    await User.create({
      user_id: user_id,
      email: user.email,
      contact: user.contact,
      username: user.username,
      password: await BCrypt.hash(user.password),
      account_type: 'Resident',
      brgy: user.address.brgy,
      profile: created_user.id,
    })

    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const RegisterWithoutVerify = async (req, res) => {
  try {
    const user = req.body
    const increment = await Profile.countDocuments({}).exec();
    const brgys = await BrgyInfo.find({}).sort({ createdAt: 1 }).exec();
    const index = brgys.findIndex((item) => item.brgy === user.brgy) + 1;

    if (index === -1) {
      res.status(400).json({ error: 'Barangay not found. Try again' });
    }

    const user_id = GenerateID(index + 1, user.type, increment + 1);

    const created_user = await Profile.create({
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      birthday: user.birthday,
      address: user.address,
    })

    if (!created_user)
      res.status(400).json({ error: 'User cannot create. Try again' })

    await User.create({
      user_id: user_id,
      email: user.email,
      contact: user.contact,
      username: user.username,
      password: await BCrypt.hash(user.password),
      account_type: GetAccountType(user.type),
      brgy: user.address.brgy,
      profile: created_user.id,
      acc_status: 'Fully Verified'
    })

    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  Login,
  RegisterWithVerify,
  RegisterWithoutVerify,
};

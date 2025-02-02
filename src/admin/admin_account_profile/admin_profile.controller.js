const mongoose = require("mongoose");

const Profile = require("./admin_profile.model")
const User = require("../admin_account_login/admin_account_login.model")

const CreateProfile = async (req, res) => {
  try {
    const APPLICANT_ID = req.query.id;
    const result = await Profile.create({...profile})

    await User.findOneAndUpdate(
      { user_id: APPLICANT_ID },
      { $set: { "profile": result.id }},
      { new: true } 
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  CreateProfile
};

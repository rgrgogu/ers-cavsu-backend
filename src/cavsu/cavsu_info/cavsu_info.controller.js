const mongoose = require("mongoose");

const Info = require("./cavsu_info.model");

const RegisterApplicant = async (req, res) => {
  try {
    const acc = req.body;
    acc.password = await BCrypt.hash(acc.password)
    await User.create({...acc})
    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  CreateCavsu
};

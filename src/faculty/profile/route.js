const express = require("express");
const router = express.Router();

const ProfileController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");


router.put("/update_profile/:id", RequireAuth, ProfileController.Update);

module.exports = router;
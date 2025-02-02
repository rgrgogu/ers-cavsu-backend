const express = require("express");
const router = express.Router();

const {
    CreateProfile
} = require("./admin_profile.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.post("/create_profile", RequireAuth, CreateProfile);

module.exports = router;
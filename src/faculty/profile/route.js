const express = require("express");
const router = express.Router();

const {
    GetProfile,
    CreateProfile
} = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_profile/:id", RequireAuth, GetProfile)
router.post("/create/:id", RequireAuth, CreateProfile);

module.exports = router;
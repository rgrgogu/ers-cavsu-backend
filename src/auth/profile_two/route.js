const express = require("express");
const router = express.Router();

const {
    GetProfile,
    CreateProfile,
    UpdateProfile
} = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_profile/:id", RequireAuth, GetProfile)
router.post("/create/:id", RequireAuth, CreateProfile);
router.put("/edit_profile/:id", RequireAuth, UpdateProfile);

module.exports = router;
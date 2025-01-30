const express = require("express");
const router = express.Router();

const {
    Login,
    Refresh,
    RegisterApplicant
} = require("./account_login.controller");

const upload = require("../../global/config/Multer");
const RequireAuth = require("../../global/middleware/RequireAuth");

router.post("/login", Login);
router.post("/refresh", Refresh);
router.post("/register_applicant", RegisterApplicant);

module.exports = router;
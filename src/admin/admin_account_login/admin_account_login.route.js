const express = require("express");
const router = express.Router();

const {
    Login,
    Refresh,
    RegisterApplicant
} = require("./admin_account_login.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.post("/login", Login);
router.post("/refresh", RequireAuth, Refresh);
router.post("/register", RegisterApplicant);

module.exports = router;
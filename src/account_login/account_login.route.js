const express = require("express");
const router = express.Router();

const {
    Login,
    RegisterWithVerify,
    RegisterWithoutVerify
} = require("./account_login.controller");

const upload = require("../../global/config/Multer");
const RequireAuth = require("../../global/middleware/RequireAuth");

router.post("/login", Login);
router.post("/register_with_verify", upload.array('files', 10), RegisterWithVerify);
router.post("/register_without_verify", RequireAuth, RegisterWithoutVerify);

module.exports = router;
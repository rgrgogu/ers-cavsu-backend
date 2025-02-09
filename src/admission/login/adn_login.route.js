const express = require("express");
const router = express.Router();

const {
    Login,
    Refresh,
    Register
} = require("./adn_login.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.post("/login", Login);
router.post("/register", Register);
router.post("/refresh/:id", RequireAuth, Refresh);

module.exports = router;
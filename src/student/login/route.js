const express = require("express");
const router = express.Router();

const {
    Login,
    Refresh,
    Register,
    RequestReset,
    Verify,
    ChangePass,
    ChangePassInitial
} = require("./controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/verify/:token", Verify)
router.post("/login", Login);
router.post("/register", Register);
router.post("/refresh/:id", RequireAuth, Refresh);
router.post("/reset/:email", RequestReset);
router.put("/change_pass/:token", ChangePass);
router.put("/change_pass_initial/:id", ChangePassInitial);

module.exports = router;
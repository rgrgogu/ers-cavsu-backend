const express = require("express");
const router = express.Router();

const LoginController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/verify/:token", LoginController.Verify)
router.post("/login", LoginController.Login);
router.post("/login_otp", LoginController.LoginOTP);
router.post("/register", LoginController.Register);
router.post("/reset", LoginController.RequestReset);
router.post("/refresh/:id/:role", RequireAuth, LoginController.Refresh);
router.put("/change_pass", RequireAuth, LoginController.ChangePass);
router.put("/initial_reset/:id", RequireAuth, LoginController.InitialReset);
router.get('/refresh_profile/:id', RequireAuth, LoginController.GetUserById);

module.exports = router;
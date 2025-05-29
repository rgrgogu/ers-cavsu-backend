const express = require("express");
const router = express.Router();
const DashboardAdminController = require("./controller");

// const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/", DashboardAdminController.getUserCounts);

module.exports = router;
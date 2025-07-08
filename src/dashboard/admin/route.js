const express = require("express");
const router = express.Router();
const DashboardAdminController = require("./controller");

// const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/", DashboardAdminController.getUserCounts);
router.get("/admin_dashboard", DashboardAdminController.getAdminDashboard);
router.get("/get_landing_counts", DashboardAdminController.getLandingCounts);

module.exports = router;
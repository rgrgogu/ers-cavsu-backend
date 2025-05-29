const express = require("express");
const router = express.Router();
const AdmissionDashboardController = require("./controller");

// const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/", AdmissionDashboardController.getDashboardCounts);

module.exports = router;
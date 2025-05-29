const express = require("express");
const router = express.Router();
const RegistrarDashboardController = require('./controller');

// const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/", RegistrarDashboardController.getDashboardCounts);

module.exports = router;
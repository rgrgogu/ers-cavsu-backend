const express = require("express");
const router = express.Router();

const {
    GetLogs,
    UpdateApplicantLog
} = require("./appntment_logs.controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/appointment_logs/get_logs/:id", RequireAuth, GetLogs)
router.put("/appointment_logs/update_log", RequireAuth, UpdateApplicantLog)

module.exports = router;
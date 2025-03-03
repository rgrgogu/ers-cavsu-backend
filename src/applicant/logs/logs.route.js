const express = require("express");
const router = express.Router();

const {
    GetLogs,
    UpdateApplicantLog
} = require("./logs.controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_logs/:id", RequireAuth, GetLogs)
router.put("/update_log", RequireAuth, UpdateApplicantLog)

module.exports = router;
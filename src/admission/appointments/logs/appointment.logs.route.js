const express = require("express");
const router = express.Router();

const {
    GetLogs,
    MassUpdateLogs,
    ChangeAppointmentLogsByApplicant
} = require("./appointment.logs.controller");

const upload = require("../../../../global/config/Multer");
const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_logs/:id", RequireAuth, GetLogs)
router.put("/mass_update_logs", RequireAuth, MassUpdateLogs)
router.put("/update_log", RequireAuth, ChangeAppointmentLogsByApplicant)

module.exports = router;
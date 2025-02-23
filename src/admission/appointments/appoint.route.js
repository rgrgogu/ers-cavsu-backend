const express = require("express");
const router = express.Router();

const {
    GetAppointments,
    GetSelectedAppointees
} = require("./appoint.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_appointments", RequireAuth, GetAppointments)
router.get("/get_selected_appointees", RequireAuth, GetSelectedAppointees)

module.exports = router;
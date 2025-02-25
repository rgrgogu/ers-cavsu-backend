const express = require("express");
const router = express.Router();

const {
    GetLogs,
    MassUpdateLogs,
} = require("./logs.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_logs/:id", RequireAuth, GetLogs)
router.put("/mass_update_logs", RequireAuth, MassUpdateLogs)

module.exports = router;
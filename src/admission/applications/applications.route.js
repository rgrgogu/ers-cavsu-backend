const express = require("express");
const router = express.Router();

const {
    GetApplications
} = require("./applications.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_applications", RequireAuth, GetApplications)

module.exports = router;
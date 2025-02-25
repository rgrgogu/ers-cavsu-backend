const express = require("express");
const router = express.Router();

const {
    GetApplications,
    GetNewApplicants,
    GetApplication
} = require("./applications.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_applications", RequireAuth, GetApplications)
router.get("/get_applications_grpA", RequireAuth, GetNewApplicants)
router.get("/get_application/:id", RequireAuth, GetApplication)

module.exports = router;
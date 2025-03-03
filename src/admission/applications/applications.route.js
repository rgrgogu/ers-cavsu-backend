const express = require("express");
const router = express.Router();

const {
    GetApplications,
    GetApplicants,
    GetApplication,
    GetExaminees,
    UpdateApplication
} = require("./applications.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

// router.get("/get_applications", RequireAuth, GetApplications)
router.get("/get_applications", RequireAuth, GetApplicants)
router.get("/get_application/:id", RequireAuth, GetApplication)
router.get("/get_examinees", RequireAuth, GetExaminees)
router.put("/mass_update", RequireAuth, UpdateApplication)

module.exports = router;
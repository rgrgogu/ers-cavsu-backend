const express = require("express");
const router = express.Router();

const {
    GetApplications,
    GetApplicants,
    GetApplication,
    GetExaminees,
    GetApplicantsByProgram,
    UpdateApplication,
    UpdateExamDetails
} = require("./applications.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

// router.get("/get_applications", RequireAuth, GetApplications)
router.get("/get_applications", RequireAuth, GetApplicants)
router.get("/get_application/:id", RequireAuth, GetApplication)
router.get("/get_examinees", RequireAuth, GetExaminees)
router.get("/get_applicants_prog", RequireAuth, GetApplicantsByProgram)
router.put("/mass_update", RequireAuth, UpdateApplication)
router.put("/mass_update_exam", RequireAuth, UpdateExamDetails)

module.exports = router;
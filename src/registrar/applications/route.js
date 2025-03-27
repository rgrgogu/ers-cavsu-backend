const express = require("express");
const router = express.Router();

const {
    GetApplicants,
    GetApplication,
    GetExaminees,
    GetApplicantsByProgram,
    UpdateApplication,
    UpdateExamDetails
} = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/get_applications", RequireAuth, GetApplicants)
router.get("/get_application/:id", RequireAuth, GetApplication)
router.get("/get_examinees", RequireAuth, GetExaminees)
router.get("/get_applicants_prog", RequireAuth, GetApplicantsByProgram)
router.put("/mass_update", RequireAuth, UpdateApplication)
router.put("/mass_update_exam", RequireAuth, UpdateExamDetails)

module.exports = router;
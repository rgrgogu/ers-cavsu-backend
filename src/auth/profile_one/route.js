const express = require("express");
const router = express.Router();

const ApplicantProfileController = require("./controller");
const { GetHoliday } = require("../../admission/holidays/holiday.controller")

const RequireAuth = require("../../../global/middleware/RequireAuth");

const upload = require("../../../global/config/Multer");
const uploadProfile = upload.single('file')
const uploadReqs = upload.array('files', 10)

router.get("/get_profile/:id", RequireAuth, ApplicantProfileController.GetProfile)
router.get("/get_holiday/:name", RequireAuth, GetHoliday);
router.get("/get_slots/:year/:month", RequireAuth, ApplicantProfileController.GetAppointmentSlots)
router.put("/edit_app_details/:id", RequireAuth, ApplicantProfileController.EditApplicationDetails);
router.put("/edit_app_profile/:id", uploadProfile, RequireAuth, ApplicantProfileController.EditApplicantProfile);
router.put("/edit_app_family/:id", RequireAuth, ApplicantProfileController.EditFamilyProfile);
router.put("/edit_app_education/:id", RequireAuth, ApplicantProfileController.EditEducationalProfile);
router.put("/edit_app_upload/:id", uploadReqs, RequireAuth, ApplicantProfileController.EditUploadRequirements);
router.put("/edit_appointment/:id", RequireAuth, ApplicantProfileController.EditAppointment);
router.put("/update_status/:id", RequireAuth, ApplicantProfileController.UpdateApplication);

module.exports = router;
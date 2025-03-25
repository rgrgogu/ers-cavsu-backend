const express = require("express");
const router = express.Router();

const {
    GetProfile,
    GetAppointmentSlots,
    // SubmitApplication,
    EditApplicationDetails,
    EditApplicantProfile,
    EditFamilyProfile,
    EditEducationalProfile,
    EditUploadRequirements,
    EditAppointment,
    UpdateApplication
} = require("./controller");
// const { GetHoliday } = require("../../admission/holidays/holiday.controller")

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

// const uploadFields = upload.fields([
//     { name: "id_pic", maxCount: 1 },
//     { name: "documents", maxCount: 5 }
// ]);

const uploadProfile = upload.single('file')
const uploadReqs = upload.array('files', 10)

router.get("/get_profile/:id", RequireAuth, GetProfile)
// router.get("/get_holiday/:name", RequireAuth, GetHoliday);
// router.get("/get_slots/:year/:month", RequireAuth, GetAppointmentSlots)
router.put("/edit_app_details/:id", RequireAuth, EditApplicationDetails);
router.put("/edit_app_profile/:id", uploadProfile, RequireAuth, EditApplicantProfile);
router.put("/edit_app_family/:id", RequireAuth, EditFamilyProfile);
router.put("/edit_app_education/:id", RequireAuth, EditEducationalProfile);
router.put("/edit_app_upload/:id", uploadReqs, RequireAuth, EditUploadRequirements);
// router.put("/edit_appointment/:id", RequireAuth, EditAppointment);
router.put("/update_status/:id", RequireAuth, UpdateApplication);

module.exports = router;
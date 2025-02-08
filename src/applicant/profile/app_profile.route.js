const express = require("express");
const router = express.Router();

const {
    SubmitApplication,
    EditApplicationDetails,
    EditApplicantProfile,
    EditFamilyProfile
} = require("./app_profile.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

const uploadFields = upload.fields([
    { name: "id_pic", maxCount: 1 },
    { name: "documents", maxCount: 5 }
]);

const uploadProfile = upload.single('file')

router.post("/submit_application", uploadFields, RequireAuth, SubmitApplication);
router.put("/edit_app_details/:id", RequireAuth, EditApplicationDetails);
router.put("/edit_app_profile/:id", uploadProfile, RequireAuth, EditApplicantProfile);
router.put("/edit_app_family/:id", uploadProfile, RequireAuth, EditFamilyProfile);

module.exports = router;
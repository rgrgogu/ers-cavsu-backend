const express = require("express");
const router = express.Router();

const {
    GetAllAdmissionGuide,
    CreateAdmissionGuide,
    EditAdmissionGuide,
    ArchiveAdmissionGuide
} = require("./admission_guide.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

const uploadFields = upload.array("files", 10);


router.get("/get_all_admission", RequireAuth, GetAllAdmissionGuide);
router.post("/create_admission", uploadFields, RequireAuth, CreateAdmissionGuide);
router.put("/edit_admission/:id", uploadFields, RequireAuth, EditAdmissionGuide);
router.put("/archive_admission/:id", RequireAuth, ArchiveAdmissionGuide);

module.exports = router;
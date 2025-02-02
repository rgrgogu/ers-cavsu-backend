const express = require("express");
const router = express.Router();

const {
    GetAllAdmissionGuide,
    CreateAdmissionGuide
} = require("./admission_guide.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

const uploadFields = upload.array("files", 10);

router.get("/get_all_admission", GetAllAdmissionGuide);
router.post("/create_admission", uploadFields, RequireAuth, CreateAdmissionGuide);

module.exports = router;
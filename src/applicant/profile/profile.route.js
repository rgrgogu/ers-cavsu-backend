const express = require("express");
const router = express.Router();

const {
    SubmitApplication,
} = require("./profile.controller");

const upload = require("../../../global/config/Multer");
const RequireAuth = require("../../../global/middleware/RequireAuth");

const uploadFields = upload.fields([
    { name: "id_pic", maxCount: 1 },
    { name: "documents", maxCount: 5 }
]);

router.post("/submit_application", uploadFields, RequireAuth, SubmitApplication);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
    GetAllERS,
    CreateERS,
    EditERS,
    ArchiveERS
} = require("./ers.controller");

const upload = require("../../../../global/config/Multer");
const RequireAuth = require("../../../../global/middleware/RequireAuth");

const uploadFields = upload.array("files", 10);

router.get("/get_all_ers", RequireAuth, GetAllERS);
router.post("/create_ers", uploadFields, RequireAuth, CreateERS);
router.put("/edit_ers/:id", uploadFields, RequireAuth, EditERS);
router.put("/archive_ers/:id", RequireAuth, ArchiveERS);

module.exports = router;
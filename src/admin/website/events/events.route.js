const express = require("express");
const router = express.Router();

const {
    GetAllEvents,
    CreateEvents,
    EditEvents,
    ArchiveEvents
} = require("./events.controller");

const upload = require("../../../../global/config/Multer");
const RequireAuth = require("../../../../global/middleware/RequireAuth");

const uploadFields = upload.array("files", 10);

router.get("/get_all_event", RequireAuth, GetAllEvents);
router.post("/create_event", uploadFields, RequireAuth, CreateEvents);
router.put("/edit_event/:id", uploadFields, RequireAuth, EditEvents);
router.put("/archive_event/:id", RequireAuth, ArchiveEvents);

module.exports = router;
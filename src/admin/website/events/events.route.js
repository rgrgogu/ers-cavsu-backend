const express = require("express");
const router = express.Router();

const {
    GetAll,
    Create,
    Edit,
    Archive
} = require("./events.controller");

const upload = require("../../../../global/config/Multer");
const RequireAuth = require("../../../../global/middleware/RequireAuth");

const uploadFields = upload.array("files", 10);

router.get("/get_all_event", RequireAuth, GetAll);
router.post("/create_event", uploadFields, RequireAuth, Create);
router.put("/edit_event/:id", uploadFields, RequireAuth, Edit);
router.put("/archive_event/:id", RequireAuth, Archive);

module.exports = router;
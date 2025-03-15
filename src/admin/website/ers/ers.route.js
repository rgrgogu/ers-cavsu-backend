const express = require("express");
const router = express.Router();

const {
    GetAll,
    Create,
    Edit,
    Archive
} = require("./ers.controller");

const upload = require("../../../../global/config/Multer");
const RequireAuth = require("../../../../global/middleware/RequireAuth");

const uploadFields = upload.array("files", 10);

router.get("/get_all_ers", RequireAuth, GetAll);
router.post("/create_ers", uploadFields, RequireAuth, Create);
router.put("/edit_ers/:id", uploadFields, RequireAuth, Edit);
router.put("/archive_ers", RequireAuth, Archive);

module.exports = router;
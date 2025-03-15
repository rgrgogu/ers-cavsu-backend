const express = require("express");
const router = express.Router();

const {
    GetOffices,
    CreateOffice,
    EditOffice,
    ArchiveOffice,
} = require("./office.controller");

const RequireAuth = require("../../../../../global/middleware/RequireAuth");

router.get("/get_all_offices", RequireAuth, GetOffices);
router.post("/create_office", RequireAuth, CreateOffice);
router.put("/edit_office/:id", RequireAuth, EditOffice);
router.put("/archive_office", RequireAuth, ArchiveOffice);

module.exports = router;
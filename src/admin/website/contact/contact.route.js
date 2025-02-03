const express = require("express");
const router = express.Router();

const {
    GetAllContact,
    CreateContact,
    EditContact,
    ArchiveContact
} = require("./contact.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_all_contact", RequireAuth, GetAllContact);
router.post("/create_contact", RequireAuth, CreateContact);
router.put("/edit_contact/:id", RequireAuth, EditContact);
router.put("/archive_contact/:id", RequireAuth, ArchiveContact);

module.exports = router;
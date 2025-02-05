const express = require("express");
const router = express.Router();

const {
    GetAll,
    Create,
    Edit,
} = require("./hero.controller");

const upload = require("../../../../global/config/Multer");
const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_hero", RequireAuth, GetAll);
router.post("/create_hero", upload.single("file"), RequireAuth, Create);
router.put("/edit_hero/:id", upload.single("file"), RequireAuth, Edit);

module.exports = router;
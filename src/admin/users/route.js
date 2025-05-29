const express = require("express");
const router = express.Router();
const UserController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/admins", RequireAuth, UserController.listAdmins);
router.get("/admissions", RequireAuth, UserController.listAdmissions);
router.get("/applicants", RequireAuth, UserController.listApplicants);
router.get("/faculty", RequireAuth, UserController.listFaculty);
router.get("/registrars", RequireAuth, UserController.listRegistrars);
router.get("/students", RequireAuth, UserController.listStudents);

router.post("/applicants", RequireAuth, UserController.massCreateStudents);
router.post("/create", RequireAuth, UserController.CreateAccount);
router.post("/create_fresh_admin", UserController.CreateFreshAdmin);
router.put("/mass_archive", RequireAuth, UserController.bulkArchive);
router.put("/mass_reset", RequireAuth, UserController.bulkResetPassword);
router.put("/mass_update_email", RequireAuth, UserController.bulkEmailUpdate)
router.put("/mass_update_year_level", RequireAuth, UserController.mass_update_year_level)

module.exports = router;
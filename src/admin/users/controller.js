const mongoose = require("mongoose");
const AdmLogin = require("../login/adm_login.model");
const AdnLogin = require("../../admission/login/adn_login.model");
const AppLogin = require("../../applicant/login/app_login.model");
const FacLogin = require("../../faculty/login/model");
const RegLogin = require("../../registrar/login/reg_login.model");
const StuLogin = require("../../student/login/model");

// Helper function to validate email
const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// UserController
const UserController = {
  // List all Admin users
  listAdmins: async (req, res) => {
    try {
      const admins = await AdmLogin.find({ isArchived: false })
        .select("-password") // Exclude password from response
        .sort({ createdAt: -1 });
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admins", error: error.message });
    }
  },

  // Create new Admin user
  createAdmin: async (req, res) => {
    try {
      const { email, name, birthdate, username, password, role } = req.body;

      // Validate required fields
      if (!email || !name || !birthdate || !username || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const newAdmin = new AdmLogin({
        email,
        name: {
          firstname: name.firstname || '',
          middlename: name.middlename || '',
          lastname: name.lastname || '',
          extension: name.extension || ''
        },
        birthdate,
        username,
        password,
        role: role || 'Admin'
      });

      const savedAdmin = await newAdmin.save();
      res.status(201).json(savedAdmin);
    } catch (error) {
      res.status(500).json({ message: "Error creating admin", error: error.message });
    }
  },

  // List all Admission users
  listAdmissions: async (req, res) => {
    try {
      const admissions = await AdnLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(admissions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admissions", error: error.message });
    }
  },

  // Create new Admission user
  createAdmission: async (req, res) => {
    try {
      const { email, name, birthdate, username, password, role } = req.body;

      if (!email || !name || !birthdate || !username || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const newAdmission = new AdnLogin({
        email,
        name: {
          firstname: name.firstname || '',
          middlename: name.middlename || '',
          lastname: name.lastname || '',
          extension: name.extension || ''
        },
        birthdate,
        username,
        password,
        role: role || 'Admission'
      });

      const savedAdmission = await newAdmission.save();
      res.status(201).json(savedAdmission);
    } catch (error) {
      res.status(500).json({ message: "Error creating admission user", error: error.message });
    }
  },

  // List all Applicants/Students
  listApplicants: async (req, res) => {
    try {
      const applicants = await AppLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(applicants);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applicants", error: error.message });
    }
  },

  // Create new Applicant/Student
  createApplicant: async (req, res) => {
    try {
      const { email, name, campus, department, username, password, role, status } = req.body;

      if (!email || !name || !campus || !department || !username || !password || !role || !status) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const newApplicant = new AppLogin({
        email,
        name: {
          firstname: name.firstname || '',
          middlename: name.middlename || '',
          lastname: name.lastname || '',
          extension: name.extension || ''
        },
        campus,
        department,
        username,
        password,
        role,
        status
      });

      const savedApplicant = await newApplicant.save();
      res.status(201).json(savedApplicant);
    } catch (error) {
      res.status(500).json({ message: "Error creating applicant", error: error.message });
    }
  },

  // List all Faculty users
  listFaculty: async (req, res) => {
    try {
      const faculty = await FacLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(faculty);
    } catch (error) {
      res.status(500).json({ message: "Error fetching faculty", error: error.message });
    }
  },

  // Create new Faculty user
  createFaculty: async (req, res) => {
    try {
      const { email, name, birthdate, username, password, role } = req.body;

      if (!email || !name || !birthdate || !username || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const newFaculty = new FacLogin({
        email,
        name: {
          firstname: name.firstname || '',
          middlename: name.middlename || '',
          lastname: name.lastname || '',
          extension: name.extension || ''
        },
        birthdate,
        username,
        password,
        role: role || 'Faculty'
      });

      const savedFaculty = await newFaculty.save();
      res.status(201).json(savedFaculty);
    } catch (error) {
      res.status(500).json({ message: "Error creating faculty", error: error.message });
    }
  },

  // List all Registrar users
  listRegistrars: async (req, res) => {
    try {
      const registrars = await RegLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(registrars);
    } catch (error) {
      res.status(500).json({ message: "Error fetching registrars", error: error.message });
    }
  },

  // Create new Registrar user
  createRegistrar: async (req, res) => {
    try {
      const { email, name, birthdate, username, password, role } = req.body;

      if (!email || !name || !birthdate || !username || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const newRegistrar = new RegLogin({
        email,
        name: {
          firstname: name.firstname || '',
          middlename: name.middlename || '',
          lastname: name.lastname || '',
          extension: name.extension || ''
        },
        birthdate,
        username,
        password,
        role: role || 'Registrar'
      });

      const savedRegistrar = await newRegistrar.save();
      res.status(201).json(savedRegistrar);
    } catch (error) {
      res.status(500).json({ message: "Error creating registrar", error: error.message });
    }
  },

  // List all Students
  listStudents: async (req, res) => {
    try {
      const students = await StuLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 })
        .populate('program')
        .populate('updated_by');
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Error fetching students", error: error.message });
    }
  },

  // Create new Student
  createStudent: async (req, res) => {
    try {
      const { personal_email, cvsu_email, name, username, password, role, student_type, enrollment_status, program, year_level, updated_by, updated_by_model, folder_id, profile_id } = req.body;

      if (!personal_email || !cvsu_email || !name || !username || !password || !program || !updated_by || !updated_by_model || !folder_id || !profile_id) {
        return res.status(400).json({ message: "All required fields are required" });
      }

      if (!validateEmail(personal_email) || !validateEmail(cvsu_email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const newStudent = new StuLogin({
        personal_email,
        cvsu_email,
        name: {
          firstname: name.firstname || '',
          middlename: name.middlename || '',
          lastname: name.lastname || '',
          extension: name.extension || ''
        },
        username,
        password,
        role: role || 'Student',
        student_type,
        enrollment_status,
        program,
        year_level,
        updated_by,
        updated_by_model,
        folder_id,
        profile_id
      });

      const savedStudent = await newStudent.save();
      res.status(201).json(savedStudent);
    } catch (error) {
      res.status(500).json({ message: "Error creating student", error: error.message });
    }
  }
};

module.exports = UserController;
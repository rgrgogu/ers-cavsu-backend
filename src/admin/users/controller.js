const mongoose = require("mongoose");
const AuthLogin = require("../../auth/login/model");
const BCrypt = require("../../../global/config/BCrypt")
const NotificationController = require("../../applicant/app_notification/notification.controller")

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
      const admins = await AuthLogin.find({ isArchived: false, role: "admin" })
        .select("-password") // Exclude password from response
        .sort({ createdAt: -1 });
      res.json(admins);
    } catch (error) {
      res.status(400).json({ message: "Error fetching admins", error: error.message });
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

      const newAdmin = new AuthLogin({
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
      res.status(400).json({ message: "Error creating admin", error: error.message });
    }
  },

  // List all Admission users
  listAdmissions: async (req, res) => {
    try {
      const admissions = await AuthLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(admissions);
    } catch (error) {
      res.status(400).json({ message: "Error fetching admissions", error: error.message });
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

      const newAdmission = new AuthLogin({
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
      res.status(400).json({ message: "Error creating admission user", error: error.message });
    }
  },

  // List all Applicants/Students
  listApplicants: async (req, res) => {
    try {
      const applicants = await AuthLogin.aggregate([
        { $match: { isArchived: false } },
        { $lookup: { from: "app_profiles", localField: "profile_id", foreignField: "_id", as: "profileDetails", pipeline: [{ $project: { _id: 0, program: "$application_details.program", firstname: "$application_details.firstname", middlename: "$application_details.middlename", lastname: "$application_details.lastname" } }] } },
        { $unwind: { path: "$profileDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: "$name",
            profile_id: "$profile_id",
            program: "$profileDetails.program",
            user_id: "$user_id",
            email: "$email",
            status: "$status",
            folder_id: "$folder_id",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            fullName: {
              $concat: [
                { $ifNull: ["$name.firstname", ""] }, " ",
                { $ifNull: ["$name.middlename", ""] }, " ",
                { $ifNull: ["$name.lastname", ""] }, " ",
                { $ifNull: ["$name.extension", ""] }
              ]
            }
          }
        },
        { $sort: { createdAt: -1 } }
      ]);

      res.json(applicants);
    } catch (error) {
      res.status(400).json({ message: "Error fetching applicants", error: error.message });
    }
  },

  // Create new Applicant/Student
  massCreateStudents: async (req, res) => {
    try {
      const studentsData = req.body; // Expecting an array of student objects
      const ids = studentsData.map(item => item._id)

      // Validate that studentsData is an array
      if (!Array.isArray(studentsData)) {
        return res.status(400).json({ message: 'Input must be an array of student objects' });
      }

      // Check if the array is empty
      if (studentsData.length === 0) {
        return res.status(400).json({ message: 'No applicants provided' });
      }

      // Get the current count to start sequencing
      const currentCount = (await AuthLogin.countDocuments()) + 1;

      // Prepare bulk operations
      const bulkOps = [];
      const idsBulkOps = [];

      // Process students and collect password hashing promises
      const studentPromises = studentsData.map(async (student, index) => {
        const year = new Date().getFullYear();
        const count = currentCount + index;
        const paddedCount = count.toString().padStart(6, '0');
        const student_id = `${year}${paddedCount}`;
        const username = student_id;

        // Hash password
        const password = await BCrypt.hash(process.env.DEFAULT_PASS, 10); // Added salt rounds (10 is a common default)

        const { _id, ...rest } = student;

        return {
          newStudent: { ...rest, student_id, username, password },
          updateOp: _id ? {
            updateOne: {
              filter: { _id: _id },
              update: { $set: { status: "Application Completed" } },
            }
          } : null
        };
      });

      // Wait for all passwords to be hashed
      const processedStudents = await Promise.all(studentPromises);

      // Populate bulk operations
      processedStudents.forEach(({ newStudent, updateOp }) => {
        bulkOps.push({ insertOne: { document: newStudent } });
        if (updateOp) {
          idsBulkOps.push(updateOp);
        }
      });

      // Execute bulk write
      const result = await AuthLogin.bulkWrite(bulkOps);

      // Update status from Submitted to Application Completed
      let appResult = null;
      if (idsBulkOps.length > 0) {
        appResult = await AuthLogin.bulkWrite(idsBulkOps);
      }

      await NotificationController.sendBulkNotification({
        title: "Application Completed", 
        log: "Your application has been completed. Congratulations and Welcome to Cavite State University - Bacoor Campus. For more updates, please check your personal email. Thank you.",
      }, ids);

      res.status(201).json({
        message: 'Students created successfully',
        data: ids,
        count: studentsData.length,
        bulkWriteResult: result,
      });

    } catch (error) {
      console.error('Error in massCreateStudents:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }

      if (error.name === 'BulkWriteError') {
        error.writeErrors.forEach(writeError => {
          console.error('Document index:', writeError.index);
          console.error('Error message:', writeError.errmsg);
        });
        return res.status(400).json({ message: 'Bulk write error', details: error.writeErrors });
      }

      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate key error: A student with this student_id already exists' });
      }

      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // List all Faculty users
  listFaculty: async (req, res) => {
    try {
      const faculty = await AuthLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(faculty);
    } catch (error) {
      res.status(400).json({ message: "Error fetching faculty", error: error.message });
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

      const newFaculty = new AuthLogin({
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
      res.status(400).json({ message: "Error creating faculty", error: error.message });
    }
  },

  // List all Registrar users
  listRegistrars: async (req, res) => {
    try {
      const registrars = await AuthLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(registrars);
    } catch (error) {
      res.status(400).json({ message: "Error fetching registrars", error: error.message });
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

      const newRegistrar = new AuthLogin({
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
      res.status(400).json({ message: "Error creating registrar", error: error.message });
    }
  },

  // List all Students
  listStudents: async (req, res) => {
    try {
      const students = await AuthLogin.find({ isArchived: false })
        .select("-password")
        .sort({ createdAt: -1 })
        .populate('program')
        .populate('updated_by');
      res.json(students);
    } catch (error) {
      res.status(400).json({ message: "Error fetching students", error: error.message });
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

      const newStudent = new AuthLogin({
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
      res.status(400).json({ message: "Error creating student", error: error.message });
    }
  }
};

module.exports = UserController;
const AuthLogin = require("../../auth/login/model");
const ProfileOne = require("../../auth/profile_one/model");
const ProfileTwo = require("../../auth/profile_two/model");
const BCrypt = require("../../../global/config/BCrypt")
const NotificationController = require("../../applicant/app_notification/notification.controller")
const { CreateFolder } = require("../../../global/utils/Drive")

const rolePrefixes = {
  admission: { prefix: 'AD', folder: process.env.ADMISSION_GDRIVE_FOLDER },
  faculty: { prefix: 'FT', folder: process.env.FACULTY_GDRIVE_FOLDER },
  registrar: { prefix: 'RG', folder: process.env.REGISTRAR_GDRIVE_FOLDER },
  admin: { prefix: 'AM', folder: process.env.ADMIN_GDRIVE_FOLDER },
};

// UserController
const UserController = {
  // List all Admin users
  listAdmins: async (req, res) => {
    try {
      const archive = req.query.archive;
      const admins = await AuthLogin.find({ isArchived: archive, role: "admin" })
        .select("-password") // Exclude password from response
        .sort({ createdAt: -1 });
      res.json(admins);
    } catch (error) {
      res.status(400).json({ message: "Error fetching admins", error: error.message });
    }
  },

  // List all Admission users
  listAdmissions: async (req, res) => {
    try {
      const archive = req.query.archive;
      const admissions = await AuthLogin.find({ isArchived: archive, role: "admission" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(admissions);
    } catch (error) {
      res.status(400).json({ message: "Error fetching admissions", error: error.message });
    }
  },

  // List all Applicants/Students
  listApplicants: async (req, res) => {
    try {
      const archive = req.query.archive;
      const applicants = await AuthLogin.find({ isArchived: archive, role: "applicant" })
        .populate('profile_id_one', 'application_details')
        .select("-password")

      res.json(applicants);
    } catch (error) {
      res.status(400).json({ message: "Error fetching applicants", error: error.message });
    }
  },

  // List all Faculty users
  listFaculty: async (req, res) => {
    try {
      const archive = req.query.archive;
      const faculty = await AuthLogin.find({ isArchived: archive, role: "faculty" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(faculty);
    } catch (error) {
      res.status(400).json({ message: "Error fetching faculty", error: error.message });
    }
  },

  // List all Registrar users
  listRegistrars: async (req, res) => {
    try {
      const archive = req.query.archive;
      const registrars = await AuthLogin.find({ isArchived: archive, role: "registrar" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(registrars);
    } catch (error) {
      res.status(400).json({ message: "Error fetching registrars", error: error.message });
    }
  },

  // List all Students
  listStudents: async (req, res) => {
    try {
      const archive = req.query.archive;
      const students = await AuthLogin.find({ isArchived: archive, role: "student" })
        .select("-password")
        .sort({ user_id: 1 })
        .populate('profile_id_one', "application_details student_details")
      res.json(students);
    } catch (error) {
      res.status(400).json({ message: "Error fetching students", error: error.message });
    }
  },

  // Create Account for Admin, Admission, Faculty, and Registrar
  CreateAccount: async (req, res) => {
    try {
      const { role } = req.body;

      // Validate role
      if (!role || !rolePrefixes[role]) {
        return res.status(400).json({ error: 'Invalid or missing role.' });
      }

      // Extract prefix and folder from rolePrefixes
      const { prefix, folder } = rolePrefixes[role];
      if (!prefix) {
        return res.status(400).json({ error: 'Role prefix is missing.' });
      }

      // Generate user_id
      const count = await AuthLogin.countDocuments({ role }) + 1;
      const year = new Date().getFullYear();
      const paddedCount = count.toString().padStart(6, '0');
      const user_id = `${prefix}${year}${paddedCount}`;

      // Assign default values for username and password
      const username = user_id;
      const password = await BCrypt.hash(process.env.DEFAULT_PASS);

      // Combine full name
      const fullName = [req.body.name.firstname, req.body.name.middlename, req.body.name.lastname, req.body.name.extension]
        .filter(Boolean)
        .join(' ');

      // Create user in the database
      const user = await AuthLogin.create({ ...req.body, username, password, user_id });

      // Use the folder from rolePrefixes or fallback to a default folder
      const folder_id = await CreateFolder(fullName, folder);

      const profileTwo = await ProfileTwo.create({ sex: req.body.sex });
      const result = await AuthLogin.findByIdAndUpdate(user._id, { profile_id_two: profileTwo._id, folder_id }, { new: true }).select("-password");

      return res.status(201).json(result);
    } catch (error) {
      if (error.code === 11000) return res.status(400).json({ error: "Please try another username." }) // Duplicate key error
      else return res.status(400).json({ error: error.message })
    }
  },

  massCreateStudents: async (req, res) => {
    try {
      const studentsIds = req.body; // Expecting an array of student objects

      // Validate that studentsIds is an array
      if (!Array.isArray(studentsIds)) {
        return res.status(400).json({ message: 'Input must be an array of student ids' });
      }

      // Check if the array is empty
      if (studentsIds.length === 0) {
        return res.status(400).json({ message: 'No applicants provided' });
      }

      // Get the current count to start sequencing
      const currentCount = (await AuthLogin.countDocuments({ role: "student" })) + 1;
      const year = new Date().getFullYear();

      // Prepare bulk operations for AuthLogin (user_id updates)
      const authBulkOps = [];
      // Prepare bulk operations for ProfileOne (profile_id, student_type, student_status updates)
      const profileBulkOps = [];

      // Process students and collect password hashing promises
      const studentPromises = studentsIds.map(async (student, index) => {
        const count = currentCount + index;
        const paddedCount = count.toString().padStart(4, '0');
        const user_id = `ST${year}${paddedCount}`;
        const username = user_id;

        // Hash password
        const password = await BCrypt.hash(process.env.DEFAULT_PASS, 10);

        // Assuming the student object has a profile_id field (e.g., "67f336f37ac96f8a2cd277a6")
        const profile_id = student.profile_id;

        return {
          authUpdate: {
            updateOne: {
              filter: { _id: student.user_id }, // Match by user_id in AuthLogin
              update: {
                $set: {
                  user_id,
                  username,
                  password,
                  role: "student",
                  status: "Created",
                },
              },
              upsert: false, // Set to true if you want to create new documents when no match is found
            },
          },
          profileUpdate: {
            updateOne: {
              filter: { _id: profile_id }, // Match by profile_id in ProfileOne
              update: {
                $set: {
                  student_details: {
                    student_type: "New",
                    student_status: "Regular",
                  }
                },
              },
              upsert: false, // Set to true if you want to create new documents when no match is found
            },
          },
        };
      });

      // Wait for all passwords to be hashed and operations to be prepared
      const processedStudents = await Promise.all(studentPromises);

      // Populate bulk operations for both models
      processedStudents.forEach(({ authUpdate, profileUpdate }) => {
        authBulkOps.push(authUpdate);
        profileBulkOps.push(profileUpdate);
      });

      // Execute bulk write for AuthLogin
      const authResult = await AuthLogin.bulkWrite(authBulkOps);

      // Execute bulk write for ProfileOne
      const profileResult = await ProfileOne.bulkWrite(profileBulkOps);

      res.status(200).json({
        message: 'Students and profiles updated successfully',
        data: studentsIds,
        count: studentsIds.length,
        authBulkWriteResult: authResult,
        profileBulkWriteResult: profileResult,
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

  bulkArchive: async (req, res) => {
    try {

      const { ids, archived } = req.body;
      console.log(archived)

      const result = await AuthLogin.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            isArchived: archived,
          }
        },
        { new: true }
      );

      res.status(200).json({ message: 'Archived successfully', result });
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  },

  bulkEmailUpdate: async (req, res) => {
    try {
      const { users } = req.body;
      console.log(users)
      // Validate the input array
      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: "Request body must contain a non-empty array of user data." });
      }
  
      // Prepare update operations
      const updateOperations = users.map(user => ({
        updateOne: {
          filter: { _id: user.id },
          update: { $set: { school_email: user.school_email } },
          // Optional: Add upsert if you want to create users that don't exist
          // upsert: true
        }
      }));
  
      // Perform bulk write with a size limit check (optional)
      if (updateOperations.length > 1000) { // Arbitrary limit to avoid 16 MB threshold
        return res.status(400).json({ message: "Too many users in a single request. Please limit to 1000 users." });
      }
  
      const result = await AuthLogin.bulkWrite(updateOperations);
  
      // Return a simplified and meaningful response
      res.status(200).json({
        message: 'School emails updated successfully',
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
        upsertedCount: result.upsertedCount || 0
      });
    } catch (error) {
      // Enhanced error handling
      console.error('Error in bulkEmailUpdate:', error);
      if (error.name === 'MongoError' || error.name === 'BulkWriteError') {
        return res.status(500).json({ 
          message: 'Database error occurred while updating emails.', 
          error: error.message 
        });
      }
      res.status(400).json({ message: 'Failed to update school emails.', error: error.message });
    }
  },

  bulkResetPassword: async (req, res) => {
    try {
      const { ids } = req.body;
      console.log(ids)

      // Validate that userIds is an array and not empty
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Input must be a non-empty array of user IDs' });
      }

      // Hash the new password (using the same default or environment variable)
      const newPassword = process.env.DEFAULT_PASS;
      const hashedPassword = await BCrypt.hash(newPassword, 10);

      // Update multiple users in a single operation
      const result = await AuthLogin.updateMany(
        { _id: { $in: ids } }, // Match all users with IDs in the array
        { $set: { password: hashedPassword } }, // Only update the password
        { new: true }
      );

      res.status(200).json({ message: 'Passwords reset successfully', result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },


};

module.exports = UserController;
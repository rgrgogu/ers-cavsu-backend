const Student = require('../../student/login/model'); // Adjust the path to your model

class StudentController {
  static async massCreateStudents(req, res) {
    try {
      const studentsData = req.body; // Expecting an array of student objects

      // Validate that studentsData is an array
      if (!Array.isArray(studentsData)) {
        return res.status(400).json({ message: 'Input must be an array of student objects' });
      }

      // Create students in bulk
      const createdStudents = await Student.insertMany(studentsData, { ordered: false });

      res.status(201).json({
        message: 'Students created successfully',
        data: createdStudents,
        count: createdStudents.length,
      });

    } catch (error) {
      console.error('Error in massCreateStudents:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }

      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate key error: A student with this student_id already exists' });
      }

      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}

module.exports = StudentController;
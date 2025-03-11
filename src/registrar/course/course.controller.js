const Course = require('./course.model');

const courseController = {
  // Create a new course
  createCourse: async (req, res) => {
    try {
      const { courseCode, courseTitle, lectureCredits, labCredits, courseType, program } = req.body;
      const createdBy = req.user._id; // Assuming user is authenticated

      // Validation: Ensure program is provided for Specialized, Elective, and Practicum/OJT
      if (['Specialized', 'Elective', 'Practicum/OJT'].includes(courseType) && !program) {
        return res.status(400).json({ message: 'Program is required for this course type' });
      }
      // Validation: Ensure program is not provided for GE, NSTP, PE
      if (['General Education', 'NSTP', 'Physical Education'].includes(courseType) && program) {
        return res.status(400).json({ message: 'Program should not be specified for this course type' });
      }

      const newCourse = new Course({
        courseCode,
        courseTitle,
        lectureCredits,
        labCredits,
        courseType,
        program,
        createdBy
      });

      const savedCourse = await newCourse.save();
      res.status(201).json(savedCourse);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Read all active courses
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.find({ isArchived: false })
        .populate('createdBy', 'username');
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Read single course
  getCourse: async (req, res) => {
    try {
      const course = await Course.findById(req.params.id)
        .populate('createdBy', 'username');
      if (!course || course.isArchived) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update course
  updateCourse: async (req, res) => {
    try {
      const { courseCode, courseTitle, lectureCredits, labCredits, courseType, program } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course || course.isArchived) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Validation for updates
      if (['Specialized', 'Elective', 'Practicum/OJT'].includes(courseType) && !program) {
        return res.status(400).json({ message: 'Program is required for this course type' });
      }
      if (['General Education', 'NSTP', 'Physical Education'].includes(courseType) && program) {
        return res.status(400).json({ message: 'Program should not be specified for this course type' });
      }

      course.courseCode = courseCode || course.courseCode;
      course.courseTitle = courseTitle || course.courseTitle;
      course.lectureCredits = lectureCredits || course.lectureCredits;
      course.labCredits = labCredits || course.labCredits;
      course.courseType = courseType || course.courseType;
      course.program = program || course.program;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Archive course
  archiveCourse: async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course || course.isArchived) {
        return res.status(404).json({ message: 'Course not found' });
      }
      course.isArchived = true;
      const archivedCourse = await course.save();
      res.json({ message: 'Course archived successfully', course: archivedCourse });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get archived courses
  getArchivedCourses: async (req, res) => {
    try {
      const courses = await Course.find({ isArchived: true })
        .populate('createdBy', 'username');
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = courseController;
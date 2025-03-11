const Curriculum = require('./curriculumModel');
const Course = require('./courseModel');
const Program = require('./programModel');

const curriculumController = {
  // Create a new curriculum with checklist
  createCurriculum: async (req, res) => {
    try {
      const { program, checklist } = req.body; // checklist is an array of { course, semester, prerequisites }
      const createdBy = req.user._id;

      const programExists = await Program.findById(program);
      if (!programExists) {
        return res.status(404).json({ message: 'Program not found' });
      }

      // Validate each checklist entry
      for (const item of checklist) {
        const courseExists = await Course.findById(item.course);
        if (!courseExists) {
          return res.status(404).json({ message: `Course ${item.course} not found` });
        }
        if (item.prerequisites && item.prerequisites.length > 0) {
          const prereqCourses = await Course.find({ _id: { $in: item.prerequisites } });
          if (prereqCourses.length !== item.prerequisites.length) {
            return res.status(400).json({ message: 'One or more prerequisites not found' });
          }
        }
      }

      // Compute identifier: Use the earliest year from checklist + program code
      const years = checklist.map(item => parseInt(item.semester.split('-')[0]));
      const minYear = Math.min(...years);
      const identifier = `${minYear}-${programExists.code}`; // e.g., "1-BSIT"

      const newCurriculum = new Curriculum({
        identifier,
        program,
        checklist,
        createdBy
      });

      const savedCurriculum = await newCurriculum.save();
      await savedCurriculum.populate([
        { path: 'program', select: 'code name' },
        { path: 'checklist.course', select: 'courseCode courseTitle' },
        { path: 'checklist.prerequisites', select: 'courseCode courseTitle' }
      ]);
      res.status(201).json(savedCurriculum);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get curriculum clustered by year and semester
  getCurriculumByProgramClustered: async (req, res) => {
    try {
      const { programId } = req.params;
      const curriculum = await Curriculum.findOne({ program: programId })
        .populate([
          { path: 'program', select: 'code name' },
          { path: 'checklist.course', select: 'courseCode courseTitle' },
          { path: 'checklist.prerequisites', select: 'courseCode courseTitle' }
        ]);

      if (!curriculum) {
        return res.status(404).json({ message: 'Curriculum not found for this program' });
      }

      // Initialize clustered structure
      const clusteredCurriculum = {
        'Year 1': { 'Semester 1': [], 'Semester 2': [], 'Semester 3': [], 'Mid-Year': [] },
        'Year 2': { 'Semester 1': [], 'Semester 2': [], 'Semester 3': [], 'Mid-Year': [] },
        'Year 3': { 'Semester 1': [], 'Semester 2': [], 'Semester 3': [], 'Mid-Year': [] },
        'Year 4': { 'Semester 1': [], 'Semester 2': [], 'Semester 3': [], 'Mid-Year': [] }
      };

      // Map semester codes to human-readable labels
      const semesterMap = {
        '1-1': 'Semester 1', '1-2': 'Semester 2', '1-3': 'Semester 3', '1-M': 'Mid-Year',
        '2-1': 'Semester 1', '2-2': 'Semester 2', '2-3': 'Semester 3', '2-M': 'Mid-Year',
        '3-1': 'Semester 1', '3-2': 'Semester 2', '3-3': 'Semester 3', '3-M': 'Mid-Year',
        '4-1': 'Semester 1', '4-2': 'Semester 2', '4-3': 'Semester 3', '4-M': 'Mid-Year'
      };

      // Cluster checklist items
      curriculum.checklist.forEach(item => {
        const [year, term] = item.semester.split('-');
        const yearKey = `Year ${year}`;
        const semesterKey = semesterMap[item.semester];

        clusteredCurriculum[yearKey][semesterKey].push({
          courseCode: item.course.courseCode,
          courseTitle: item.course.courseTitle,
          prerequisites: item.prerequisites.map(prereq => ({
            courseCode: prereq.courseCode,
            courseTitle: prereq.courseTitle
          }))
        });
      });

      res.json({
        identifier: curriculum.identifier,
        program: curriculum.program,
        curriculum: clusteredCurriculum
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get count of curriculum entries per program (count of checklist items)
  getCurriculumCountByProgram: async (req, res) => {
    try {
      const { programId } = req.params;
      const programExists = await Program.findById(programId);
      if (!programExists) {
        return res.status(404).json({ message: 'Program not found' });
      }

      const curriculum = await Curriculum.findOne({ program: programId });
      const count = curriculum ? curriculum.checklist.length : 0;

      res.json({
        program: { code: programExists.code, name: programExists.name },
        curriculumCount: count
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = curriculumController;
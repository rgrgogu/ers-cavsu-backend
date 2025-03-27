// controllers/schoolYearsController.js
const SchoolYear = require('../../admin/school_year/model');

// Create a new school year
exports.createSchoolYear = async (req, res) => {
    try {
        const schoolYear = new SchoolYear(req.body);
        const savedSchoolYear = await schoolYear.save();
        res.status(201).json(savedSchoolYear);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all school years
exports.getAllSchoolYears = async (req, res) => {
    try {
        const schoolYears = await SchoolYear.find().populate('updated_by', 'name');
        res.json(schoolYears);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single school year by ID
exports.getSchoolYearById = async (req, res) => {
    try {
        const schoolYear = await SchoolYear.findById(req.params.id).populate('updated_by');
        if (!schoolYear) {
            return res.status(404).json({ message: 'School year not found' });
        }
        res.json(schoolYear);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a school year
exports.updateSchoolYear = async (req, res) => {
    try {
        const schoolYear = await SchoolYear.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!schoolYear) {
            return res.status(404).json({ message: 'School year not found' });
        }
        res.json(schoolYear);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Set enrollment semester
exports.setEnrollmentSemester = async (req, res) => {
    try {
        const { semester } = req.body; // Expecting 'first', 'second', 'third', or 'midyear'
        const validSemesters = ['first', 'second', 'third', 'midyear'];
        
        if (!validSemesters.includes(semester)) {
            return res.status(400).json({ message: 'Invalid semester value' });
        }

        // Reset all semesters to false and set the specified one to true
        const updateObj = {
            'enrollmentSemesters.first': false,
            'enrollmentSemesters.second': false,
            'enrollmentSemesters.third': false,
            'enrollmentSemesters.midyear': false,
            [`enrollmentSemesters.${semester}`]: true
        };

        const schoolYear = await SchoolYear.findByIdAndUpdate(
            req.params.id,
            updateObj,
            { new: true, runValidators: true }
        );

        if (!schoolYear) {
            return res.status(404).json({ message: 'School year not found' });
        }
        res.json(schoolYear);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Archive a school year
exports.archiveSchoolYear = async (req, res) => {
    try {
        const schoolYear = await SchoolYear.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );
        if (!schoolYear) {
            return res.status(404).json({ message: 'School year not found' });
        }
        res.json(schoolYear);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Archive many school years
exports.archiveManySchoolYears = async (req, res) => {
    try {
        const { schoolYearIds } = req.body; // Expecting an array of school year IDs
        
        if (!Array.isArray(schoolYearIds) || schoolYearIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of school year IDs' });
        }

        const result = await SchoolYear.updateMany(
            { _id: { $in: schoolYearIds } },
            { isArchived: true },
            { runValidators: true }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No school years found to archive' });
        }

        res.json({ 
            message: 'School years archived successfully',
            archivedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
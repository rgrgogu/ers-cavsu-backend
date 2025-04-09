const Section = require('./model'); // Adjust path as needed

// Create a new section
exports.createSection = async (req, res) => {
    try {
        const section = new Section(req.body);
        const savedSection = await section.save();

        const result = await Section.findById({ _id: savedSection._id })
            .populate('program', 'name code')
            .populate('updated_by', 'name');

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all sections
exports.getAllSections = async (req, res) => {
    try {
        const { archived } = req.query;

        const sections = await Section.find({ isArchived: archived })
            .populate('program', 'name code')
            .populate('updated_by', 'name');

        res.json(sections);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getSectionsByWildCard = async (req, res) => {
    try {
        const { level } = req.query;

        if (!level) {
            return res.status(400).json({ message: "Missing required query parameters" });
        }

        // Dynamically create regex based on `level` value
        const levelRegex = new RegExp(level, "i");

        // Fetch sections matching isArchived and section_code conditions
        const sections = await Section.find({
            isArchived: false,
            section_code: levelRegex // Use dynamic regex
        })
            .populate('program', 'name code')
            .populate('updated_by', 'name');

        res.json(sections);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Get a single section by ID
exports.getSectionById = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id)
            .populate('program')
            .populate('updated_by');
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json(section);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a section
exports.updateSection = async (req, res) => {
    try {
        const { section_code, program, semester, capacity, updated_by } = req.body;

        const section = await Section.findByIdAndUpdate(
            req.params.id,
            { section_code, program, semester, capacity, updated_by },
            { new: true, runValidators: true }
        )
            .populate('program', 'name code') // Populate program with specific fields
            .populate('updated_by', 'name'); // Populate updated_by with specific fields

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.json(section);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a section
exports.deleteSection = async (req, res) => {
    try {
        const section = await Section.findByIdAndDelete(req.params.id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Archive a section
exports.archiveSection = async (req, res) => {
    try {
        const section = await Section.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.json(section);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.archiveManySections = async (req, res) => {
    try {
        const { ids, archived, updated_by } = req.body; // Expecting an array of section IDs

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of section IDs' });
        }

        const result = await Section.updateMany(
            { _id: { $in: ids } },
            { isArchived: archived, updated_by: updated_by },
            { runValidators: true }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No sections found to archive' });
        }

        res.json({
            message: 'Sections archived successfully',
            archivedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
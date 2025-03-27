const Section = require('./model'); // Adjust path as needed

// Create a new section
exports.createSection = async (req, res) => {
    try {
        const section = new Section(req.body);
        const savedSection = await section.save();
        res.status(201).json(savedSection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all sections
exports.getAllSections = async (req, res) => {
    try {
        const { archived } = req.query.archive;

        const sections = await Section.find({ isArchived: archived })
            .populate('program')
            .populate('school_year')
            .populate('updated_by');
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
            .populate('school_year')
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
        const section = await Section.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
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
        const { ids } = req.body; // Expecting an array of section IDs

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of section IDs' });
        }

        const result = await Section.updateMany(
            { _id: { $in: ids } },
            { isArchived: true },
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
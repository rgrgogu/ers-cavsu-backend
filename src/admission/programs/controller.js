const Program = require('../../admin/programs/model'); // Adjust the path as needed

// Read all active programs
const getAllPrograms = async (req, res) => {
  try {
      const { archived } = req.query
      const programs = await Program.find({ isArchived: archived || false })
          .populate('updated_by', 'name');

      res.status(200).json(programs);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
}

module.exports = { getAllPrograms };
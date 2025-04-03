const QuestiontModel = require("./question.model"); // Adjust path to your model

const GetQuestions = async (req, res) => {
  try {
    const { id, archive } = req.query; // id is the group_id

    const question = await QuestiontModel.find({
      $and: [
        { isArchived: archive },
        { group: id }
      ]
    })
    .populate({
      path: 'created_by',
      select: 'name',
    })
    .populate({
      path: 'updated_by',
      select: 'name',
    })
    .sort({ updatedAt: -1 });

    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const CreateQuestions = async (req, res) => {
  try {
    const { id, group_id } = req.query; // id is admin_id, group_id is category group
    const data = req.body;

    const result = await QuestiontModel.create({ ...data, created_by: id, group: group_id});

    res.status(201).json({ message: 'Question created', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const EditQuestions = async (req, res) => {
  try {
    const doc_id = req.params.id; // Category ID
    const id = req.query.id;     // Admin ID
    const data = req.body;

    const result = await QuestiontModel.findByIdAndUpdate(
      { _id: doc_id },
      {
        $set: {
          ...data,
          updated_by: id
        }
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question edited successfully', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const ArchiveQuestions = async (req, res) => {
  try {
    const { ids, archived, updated_by } = req.body;

    const result = await QuestiontModel.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isArchived: archived,
          updated_by: updated_by,
        }
      },
      { new: true }
    );

    res.status(200).json({ message: 'Questions archived successfully', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  GetQuestions,
  CreateQuestions,
  EditQuestions,
  ArchiveQuestions,
};
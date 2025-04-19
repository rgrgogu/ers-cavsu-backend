const QuestiontModel = require("../../../admin/evaluation_category/question/question.model.js"); // Adjust path to your model

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

module.exports = {
  GetQuestions,
};
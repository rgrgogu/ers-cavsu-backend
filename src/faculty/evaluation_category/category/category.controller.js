const CategoryGroupModel = require('../../../admin/evaluation_category/category/category.model.js'); // Adjust path to your model
const QuestionModel = require("../../../admin/evaluation_category/question/question.model.js");   // Adjust path to your model

const GetCategoryGroups = async (req, res) => {
  try {
    const archive = req.query.archive;

    const categories = await CategoryGroupModel.find({ isArchived: archive })
      .populate({
        path: 'created_by',
        select: 'name',
      })
      .populate({
        path: 'updated_by',
        select: 'name',
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  GetCategoryGroups,
};
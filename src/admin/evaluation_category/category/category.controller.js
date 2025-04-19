const CategoryGroupModel = require("./category.model"); // Adjust path to your model
const QuestionModel = require("../question/question.model");   // Adjust path to your model

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

const CreateCategoryGroup = async (req, res) => {
  try {
    const { id } = req.query; // Admin ID from query
    const data = req.body;

    const result = await CategoryGroupModel.create({ 
      ...data, 
      created_by: id 
    });

    res.status(201).json({ message: 'Category group created', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const EditCategoryGroup = async (req, res) => {
  try {
    const doc_id = req.params.id; // Category group ID from params
    const id = req.query.id;     // Admin ID from query
    const data = req.body;

    const result = await CategoryGroupModel.findByIdAndUpdate(
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
      return res.status(404).json({ message: 'Category group not found' });
    }

    res.status(200).json({ message: 'Category group edited successfully', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const ArchiveCategoryGroup = async (req, res) => {
  try {
    const { ids, archived, updated_by } = req.body;

    // Update category groups
    const result = await CategoryGroupModel.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isArchived: archived,
          updated_by: updated_by,
        }
      },
      { new: true }
    );

    // Update related category list items
    const update = await QuestionModel.updateMany(
      { group: { $in: ids } },
      { isArchived: archived }
    );

    res.status(200).json({ 
      message: 'Category groups archived successfully', 
      result, 
      update 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  GetCategoryGroups,
  CreateCategoryGroup,
  EditCategoryGroup,
  ArchiveCategoryGroup,
};
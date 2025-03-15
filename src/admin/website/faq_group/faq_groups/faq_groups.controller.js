const mongoose = require("mongoose");

const Model = require("./faq_groups.model");
const Model1 = require("../faq/faq.model");

const GetFAQGroups = async (req, res) => {
  try {
    const archive = req.query.archive;

    const faqs = await Model.find({ isArchived: archive })
      .populate({
        path: 'created_by',
        select: 'name',
      }).populate({
        path: 'updated_by',
        select: 'name',
      }).sort({ updatedAt: -1 });

    res.status(200).json(faqs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const CreateFAQGroup = async (req, res) => {
  try {
    const { id } = req.query;
    const data = req.body;

    const result = await Model.create({ ...data, created_by: id })

    res.status(201).json({ message: 'Data created', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const EditFAQGroup = async (req, res) => {
  try {
    const doc_id = req.params.id;
    const id = req.query.id;
    const data = req.body;

    const result = await Model.findByIdAndUpdate(
      { _id: doc_id },
      {
        $set: {
          ...data,
          updated_by: id
        }
      },
      { new: true }
    )

    res.status(200).json({ message: 'Data edited successfully', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const ArchiveFAQGroup = async (req, res) => {
  try {

    const { ids, archived, updated_by } = req.body;

    const result = await Model.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isArchived: archived,
          updated_by: updated_by,
        }
      },
      { new: true }
    );

    const update = await Model1.updateMany(
      { group: { $in: ids }  },
      { isArchived: archived },
    )

    res.status(200).json({ message: 'Archived successfully', result, update });
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
module.exports = {
  GetFAQGroups,
  CreateFAQGroup,
  EditFAQGroup,
  ArchiveFAQGroup,
};

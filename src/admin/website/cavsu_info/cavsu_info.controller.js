const mongoose = require("mongoose");

const Info = require("./cavsu_info.model");

const GetCavsuInfo = async (req, res) => {
  try {
    const result = await Info.find();
    res.status(200).json( result[0] );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const CreateCavsu = async (req, res) => {
  try {
    const cavsu = req.body;
    const data = await Info.create({...cavsu});
    res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const EditMandate = async (req, res) => {
  try {
    const { mandate } = req.body;

    const data = await Info.findByIdAndUpdate(
      {_id: req.params.id},
      { 
        $set: {
          mandate: mandate
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const EditVision = async (req, res) => {
  try {
    const { vision } = req.body;

    const data = await Info.findByIdAndUpdate(
      {_id: req.params.id},
      { 
        $set: {
          vision: vision
        }
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const EditMission = async (req, res) => {
  try {
    const { mission } = req.body;

    const data = await Info.findByIdAndUpdate(
      {_id: req.params.id},
      { 
        $set: {
          mission: mission
        }
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const EditCoreValues = async (req, res) => {
  try {
    const {core_val}= req.body;

    const data = await Info.findByIdAndUpdate(
      {_id: req.params.id},
      { 
        $set: {
          core_val: core_val
        }
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const EditQualityPolicy = async (req, res) => {
  try {
    const {quality_pol}= req.body;

    const data = await Info.findByIdAndUpdate(
      {_id: req.params.id},
      { 
        $set: {
          quality_pol: quality_pol
        }
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const EditHistory = async (req, res) => {
  try {
    const {history}= req.body;

    const data = await Info.findByIdAndUpdate(
      {_id: req.params.id},
      { 
        $set: {
          history: history
        }
      },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  GetCavsuInfo,
  CreateCavsu,
  EditMandate,
  EditVision,
  EditMission,
  EditCoreValues,
  EditQualityPolicy,
  EditHistory
};

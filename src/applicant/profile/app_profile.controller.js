const mongoose = require("mongoose");

const Profile = require("./app_profile.model")
const User = require("../login/app_login.model")

const UploadApplicantFiles = require("../../../global/functions/UploadApplicantFiles")
const DeletedApplicantFiles = require("../../../global/functions/DeleteApplicantFiles")
const { CreateFolder, UploadFiles, DeleteFiles } = require("../../../global/utils/Drive");

const GetProfile = async (req, res) => {
  try{
    const user_id = req.params.id;

    const result = await Profile.findOne({user_id: user_id})

    res.status(200).json(result)
  }catch(err){
    res.status(400).json({ error: err.message });
  }
}

const SubmitApplication = async (req, res) => {
  try {
    const APPLICANT_ID = req.query.applicant_id;
    const ID_MAX_SIZE = 200 * 1024;
    const DOCUMENT_MAX_SIZE = 1024 * 1024;
    const { body, files } = req
    const profile = JSON.parse(body.obj);
    const doc_type = JSON.parse(body.doc_type);

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // check id_pic if exceeds in 200 kb
    if (files["id_pic"][0].size > ID_MAX_SIZE) {
      return res.status(400).json({ error: `File ${files["id_pic"][0].originalname} exceeds ${ID_MAX_SIZE / 1024}KB limit.` });
    }

    if (files["documents"].length != 0) {
      let err = [];

      for (const file in files["documents"]) {
        if (file.size > DOCUMENT_MAX_SIZE) {
          err.push({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` })
          console.log(err)
        }
      }

      if (err.length != 0)
        return res.status(400).json(err);
    }

    const { folder_id, id_pic, documents } = await UploadApplicantFiles(req.files, APPLICANT_ID, doc_type)

    const result = await Profile.create({
      ...profile,
      applicant_profile: {
        ...profile.applicant_profile,
        id_pic: { ...id_pic }
      },
      upload_reqs: { files: [...documents] },
      folder_id
    })

    await User.findOneAndUpdate(
      { user_id: APPLICANT_ID },
      { $set: { "profile": result.id } },
      { new: true }
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const EditApplicationDetails = async (req, res) => {
  try {
    const user_id = req.params.id;
    const data = req.body;

    const objectId = new mongoose.Types.ObjectId(user_id);

    const result = await Profile.findOneAndUpdate(
      { user_id: objectId },
      { $set: { application_details: data } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const EditApplicantProfile = async (req, res) => {
  try {
    let obj = {}
    const user_id = req.params.id;
    const { folder_id, deleted_id } = req.query;

    const { body, file } = req;
    const data = JSON.parse(body.obj)
    const doc_type = JSON.parse(body.doc_type);
    const DOCUMENT_MAX_SIZE = 1024 * 1024;
    const objectId = new mongoose.Types.ObjectId(user_id);

    if (file) {
      if (file.size > DOCUMENT_MAX_SIZE) {
        return res.status(400).json({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` });
      }

      const { id, name } = await UploadFiles(file, folder_id);

      obj = {
        link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
        id,
        name
      }
    }

    if (deleted_id)
      await DeleteFiles(deleted_id);

    const result = await Profile.findOneAndUpdate(
      { user_id: objectId },
      {
        $set: {
          applicant_profile: {
            ...data,
            id_pic: file ? obj : data.id_pic,
          },
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const EditFamilyProfile = async (req, res) => {
  try {
    const user_id = req.params.id;
    const data = req.body;

    const objectId = new mongoose.Types.ObjectId(user_id);

    const result = await Profile.findOneAndUpdate(
      { user_id: objectId },
      { $set: { family_profile: data } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const EditEducationalProfile = async (req, res) => {
  try {
    const user_id = req.params.id;
    const data = req.body;

    const objectId = new mongoose.Types.ObjectId(user_id);

    const result = await Profile.findOneAndUpdate(
      { user_id: objectId },
      { $set: { educational_profile: data } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const EditUploadRequirements = async (req, res) => {
  try {
    let result = null;

    const user_id = req.params.id;
    const { body, files } = req;
    const { folder_id } = req.query;
    const deletedList = JSON.parse(body.deleted)
    const doc_type = JSON.parse(body.doc_type);
    const objectId = new mongoose.Types.ObjectId(user_id);

    if (files.length != 0) {
      const { err, documents } = await UploadApplicantFiles(files, folder_id, doc_type)

      if(err.length === 0){
        result = await Profile.findOneAndUpdate(
          { user_id: objectId },
          {
            $push: { upload_reqs: documents }
          },
          { new: true }
        );

        if (!result) {
          return res.status(404).json({ message: "Profile not found" });
        }
      }
      else
        return res.status(400).json(err);
    }

    if (deletedList && deletedList?.length !== 0) {
      await DeletedApplicantFiles(res, deletedList, objectId, Profile);
    }
    else {
      res.status(200).json({ message: 'Data edited successfully', result });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  GetProfile,
  EditApplicationDetails,
  EditApplicantProfile,
  EditFamilyProfile,
  EditEducationalProfile,
  EditUploadRequirements
};

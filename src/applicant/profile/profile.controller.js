const mongoose = require("mongoose");

const Profile = require("./profile.model")
const User = require("../account_login/account_login.model")

const UploadApplicantFiles = require("../../../global/functions/UploadApplicantFiles")

const SubmitApplication = async (req, res) => {
  try {
    const APPLICANT_ID = req.query.applicant_id;
    const ID_MAX_SIZE = 200 * 1024;
    const DOCUMENT_MAX_SIZE = 1024 * 1024;
    const {body, files} = req
    const profile = JSON.parse(body.obj);
    const doc_type = JSON.parse(body.doc_type);

    if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
    }

    // check id_pic if exceeds in 200 kb
    if(files["id_pic"][0].size > ID_MAX_SIZE){
        return res.status(400).json({ error: `File ${files["id_pic"][0].originalname} exceeds ${ID_MAX_SIZE / 1024}KB limit.` });
    }

    if(files["documents"].length != 0){
        let err = [];

        for(const file in files["documents"]) {
            if (file.size > DOCUMENT_MAX_SIZE) {
                err.push({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` })
                console.log(err)
            }
        }

        if(err.length != 0)
            return res.status(400).json(err);
    }

    const {id_pic, documents } = await UploadApplicantFiles(req.files, APPLICANT_ID, doc_type)

    const result = await Profile.create({
        ...profile,
        applicant_profile: {
            ...profile.applicant_profile,
            id_pic: {...id_pic}
        },
        upload_reqs: {files: [...documents]}
    })

    await User.findOneAndUpdate(
      { user_id: APPLICANT_ID },
      { $set: { "profile": result.id }},
      { new: true } 
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  SubmitApplication
};

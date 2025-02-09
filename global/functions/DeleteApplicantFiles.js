const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../utils/Drive");

const DeleteApplicantFiles = async (res, deletedList, objectId, Profile) => {
    for (const file of deletedList) {
        console.log(file._id)
        await DeleteFiles(file.id);
    }

    const del_arr = deletedList.map((item) => item.id)

    const output = await Profile.findOneAndUpdate(
        { user_id: objectId }, // Find the group by its ID
        { $pull: { upload_reqs: { id: { $in: del_arr } } } },
        { new: true }
    )

    res.status(200).json({ message: 'Data edited successfully', result: output });
}

module.exports = DeleteApplicantFiles
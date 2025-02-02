const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../utils/Drive");

const UploadApplicantFiles = async (files, id, doc_type) => {
    let id_pic = { link: '' , id: '', name: ''},
        doc = { link: '' , id: '', name: '', type: ''},
        documents = [];

    const folder_id = await CreateFolder(id, process.env.APPLICANT_GDRIVE_FOLDER);

    if(files["id_pic"].length != 0){
        const { id, name } = await UploadFiles(files["id_pic"][0], folder_id);
        
        id_pic = {
            link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,  // Dynamic link generation
            id,
            name
        };
    }

    if(files["documents"].length != 0){
        for(let f = 0; f < files["documents"].length; f++){
            const { id, name } = await UploadFiles(files["documents"][f], folder_id);
            
            doc = {
                link: `https://drive.google.com/file/d/${id}`,  // Dynamic link generation
                id,
                name,
                type: doc_type[f]
            }

            documents.push(doc)
        }
    }

    return { folder_id, id_pic, documents }
}

module.exports = UploadApplicantFiles
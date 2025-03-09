const Model = require("../../admission/logs/logs.model");

const GetLogs = async (req, res) => {
    try {
        const user_id = req.params.id;

        const result = await Model.findOne({ applicant: user_id }).populate("logs.processed_by", "name");
        
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
}

const UpdateApplicantLog = async (req, res) => {
    try {
        const data = req.body;

        const result = await Model.findOneAndUpdate(
            { applicant: data.processed_by },
            {
                $push: {
                    logs: {
                        log: data.log,
                        processed_by: data.processed_by,
                        title: data.title,
                        from: "Applicant",
                        processed_by_model: "app_login",
                        timeline: data.timeline
                    }
                }
            },
            { upsert: false }
        )

        res.status(200).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
}

module.exports = {
    GetLogs,
    UpdateApplicantLog
};
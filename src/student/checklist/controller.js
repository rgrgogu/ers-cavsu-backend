const Curriculum = require('../../admin/curriculum/model');
const Checklist = require('../../registrar/checklist/model');

const ChecklistController = {
    GetChecklistForEnrollee: async (req, res) => {
        try {
            const student_id = req.params.id

            const result = await Checklist.findOne({ student_id })
                .populate({
                    path: 'years.semesters.first.course_id years.semesters.second.course_id years.semesters.third.course_id years.semesters.midyear.course_id',
                    select: 'courseCode courseTitle credits',
                })
                .populate({
                    path: 'years.semesters.first.pre_req_ids years.semesters.second.pre_req_ids years.semesters.third.pre_req_ids years.semesters.midyear.pre_req_ids',
                    select: 'courseCode',
                })
                .populate({
                    path: 'years.semesters.first.grade_id years.semesters.second.grade_id years.semesters.third.grade_id years.semesters.midyear.grade_id',
                    select: 'grade_status',
                })
                .populate({
                    path: 'program',
                    select: 'name',
                })
                .lean();

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Curriculum not found',
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error fetching checklist',
                error: error.message,
            });
        }
    },
}

module.exports = ChecklistController
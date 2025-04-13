const Schedule = require("./model")

const ScheduleController = {
    CreateSchedule: async (school_year, semester, day_time, session, schedule_id = null) => {
        try {
            if (schedule_id) {
                // Update the existing schedule
                const updatedSchedule = await Schedule.findByIdAndUpdate(
                    schedule_id,
                    {
                        school_year,
                        semester,
                        day_time,
                    },
                    { new: true, session } // Use session and return the updated document
                );
    
                if (!updatedSchedule) {
                    throw new Error("Schedule not found for update");
                }
    
                return updatedSchedule._id;
            } else {
                // Create a new schedule
                const newSchedule = new Schedule({
                    school_year,
                    semester,
                    day_time,
                });
    
                const savedSchedule = await newSchedule.save({ session });
                return savedSchedule._id;
            }
        } catch (error) {
            console.error('Error in CreateSchedule:', error);
            throw new Error(error.message);
        }
    }
}

module.exports = ScheduleController
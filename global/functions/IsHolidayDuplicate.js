const IsHolidayDuplicate = (existingHolidays, item) => {
    // Create a stringified version of the holiday for comparison
    const holidayString = JSON.stringify(item);
    for (let existingHoliday of existingHolidays) {
        if (holidayString === JSON.stringify(existingHoliday)) {
            return true;  // Found a match, it is a duplicate
        }
    }
    return false;  // No match, it's unique
}


module.exports = IsHolidayDuplicate;
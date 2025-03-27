const Program = require('../../admin/programs/model'); // Adjust the path as needed

const getProgramsByApplicantType = async (req, res) => {
  try {
    // Fetch programs that are not archived, selecting only necessary fields
    const programs = await Program.find({ isArchived: false })
      .select('name applicant_types')
      .lean();

    // Map short applicant type codes to full names
    const typeMap = {
      ALS: 'Alternative Learning System (ALS) Passer',
      Arts: 'Arts and Design',
      Sports: 'Sports',
      'TVL-AF': 'Tech-Voc - Agricultural-Fishery Arts',
      'TVL-HE': 'Tech-Voc - Home Economics',
      'TVL-IA': 'Tech-Voc - Industrial Arts',
      'TVL-ICT': 'Tech-Voc - Information and Communications Technology',
      ABM: 'Accountancy, Business and Management',
      STEM: 'Science, Technology, Engineering, and Mathematics',
      HUMSS: 'Humanities and Social Science',
      GAS: 'General Academic Strand',
      'Second Courser': 'Second Courser',
      'CVSU Transferees': 'Transferee from CVSU System',
      'Other Transferees': 'Transferee from Other School',
      Foreign: 'Foreign Undergraduate Student Applicant',
      ArtsSports: 'ArtsSports', // Kept as-is
      General: 'General', // Kept as-is
    };

    // Define the output structure for categorized programs
    const programCategories = {
      'Alternative Learning System (ALS) Passer': [],
      'Foreign Undergraduate Student Applicant': [],
      'Arts and Design': [],
      'Sports': [],
      'Transferee from CVSU System': [],
      'Transferee from Other School': [],
      'Second Courser': [],
      'Tech-Voc': {
        'Agricultural-Fishery Arts': [],
        'Home Economics': [],
        'Industrial Arts': [],
        'Information and Communications Technology': [],
      },
      'Accountancy, Business and Management': [],
      'Science, Technology, Engineering, and Mathematics': [],
      'Humanities and Social Science': [],
      'General Academic Strand': [],
    };

    // Helper function to normalize Tech-Voc subcategories
    const normalizeTechVocSubCategory = (fullType) => fullType.replace('Tech-Voc - ', '');

    // Populate the program categories
    programs.forEach((program) => {
      program.applicant_types.forEach((type) => {
        const fullType = typeMap[type] || type; // Map short code to full name, fallback to original

        if (fullType.startsWith('Tech-Voc -')) {
          const subCategory = normalizeTechVocSubCategory(fullType);
          if (programCategories['Tech-Voc'][subCategory]) {
            programCategories['Tech-Voc'][subCategory].push(program.name);
          }
        } else if (fullType in programCategories) {
          programCategories[fullType].push(program.name);
        }
      });
    });

    // Helper function to deduplicate and sort arrays
    const deduplicateAndSort = (arr) => [...new Set(arr)].sort();

    // Deduplicate and sort all program lists
    Object.keys(programCategories).forEach((category) => {
      if (Array.isArray(programCategories[category])) {
        programCategories[category] = deduplicateAndSort(programCategories[category]);
      } else {
        // Handle nested Tech-Voc object
        Object.keys(programCategories[category]).forEach((subCategory) => {
          programCategories[category][subCategory] = deduplicateAndSort(
            programCategories[category][subCategory]
          );
        });
      }
    });

    // Send the response
    return res.status(200).json(programCategories);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching programs by applicant type',
      error: error.message,
    });
  }
};

module.exports = { getProgramsByApplicantType };
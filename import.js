const routes = [
    // STUDENT
    { api: "/api/student/auth", router: require('./src/student/login/route.js') },
    { api: "/api/student/profile", router: require('./src/student/profile/route.js') },
    { api: "/api/student/ctgy_groups", router: require('./src/student/evaluation/category/category.route.js') },
    { api: "/api/student/ctgy_questions", router: require('./src/student/evaluation/question/question.route.js') },
    
    // FACULTY
    { api: "/api/faculty/auth", router: require('./src/faculty/login/route.js') },
    { api: "/api/faculty/profile", router: require('./src/faculty/profile/route.js') },
    { api: "/api/faculty/ctgy_groups", router: require('./src/faculty/evaluation/category/category.route.js') },
    { api: "/api/faculty/ctgy_questions", router: require('./src/faculty/evaluation/question/question.route.js') },

    // REGISTRAR
    { api: "/api/registrar/auth", router: require('./src/registrar/login/reg_login.route.js') },
    { api: "/api/registrar/profile", router: require('./src/registrar/profile/reg_profile.route.js') },
    { api: "/api/registrar/sections", router: require('./src/registrar/section/route.js') },
    { api: "/api/registrar/school_year", router: require('./src/registrar/school_year/route.js') },
    { api: "/api/registrar/applications", router: require('./src/registrar/applications/route.js') },
    { api: "/api/registrar/logs", router: require('./src/registrar/logs/route.js') },
    { api: "/api/registrar/programs", router: require('./src/registrar/programs/route.js') },
    { api: "/api/registrar/courses", router: require('./src/registrar/course/course.route.js') },
    { api: "/api/registrar/course_grps", router: require('./src/registrar/course_group/route.js') },
    { api: "/api/registrar/curriculums", router: require('./src/registrar/curriculum/route.js') },
    { api: "/api/registrar/students", router: require('./src/registrar/students/route.js') },
    { api: "/api/registrar/enrollments", router: require('./src/registrar/enrollment/route.js') },
    
    // ADMISSION
    { api: "/api/admission/auth", router: require('./src/admission/login/adn_login.route.js') },
    { api: "/api/admission/profile", router: require('./src/admission/profile/adn_profile.route.js') },
    { api: "/api/admission/a_holidays", router: require('./src/admission/holidays/holiday.route.js') },
    { api: "/api/admission/applications", router: require('./src/admission/applications/applications.route.js') },
    { api: "/api/admission/appointments", router: require('./src/admission/appointments/appoint.route.js') },
    { api: "/api/admission/logs", router: require('./src/admission/logs/logs.route.js') },
    { api: "/api/admission/programs", router: require('./src/admission/programs/route.js') },

    // APPLICANT
    { api: "/api/applicant/auth", router: require('./src/applicant/login/app_login.route.js') },
    { api: "/api/applicant/profile", router: require('./src/applicant/profile/app_profile.route.js') },
    { api: "/api/applicant/logs", router: require('./src/applicant/logs/logs.route.js') },
    { api: "/api/applicant/notif", router: require('./src/applicant/app_notification/notification.route.js') },
    { api: "/api/applicant/surveys", router: require('./src/applicant/survey/survey.route.js') },
    { api: "/api/applicant/programs", router: require('./src/applicant/programs/route.js') },

    // ADMIN
    { api: "/api/admin/auth", router: require('./src/admin/login/adm_login.route.js') },
    { api: "/api/admin/profile", router: require('./src/admin/profile/adm_profile.route.js') },
    { api: "/api/admin/w_adguide", router: require('./src/admin/website/admission_guide/admission_guide.route.js') },
    { api: "/api/admin/w_info", router: require('./src/admin/website/cavsu_info/cavsu_info.route.js') },
    { api: "/api/admin/w_ers", router: require('./src/admin/website/ers/ers.route.js') },
    { api: "/api/admin/w_events", router: require('./src/admin/website/events/events.route.js') },
    { api: "/api/admin/w_faqs", router: require('./src/admin/website/faq_group/faq/faq.route.js') },
    { api: "/api/admin/w_faqgroups", router: require('./src/admin/website/faq_group/faq_groups/faq_groups.route.js') },
    { api: "/api/admin/w_offs", router: require('./src/admin/website/official_group/officials/officials.route.js') },
    { api: "/api/admin/w_offgroups", router: require('./src/admin/website/official_group/office/office.route.js') },
    { api: "/api/admin/w_hero", router: require('./src/admin/website/hero/hero.route.js') },
    { api: "/api/admin/school_years", router: require('./src/admin/school_year/route.js') },
    { api: "/api/admin/programs", router: require('./src/admin/programs/route.js') },
    { api: "/api/admin/courses", router: require('./src/admin/course/course.route.js') },
    { api: "/api/admin/course_grps", router: require('./src/admin/course_group/route.js') },
    { api: "/api/admin/curriculums", router: require('./src/admin/curriculum/route.js') },
    { api: "/api/admin/users", router: require('./src/admin/users/route.js') },
    { api: "/api/admin/ctgy_groups", router: require('./src/admin/evaluation/category/category.route.js') },
    { api: "/api/admin/ctgy_questions", router: require('./src/admin/evaluation/question/question.route.js') },


    // PUBLIC API
    { api: "/api/public", router: require('./src/admin/website/public/public.router.js') },
]

const Route = (app) => {
    for (const route of routes)
        app.use(route.api, route.router);
}

module.exports = Route;
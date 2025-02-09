// APPLICANT
// const account_login = require('./src/applicant/account_login/account_login.route');
// const profile = require('./src/applicant/profile/profile.route');

const routes = [
    // ADMISSION
    { api: "/api/admission/auth", router: require('./src/admission/login/adn_login.route.js') },
    { api: "/api/admission/profile", router: require('./src/admission/profile/adn_profile.route.js') }, 

    // APPLICANT
    { api: "/api/applicant/auth", router: require('./src/applicant/login/app_login.route.js') },
    { api: "/api/applicant/profile", router: require('./src/applicant/profile/app_profile.route.js') }, 

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

    // PUBLIC API
    { api: "/api/public", router: require('./src/admin/website/public/public.router.js') },
]

const Route = (app) => {
    for (const route of routes)
        app.use(route.api, route.router);
}

module.exports = Route;
const mongoose = require("mongoose");

const Guide = require("../admission_guide/admission_guide.model");
const Info = require("../cavsu_info/cavsu_info.model")
const ERS = require("../ers/ers.model")
const Events = require("../events/events.model")
const FAQGroup = require("../faq_group/faq_groups/faq_groups.model")
const FAQ = require("../faq_group/faq/faq.model")
const Official = require("../official_group/officials/officials.model")
const Hero = require("../hero/hero.model")

const GetAllAdmissionGuide = async (req, res) => {
    try {
        const result = await Guide.find(
            {isArchived: false},
            'group_name group_desc group_files.link'
        )
        .populate({
            path: 'updated_by created_by',
            select: 'name',
        })
        .sort({ updatedAt: -1 })

        const modifiedResult = result.map(doc => ({
            id: doc.id,
            group_name: doc.group_name,
            group_desc: doc.group_desc,
            group_files: doc.group_files,
            author: !doc.updated_by ? doc.updated_by?.fullNameInitial : doc.created_by?.fullNameInitial, // Extract virtual manually
        }));

        res.status(200).json({result: modifiedResult});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetCavsuInfo = async (req, res) => {
    try {
        const result = await Info.findOne(
            {},
            'mandate vision mission core_val quality_pol history'
        )

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetERS = async (req, res) => {
    try {
        const result = await ERS.find(
            {isArchived: false},
            "group_name group_desc group_files.link"
        )
        .populate({
            path: 'updated_by created_by',
            select: 'name',
        })
        .sort({ updatedAt: -1 })

        const modifiedResult = result.map(doc => ({
            id: doc.id,
            group_name: doc.group_name,
            group_desc: doc.group_desc,
            group_files: doc.group_files,
            author: !doc.updated_by ? doc.updated_by?.fullNameInitial : doc.created_by?.fullNameInitial, // Extract virtual manually
        }));

        res.status(200).json({result: modifiedResult});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetEvents = async (req, res) => {
    try {
        const result = await Events.find(
            {isArchived: false},
            "title desc group_files.link"
        )
        .populate({
            path: 'updated_by created_by',
            select: 'name',
        })
        .sort({ updatedAt: -1 })

        const modifiedResult = result.map(doc => ({
            id: doc.id,
            title: doc.title,
            desc: doc.desc,
            group_files: doc.group_files,
            author: !doc.updated_by ? doc.updated_by?.fullNameInitial : doc.created_by?.fullNameInitial, // Extract virtual manually
        }));
        
        res.status(200).json({result: modifiedResult});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetFAQGroup = async (req, res) => {
    try {
        const result = await FAQGroup.find(
            {isArchived: false},
            "title desc"
        )
        .populate({
            path: 'updated_by created_by',
            select: 'name',
        })
        .sort({ updatedAt: -1 })

        const modifiedResult = result.map(doc => ({
            id: doc.id,
            title: doc.title,
            desc: doc.desc,
            author: !doc.updated_by ? doc.updated_by?.fullNameInitial : doc.created_by?.fullNameInitial, // Extract virtual manually
        }));
        
        res.status(200).json({result: modifiedResult});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetFAQs = async (req, res) => {
    try {
        const faq_group_id = req.params.id;

        const result = await FAQ.find(
            {$and: [{ isArchived: false },{ group: faq_group_id }]},
            "question answer"
        )
        .sort({ updatedAt: -1 })

        const modifiedResult = result.map(doc => ({
            id: doc.id,
            question: doc.question,
            answer: doc.answer,
        }));
        
        res.status(200).json({result: modifiedResult});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetOfficials = async (req, res) => {
    try {
        const result = await Official.find(
            {isArchived: false},
            "name designation contact email unit"
        )
        .populate({
            path: 'office',
            select: 'office_group',
        })
        .sort({ updatedAt: -1 })

        const modifiedResult = result.map(doc => ({
            id: doc.id,
            name: doc.name,
            designation: doc.designation,
            contact: doc.contact,
            email: doc.email,
            unit: doc.unit,
            office: doc.office.office_group
        }));
        
        res.status(200).json({result: modifiedResult});
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetHero = async (req, res) => {
    try {
        const result = await Hero.findOne(
            {},
            'title desc image.link hashtags'
        )

        const modifiedResult = {
            id: result.id,
            title: result.title,
            desc: result.desc,
            image: result.image.link,
            hashtags: result.hashtags,
        };

        res.status(200).json(modifiedResult);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    GetAllAdmissionGuide,
    GetCavsuInfo,
    GetERS,
    GetEvents,
    GetFAQGroup,
    GetFAQs,
    GetOfficials,
    GetHero
}
const mongoose = require('mongoose');

const termsConditionsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['terms', 'privacy'],
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: Array,
        required: true,
        default: []
    },
    version: {
        type: String,
        required: true,
        default: '1.0'
    },
    effectiveDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TermsConditions', termsConditionsSchema);


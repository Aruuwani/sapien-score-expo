const TermsConditions = require('../models/termsConditions.model');

/**
 * Get Terms & Conditions or Privacy Policy
 * @route GET /api/terms/:type
 * @param {string} type - 'terms' or 'privacy'
 */
exports.getTermsConditions = async (req, res) => {
    try {
        const { type } = req.params;

        if (!['terms', 'privacy'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Must be "terms" or "privacy"'
            });
        }

        const termsDoc = await TermsConditions.findOne({ type, isActive: true });

        if (!termsDoc) {
            return res.status(404).json({
                success: false,
                message: `${type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} not found`
            });
        }

        res.status(200).json({
            success: true,
            data: termsDoc
        });
    } catch (error) {
        console.error('Error fetching terms & conditions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch terms & conditions',
            error: error.message
        });
    }
};

/**
 * Create or Update Terms & Conditions (Admin only)
 * @route POST /api/terms
 */
exports.createOrUpdateTerms = async (req, res) => {
    try {
        const { type, title, content, version } = req.body;

        if (!type || !title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Type, title, and content are required'
            });
        }

        if (!['terms', 'privacy'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Must be "terms" or "privacy"'
            });
        }

        // Deactivate previous version
        await TermsConditions.updateMany({ type }, { isActive: false });

        // Create new version
        const termsDoc = await TermsConditions.create({
            type,
            title,
            content,
            version: version || '1.0',
            effectiveDate: new Date(),
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Terms & Conditions created/updated successfully',
            data: termsDoc
        });
    } catch (error) {
        console.error('Error creating/updating terms & conditions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create/update terms & conditions',
            error: error.message
        });
    }
};

/**
 * Get all versions of Terms & Conditions (Admin only)
 * @route GET /api/terms/all/:type
 */
exports.getAllVersions = async (req, res) => {
    try {
        const { type } = req.params;

        if (!['terms', 'privacy'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Must be "terms" or "privacy"'
            });
        }

        const allVersions = await TermsConditions.find({ type }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: allVersions
        });
    } catch (error) {
        console.error('Error fetching all versions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch all versions',
            error: error.message
        });
    }
};


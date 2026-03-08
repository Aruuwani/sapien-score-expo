const fetch = require('node-fetch');

const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

/**
 * Send a WhatsApp template message via Meta Cloud API
 * @param {string} phoneNumber - Recipient phone number (with country code, no +)
 * @param {string} templateName - WhatsApp approved template name
 * @param {string} languageCode - Template language code (default: en_US)
 * @param {Array} parameters - Template parameters (optional)
 */
const sendWhatsAppTemplate = async (phoneNumber, templateName = 'hello_world', languageCode = 'en_US', parameters = []) => {
    try {
        // Clean phone number: remove +, spaces, dashes
        const cleanPhone = phoneNumber.replace(/[\s\-\+]/g, '');

        const body = {
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
            },
        };

        // Add parameters if provided (for templates with variables like {{1}}, {{2}})
        if (parameters.length > 0) {
            body.template.components = [
                {
                    type: 'body',
                    parameters: parameters.map(param => ({
                        type: 'text',
                        text: param,
                    })),
                },
            ];
        }

        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ WhatsApp message sent:', {
                to: cleanPhone,
                template: templateName,
                messageId: data.messages?.[0]?.id,
            });
            return { success: true, data };
        } else {
            console.error('❌ WhatsApp API error:', {
                to: cleanPhone,
                error: data.error,
            });
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('❌ WhatsApp send failed:', {
            to: phoneNumber,
            error: error.message,
        });
        return { success: false, error: error.message };
    }
};

/**
 * Send a scoring notification via WhatsApp
 * Uses the hello_world template (default) — replace with a custom template once approved
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} senderName - Name of the person who scored
 * @param {string} relationName - Relation type (e.g., "friend", "colleague")
 */
const sendScoringNotification = async (phoneNumber, senderName, relationName) => {
    if (!phoneNumber) {
        console.log('⚠️ No phone number provided, skipping WhatsApp notification');
        return { success: false, error: 'No phone number' };
    }

    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
        console.log('⚠️ WhatsApp not configured, skipping notification');
        return { success: false, error: 'WhatsApp not configured' };
    }

    // Use hello_world template for now
    // TODO: Replace with custom template once approved by Meta, e.g.:
    // return sendWhatsAppTemplate(phoneNumber, 'scoring_notification', 'en_US', [senderName, relationName]);
    return sendWhatsAppTemplate(phoneNumber, 'hello_world', 'en_US');
};

module.exports = {
    sendWhatsAppTemplate,
    sendScoringNotification,
};

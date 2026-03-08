const fetch = require('node-fetch');

const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0`;

/**
 * Send a WhatsApp text message via Meta Cloud API
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {string} message - Plain text message to send
 */
const sendWhatsAppText = async (phoneNumber, message) => {
    try {
        const cleanPhone = phoneNumber.replace(/[\s\-\+]/g, '');
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone,
                type: 'text',
                text: { body: message },
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ WhatsApp message sent:', {
                to: cleanPhone,
                messageId: data.messages?.[0]?.id,
            });
            return { success: true, data };
        } else {
            console.error('❌ WhatsApp API error:', data.error);
            // If text message fails (24hr window), try template fallback
            if (data.error?.code === 131047 || data.error?.message?.includes('re-engage')) {
                console.log('↩️ Falling back to template message...');
                return sendWhatsAppTemplate(phoneNumber);
            }
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('❌ WhatsApp send failed:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send a WhatsApp template message (fallback for business-initiated messages)
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} templateName - Approved template name
 * @param {string} languageCode - Template language
 * @param {Array} parameters - Template body parameters
 */
const sendWhatsAppTemplate = async (phoneNumber, templateName = 'hello_world', languageCode = 'en_US', parameters = []) => {
    try {
        const cleanPhone = phoneNumber.replace(/[\s\-\+]/g, '');
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        const body = {
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
            },
        };

        if (parameters.length > 0) {
            body.template.components = [{
                type: 'body',
                parameters: parameters.map(p => ({ type: 'text', text: p })),
            }];
        }

        const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ WhatsApp template sent:', { to: cleanPhone, template: templateName });
            return { success: true, data };
        } else {
            console.error('❌ WhatsApp template error:', data.error);
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('❌ WhatsApp template failed:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send scoring notification via WhatsApp (same message as email)
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} senderName - Name of the person who scored
 * @param {string} relationName - Relation type (e.g., "friend", "colleague")
 */
const sendScoringNotification = async (phoneNumber, senderName, relationName) => {
    if (!phoneNumber) {
        console.log('⚠️ No phone number, skipping WhatsApp');
        return { success: false, error: 'No phone number' };
    }

    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
        console.log('⚠️ WhatsApp not configured, skipping');
        return { success: false, error: 'WhatsApp not configured' };
    }

    const message = `Hello There,

Welcome to SapienScore, a place to share and receive anonymous feedback.

You have been scored by "${senderName}" as "${relationName}"

You can view the scores by creating an account here.

Register at: www.Sapio.one with your corporate and personal email.

Once registered, you can access and view how you are perceived by your friends.

Good luck and happy scoring 😃

Regards,
Team SapienScore`;

    return sendWhatsAppText(phoneNumber, message);
};

module.exports = {
    sendWhatsAppText,
    sendWhatsAppTemplate,
    sendScoringNotification,
};

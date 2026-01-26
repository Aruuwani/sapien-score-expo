const fetch = require('node-fetch');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000';

const termsContent = [
    {
        title: "1. Acceptance of Terms",
        content: "By accessing and using Sapien Score, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
        title: "2. Use License",
        content: "Permission is granted to temporarily download one copy of the materials on Sapien Score's application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:",
        bullets: [
            "Modify or copy the materials",
            "Use the materials for any commercial purpose or for any public display",
            "Attempt to reverse engineer any software contained in Sapien Score",
            "Remove any copyright or other proprietary notations from the materials",
            "Transfer the materials to another person or \"mirror\" the materials on any other server"
        ]
    },
    {
        title: "3. User Account",
        content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account."
    },
    {
        title: "4. User Conduct",
        content: "You agree not to:",
        bullets: [
            "Use the service for any unlawful purpose or to solicit others to perform unlawful acts",
            "Violate any international, federal, provincial or state regulations, rules, laws, or local ordinances",
            "Infringe upon or violate our intellectual property rights or the intellectual property rights of others",
            "Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate",
            "Submit false or misleading information"
        ]
    },
    {
        title: "5. Rating System",
        content: "Sapien Score provides a platform for users to rate and be rated. All ratings should be honest and based on actual experiences. Fraudulent ratings or attempts to manipulate the rating system are strictly prohibited."
    },
    {
        title: "6. Content Ownership",
        content: "You retain ownership of any content you submit to Sapien Score. However, by submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content."
    },
    {
        title: "7. Disclaimer",
        content: "The materials on Sapien Score are provided on an 'as is' basis. Sapien Score makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
        title: "8. Limitations",
        content: "In no event shall Sapien Score or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Sapien Score."
    },
    {
        title: "9. Modifications",
        content: "Sapien Score may revise these terms of service at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service."
    },
    {
        title: "10. Governing Law",
        content: "These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
    },
    {
        title: "11. Contact Information",
        content: "If you have any questions about these Terms & Conditions, please contact us at:",
        bullets: [
            "Email: support@sapienworld.com",
            "Phone: +91 9993324823"
        ]
    }
];

const privacyContent = [
    {
        title: "1. Information We Collect",
        content: "We collect information that you provide directly to us:",
        bullets: [
            "Name and contact information (email, phone number)",
            "Profile information (photo, profession, website)",
            "Account credentials",
            "Ratings and reviews you provide"
        ]
    },
    {
        title: "2. How We Use Your Information",
        content: "We use the information we collect to:",
        bullets: [
            "Provide, maintain, and improve our services",
            "Process your transactions and send related information",
            "Send you technical notices and support messages",
            "Respond to your comments and questions",
            "Monitor and analyze trends, usage, and activities in connection with our services"
        ]
    },
    {
        title: "3. Information Sharing",
        content: "We do not share your personal information with third parties except:",
        bullets: [
            "With your consent",
            "To comply with legal obligations",
            "To protect our rights and prevent fraud"
        ]
    },
    {
        title: "4. Data Security",
        content: "We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction."
    },
    {
        title: "5. Your Rights",
        content: "You have the right to:",
        bullets: [
            "Access your personal information",
            "Correct inaccurate information",
            "Request deletion of your information",
            "Object to processing of your information"
        ]
    },
    {
        title: "6. Cookies and Tracking",
        content: "We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent."
    },
    {
        title: "7. Third-Party Services",
        content: "Our service may contain links to third-party websites or services that are not owned or controlled by Sapien Score. We have no control over, and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services."
    },
    {
        title: "8. Children's Privacy",
        content: "Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us."
    },
    {
        title: "9. Changes to This Privacy Policy",
        content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date."
    },
    {
        title: "10. Contact Us",
        content: "If you have any questions about this Privacy Policy, please contact us at:",
        bullets: [
            "Email: privacy@sapienworld.com",
            "Phone: +91 9993324823"
        ]
    }
];

async function seedTermsConditions() {
    try {
        console.log('🚀 Starting to seed Terms & Conditions via API...\n');

        // Insert Terms & Conditions via POST API
        console.log('📝 Inserting Terms & Conditions...');
        const termsResponse = await fetch(`${API_URL}/node/api/terms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'terms',
                title: 'Terms & Conditions',
                content: termsContent,
                version: '1.0'
            })
        });
        const termsData = await termsResponse.json();

        if (!termsResponse.ok) {
            throw new Error(termsData.message || 'Failed to insert Terms & Conditions');
        }
        console.log('✅ Terms & Conditions inserted:', termsData.data._id);

        // Insert Privacy Policy via POST API
        console.log('\n📝 Inserting Privacy Policy...');
        const privacyResponse = await fetch(`${API_URL}/node/api/terms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'privacy',
                title: 'Privacy Policy',
                content: privacyContent,
                version: '1.0'
            })
        });
        const privacyData = await privacyResponse.json();

        if (!privacyResponse.ok) {
            throw new Error(privacyData.message || 'Failed to insert Privacy Policy');
        }
        console.log('✅ Privacy Policy inserted:', privacyData.data._id);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('📄 Seeding completed successfully!');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`\nTerms ID: ${termsData.data._id}`);
        console.log(`Privacy ID: ${privacyData.data._id}`);
        console.log(`\nYou can now access them via:`);
        console.log(`GET ${API_URL}/node/api/terms/terms`);
        console.log(`GET ${API_URL}/node/api/terms/privacy`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        process.exit(1);
    }
}

seedTermsConditions();


// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone_number: {
        type: String,
       default:null
    },
    email: {
        type: String,
       default:null
    },
    password: {
        type: String,
        required: false,  // Optional - pending users (created via ratings) won't have password
        default: undefined
    },
    agreedTerms: {
        type: Boolean,
        default: false
    },
    work_email: {
        type: String,
       default:null
    },
    username: {
        type: String,
       default:null
    },
    
    name: {
        type: String,
        default: null
    },
    photo_url: {
        type: String,
        default: null
    },
    profession: {
        type: String,
        default: null
    },
    website: {
        type: String,
        default: null
    },
    
    social_links: {
        type: Object,
        default: {},
    },
    activate_social_profile: {
         type: String,
       default:false
    },
    display_username: {
        type: String,
        default: false
    },
    auto_approve: {
        type: String,
        default: false
    },
    notify_score_updates: {
        type: String,
        default: false
    },
    account_status: {
        type: String,
        default: false
    },
    invited: {
        type: String,
        default: true  // Deprecated - kept for backward compatibility
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    
    push_tokens: [{
        token: {
            type: String,
            required: true,  // This prevents null tokens
            unique: true,
            sparse: true     // This allows the unique constraint to ignore nulls
          },
        platform: {
            type: String,
            enum: ['ios', 'android'],
           
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }],
    pendingNotifications: [{
        title: String,
        body: String,
        data: {
            redirectTo: String,  // e.g., "/profile"
            sentAt: Date
        },
        expiresAt: {  // Auto-delete after 30 days
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            index: { expires: '30d' }
        }
      }]
});

userSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);


const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// DEPRECATED: This endpoint is replaced by /api/auth/register
// Kept for backward compatibility
exports.createUser = async (req, res) => {
    try {
        return res.status(410).json({
            error: 'This endpoint is deprecated. Please use POST /node/api/auth/register for new user registration.'
        });
    } catch (err) {
        console.log('err', err);
        res.status(400).json({ error: err.message });
    }
};

const usernames = [
  'anonymous43', 'glittergoldy63', 'avenger612', 'glamqueen223',
  'slytherinboy123', 'skateboarder2', 'slayingbot445', 'mightyknife45',
  'shadowhunter99', 'codebreaker7', 'midnightowl42', 'starlightdreamer',
  'quantumleaper', 'neonphantom88', 'frostbite202', 'dragonhearte',
  'silverfox007', 'cosmicvoyager', 'pixelpioneer', 'mysticmoonbeam',
  'thunderstrike5', 'velvetvortex', 'cyberninja01', 'sapphireskies',
  'emberflare', 'phantomwhisper', 'galacticguru', 'obsidianoracle',
  'lunarlight', 'solarflarex', 'tidalwave99', 'auroraborealis',
  'nebulaknight', 'quantumquasar', 'stardustsailor', 'voidwalkerz',
  'cosmiccrusader', 'etherealsage', 'infinityblade', 'chronomaster',
  'shadowspecter', 'digitaldruid', 'neonwanderer', 'frostfang',
  'emberphoenix', 'thundershock', 'voidvoyager', 'starlightseraph',
  'quantumqwest', 'lunarlegend', 'solarsentinel', 'tidalterror',
  'auroraangel', 'nebulanomad', 'cosmiccaptain', 'etherealexplorer',
  'infinityiris', 'chronochampion', 'shadowswift', 'digitaldynamo',
  'neonnebula', 'frostfire', 'emberecho', 'thundertitan',
  'voidvalkyrie', 'starshadow', 'quantumqueen', 'lunarlancer',
  'solsticewarrior', 'tidalphantom', 'auroraavenger', 'neonnightshade',
  'cosmiccomet', 'etherealenigma', 'infinityimpulse', 'chronocipher',
  'shadowstrike', 'digitaldoppel', 'neonnova', 'frostflame',
  'emberessence', 'thunderthrone', 'voidvanguard', 'starseeker',
  'quantumquiver', 'lunarlotus', 'solarsurge', 'tidaltrance',
  'auroraarcher', 'nebulanight', 'cosmiccatalyst', 'etherealeclipse',
  'infinityicon', 'chronocrystal', 'shadowshard', 'digitaldawn',
  'neonnexus', 'frostfury', 'embereternal', 'thundertrail',
  'voidvortex', 'stardustsage', 'quantumquill', 'lunarlily',
  'solarshade', 'tidaltwilight', 'auroraascent'
];

// GET available usernames
exports.getUserNames= async (req, res) => {
  try {
    // Get all taken usernames from database
    const takenUsernames = await User.find({}, 'username');
    const takenUsernamesSet = new Set(takenUsernames.map(user => user.username));
    
    // Filter out taken usernames
    const availableUsernames = usernames.filter(
      username => !takenUsernamesSet.has(username)
    );
    
    res.json({
      success: true,
      count: availableUsernames.length,
      usernames: availableUsernames
    });
    
  } catch (error) {
    console.error('Error fetching available usernames:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available usernames'
    });
  }
}
exports.getUsers = async (req, res) => {
    try {
        const users = await userService.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserByWorkEmailOrPhoneNumber = async (req, res) => {
    const { work_email, phone_number } = req.query;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 getUserByWorkEmailOrPhoneNumber:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('work_email:', work_email);
    console.log('phone_number:', phone_number);

    try {
        // Build query conditions to check ALL possible fields
        // This handles:
        // 1. Users created with email field
        // 2. Users created with work_email field (backward compatibility)
        // 3. Users created with phone_number field
        // 4. Pending users (created via rating) with any of these fields
        const queryConditions = [];

        if (work_email) {
            queryConditions.push({ email: work_email });        // Check email field
            queryConditions.push({ work_email: work_email });   // Check work_email field
        }

        if (phone_number) {
            queryConditions.push({ phone_number: phone_number });
        }

        console.log('Query conditions:', JSON.stringify(queryConditions, null, 2));

        const user = await userService.findOne({
            $or: queryConditions
        });

        if (!user) {
            console.log('❌ User not found');
            console.log('═══════════════════════════════════════════════════════\n');
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('✅ User found:', {
            id: user._id,
            email: user.email,
            work_email: user.work_email,
            phone_number: user.phone_number,
            hasPassword: !!user.password,
            isPending: !user.password
        });
        console.log('═══════════════════════════════════════════════════════\n');

        res.json(user);
    } catch (err) {
        console.error('❌ Error in getUserByWorkEmailOrPhoneNumber:', err);
        console.log('═══════════════════════════════════════════════════════\n');
        res.status(500).json({ error: err.message });
    }
};

exports.getUser = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required in the header' });
    }

    try {
        const user = await userService.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateUser = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required in the header' });
    }

    try {
        const user = await userService.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const existingUser = await userService.findOne({
            $or: [
                { work_email: req.body.work_email },
                { phone_number: req.body.phone_number }
            ]
        });

        if (existingUser) {
            if (existingUser.work_email === req.body.work_email) {
                return res.status(400).json({ error: 'Work email already registered' });
            }

            if (existingUser.phone_number === req.body.phone_number) {
                return res.status(400).json({ error: 'Phone number already registered' });
            }
        }

        // Update only fields that are provided in the request body
        const updatableFields = [
            'username',
            'phone_number',
            'email',
            'work_email',
            'name',
            'photo_url',
            'profession',
            'social_links',
            "activate_social_profile",
            "display_username",
            "website",
            "auto_approve",
            "notify_score_updates",
            "account_status",
            "push_tokens",
            "pendingNotifications"
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        const updatedUser = await user.save();

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


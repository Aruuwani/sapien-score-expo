const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
exports.create = async (userData) => {
    const queryConditions = [
        { work_email: userData.work_email },
        { phone_number: userData.phone_number }
    ].filter(condition => Object.values(condition)[0]); // Remove undefined conditions

    const existing = await User.findOne({ $or: queryConditions });

    if (existing) {
        const token = jwt.sign(
            { id: existing._id, phone_number: existing.phone_number },
            process.env.JWT_SECRET,
           
        );
        return { user: existing, token, alreadyExists: true };
    }

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    return { user: savedUser, token: null, alreadyExists: false };
};


exports.findAll = async () => {
    return await User.find();
};
exports.findOne = async (query) => {
    return await User.findOne(query);
};

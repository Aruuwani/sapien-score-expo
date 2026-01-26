const Rating = require('../models/Rating.model');

const createRating = async (data) => {
  const newRating = new Rating(data);
  return await newRating.save();
};

const getRatingsForUser = async (receiver_id) => {
  return await Rating.find({ receiver_id }).populate('sender_id', 'username email phone_number work_email');
};
const getRatingsIScored = async (sender_id) => {
  return await Rating.find({ sender_id }).populate('receiver_id', 'username email phone_number work_email');
};

const updateRatingStatus = async (ratingId, status) => {
  return await Rating.findByIdAndUpdate(ratingId, { status }, { new: true });
};

const getRatingsByUserId = async (userId) => {
  try {
    const ratings = await Rating.find({ sender_id: userId }).populate('receiver_id');
    console.log(ratings,"rating11")
    return ratings;
  } catch (error) {
    console.error('Error in getRatingsByUserId:', error);
    throw error;
  }
};

const getRatingsForMe = async (receiver_id) => {
  const ratings = await Rating.find({ receiver_id }).populate('sender_id', 'username email phone_number work_email');
  return ratings;
};




module.exports = {
  createRating,
  getRatingsForUser,
  updateRatingStatus,
  getRatingsByUserId,
  getRatingsForMe,
  getRatingsIScored
};
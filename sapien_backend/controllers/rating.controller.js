const ratingService = require('../services/rating.services');
const relationService = require('../services/relationService');
const { sendScoringNotification } = require('../services/whatsappService');
// const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const { Types } = mongoose;
const { ObjectId } = Types;
const Rating = require('../models/Rating.model');
const User = require('../models/user.model'); // Adjust path as per your project
const { Expo } = require('expo-server-sdk'); // Note the destructuring here
const expo = new Expo();
// const createRating = async (req, res) => {
//   console.log('req.body', req.body)
//   try {
//     const sender_id = req.userId; // from authMiddleware
//     const { emailOrPhone, rating_data,sender_relation } = req.body;

//     if (!emailOrPhone || !rating_data || !sender_relation) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }

//     // Find or create receiver
//     let receiver = await User.findOne({
//       $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
//     });

//     if (!receiver) {
//       receiver = await User.create({
//         email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
//         phone: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
//         createdAt: new Date(),
//       });
//     }

//     const newRating = new Rating({
//       sender_id,
//       receiver_id: receiver._id,
//      rating_data,
//       sender_relation,
//       status: 'pending',
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     await newRating.save();

//     res.status(201).json({ message: 'Rating created successfully.', data: newRating });
//   } catch (err) {
//     console.error('Error creating rating:', err.message);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };

const nodemailer = require('nodemailer');
// Twilio disabled - using email notifications only
// const twilio = require('twilio');
const Notification = require('../models/Notification');
const { createNotification } = require('./notification');


// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email password or app password
  },
});

// Twilio disabled
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// const createRating = async (req, res) => {
//   try {
//     const sender_id = req.userId;
//     const { emailOrPhone, rating_data, sender_relation } = req.body;

//     if (!emailOrPhone || !rating_data || !sender_relation) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }

//     // Find or create receiver
//     let receiver = await User.findOne({
//       $or: [{ work_email: emailOrPhone }, { phone_number: emailOrPhone }],
//     });

//     if (!receiver) {
//       receiver = await User.create({
//         work_email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
//         phone_number: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
//         createdAt: new Date(),
//       });
//     }

//     // Determine status - simple string value based on auto_approve flag
//     const status = receiver.auto_approve === 'true' ? 'approved' : 'pending';
//     console.log('receiver', receiver)
//     const newRating = new Rating({
//       sender_id,
//       receiver_id: receiver._id,
//       rating_data,
//       sender_relation,
//       status: status,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     const savedRating = await newRating.save();
//     const sender = await User.findById(sender_id);
//     await createNotification({
//       userId: receiver._id,
//       createdBy: sender_id,
//       message: 'New score request received from ' + sender.username || 'Anonymous',
//       type: 'rating',
//     });


//     const messageText = `New score request received from ' ${sender.username || 'Anonymous'}. Login on Sapien Score app to view.`;

//     // Send email or SMS notification
//     if (emailOrPhone.includes('@')) {
//       // Send email
//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: emailOrPhone,
//         subject: 'You have a new Sapien Score Request!',
//         text: messageText,
//       });
//     } else {
//       // Send SMS
//       await twilioClient.messages.create({
//         body: messageText,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: emailOrPhone, // Make sure it's in international format
//       });
//     }

//     res.status(201).json({ message: 'Rating created successfully.', data: newRating });
//   } catch (err) {
//     console.error('Error creating rating:', err.message);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };

// const createRating = async (req, res) => {
//   try {
//     const sender_id = req.userId;
//     const { emailOrPhone, rating_data, sender_relation } = req.body;

//     if (!emailOrPhone || !rating_data || !sender_relation) {
//       return res.status(400).json({ error: 'Missing required fields.' });
//     }

//     // Find or create receiver
//     let receiver = await User.findOne({
//       $or: [{ work_email: emailOrPhone }, { phone_number: emailOrPhone }],
//     }).populate('push_tokens');

//     if (!receiver) {
//       receiver = await User.create({
//         work_email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
//         phone_number: !emailOrPhone.includes('@') ? emailOrPhone : undefined,
//         invited : true,
//         createdAt: new Date(),
//       });
//     }

//     // Determine status
//     const status = receiver.auto_approve === 'true' ? 'approved' : 'pending';

//     const newRating = new Rating({
//       sender_id,
//       receiver_id: receiver._id,
//       rating_data,
//       sender_relation,
//       status: status,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     const savedRating = await newRating.save();
//     const sender = await User.findById(sender_id);

//     // Create database notification
//     await createNotification({
//       userId: receiver._id,
//       createdBy: sender_id,
//       message: `New score request received from ${sender?.username || 'Anonymous'}`,
//       type: 'rating',
//     });

//     const notificationMessage = `New score request received from ${sender?.username || 'Anonymous'}`;

//     // Send push notifications to all registered devices
//     // if (receiver.push_tokens?.length > 0) {
//     //   const messages = receiver.push_tokens
//     //     .filter(token => Expo.isExpoPushToken(token))
//     //     .map(token => ({
//     //       to: token,
//     //       sound: 'default',
//     //       title: 'New Sapien Score Request',
//     //       body: notificationMessage,
//     //       data: { 
//     //         screen: 'sapiensrequests',
//     //         ratingId: savedRating._id.toString()
//     //       },
//     //     }));

//     //   if (messages.length > 0) {
//     //     await expo.sendPushNotificationsAsync(messages);
//     //   }
//     // }
//     await sendNotification(receiver._id, {
//       title: 'Sapien Score Request',
//       body: notificationMessage,
//       data: {
//         screen: 'sapiensrequests',
//         ratingId: savedRating._id.toString()
//       },

//     })
//     // Fallback to email/SMS
//     if (emailOrPhone.includes('@')) {
//       await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: emailOrPhone,
//         subject: 'New Sapien Score Request',
//         text: notificationMessage,
//       });
//     } else {
//       await twilioClient.messages.create({
//         body: notificationMessage,
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: emailOrPhone,
//       });
//     }

//     res.status(201).json({
//       message: 'Rating created successfully',
//       data: savedRating
//     });

//   } catch (err) {
//     console.error('Error creating rating:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
const createRating = async (req, res) => {
  try {
    const sender_id = req.userId;
    const { emailOrPhone, rating_data, sender_relation, existing_rating_id } = req.body;

    if (!emailOrPhone || !rating_data || !sender_relation) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Find or create receiver
    // Check both email and work_email fields for backward compatibility
    let receiver = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { work_email: emailOrPhone },
        { phone_number: emailOrPhone }
      ],
    }).populate('push_tokens');

    if (!receiver) {
      // Create a "pending user" - user who has been rated but hasn't registered yet
      // They will have email/phone but NO password (password will be null/undefined)
      const isEmail = emailOrPhone.includes('@');

      receiver = await User.create({
        email: isEmail ? emailOrPhone : undefined,
        phone_number: !isEmail ? emailOrPhone : undefined,
        work_email: isEmail ? emailOrPhone : undefined, // For backward compatibility
        password: undefined, // No password - this is a pending user
        agreedTerms: false, // They haven't agreed to terms yet
        invited: 'true', // For backward compatibility
        createdAt: new Date(),
      });
    }

    // Check if we're updating an existing rating
    let rating;
    if (existing_rating_id) {
      // Verify the existing rating belongs to this sender-receiver pair
      rating = await Rating.findOne({
        _id: existing_rating_id,
        sender_id,
        receiver_id: receiver._id
      });

      if (rating) {
        // Update existing rating
        rating.rating_data = rating_data;
        rating.sender_relation = sender_relation;
        rating.updated_at = new Date();
        await rating.save();

        console.log('✅ Rating updated:', {
          ratingId: rating._id,
          sender: sender_id,
          receiver: receiver._id,
          relation: sender_relation
        });

        return res.status(200).json({
          message: 'Rating updated successfully',
          data: rating
        });
      }
      // If no matching rating found, continue to create new one
    }

    // Check if user has already rated this receiver with the same relation
    // This prevents duplicate ratings for the same sender-receiver-relation combination
    const existingRating = await Rating.findOne({
      sender_id,
      receiver_id: receiver._id,
      sender_relation,
      status: { $in: ['pending', 'approved'] } // Only check active ratings
    });

    if (existingRating) {
      // Get relation name for better error message
      let relationName = sender_relation;
      try {
        const relation = await relationService.getRelationById(sender_relation);
        if (relation && relation.name) {
          relationName = relation.name;
        }
      } catch (err) {
        console.error('Error fetching relation name:', err);
      }

      console.log('⚠️ Duplicate rating attempt blocked:', {
        sender: sender_id,
        receiver: receiver._id,
        relation: sender_relation,
        relationName: relationName,
        existingRatingId: existingRating._id
      });

      return res.status(400).json({
        error: 'You have already rated this user with this relation',
        message: `You have already rated this user as "${relationName}". You can only rate once per relation type.`,
        alreadyScored: true,
        relationName: relationName,
        existingRating: existingRating
      });
    }

    // Determine status for new rating
    const status = receiver.auto_approve === 'true' ? 'approved' : 'pending';

    // Create new rating
    const newRating = new Rating({
      sender_id,
      receiver_id: receiver._id,
      rating_data,
      sender_relation,
      status: status,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('✅ Creating new rating:', {
      sender: sender_id,
      receiver: receiver._id,
      relation: sender_relation,
      status
    });

    const savedRating = await newRating.save();
    const sender = await User.findById(sender_id);

    // Create database notification
    await createNotification({
      userId: receiver._id,
      createdBy: sender_id,
      message: `New score request received from ${sender?.username || 'Anonymous'}`,
      type: 'rating',
    });

    const notificationMessage = `New score request received from ${sender?.username || 'Anonymous'}`;

    // Send push notification to registered users with push tokens
    await sendNotification(receiver._id, {
      title: 'Sapien Score Request',
      body: notificationMessage,
      data: {
        screen: 'sapiensrequests',
        ratingId: savedRating._id.toString()
      },
    });

    // Send email notification ONLY if email is provided
    // Twilio SMS is disabled - no notifications for phone-only ratings
    if (emailOrPhone.includes('@')) {
      // Get relation name
      let relationName = 'colleague/friend/casual';
      try {
        if (sender_relation) {
          const relation = await relationService.getRelationById(sender_relation);
          if (relation && relation.name) {
            relationName = relation.name.toLowerCase();
          }
        }
      } catch (err) {
        console.error('Error fetching relation name for email:', err);
      }

      const senderUsername = sender?.username || 'Someone';

      // Logo URL hosted on S3
      const logoUrl = 'https://sapienbuket.s3.us-east-1.amazonaws.com/SapienScore.png';


      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .logo { margin-bottom: 20px; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hello There,</p>
      
      <p>Welcome to Sapienscore, a place to share and receive anonymous feedback.</p>
      
      <p>You have been scored by "<strong>${senderUsername}</strong>" as "<strong>${relationName}</strong>"</p>
      
      <p>You can view the scores by creating an account here.</p>
      
      <p>Register at: <a href="https://www.sapio.one">www.Sapio.one</a> with your corporate and personal email.</p>
      
      <p>Once register, you can access and view how you are perceived by your friends.</p>
      
      <p>Good luck and happy scoring 😃</p>
      
      <p>Regards,</p>
      
      <p>Team SapienScore</p>
      
      <p><img src="${logoUrl}" alt="Team SapienScore" style="width: 150px; margin-top: 10px;" /></p>
    </div>
  </div>
</body>
</html>
      `;

      const emailText = `
Hello There,

Welcome to Sapienscore, a place to share and receive anonymous feedback.

You have been scored by "${senderUsername}" as "${relationName}"

You can view the scores by creating an account here.

Register at: www.Sapio.one with your corporate and personal email.

Once register, you can access and view how you are perceived by your friends.

Good luck and happy scoring 😃

Regards,
Team SapienScore
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailOrPhone,
        subject: 'New Sapien Score Request',
        text: emailText,
        html: emailHtml,
      });
    }
    // Send WhatsApp notification if receiver has a phone number
    const receiverPhone = receiver.phone_number || (!emailOrPhone.includes('@') ? emailOrPhone : null);
    if (receiverPhone) {
      try {
        await sendScoringNotification(receiverPhone, sender?.username || 'Someone', relationName || 'colleague');
      } catch (whatsappError) {
        console.error('WhatsApp notification failed (non-blocking):', whatsappError.message);
      }
    }

    res.status(201).json({
      message: 'Rating created successfully',
      data: savedRating
    });

  } catch (err) {
    console.error('Error creating/updating rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// utils/notifications.js
// const sendNotification = async (userId, notification) => {
//   try {
//     const user = await User.findById(userId);

//     // Try immediate delivery if user has tokens
//     if (user.push_tokens?.length > 0) {
//       const expoMessages = user.push_tokens.map(token => ({
//         to: token.token,
//         title: notification.title,
//         body: notification.body,
//         data: { redirectTo: notification.redirectUrl }
//       }));

//       await axios.post('https://exp.host/--/api/v2/push/send', expoMessages);
//       return { delivered: true };
//     }

//     // Fallback: Queue if no tokens or delivery fails
//     await User.updateOne(
//       { _id: userId },
//       {
//         $push: {
//           pendingNotifications: {
//             ...notification,
//             createdAt: new Date()
//           }
//         }
//       }
//     );
//     return { queued: true };

//   } catch (error) {
//     // Network errors will trigger this catch
//     await User.updateOne(
//       { _id: userId },
//       { $push: { pendingNotifications: notification } }
//     );
//     return { queued: true };
//   }
// };

const sendNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId);

    // Filter out any invalid tokens
    const validTokens = user.push_tokens?.filter(t => t.token && t.token !== 'null') || [];

    // Try immediate delivery if valid tokens exist
    if (validTokens.length > 0) {
      const expoMessages = validTokens.map(token => ({
        to: token.token,
        title: notification.title,
        body: notification.body,
        data: notification.data
      }));

      await axios.post('https://exp.host/--/api/v2/push/send', expoMessages);
      return { delivered: true };
    }

    // Fallback: Queue if no valid tokens
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          pendingNotifications: {
            ...notification,
            createdAt: new Date()
          }
        }
      }
    );
    return { queued: true };

  } catch (error) {
    console.error('Notification error:', error);
    // Queue on any error
    await User.updateOne(
      { _id: userId },
      { $push: { pendingNotifications: notification } }
    );
    return { queued: true };
  }
};

const updateRating = async (req, res) => {
  try {
    const sender_id = req.userId;
    const { ratingId, rating_data, sender_relation } = req.body;

    if (!ratingId || !rating_data || !sender_relation) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Find the existing rating
    const existingRating = await Rating.findOne({
      _id: new ObjectId(ratingId),
      sender_id: sender_id
    });

    if (!existingRating) {
      return res.status(404).json({ error: 'Rating not found or you are not authorized to update it.' });
    }

    // Update the rating
    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      {
        $set: {
          rating_data: rating_data,
          sender_relation: sender_relation,
          status: 'pending', // Reset status if needed
          updated_at: new Date()
        }
      },
      { new: true } // Return the updated document
    );

    // Find receiver information
    const receiver = await User.findById(existingRating.receiver_id);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found.' });
    }

    // Update notification
    await createNotification({
      userId: receiver._id,
      createdBy: sender_id,
      message: 'Your rating has been updated. Check your Sapien Score.',
      type: 'rating_update',
    });

    // Send email notification only (Twilio disabled)
    const contactEmail = receiver.email || receiver.work_email;
    const messageText = `Your Sapien Score has been updated. Login to view the changes.`;

    // Send email notification ONLY
    if (contactEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: contactEmail,
        subject: 'Your Sapien Score has been updated!',
        text: messageText,
      });
    }
    // Send WhatsApp notification for score update
    const receiverPhone = receiver.phone_number;
    if (receiverPhone) {
      try {
        await sendScoringNotification(receiverPhone, 'Someone', 'score update');
      } catch (whatsappError) {
        console.error('WhatsApp update notification failed (non-blocking):', whatsappError.message);
      }
    }

    res.status(200).json({
      message: 'Rating updated successfully.',
      data: updatedRating
    });
  } catch (err) {
    console.error('Error updating rating:', err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
const getRatings = async (req, res) => {
  try {
    const receiver_id = req.params.receiver_id || req.userId; // fallback to current user
    const ratings = await ratingService.getRatingsForUser(receiver_id);
    res.status(200).json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ratings', error: err.message });
  }
};



const updateStatus = async (req, res) => {
  try {
    const updatedRating = await ratingService.updateRatingStatus(req.params.ratingId, req.body.status);
    res.status(200).json(updatedRating);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update rating status', error: err.message });
  }
};


async function getUserRatings(req, res) {
  try {
    const userId = req.userId;
    console.log(userId, "userId")
    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    const ratings = await ratingService.getRatingsByUserId(userId);
    console.log(ratings, "rating")
    return res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


const getWhoScoredMe = async (req, res) => {
  try {
    const receiver_id = req.userId;
    console.log('Receiver ID from token:', receiver_id);

    const ratings = await ratingService.getRatingsForMe(receiver_id);

    if (!ratings || ratings.length === 0) {
      return res.status(200).json({ message: "No ratings found", data: [] });
    }

    res.status(200).json({ message: "Ratings fetched successfully", data: ratings });
  } catch (error) {
    console.error('Error fetching who scored me:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// const GetWhomIScored = async (req, res) => {
//   try {
//     const sender_id = req.userId;
//     console.log('Receiver ID from token:', sender_id);

//     const ratings = await ratingService.getRatingsIScored(sender_id);
//     console.log('GetWhomIScoredstings', ratings)
//     if (!ratings || ratings.length === 0) {
//       return res.status(200).json({ message: "No ratings found", data: [] });
//     }

//     res.status(200).json({ message: "Ratings fetched successfully", data: ratings });
//   } catch (error) {
//     console.error('Error fetching who scored me:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

const GetWhomIScored = async (req, res) => {
  try {
    const sender_id = req.userId;
    const ratings = await ratingService.getRatingsIScored(sender_id);

    if (!ratings || ratings.length === 0) {
      return res.status(200).json({ message: "No ratings found", data: [] });
    }

    const ratingsWithRelations = await Promise.all(ratings.map(async (rating) => {
      if (!rating.sender_relation) {
        return {
          ...rating.toObject ? rating.toObject() : rating,
          sender_relation_name: null
        };
      }

      // Case 1: sender_relation is already a string name (like "Family")
      if (typeof rating.sender_relation === 'string' &&
        !mongoose.Types.ObjectId.isValid(rating.sender_relation)) {
        return {
          ...rating.toObject ? rating.toObject() : rating,
          sender_relation_name: rating.sender_relation
        };
      }

      // Case 2: sender_relation is an ObjectId (like "68319a34dc5cfcb597943d4e")
      try {
        const relation = await relationService.getRelationById(rating.sender_relation);
        return {
          ...rating.toObject ? rating.toObject() : rating,
          sender_relation_name: relation ? relation.name : null
        };
      } catch (err) {
        console.error(`Error fetching relation for ID ${rating.sender_relation}:`, err);
        return {
          ...rating.toObject ? rating.toObject() : rating,
          sender_relation_name: null
        };
      }
    }));

    res.status(200).json({
      message: "Ratings fetched successfully",
      data: ratingsWithRelations
    });
  } catch (error) {
    console.error('Error fetching who scored me:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// const AlreadyScored = async (req, res) => {
//   try {
//     console.log('Raw query params:', req.query);

//     const { receiver_id, sender_relation } = req.query;
//     const sender_id = req.userId; // From authMiddleware (already ObjectId)
// console.log('receiver_id, sender_relation,sender_id', receiver_id, sender_relation,sender_id)
//     // Validation
//     if (!receiver_id || !sender_relation) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Convert only what needs conversion
//     const receiverId = new ObjectId(receiver_id);

//     // Debug logs
//     console.log('Processed IDs:', {
//       sender_id,         // Should already be ObjectId
//       receiverId,        // Newly converted
//       sender_relation    // Untouched (string)
//     });

//     const existing = await Rating.findOne({
//       sender_id,
//       receiver_id: receiverId,
//       sender_relation
//     });

//     return res.status(200).json({
//       alreadyScored: !!existing,
//       existingRating: existing || null
//     });

//   } catch (err) {
//     console.error('Full error:', err);

//     if (err instanceof mongoose.Error.CastError) {
//       return res.status(400).json({
//         error: 'ID format error',
//         details: `Failed to process ID: ${err.value}`,
//         solution: 'Ensure all IDs are 24-character hex strings'
//       });
//     }

//     return res.status(500).json({
//       error: 'Server error',
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// Get all relations that the logged user has already scored for a specific receiver
const getScoredRelationsForReceiver = async (req, res) => {
  try {
    const { receiver_id } = req.query;
    const sender_id = req.userId;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 getScoredRelationsForReceiver:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('sender_id:', sender_id);
    console.log('receiver_id:', receiver_id);

    if (!receiver_id) {
      console.log('❌ Missing receiver_id');
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'receiver_id is required'
      });
    }

    // Check if receiver_id is a valid ObjectId or an email/phone
    let receiverObjectId;

    if (mongoose.Types.ObjectId.isValid(receiver_id) && receiver_id.length === 24) {
      // It's a valid ObjectId
      receiverObjectId = new mongoose.Types.ObjectId(receiver_id);
      console.log('receiver_id is a valid ObjectId:', receiverObjectId);
    } else {
      // receiver_id is an email or phone - look up the user
      console.log('receiver_id appears to be email/phone, looking up user...');
      const user = await User.findOne({
        $or: [
          { email: receiver_id },
          { work_email: receiver_id },
          { phone_number: receiver_id }
        ]
      });

      if (!user) {
        console.log('No user found for this email/phone - returning empty scored relations');
        return res.status(200).json({
          scoredRelations: [],
          scoredRelationIds: [],
          count: 0
        });
      }

      receiverObjectId = user._id;
      console.log('Found user with _id:', receiverObjectId);
    }

    // Find all ratings from this sender to this receiver
    const existingRatings = await Rating.find({
      sender_id,
      receiver_id: receiverObjectId,
      status: { $in: ['pending', 'approved'] }
    });

    console.log(`Found ${existingRatings.length} existing rating(s)`);

    if (existingRatings.length > 0) {
      console.log('Existing ratings details:');
      existingRatings.forEach((rating, index) => {
        console.log(`  Rating ${index + 1}:`);
        console.log('    _id:', rating._id);
        console.log('    sender_relation:', rating.sender_relation);
        console.log('    sender_relation type:', typeof rating.sender_relation);
        console.log('    status:', rating.status);
      });
    }

    // Extract relation IDs
    const scoredRelationIds = existingRatings.map(rating => rating.sender_relation);

    console.log('Scored relation IDs:', scoredRelationIds);
    console.log('Scored relation IDs types:', scoredRelationIds.map(id => typeof id));

    // Fetch relation names
    const relationsWithNames = await Promise.all(
      scoredRelationIds.map(async (relationId) => {
        try {
          const relation = await relationService.getRelationById(relationId);
          return {
            relationId: relationId,
            relationName: relation ? relation.name : null
          };
        } catch (err) {
          console.error(`Error fetching relation ${relationId}:`, err);
          return {
            relationId: relationId,
            relationName: null
          };
        }
      })
    );

    console.log('Relations with names:', relationsWithNames);
    console.log('═══════════════════════════════════════════════════════\n');

    return res.status(200).json({
      scoredRelations: relationsWithNames,
      scoredRelationIds: scoredRelationIds,
      count: scoredRelationIds.length
    });

  } catch (error) {
    console.error('❌❌❌ getScoredRelationsForReceiver error ❌❌❌');
    console.error('Error message:', error.message);
    console.log('═══════════════════════════════════════════════════════\n');
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const AlreadyScored = async (req, res) => {
  try {
    const { receiver_id, sender_relation } = req.query;
    const sender_id = req.userId;

    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 AlreadyScored check:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('sender_id:', sender_id, '(type:', typeof sender_id, ')');
    console.log('sender_id toString:', sender_id.toString());
    console.log('receiver_id:', receiver_id, '(type:', typeof receiver_id, ')');
    console.log('sender_relation:', sender_relation, '(type:', typeof sender_relation, ')');
    console.log('query:', req.query);

    // Validate required parameters
    if (!receiver_id || !sender_relation) {
      console.log('❌ Missing required parameters');
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both receiver_id and sender_relation are required'
      });
    }

    // Check if receiver_id is a valid ObjectId or an email/phone
    let receiverObjectId;

    if (mongoose.Types.ObjectId.isValid(receiver_id) && receiver_id.length === 24) {
      // It's a valid ObjectId
      receiverObjectId = new mongoose.Types.ObjectId(receiver_id);
      console.log('receiver_id is a valid ObjectId:', receiverObjectId);
    } else {
      // receiver_id is an email or phone - look up the user
      console.log('receiver_id appears to be email/phone, looking up user...');
      const user = await User.findOne({
        $or: [
          { email: receiver_id },
          { work_email: receiver_id },
          { phone_number: receiver_id }
        ]
      });

      if (!user) {
        console.log('No user found for this email/phone - cannot have been scored');
        // Get relation name for better response
        let relationName = sender_relation;
        try {
          const relation = await relationService.getRelationById(sender_relation);
          if (relation && relation.name) {
            relationName = relation.name;
          }
        } catch (err) {
          console.error('Error fetching relation name:', err);
        }

        return res.status(200).json({
          alreadyScored: false,
          ratingId: null,
          status: null,
          createdAt: null,
          relationName: relationName
        });
      }

      receiverObjectId = user._id;
      console.log('Found user with _id:', receiverObjectId);
    }
    console.log('Using receiverObjectId:', receiverObjectId.toString());

    // Build query
    const query = {
      sender_id,
      receiver_id: receiverObjectId,
      sender_relation,
      status: { $in: ['pending', 'approved'] }
    };

    console.log('Database query:', JSON.stringify(query, null, 2));
    console.log('Query breakdown:');
    console.log('  - sender_id:', query.sender_id, '(type:', typeof query.sender_id, ')');
    console.log('  - receiver_id:', query.receiver_id, '(type:', typeof query.receiver_id, ')');
    console.log('  - sender_relation:', query.sender_relation, '(type:', typeof query.sender_relation, ')');
    console.log('  - status:', query.status);

    const existingRating = await Rating.findOne(query);

    console.log('Query result:', existingRating ? 'FOUND' : 'NOT FOUND');

    // ADDITIONAL DEBUG: Check if there are ANY ratings for this sender-receiver pair
    console.log('');
    console.log('🔍 DEBUG: Checking ALL ratings for this sender-receiver pair...');
    const allRatingsForPair = await Rating.find({
      sender_id,
      receiver_id: receiverObjectId
    });
    console.log(`Found ${allRatingsForPair.length} total rating(s) for this sender-receiver pair`);

    if (allRatingsForPair.length > 0) {
      allRatingsForPair.forEach((rating, index) => {
        console.log(`  Rating ${index + 1}:`);
        console.log('    _id:', rating._id);
        console.log('    sender_id:', rating.sender_id, '(matches query?', rating.sender_id.toString() === sender_id.toString(), ')');
        console.log('    receiver_id:', rating.receiver_id, '(matches query?', rating.receiver_id.toString() === receiverObjectId.toString(), ')');
        console.log('    sender_relation:', rating.sender_relation, '(matches query?', rating.sender_relation === sender_relation, ')');
        console.log('    sender_relation type:', typeof rating.sender_relation);
        console.log('    query sender_relation type:', typeof sender_relation);
        console.log('    status:', rating.status, '(in [pending, approved]?', ['pending', 'approved'].includes(rating.status), ')');
        console.log('    created_at:', rating.created_at);
        console.log('    ---');
        console.log('    ALL CONDITIONS MET?',
          rating.sender_id.toString() === sender_id.toString() &&
          rating.receiver_id.toString() === receiverObjectId.toString() &&
          rating.sender_relation === sender_relation &&
          ['pending', 'approved'].includes(rating.status)
        );
      });
    }
    console.log('');

    // Get relation name for better response
    let relationName = sender_relation;
    try {
      const relation = await relationService.getRelationById(sender_relation);
      if (relation && relation.name) {
        relationName = relation.name;
      }
    } catch (err) {
      console.error('Error fetching relation name:', err);
    }

    if (existingRating) {
      console.log('⚠️⚠️⚠️ DUPLICATE RATING FOUND! ⚠️⚠️⚠️');
      console.log('   Rating ID:', existingRating._id);
      console.log('   Sender ID:', existingRating.sender_id);
      console.log('   Receiver ID:', existingRating.receiver_id);
      console.log('   Sender Relation:', existingRating.sender_relation);
      console.log('   Relation Name:', relationName);
      console.log('   Status:', existingRating.status);
      console.log('   Created at:', existingRating.created_at);
      console.log('═══════════════════════════════════════════════════════\n');
    } else {
      console.log('✅ No existing rating found - user can proceed');
      console.log('═══════════════════════════════════════════════════════\n');
    }

    return res.status(200).json({
      alreadyScored: !!existingRating,
      ratingId: existingRating?._id || null,
      status: existingRating?.status || null,
      createdAt: existingRating?.created_at || null,
      relationName: relationName
    });

  } catch (error) {
    console.error('❌❌❌ AlreadyScored error ❌❌❌');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('═══════════════════════════════════════════════════════\n');
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};



module.exports = {
  createRating,
  getRatings,
  updateStatus,
  getUserRatings,
  getWhoScoredMe,
  AlreadyScored,
  GetWhomIScored,
  updateRating,
  getScoredRelationsForReceiver

};

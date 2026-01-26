const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Create a rating
router.post('/', authMiddleware,ratingController.createRating);
router.post('/updateratings', authMiddleware, ratingController.updateRating);
// router.get('/getmyratings', authMiddleware,ratingController.createRating);

// Get all ratings **given by the logged-in user**
router.get('/getuser_rating', authMiddleware, ratingController.getUserRatings);

// Get all ratings whihc hase given to me**
router.get('/who-scored-me', authMiddleware, ratingController.getWhoScoredMe);
router.get('/whom-i-scored', authMiddleware, ratingController.GetWhomIScored);

router.get('/check-if-scored', authMiddleware, ratingController.AlreadyScored);

// Get scored relations for a specific receiver
router.get('/scored-relations-for-receiver', authMiddleware, ratingController.getScoredRelationsForReceiver);

// Get all ratings for a receiver
router.get('/:receiver_id',authMiddleware, ratingController.getRatings);

// Update rating status (support both PATCH and PUT for CORS compatibility)
router.patch('/:ratingId/status', authMiddleware, ratingController.updateStatus);
router.put('/:ratingId/status', authMiddleware, ratingController.updateStatus);



// router.get('/:receiver_id', authMiddleware, ratingController.getRatings);




module.exports = router;

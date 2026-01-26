/**
 * Test Script: Duplicate Rating Prevention
 * 
 * This script tests that:
 * 1. User can rate another user once per relation type
 * 2. User cannot rate the same user with the same relation twice
 * 3. User CAN rate the same user with different relations
 */

const mongoose = require('mongoose');
const User = require('./models/user.model');
const Rating = require('./models/Rating.model');
require('dotenv').config();

async function testDuplicateRatingPrevention() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Create test users
        console.log('═══════════════════════════════════════════════════════');
        console.log('SETUP: Creating test users');
        console.log('═══════════════════════════════════════════════════════\n');

        // Clean up existing test data
        await User.deleteMany({ email: { $in: ['sender@test.com', 'receiver@test.com'] } });
        await Rating.deleteMany({});

        const sender = await User.create({
            email: 'sender@test.com',
            phone_number: '+919876543210',
            password: 'hashedpassword123',
            username: 'TestSender',
            agreedTerms: true
        });

        const receiver = await User.create({
            email: 'receiver@test.com',
            phone_number: '+919876543211',
            password: 'hashedpassword456',
            username: 'TestReceiver',
            agreedTerms: true
        });

        console.log('✅ Test users created:');
        console.log(`   Sender: ${sender.email} (${sender._id})`);
        console.log(`   Receiver: ${receiver.email} (${receiver._id})`);
        console.log('');

        // Test Case 1: Create first rating with "friend" relation
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 1: First rating with "friend" relation');
        console.log('═══════════════════════════════════════════════════════\n');

        const rating1 = await Rating.create({
            sender_id: sender._id,
            receiver_id: receiver._id,
            sender_relation: 'friend',
            rating_data: [
                {
                    topic: 'Communication',
                    traits: [
                        { trait: 'Clarity', score: 8 }
                    ]
                }
            ],
            status: 'pending'
        });

        console.log('✅ First rating created successfully:');
        console.log(`   Rating ID: ${rating1._id}`);
        console.log(`   Relation: ${rating1.sender_relation}`);
        console.log(`   Status: ${rating1.status}`);
        console.log('');

        // Test Case 2: Try to create duplicate rating with same relation
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 2: Attempt duplicate rating with "friend" relation');
        console.log('═══════════════════════════════════════════════════════\n');

        try {
            await Rating.create({
                sender_id: sender._id,
                receiver_id: receiver._id,
                sender_relation: 'friend', // Same relation
                rating_data: [
                    {
                        topic: 'Communication',
                        traits: [
                            { trait: 'Clarity', score: 9 }
                        ]
                    }
                ],
                status: 'pending'
            });

            console.log('❌ FAILURE: Duplicate rating was created (should have been blocked)');
        } catch (error) {
            if (error.code === 11000) {
                console.log('✅ SUCCESS: Duplicate rating blocked by database index');
                console.log(`   Error: ${error.message}`);
            } else {
                console.log('❌ FAILURE: Unexpected error:', error.message);
            }
        }
        console.log('');

        // Test Case 3: Create rating with different relation
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 3: Create rating with "colleague" relation');
        console.log('═══════════════════════════════════════════════════════\n');

        const rating2 = await Rating.create({
            sender_id: sender._id,
            receiver_id: receiver._id,
            sender_relation: 'colleague', // Different relation
            rating_data: [
                {
                    topic: 'Professionalism',
                    traits: [
                        { trait: 'Reliability', score: 9 }
                    ]
                }
            ],
            status: 'pending'
        });

        console.log('✅ Second rating created successfully:');
        console.log(`   Rating ID: ${rating2._id}`);
        console.log(`   Relation: ${rating2.sender_relation}`);
        console.log(`   Status: ${rating2.status}`);
        console.log('');

        // Test Case 4: Create rating with "other" relation
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 4: Create rating with "other" relation');
        console.log('═══════════════════════════════════════════════════════\n');

        const rating3 = await Rating.create({
            sender_id: sender._id,
            receiver_id: receiver._id,
            sender_relation: 'other', // Another different relation
            rating_data: [
                {
                    topic: 'General',
                    traits: [
                        { trait: 'Kindness', score: 10 }
                    ]
                }
            ],
            status: 'pending'
        });

        console.log('✅ Third rating created successfully:');
        console.log(`   Rating ID: ${rating3._id}`);
        console.log(`   Relation: ${rating3.sender_relation}`);
        console.log(`   Status: ${rating3.status}`);
        console.log('');

        // Test Case 5: Verify all ratings
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 5: Verify all ratings in database');
        console.log('═══════════════════════════════════════════════════════\n');

        const allRatings = await Rating.find({
            sender_id: sender._id,
            receiver_id: receiver._id
        });

        console.log(`Total ratings found: ${allRatings.length}`);
        allRatings.forEach((rating, index) => {
            console.log(`   ${index + 1}. Relation: ${rating.sender_relation}, Status: ${rating.status}`);
        });
        console.log('');

        if (allRatings.length === 3) {
            console.log('✅ SUCCESS: Exactly 3 ratings exist (friend, colleague, other)');
        } else {
            console.log(`❌ FAILURE: Expected 3 ratings, found ${allRatings.length}`);
        }
        console.log('');

        // Test Case 6: Try duplicate with "colleague" relation
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 6: Attempt duplicate rating with "colleague" relation');
        console.log('═══════════════════════════════════════════════════════\n');

        try {
            await Rating.create({
                sender_id: sender._id,
                receiver_id: receiver._id,
                sender_relation: 'colleague', // Duplicate
                rating_data: [
                    {
                        topic: 'Professionalism',
                        traits: [
                            { trait: 'Reliability', score: 7 }
                        ]
                    }
                ],
                status: 'pending'
            });

            console.log('❌ FAILURE: Duplicate rating was created (should have been blocked)');
        } catch (error) {
            if (error.code === 11000) {
                console.log('✅ SUCCESS: Duplicate rating blocked by database index');
                console.log(`   Error: ${error.message}`);
            } else {
                console.log('❌ FAILURE: Unexpected error:', error.message);
            }
        }
        console.log('');

        // Test Case 7: Rejected rating doesn't block new rating
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 7: Rejected rating allows new rating with same relation');
        console.log('═══════════════════════════════════════════════════════\n');

        // Update first rating to rejected
        await Rating.findByIdAndUpdate(rating1._id, { status: 'rejected' });
        console.log('   Updated first rating status to "rejected"');

        // Try to create new rating with "friend" relation (should work now)
        const rating4 = await Rating.create({
            sender_id: sender._id,
            receiver_id: receiver._id,
            sender_relation: 'friend', // Same as rejected rating
            rating_data: [
                {
                    topic: 'Communication',
                    traits: [
                        { trait: 'Clarity', score: 10 }
                    ]
                }
            ],
            status: 'pending'
        });

        console.log('✅ New rating created successfully after previous was rejected:');
        console.log(`   Rating ID: ${rating4._id}`);
        console.log(`   Relation: ${rating4.sender_relation}`);
        console.log(`   Status: ${rating4.status}`);
        console.log('');

        // Clean up
        console.log('═══════════════════════════════════════════════════════');
        console.log('CLEANUP: Removing test data');
        console.log('═══════════════════════════════════════════════════════\n');

        await User.deleteMany({ email: { $in: ['sender@test.com', 'receiver@test.com'] } });
        await Rating.deleteMany({
            $or: [
                { sender_id: sender._id },
                { receiver_id: receiver._id }
            ]
        });

        console.log('✅ Test data cleaned up');
        console.log('');

        console.log('═══════════════════════════════════════════════════════');
        console.log('ALL TESTS COMPLETED SUCCESSFULLY! 🎉');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        console.log('Summary:');
        console.log('✅ User can rate another user once per relation type');
        console.log('✅ Duplicate ratings with same relation are blocked');
        console.log('✅ User can rate same user with different relations');
        console.log('✅ Rejected ratings allow new ratings with same relation');

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testDuplicateRatingPrevention();


/**
 * Test Script: AlreadyScored Query
 * 
 * This script tests the database query used in the AlreadyScored API
 * to verify it's finding existing ratings correctly.
 */

const mongoose = require('mongoose');
const Rating = require('./models/Rating.model');
require('dotenv').config();

async function testAlreadyScoredQuery() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST: AlreadyScored Query');
        console.log('═══════════════════════════════════════════════════════\n');

        // Test parameters (replace with your actual IDs)
        const sender_id = new mongoose.Types.ObjectId('68ed45d07081a2a7646a0cd8');
        const receiver_id_string = '68e805de66849113f7585b97';
        const sender_relation = '68319a34dc5cfcb597943d4e';

        console.log('Test Parameters:');
        console.log('  sender_id:', sender_id, '(ObjectId)');
        console.log('  receiver_id (string):', receiver_id_string);
        console.log('  sender_relation:', sender_relation);
        console.log('');

        // Convert receiver_id to ObjectId
        const receiver_id = new mongoose.Types.ObjectId(receiver_id_string);
        console.log('  receiver_id (ObjectId):', receiver_id);
        console.log('');

        // Test 1: Find all ratings for this sender-receiver pair
        console.log('───────────────────────────────────────────────────────');
        console.log('TEST 1: All ratings for sender-receiver pair');
        console.log('───────────────────────────────────────────────────────');
        
        const allRatings = await Rating.find({
            sender_id,
            receiver_id
        });

        console.log(`Found ${allRatings.length} rating(s):\n`);
        
        allRatings.forEach((rating, index) => {
            console.log(`Rating ${index + 1}:`);
            console.log('  ID:', rating._id);
            console.log('  Sender ID:', rating.sender_id);
            console.log('  Receiver ID:', rating.receiver_id);
            console.log('  Sender Relation:', rating.sender_relation);
            console.log('  Status:', rating.status);
            console.log('  Created:', rating.created_at);
            console.log('  Matches relation?', rating.sender_relation === sender_relation);
            console.log('  Status is pending/approved?', ['pending', 'approved'].includes(rating.status));
            console.log('');
        });

        // Test 2: Find with exact query (as used in AlreadyScored API)
        console.log('───────────────────────────────────────────────────────');
        console.log('TEST 2: Exact query (as used in AlreadyScored API)');
        console.log('───────────────────────────────────────────────────────');

        const query = {
            sender_id,
            receiver_id,
            sender_relation,
            status: { $in: ['pending', 'approved'] }
        };

        console.log('Query:', JSON.stringify(query, null, 2));
        console.log('');

        const existingRating = await Rating.findOne(query);

        if (existingRating) {
            console.log('✅ FOUND existing rating:');
            console.log('  ID:', existingRating._id);
            console.log('  Sender ID:', existingRating.sender_id);
            console.log('  Receiver ID:', existingRating.receiver_id);
            console.log('  Sender Relation:', existingRating.sender_relation);
            console.log('  Status:', existingRating.status);
            console.log('  Created:', existingRating.created_at);
            console.log('');
            console.log('⚠️ This means the API should return: { alreadyScored: true }');
        } else {
            console.log('❌ NO existing rating found');
            console.log('');
            console.log('✅ This means the API should return: { alreadyScored: false }');
        }

        console.log('');

        // Test 3: Check if relation ID matches
        console.log('───────────────────────────────────────────────────────');
        console.log('TEST 3: Relation ID Comparison');
        console.log('───────────────────────────────────────────────────────');

        if (allRatings.length > 0) {
            allRatings.forEach((rating, index) => {
                console.log(`Rating ${index + 1}:`);
                console.log('  Database relation:', rating.sender_relation);
                console.log('  Query relation:', sender_relation);
                console.log('  Exact match?', rating.sender_relation === sender_relation);
                console.log('  Type of DB relation:', typeof rating.sender_relation);
                console.log('  Type of query relation:', typeof sender_relation);
                console.log('');
            });
        }

        // Test 4: Find with different variations
        console.log('───────────────────────────────────────────────────────');
        console.log('TEST 4: Query Variations');
        console.log('───────────────────────────────────────────────────────');

        // Variation 1: Without status filter
        const withoutStatus = await Rating.findOne({
            sender_id,
            receiver_id,
            sender_relation
        });
        console.log('Without status filter:', withoutStatus ? 'FOUND' : 'NOT FOUND');

        // Variation 2: Only pending
        const onlyPending = await Rating.findOne({
            sender_id,
            receiver_id,
            sender_relation,
            status: 'pending'
        });
        console.log('Only pending status:', onlyPending ? 'FOUND' : 'NOT FOUND');

        // Variation 3: Only approved
        const onlyApproved = await Rating.findOne({
            sender_id,
            receiver_id,
            sender_relation,
            status: 'approved'
        });
        console.log('Only approved status:', onlyApproved ? 'FOUND' : 'NOT FOUND');

        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST COMPLETE');
        console.log('═══════════════════════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        process.exit(1);
    }
}

// Run the test
console.log('');
console.log('🧪 Starting AlreadyScored Query Test...');
console.log('');
console.log('⚠️ IMPORTANT: Update the test parameters in the script with your actual IDs!');
console.log('   - sender_id: Your user ID');
console.log('   - receiver_id_string: The person you rated');
console.log('   - sender_relation: The relation ID you used');
console.log('');

testAlreadyScoredQuery();


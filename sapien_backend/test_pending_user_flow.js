/**
 * Test Script: Pending User Registration Flow
 * 
 * This script tests the flow where:
 * 1. User A rates User B (who doesn't have an account yet)
 * 2. System creates a "pending user" entry for User B
 * 3. User B signs up with their email/phone
 * 4. System should UPDATE the existing pending user entry (not create a new one)
 */

const mongoose = require('mongoose');
const User = require('./models/user.model');
const authService = require('./services/auth.service');
require('dotenv').config();

async function testPendingUserFlow() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test Case 1: Pending user created with EMAIL
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 1: Pending user created with EMAIL');
        console.log('═══════════════════════════════════════════════════════\n');

        const testEmail = 'pending.user@test.com';
        const testPhone = '+919876543210';
        const testPassword = 'TestPassword123';

        // Clean up any existing test data
        await User.deleteMany({
            $or: [
                { email: testEmail },
                { work_email: testEmail },
                { phone_number: testPhone }
            ]
        });
        console.log('🧹 Cleaned up existing test data\n');

        // Step 1: Simulate rating flow - create pending user with EMAIL only
        console.log('Step 1: Creating pending user (via rating flow)...');
        const pendingUser = await User.create({
            email: testEmail,
            work_email: testEmail,
            phone_number: undefined,
            password: undefined, // No password - this is a pending user
            agreedTerms: false,
            invited: 'true'
        });
        console.log('✅ Pending user created:', {
            id: pendingUser._id,
            email: pendingUser.email,
            phone: pendingUser.phone_number,
            hasPassword: !!pendingUser.password
        });
        console.log('');

        // Step 2: User signs up with BOTH email and phone
        console.log('Step 2: User signing up with email + phone...');
        const signupResult = await authService.register({
            email: testEmail,
            phone_number: testPhone,
            password: testPassword,
            agreedTerms: true
        });

        console.log('✅ Signup result:', {
            userId: signupResult.user.id,
            email: signupResult.user.email,
            phone: signupResult.user.phone_number,
            isPendingUserActivated: signupResult.isPendingUserActivated,
            hasToken: !!signupResult.token
        });
        console.log('');

        // Step 3: Verify the user was UPDATED (not duplicated)
        console.log('Step 3: Verifying no duplicate users...');
        const allUsers = await User.find({
            $or: [
                { email: testEmail },
                { work_email: testEmail },
                { phone_number: testPhone }
            ]
        });

        console.log(`Found ${allUsers.length} user(s) with this email/phone`);
        if (allUsers.length === 1) {
            console.log('✅ SUCCESS: No duplicate users created!');
            console.log('Updated user details:', {
                id: allUsers[0]._id,
                email: allUsers[0].email,
                phone: allUsers[0].phone_number,
                hasPassword: !!allUsers[0].password,
                agreedTerms: allUsers[0].agreedTerms
            });
        } else {
            console.log('❌ FAILURE: Multiple users found!');
            allUsers.forEach((user, index) => {
                console.log(`User ${index + 1}:`, {
                    id: user._id,
                    email: user.email,
                    phone: user.phone_number,
                    hasPassword: !!user.password
                });
            });
        }
        console.log('\n');

        // Test Case 2: Pending user created with PHONE
        console.log('═══════════════════════════════════════════════════════');
        console.log('TEST CASE 2: Pending user created with PHONE');
        console.log('═══════════════════════════════════════════════════════\n');

        const testEmail2 = 'pending.user2@test.com';
        const testPhone2 = '+919876543211';
        const testPassword2 = 'TestPassword456';

        // Clean up
        await User.deleteMany({
            $or: [
                { email: testEmail2 },
                { work_email: testEmail2 },
                { phone_number: testPhone2 }
            ]
        });

        // Step 1: Create pending user with PHONE only
        console.log('Step 1: Creating pending user with phone only...');
        const pendingUser2 = await User.create({
            email: undefined,
            work_email: undefined,
            phone_number: testPhone2,
            password: undefined,
            agreedTerms: false,
            invited: 'true'
        });
        console.log('✅ Pending user created:', {
            id: pendingUser2._id,
            email: pendingUser2.email,
            phone: pendingUser2.phone_number,
            hasPassword: !!pendingUser2.password
        });
        console.log('');

        // Step 2: User signs up with BOTH email and phone
        console.log('Step 2: User signing up with email + phone...');
        const signupResult2 = await authService.register({
            email: testEmail2,
            phone_number: testPhone2,
            password: testPassword2,
            agreedTerms: true
        });

        console.log('✅ Signup result:', {
            userId: signupResult2.user.id,
            email: signupResult2.user.email,
            phone: signupResult2.user.phone_number,
            isPendingUserActivated: signupResult2.isPendingUserActivated,
            hasToken: !!signupResult2.token
        });
        console.log('');

        // Step 3: Verify no duplicates
        console.log('Step 3: Verifying no duplicate users...');
        const allUsers2 = await User.find({
            $or: [
                { email: testEmail2 },
                { work_email: testEmail2 },
                { phone_number: testPhone2 }
            ]
        });

        console.log(`Found ${allUsers2.length} user(s) with this email/phone`);
        if (allUsers2.length === 1) {
            console.log('✅ SUCCESS: No duplicate users created!');
            console.log('Updated user details:', {
                id: allUsers2[0]._id,
                email: allUsers2[0].email,
                phone: allUsers2[0].phone_number,
                hasPassword: !!allUsers2[0].password,
                agreedTerms: allUsers2[0].agreedTerms
            });
        } else {
            console.log('❌ FAILURE: Multiple users found!');
            allUsers2.forEach((user, index) => {
                console.log(`User ${index + 1}:`, {
                    id: user._id,
                    email: user.email,
                    phone: user.phone_number,
                    hasPassword: !!user.password
                });
            });
        }
        console.log('\n');

        // Clean up test data
        console.log('🧹 Cleaning up test data...');
        await User.deleteMany({
            $or: [
                { email: testEmail },
                { work_email: testEmail },
                { phone_number: testPhone },
                { email: testEmail2 },
                { work_email: testEmail2 },
                { phone_number: testPhone2 }
            ]
        });
        console.log('✅ Test data cleaned up\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('ALL TESTS COMPLETED');
        console.log('═══════════════════════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testPendingUserFlow();


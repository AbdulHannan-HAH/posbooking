// scripts/checkUsers.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({});
        console.log('\n📋 All Users:');
        users.forEach(user => {
            console.log(`\n👤 User: ${user.username}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   ID: ${user._id}`);
        });

        // Check if admin user exists
        const admin = await User.findOne({ role: 'admin' });
        console.log('\n👑 Admin User:', admin ? `Exists (${admin.username})` : 'Not found');

        // Check if pool_staff exists
        const poolStaff = await User.findOne({ role: 'pool_staff' });
        console.log('🏊 Pool Staff:', poolStaff ? `Exists (${poolStaff.username})` : 'Not found');

        await mongoose.disconnect();
        console.log('\n✅ Check completed');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkUsers();
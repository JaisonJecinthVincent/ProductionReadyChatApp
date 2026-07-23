const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// User model (simplified version)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePic: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'slanesh@gmail.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      return existingUser;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Slanesh@5002', salt);

    // Create test user
    const testUser = new User({
      email: 'slanesh@gmail.com',
      fullName: 'Test User for Load Testing',
      password: hashedPassword,
      profilePic: 'https://avatar.iran.liara.run/public/1'
    });

    await testUser.save();
    console.log('✅ Test user created successfully:', testUser.email);

    // Create additional test users for more realistic testing
    const userEmails = Array.from({ length: 10 }, (_, i) => `testuser${i + 1}@example.com`);
    const existingUsers = await User.find({ email: { $in: userEmails } }).select('email');
    const existingEmails = new Set(existingUsers.map(u => u.email));
    
    const additionalUsers = userEmails
      .filter(email => !existingEmails.has(email))
      .map((email, i) => new User({
        email,
        fullName: `Test User ${i + 1}`,
        password: hashedPassword,
        profilePic: `https://avatar.iran.liara.run/public/${i + 1}`
      }));

    if (additionalUsers.length > 0) {
      await User.insertMany(additionalUsers);
      console.log(`✅ Created ${additionalUsers.length} additional test users`);
    }

    console.log('✅ All test users are ready for load testing');
    
    // List all test users
    const allTestUsers = await User.find({
      email: { $regex: /(slanesh@gmail\.com|testuser\d+@example\.com)/ }
    }).select('email fullName');
    
    console.log('\n📋 Available test users:');
    allTestUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.fullName})`);
    });

    return testUser;

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
};

createTestUser();
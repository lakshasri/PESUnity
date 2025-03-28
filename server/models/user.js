const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove any existing indexes
mongoose.connection.collections['users']?.dropIndexes();

const User = mongoose.model('User', userSchema);

module.exports = User;

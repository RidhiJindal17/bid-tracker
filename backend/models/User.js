import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema for MongoDB.
 * Includes basic user info and authentication details.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ['admin', 'sales', 'manager', 'engineer', 'user'],
      default: 'user',
    },
    department: {
      type: String,
      default: 'General',
    },
    assignedBids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
      }
    ],
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    performanceMetrics: {
      completedTasks: { type: Number, default: 0 },
      revenueContribution: { type: Number, default: 0 },
      efficiency: { type: Number, default: 100 },
    },
    activityHistory: [
      {
        action: { type: String, required: true },
        details: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

/**
 * Encrypt password before saving the user to the database.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Match user-entered password to hashed password in database.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

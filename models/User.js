const mongoose = require('mongoose');

// This sub-schema stores all progress-related data.
// It's flexible to allow for new types of progress later.
const ProgressSchema = new mongoose.Schema({
    completedExercises: { type: Map, of: Boolean, default: {} },
    completedQuizzes: { type: Map, of: Boolean, default: {} },
    completedChallenges: { type: Map, of: Boolean, default: {} },
    unlockedAchievements: { type: Map, of: Boolean, default: {} },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 1 },
    lastLogin: { type: Date, default: Date.now },
}, { _id: false }); // _id: false prevents Mongoose from creating a separate ID for the sub-document.

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
    // Embed the progress schema directly into the user document.
    progress: {
        type: ProgressSchema,
        default: () => ({})
    }
});


module.exports = mongoose.model('User', UserSchema);

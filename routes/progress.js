const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Note the path change to ../
const User = require('../models/User'); // Note the path change to ../

// @route   GET /api/progress
// @desc    Get user progress (Protected)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user.progress);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/progress
// @desc    Update user progress (Protected)
router.put('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { progress: req.body } },
            { new: true }
        ).select('-password');
        res.json(user.progress);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
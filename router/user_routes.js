const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');


// Route to create a new User
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User(data);
        const response = await newUser.save();

        console.log('Data saved');
        const payload = {
            id: response.id
        };
        const token = generateToken(payload);
        console.log('Token generated:', token);
        return res.status(200).json({ response, token: token });
    } catch (err) {
        console.error('Error saving data:', err);
        return res.status(500).json({ err: "Internal server error" });
    }
});


// Route for user login
router.post('/login', async (req, res) => {
    try {
        const { cnic, password } = req.body;
        const user = await User.findOne({ cnic: cnic });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid cnic or password' });
        }

        const payload = {
            id: user.id
        };

        const token = generateToken(payload);
        console.log('User logged in, token generated:', token);
        return res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});
// Route to get user profile (requires authentication)
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user; // Ensure jwtAuthMiddleware is adding req.user
        if (!userData) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        const userId = userData.id;
        const user = await Person.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: "Internal server error" });
    }
});






// Route to update a person by ID (requires authentication)
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const { currentPassword, mewPassword } = req.body;

        const response = await User.findById(UserId) 

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        user.password = newPassword;
        await user.save();

        console.log('password updated for person ID:', userId);
        return res.status(200).json({message: 'password updated'});
    } catch (err) {
        console.error('Error updating data:', err);
        return res.status(500).json({ err: "Internal server error" });
    }
});


module.exports = router;

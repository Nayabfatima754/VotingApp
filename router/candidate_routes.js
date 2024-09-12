const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user'); // Assuming the User model is in the same directory
const { jwtAuthMiddleware } = require('../jwt');

// Function to check if a user has an admin role
const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user && user.role === 'admin') {
            return true;
        }
        return false;
    } catch (err) {
        console.error('Error checking admin role:', err);
        return false;
    }
};

// Route to create a new candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();

        console.log('Data saved');
        return res.status(200).json({ response });
    } catch (err) {
        console.error('Error saving data:', err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

// Route to update a candidate by ID (requires authentication)
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateId;
        const updateCandidateData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ err: 'Candidate not found' });
        }

        console.log('Data updated for Candidate ID:', candidateId);
        return res.status(200).json(response);
    } catch (err) {
        console.error('Error updating data:', err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

// Route to delete a candidate by ID (requires authentication)
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateId;

        const response = await Candidate.findByIdAndDelete(candidateId);
        if (!response) {
            return res.status(404).json({ err: 'Candidate not found' });
        }

        console.log('Candidate deleted');
        return res.status(200).json(response);
    } catch (err) {
        console.error('Error deleting candidate:', err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

// Route to handle voting
router.post('/votes/:candidateId', jwtAuthMiddleware, async (req, res) => {// :candidateId ki jgh candidate ki id lagegi postman main get krte wqt ya vote krtr wqt 
    const candidateId = req.params.candidateId;
    const userId = req.user.id; // Use authenticated user's ID from jwtAuthMiddleware

    try {
        // Check if candidate exists
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has already voted
        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Check if user is an admin
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Admin is not allowed to vote' });
        }

        // Record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Mark the user as having voted
        user.isVoted = true;
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        console.error('Error recording vote:', err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

// Route to get the vote count for all candidates
router.get('/votes/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });
        const voteRecord = candidates.map((data) => ({
            party: data.party,
            voteCount: data.voteCount // Corrected line
        }));

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});
router.get('/candidateList', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        return res.status(200).json(candidates);
    } catch (err) {
        console.error('Error retrieving candidates:', err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

module.exports = router;

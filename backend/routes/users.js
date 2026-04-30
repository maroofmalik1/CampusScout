const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const College = require('../models/College');
const { auth } = require('../middleware/auth');

// ─── GET /api/users/saved ─────────────────────────────────────────────────────
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      'savedColleges',
      'name location fees rating image slug courses placement rankings type'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ savedColleges: user.savedColleges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/users/saved/:collegeId  (toggle save) ─────────────────────────
router.post('/saved/:collegeId', auth, async (req, res) => {
  try {
    const { collegeId } = req.params;

    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ error: 'College not found' });

    const user = await User.findById(req.userId);
    const idx  = user.savedColleges.indexOf(collegeId);
    let saved;

    if (idx > -1) {
      // Already saved → unsave
      user.savedColleges.splice(idx, 1);
      college.savedCount = Math.max(0, (college.savedCount || 0) - 1);
      saved = false;
    } else {
      // Not saved → save
      user.savedColleges.push(collegeId);
      college.savedCount = (college.savedCount || 0) + 1;
      saved = true;
    }

    await Promise.all([user.save(), college.save()]);
    res.json({ saved, savedColleges: user.savedColleges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/users/comparisons ─────────────────────────────────────────────
router.post('/comparisons', auth, async (req, res) => {
  try {
    const { name, collegeIds } = req.body;

    if (!name || !collegeIds || collegeIds.length < 2)
      return res.status(400).json({ error: 'Name and at least 2 college IDs required' });

    const user = await User.findById(req.userId);
    user.savedComparisons.unshift({ name, colleges: collegeIds });

    // Keep only the last 10 comparisons
    if (user.savedComparisons.length > 10)
      user.savedComparisons = user.savedComparisons.slice(0, 10);

    await user.save();
    res.json({ comparisons: user.savedComparisons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/users/comparisons ──────────────────────────────────────────────
router.get('/comparisons', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      'savedComparisons.colleges',
      'name location fees rating slug'
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ comparisons: user.savedComparisons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
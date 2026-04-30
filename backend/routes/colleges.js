const express       = require('express');
const router        = express.Router();
const College       = require('../models/College');
const { optionalAuth } = require('../middleware/auth');

// ─── GET /api/colleges  (list + search + filter + pagination) ─────────────────
router.get('/', async (req, res) => {
  try {
    const {
      search   = '',
      location = '',
      state    = '',
      course   = '',
      feesMin  = 0,
      feesMax  = 10000000,
      type     = '',
      exam     = '',
      sort     = 'rating',
      page     = 1,
      limit    = 9,
    } = req.query;

    const query = {};

    // Full-text style search (name / city / state)
    if (search) {
      query.$or = [
        { name:             { $regex: search, $options: 'i' } },
        { 'location.city':  { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
      ];
    }

    if (state)    query['location.state'] = { $regex: state,    $options: 'i' };
    if (location) query['location.city']  = { $regex: location, $options: 'i' };
    if (type)     query.type              = type;
    if (exam)     query.examAccepted      = { $in: [new RegExp(exam, 'i')] };
    if (course)   query.courseTags        = { $in: [new RegExp(course, 'i')] };

    if (Number(feesMin) > 0 || Number(feesMax) < 10000000) {
      query['fees.min'] = { $gte: Number(feesMin) };
      query['fees.max'] = { $lte: Number(feesMax) };
    }

    const sortMap = {
      rating:    { rating:        -1 },
      fees_asc:  { 'fees.min':     1 },
      fees_desc: { 'fees.min':    -1 },
      name:      { name:           1 },
      ranking:   { 'rankings.nirf': 1 },
    };
    const sortOption = sortMap[sort] || { rating: -1 };

    const total    = await College.countDocuments(query);
    const colleges = await College.find(query)
      .select('-reviews -__v')
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      colleges,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      limit:      Number(limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/colleges/filters  (unique values for dropdowns) ────────────────
router.get('/filters', async (req, res) => {
  try {
    const [states, types, exams, courses] = await Promise.all([
      College.distinct('location.state'),
      College.distinct('type'),
      College.distinct('examAccepted'),
      College.distinct('courseTags'),
    ]);

    res.json({
      states:  states.sort(),
      types,
      exams:   [...new Set(exams.flat())].sort(),
      courses: [...new Set(courses.flat())].sort(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/colleges/compare?ids=id1,id2,id3 ───────────────────────────────
router.get('/compare', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'No college IDs provided' });

    const idArray = ids.split(',').filter(Boolean);
    if (idArray.length < 2)
      return res.status(400).json({ error: 'Need at least 2 colleges to compare' });
    if (idArray.length > 3)
      return res.status(400).json({ error: 'Maximum 3 colleges can be compared' });

    const colleges = await College.find({ _id: { $in: idArray } }).select('-__v');
    res.json({ colleges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/colleges/predict/results?exam=JEE&rank=5000 ────────────────────
router.get('/predict/results', async (req, res) => {
  try {
    const { exam, rank } = req.query;
    if (!exam || !rank)
      return res.status(400).json({ error: 'Exam and rank are required' });

    const rankNum = Number(rank);

    // Rule-based eligibility thresholds
    let minRating;
    if      (rankNum <= 1000)  minRating = 4.5;
    else if (rankNum <= 5000)  minRating = 4.0;
    else if (rankNum <= 20000) minRating = 3.5;
    else                       minRating = 3.0;

    const query = {
      examAccepted: { $in: [new RegExp(exam, 'i')] },
      rating:       { $gte: minRating },
    };

    const colleges = await College.find(query)
      .select('name location fees rating courses courseTags placement rankings image slug')
      .sort({ rating: -1, 'rankings.nirf': 1 })
      .limit(12);

    res.json({ colleges, criteria: { exam, rank: rankNum, minRating } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/colleges/:id  (detail) ─────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json({ college });
  } catch (err) {
    if (err.name === 'CastError')
      return res.status(404).json({ error: 'College not found' });
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/colleges/:id/reviews  (add a review) ──────────────────────────
router.post('/:id/reviews', async (req, res) => {
  try {
    const { author, rating, comment } = req.body;

    if (!author || !rating || !comment)
      return res.status(400).json({ error: 'Author, rating, and comment are required' });

    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });

    college.reviews.unshift({ author, rating: Number(rating), comment });
    college.totalReviews = college.reviews.length;

    // Recalculate average rating
    const avg = college.reviews.reduce((acc, r) => acc + r.rating, 0) / college.reviews.length;
    college.rating = Math.round(avg * 10) / 10;

    await college.save();
    res.json({ review: college.reviews[0], rating: college.rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  author:  { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date:    { type: Date, default: Date.now },
  helpful: { type: Number, default: 0 },
});

const CourseSchema = new mongoose.Schema({
  name:     String,
  duration: String,
  fees:     Number,
  seats:    Number,
});

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, unique: true },

    location: {
      city:  { type: String, required: true },
      state: { type: String, required: true },
    },

    type: {
      type: String,
      enum: ['Government', 'Private', 'Deemed', 'Autonomous'],
      default: 'Private',
    },

    established: Number,
    description: String,
    image:       { type: String, default: '' },

    fees: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },

    rating:     { type: Number, default: 4.0, min: 1, max: 5 },
    courses:    [CourseSchema],
    courseTags: [String],

    placement: {
      averagePackage: Number,
      highestPackage: Number,
      placementRate:  Number,
      topRecruiters:  [String],
    },

    rankings: {
      nirf:    Number,
      qs:      Number,
      outlook: Number,
    },

    facilities:    [String],
    examAccepted:  [String],
    reviews:       [ReviewSchema],
    totalReviews:  { type: Number, default: 0 },
    savedCount:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for full-text search
CollegeSchema.index({
  name:             'text',
  'location.city':  'text',
  'location.state': 'text',
});

// Auto-generate slug before save
CollegeSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('College', CollegeSchema);
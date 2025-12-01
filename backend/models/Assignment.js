import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  // Schema structure for the assignment
  sampleSchemas: [{
    table: String,
    columns: [String],
    sampleRows: [[mongoose.Schema.Types.Mixed]] // Array of arrays for sample data
  }],
  // Expected result structure (for future auto-grading)
  expectedResult: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

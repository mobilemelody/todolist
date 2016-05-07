// Load required packages
var mongoose = require('mongoose');

// Define task schema
var TaskSchema = new mongoose.Schema({
	title: String,
	due: Date,
	priority: { type: Number, default: 0 },
	completed: Boolean,
	order: { type: Number, default: 0 },
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);
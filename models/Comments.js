// Load required packages
var mongoose = require('mongoose');

// Define comments schema
var CommentSchema = new mongoose.Schema({
	body: String,
	created: { type: Date, default: Date.now },
	author: String,
	post: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }
});

// Export the Mongoose model
module.exports = mongoose.model('Comment', CommentSchema);

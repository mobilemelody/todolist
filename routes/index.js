var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var Task = mongoose.model('Task');
var Comment = mongoose.model('Comment');

// Create our Express application
var app = express();
var router = express.Router();

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// Initial dummy route
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Create endpoint for POSTS
router.post('/tasks', function(req, res) {
	// Create new instance of the Tasks model
	var task = new Task(req.body);
	task.save(function(err, task) {
		if(err) { return next(err); }
		
		res.json(task);
	});
});


// preload task by ID
router.param('task', function(req, res, next, id) {
	var query = Task.findById(id);
	
	query.exec(function(err, task) {
		if(err) { return next(err); }
		if(!task) { return next(new Error('can\'t find task')); }
		
		req.task = task;
		return next();
	});
});

router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);
	
	query.exec(function(err, comment) {
		if(err) { return next(err); }
		
		req.comment = comment;
		return next();
	});
});

// GET request to retrieve all tasks 
router.get('/tasks', function(req, res, next) {
	Task.find({}).populate('comments').exec(function(err, tasks) {
		if(err) { return next(err); }
		
		res.json(tasks);
	});
});

// GET request to retrieve task by ID
router.get('/tasks/:task', function(req, res) {
	res.json(req.task);
});

// DELETE request to delete task by ID
router.delete('/tasks/:task', function(req, res, next) {
	var task = req.task;
	task.remove(function(err) {
		res.json(req.task);
	});
});

// PUT request to edit task by ID
router.put('/tasks/:task', function(req, res, next) {
	var task = req.task;
	task.title = req.body.title;
	task.due = req.body.due;
	task.completed = req.body.completed;
	task.save(function(err) {
		res.json(req.task);
	});
});

// POST request to add comment
router.post('/tasks/:task/comments', function(req, res, next) {
	console.log('comment post request');
	var comment = new Comment(req.body);
	comment.task = req.task;
	
	comment.save(function(err, comment){
		if(err) { return next(err); }
		
		req.task.comments.push(comment);
		req.task.save(function(err, task) {
			if(err) { return next(err); }
			res.json(comment);
		});
	});
});

// DELETE request to delete comment
router.delete('/tasks/:task/comments/:comment', function(req, res, next) {
	console.log('delete comment request');
	var task = req.task;
	var comment = req.comment;
	comment.remove(function(err) {
		for (var i = 0; i < task.comments.length; i++) {
			if (task.comments[i].toString() === comment._id.toString()) {
				task.comments = req.task.comments.splice(0, i);
				console.log(task.comments);
				break;
			}
		}
		task.save(function(err) {
			res.json(req.task);
		});
	});
});

module.exports = router;

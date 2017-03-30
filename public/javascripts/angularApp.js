var app = angular.module('todolist', ['ui.router', 'angularMoment', 'moment-picker']);

// CONFIGURATION
app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['tasks', function(tasks) {
						return tasks.getAll();
					}]
				},
			})
			.state('tasks', {
				url: '/tasks/:id',
				templateUrl: '/tasks.html',
				controller: 'TasksCtrl',
				resolve: {
					task: ['$stateParams', 'tasks', function($stateParams, tasks) {
						return tasks.get($stateParams.id);
					}]
				},
			});
		
		$urlRouterProvider.otherwise('home');
	}
]);

// SERVICES + FACTORIES
app.factory('tasks', ['$http', function($http) {
	var o = {
		tasks: [],
	};
	
	o.getAll = function() {
		return $http.get('/tasks').success(function(data) {
			angular.copy(data, o.tasks);
		});
	};
	
	o.create = function(task) {
		return $http.post('/tasks', task).success(function(data) {
			o.tasks.push(data);
		});
	};
	
	o.get = function(id) {
		return $http.get('/tasks/' + id).then(function(res) {
			return res.data;
		});
	};
	
	o.addComment = function(id, comment) {
		return $http.post('/tasks/' + id + '/comments', comment).success(function(data) {
			o.tasks.push(data);
		});
	};
	
	o.remove = function(task) {
		return $http.delete('/tasks/' + task._id, task).success(function(data){
			o.getAll();
		});
	};
	
	o.update = function(id, newTask) {
		return $http.put('/tasks/' + id, newTask).success(function(data){
			return data;
		});
	};
	
	o.deleteComment = function(task, comment) {
		return $http.delete('/tasks/' + task._id + '/comments/' + comment._id).success(function(data){
			o.getAll();
		});
	};
	
	return o;
}]);


// CONTROLLERS
app.controller('MainCtrl', [
'$scope',
'tasks', // inject tasks service
'$filter',
function($scope, tasks, $filter){
	$scope.addTask = function(){
		if(!$scope.title || $scope.title === '') { return; }
		tasks.create({
			title: $scope.title,
			due: $scope.due,
			completed: false,
		});
		$scope.title = '';
		$scope.due = '';
	};
	
	$scope.changeState = function(task){
		task.completed = !task.completed;
		newTask = angular.copy(task);
		tasks.update(task._id, newTask);
	};
	
	$scope.deleteTask = function(task){
		tasks.remove(task);
	};
	
	$scope.editing = [];
	
	$scope.updateTask = function(task) {
		newTask = angular.copy(task);
		newTask.title = task.title;
		newTask.due = task.due;
		tasks.update(task._id, newTask);
		$scope.editing[task._id] = false;
	};
	
	$scope.editTask = function(task) {
		$scope.editing[task._id] = angular.copy(task);
		$scope.addFormOpen = false;
	};
	
	$scope.cancelTask = function(task) {
		$scope.task = angular.copy($scope.editing[task._id]);
		$scope.editing[task._id] = false;
		tasks.getAll(task);
	};
	
	$scope.commentForm = {};
	
	$scope.addComment = function(task){
		console.log($scope.commentForm.body);
		if($scope.commentForm.body === '') {return;}
		tasks.addComment(task._id, {
			body: $scope.commentForm.body,
			author: 'user',
			task: task,
		}).success(function(task, comment){
			var task = comment.task;
			//task.comments.push(comment);
		});
		$scope.commentForm.body = '';
	};
		
	$scope.deleteComment = function(task, comment){
		tasks.deleteComment(task, comment);
	}
	
    $scope.$watch('task.due', function (newValue) {
    	$scope.due = $filter('date')(newValue, 'MMM dd'); 
    });
	
	$scope.tasks = tasks.tasks;
}]);

app.controller('TasksCtrl', [
'$scope',
'tasks',
'task',
function($scope, tasks, task) {
	$scope.task = task;
	$scope.addComment = function(){
			if($scope.body === '') {return;}
			tasks.addComment(task._id, {
				body: $scope.body,
				author: 'user',
			}).success(function(comment){
				$scope.task.comments.push(comment);
			});
			$scope.body = '';
		};
}]);
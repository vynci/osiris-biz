app.controller('DashCtrl', function($scope, $ionicPopup, Pubnub, $pubnubChannel, $state, $rootScope, $ionicLoading, $ionicHistory, appointmentService, threadService, reviewService) {
	var user = {
		id : "jsYBzvkOHj"
	}

	$scope.appointments = {
		'completed' : [],
		'accepted' : [],
		'pending' : [],
		'canceled' : []
	};
	$scope.isMessagesLoading = true;
	$scope.isReviewsLoading = true;

	$scope.$on('$ionicView.enter', function(e) {
		$scope.isAppointmentsLoading = true;

    if(Parse.User.current()){
        user.id = Parse.User.current().get('artistId');
				clearAppointments();
				getAppointments();
				getReviewsById(Parse.User.current().get('artistId'));
				getThreads();
    }else{
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
    }
	});

	$scope.refresh = function(){
		if(Parse.User.current()){
			user.id = Parse.User.current().get('artistId');
			clearAppointments();
			getAppointments();
			getReviewsById(Parse.User.current().get('artistId'));
			getThreads();
		}else{
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.transitionTo('tab.account-login', null, {reload: true, notify:true});
		}
		$scope.$broadcast('scroll.refreshComplete');
	}

  $scope.redirectToAppointments = function(){
      $state.transitionTo('tab.manage-appointments', null, {reload: true, notify:true});
  }

	function getThreads(){
		threadService.getThreadById(Parse.User.current().get('artistId'))
		.then(function(results) {
			// Handle the result
			$scope.newMessages = 0;
			angular.forEach(results, function(value, key) {
				if(value.get('isNewMessageArtist')){
					$scope.newMessages++;
				};
			});
			$scope.isMessagesLoading = false;
		}, function(err) {
			$scope.isMessagesLoading = false;
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

	function getAppointments(){
		appointmentService.getBookingsById(Parse.User.current().get('artistId'))
		.then(function(results) {
			// Handle the result
			angular.forEach(results, function(appointment) {
				if(appointment.get('status')){
					$scope.appointments[appointment.get('status')].push(appointment);
				}
			});
			$scope.isAppointmentsLoading = false;
		}, function(err) {
			// Error occurred
			$scope.isAppointmentsLoading = false;
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

	function getReviewsById(id){
		reviewService.getReviewsById(id)
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.newReviews = 0;
			angular.forEach(results, function(value, key) {
				if(value.get('isNewReview')){
					$scope.newReviews++;
				};
			});
			$scope.isReviewsLoading = false;
		}, function(err) {
			// Error occurred
			$scope.isReviewsLoading = false;
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

	function clearAppointments(){
		$scope.appointments = {
			'completed' : [],
			'accepted' : [],
			'pending' : [],
			'canceled' : []
		};
	}


})

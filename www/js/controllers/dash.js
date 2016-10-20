app.controller('DashCtrl', function($scope, $ionicPopup, Pubnub, $pubnubChannel, $state, $rootScope, $ionicLoading, $ionicHistory, appointmentService) {
	var user = {
		id : "jsYBzvkOHj"
	}

	$scope.appointments = {
		'completed' : [],
		'accepted' : [],
		'pending' : [],
		'canceled' : []
	};

	$scope.$on('$ionicView.enter', function(e) {
        if(Parse.User.current()){
            user.id = Parse.User.current().get('profileId');
						clearAppointments()
						getAppointments();
        }else{
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
        }
	});

    $scope.redirectToAppointments = function(){
        $state.transitionTo('tab.manage-appointments', null, {reload: true, notify:true});
    }


	function getAppointments(){
		$ionicLoading.show({
			template: 'Loading :)'
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});

		appointmentService.getBookingsById(Parse.User.current().get('profileId'))
		.then(function(results) {
			// Handle the result
			console.log(results);
			angular.forEach(results, function(appointment) {
				console.log(appointment.attributes);
				if(appointment.get('status')){
					$scope.appointments[appointment.get('status')].push(appointment);
				}
			});

			$ionicLoading.hide();
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
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

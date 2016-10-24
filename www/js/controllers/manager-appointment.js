app.controller('ManagerAppointmentCtrl', function($scope, $ionicPopup, appointmentService, $ionicLoading) {
	console.log('manager appointment controller');

	$scope.appointments = {
		'completed' : [],
		'accepted' : [],
		'pending' : [],
		'canceled' : []
	};

	$scope.$on('$ionicView.enter', function(e) {
		if(Parse.User.current()){
			clearAppointments();
			getAppointments();
		}else{
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.transitionTo('tab.account-login', null, {reload: true, notify:true});
		}
	});

	$scope.showBookingAlert = function(customer, actionType, buttonType) {
			$scope.data = {};
			// An elaborate, custom popup
			var myPopup = $ionicPopup.show({
				template: '<div style="padding: 0px 100px;"><img style="width:100%; border-radius: 50%";" src="img/portfolio/d.jpg"></div><div style="text-align:center;"><button class="button button-small button-blocked button-energized"><i class="icon ion-chatboxes"> Chat</i></button> <button class="button button-small button-blocked button-calm" ng-click="contact()"><i class="icon ion-ios-email"> SMS</i></button>   <button class="button button-small button-balanced"><i class="icon ion-ios-telephone"> Call</i></button></div> <br>Name: ' + customer.get('customerInfo').firstName + ' ' + customer.get('customerInfo').lastName +'<br>Location: Mandaue, Cebu City<br>Contact: ' + customer.get('customerInfo').contactNumber +'<br> Schedule: ' + customer.get('schedule') +' <br> Total Bill: P' + customer.get('totalBill'),
				title: '<b>Booking Details</b>',
				subTitle: '',
				scope: $scope,
				buttons: [
					{ text: 'Close' },
					{
						text: '<b>Decline</b>',
						type: 'button-assertive',
						onTap: function(e) {
							$scope.declineAppointment(customer);
						}
					},
					{
						text: '<b>' + actionType + '</b>',
						type: buttonType || 'button-positive',
						onTap: function(e) {
							if(actionType === 'Complete'){
								$scope.completeAppointment(customer);
							} else{
								$scope.acceptAppointment(customer);
							}

						}
					}
				]
			});

			myPopup.then(function(res) {
				console.log('Tapped!', res);
			});

	};

	$scope.restoreAppointment = function(appointment, isCompleted){
		console.log('decline!');
		var confirmPopup = $ionicPopup.confirm({
			title: '<b>Restore Booking</b>',
			template: 'Are you sure you want to <b style="color:yellow;">RESTORE?</b>'
		});

		confirmPopup.then(function(res) {
			if(res) {
				if(isCompleted){
					setAppointment(appointment, 'accepted', 'Accepted');
				}else{
					setAppointment(appointment, 'pending', 'Pending');
				}

			} else {
				console.log('You are not sure');
			}
		});
	}

	$scope.declineAppointment = function(appointment){
		console.log('decline!');
		var confirmPopup = $ionicPopup.confirm({
			title: '<b>Decline Booking</b>',
			template: 'Are you sure you want to <b style="color:red;">DECLINE?</b>'
		});

		confirmPopup.then(function(res) {
			if(res) {
				setAppointment(appointment, 'canceled', 'Declined');
			} else {
				console.log('You are not sure');
			}
		});
	}

	$scope.acceptAppointment = function(appointment){
		var confirmPopup = $ionicPopup.confirm({
			title: '<b>Accept Booking</b>',
			template: 'Are you sure you want to <b style="color:blue;">ACCEPT?</b>'
		});

		confirmPopup.then(function(res) {
			if(res) {
				setAppointment(appointment, 'accepted', 'Accepted');
			} else {
				console.log('You are not sure');
			}
		});
	}

	$scope.completeAppointment = function(appointment){
		var confirmPopup = $ionicPopup.confirm({
			title: '<b>Complete Booking</b>',
			template: 'Are you sure you want to set this to <b style="color:green;">COMPLETE?</b>'
		});

		confirmPopup.then(function(res) {
			if(res) {
				setAppointment(appointment, 'completed', 'Completed');
			} else {
				console.log('You are not sure');
			}
		});
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
				if(appointment.get('status')){
					$scope.appointments[appointment.get('status')].push(appointment);
				}

				console.log($scope.appointments);
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

	function setAppointment(appointment, status, type){
		appointment.set("status", status);

		appointment.save(null, {
			success: function(result) {
				clearAppointments();
				getAppointments();
				var alertPopup = $ionicPopup.alert({
					title: '<b>Booking</b>',
					template: 'Booking Successfully ' + type
				});
				$ionicLoading.hide();

				alertPopup.then(function(res) {

				});

			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Booking',
					template: 'Booking Error on Complete, Please try again'
				});

				alertPopup.then(function(res) {

				});
			}
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

	$scope.contact = function(){
		console.log('contact!');
	}

})

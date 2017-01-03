app.controller('ManagerAppointmentCtrl', function($scope, $ionicPopup, appointmentService, $ionicLoading, artistService, threadService, $state) {
	console.log('manager appointment controller');
	var bookingPopup;
	$scope.appointments = {
		'completed' : [],
		'accepted' : [],
		'pending' : [],
		'canceled' : []
	};

	$scope.listView = {
		'completed' : 3,
		'accepted' : 3,
		'pending' : 3,
		'canceled' : 3
	}

	$scope.$on('$ionicView.enter', function(e) {
		$scope.isLoading = true;

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

	$scope.messageCustomer = function(){
		var customer = $scope.currentCustomerSelected;

		if(customer.get('customerInfo').id){
			threadService.isThreadExist(customer.get('customerInfo').id, Parse.User.current().get('artistId'))
			.then(function(results) {
				// Handle the result
				console.log(results);
				bookingPopup.close();
				if(results.length){
					$state.go('tab.chat-detail', {customerId: customer.get('customerInfo').id, chatId: results[0].id});
				}else{
					console.log('create new thread');
					getArtistProfile(customer);
				}

				return results;
			}, function(err) {
				// Error occurred
				console.log(err);
			}, function(percentComplete) {
				console.log(percentComplete);
			});
		} else{
			var alertPopup = $ionicPopup.alert({
				title: 'Customer Not Registered Yet.',
				template: 'You cannot chat with this user yet. <br><br>Please contact the customer through SMS or Phone Call.'
			});

			alertPopup.then(function(res) {
				console.log('Thank you for not eating my delicious ice cream cone');
			});
		}
	}

	$scope.viewAll = function(listType, status){
		$scope.listView[listType] = status;
	}

	$scope.showBookingAlert = function(customer, actionType, buttonType) {
			$scope.data = {};
			// An elaborate, custom popup
			var avatar = customer.get('customerInfo').avatar || 'img/placeholder.png';
			$scope.currentCustomerSelected = customer;
			bookingPopup = $ionicPopup.show({
				template: '<div style="padding: 0px 100px;"><img class="animate-show" fade-in style="width:100%; border-radius: 50%";" src="' + avatar + '"></div><br><div style="text-align:center;"><button class="button button-small button-blocked button-energized" ng-click="messageCustomer()"><i class="icon ion-chatboxes"> Chat</i></button> <a class="button button-small button-blocked button-calm" href="sms:'+ customer.get('customerInfo').contactNumber +'""><i class="icon ion-ios-email"> SMS</i></a>   <a class="button button-small button-balanced" href="tel:'+ customer.get('customerInfo').contactNumber +'"><i class="icon ion-ios-telephone"> Call</i></a></div> <br><span ng-if="currentCustomerSelected.attributes.customerInfo.firstName">Name: ' + customer.get('customerInfo').firstName + ' ' + customer.get('customerInfo').lastName +'</span><br>Contact: ' + customer.get('customerInfo').contactNumber +'<br> Schedule: ' + customer.get('schedule') +'<br>Selected Services: <span ng-repeat="service in currentCustomerSelected.attributes.selectedServices track by $index">{{service.name}}{{$last ? "" : ", "}}</span> <br> Total Bill: P' + customer.get('totalBill'),
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

			bookingPopup.then(function(res) {
				console.log('Tapped!', res);
			});
	};

	$scope.restoreAppointment = function(appointment, isCompleted){
		var myPopup = $ionicPopup.show({
			template: 'What status would you like to set this booking?',
			title: 'Restore Booking Status',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Cancel' },
				{
					text: '<b>Pending</b>',
					type: 'button-energized',
					onTap: function(e) {
						setAppointment(appointment, 'pending', 'Pending');
					}
				},
				{
					text: '<b>Accepted</b>',
					type: 'button-positive',
					onTap: function(e) {
						setAppointment(appointment, 'accepted', 'Accepted');
					}
				}
			]
		});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
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

	function getArtistProfile(customer){
		if(Parse.User.current()){
			artistService.getArtistById(Parse.User.current().get('artistId'))
			.then(function(results) {
				// Handle the result
				createNewThread(results[0], customer);


				return results;
			}, function(err) {
				// Error occurred
				console.log(err);
			}, function(percentComplete) {
				console.log(percentComplete);
			});
		}
	}

	function createNewThread(artist, customer){
		var Thread = Parse.Object.extend("Thread");
		var thread = new Thread();

		thread.set("lastMessage", '');
		thread.set("messages", []);
		thread.set("artistInfo", {
			"id": artist.id,
			"firstName": artist.get('firstName'),
			"lastName": artist.get('lastName'),
			"avatar": artist.get('avatar')
		});

		thread.set("customerInfo", {
			"id": customer.get('customerInfo').id,
			"firstName": customer.get('customerInfo').firstName,
			"lastName": customer.get('customerInfo').lastName,
			"avatar": customer.get('avatar') || 'img/placeholder.png'
		});

		thread.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				console.log('last message success');
				$state.go('tab.chat-detail', {customerId: customer.get('customerInfo').id, chatId: result.id});
			},
			error: function(gameScore, error) {
			}
		});
	}

	function getAppointments(){
		appointmentService.getBookingsById(Parse.User.current().get('artistId'))
		.then(function(results) {
			// Handle the result
			console.log(results);
			angular.forEach(results, function(appointment) {
				if(appointment.get('status')){
					$scope.appointments[appointment.get('status')].push(appointment);
				}

				// console.log($scope.appointments);
			});

			$scope.isLoading = false;
		}, function(err) {
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

	function setAppointment(appointment, status, type){
		appointment.set("status", status);

		if(type === 'Accepted'){
			type = '<b>Accepted</b><br><br> This booking has now been added to your calendar schedule.'
		}

		appointment.save(null, {
			success: function(result) {
				clearAppointments();
				getAppointments();
				var alertPopup = $ionicPopup.alert({
					title: '<b>Booking</b>',
					template: 'Booking Successfully Added to: ' + type
				});

				alertPopup.then(function(res) {

				});

			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
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

app.controller('MainCtrl', function($scope, $ionicPopup, Pubnub, $pubnubChannel, $state, $rootScope, $ionicLoading, $ionicHistory, $stateParams, $state, customerService) {
	console.log('main!');
	console.log($state);
	var user = {
		id : "jsYBzvkOHj"
	}

	$scope.$on('$ionicView.enter', function(e) {
		if(Parse.User.current()){
			user.id = Parse.User.current().get('profileId');
		}else{
			// $ionicHistory.nextViewOptions({
			// 	disableBack: true
			// });
			// $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
		}
	});

	$scope.showMessageAlert = function(message) {
		$scope.data = {};

		var myPopup = $ionicPopup.show({
			template: '<div style="padding: 0px 100px; text-align: center;"><img style="width:50%; border-radius: 50%";" src="' + message.sender.avatar + '"><br><b>' + message.sender.name + '</b></div>',
			title: '<b>You have a new message!</b> <br><br> <p style="text-align: justify;">' + message.content.message + '</p>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Cancel' },
				{
					text: '<b>View</b>',
					type: 'button-positive',
					onTap: function(e) {
						$state.go('tab.chat-detail', {customerId: message.content.userId, chatId: message.content.threadId});
					}
				}
				]
			});

			myPopup.then(function(res) {
				console.log('Tapped!', res);
			});

	};

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

	$scope.showBookingAlert = function(booking) {
		$scope.data = {};
		console.log(booking);
		// An elaborate, custom popup
		var customer = booking.content;
		var avatar = customer.customerInfo.avatar || 'img/placeholder.png';
		var myPopup = $ionicPopup.show({
			template: '<div style="padding: 0px 100px;"><img style="width:100%; border-radius: 50%";" src="' + avatar + '"></div><div style="text-align:center;"><button class="button button-small button-blocked button-energized"><i class="icon ion-chatboxes"> Chat</i></button> <button class="button button-small button-blocked button-calm" ng-click="contact()"><i class="icon ion-ios-email"> SMS</i></button>   <button class="button button-small button-balanced"><i class="icon ion-ios-telephone"> Call</i></button></div> <br>Name: ' + customer.customerInfo.firstName + ' ' + customer.customerInfo.lastName +'<br>Location: Mandaue, Cebu City<br>Contact: ' + customer.customerInfo.contactNumber +'<br> Schedule: ' + customer.schedule.iso.toString() +' <br> Total Bill: P' + customer.totalBill,
			title: '<b>You have a new booking!</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
				{
					text: '<b>View</b>',
					type: 'button-positive',
					onTap: function(e) {
						$state.go('tab.manage-appointments');
					}
				},
				{
					text: '<b>Accept</b>',
					type: 'button-balanced',
					onTap: function(e) {
						$scope.acceptAppointment(customer);
					}
				}
			]
		});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});

	};

	function setAppointment(booking, status, type){
		var Appointment = Parse.Object.extend("Booking");
		var appointment = new Appointment();

		appointment.id = booking.objectId;

		appointment.set("status", status);

		appointment.save(null, {
			success: function(result) {

				var myPopup = $ionicPopup.show({
					template: '<b>Booking Successfully Accepted!</b>',
					title: 'Booking',
					subTitle: '',
					scope: $scope,
					buttons: [
						{ text: 'Close' },
						{
							text: '<b>Calendar</b>',
							type: 'button-positive',
							onTap: function(e) {
								$state.go('tab.manage-schedule-calendar');
							}
						},
						{
							text: '<b>List</b>',
							type: 'button-balanced',
							onTap: function(e) {
								$state.go('tab.manage-appointments');
							}
						}
						]
				});

				myPopup.then(function(res) {
					console.log('Tapped!', res);
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

	$scope.bookingAlertChannel = 'book/' + user.id;
	$scope.messageAlertChannel = 'message/' + user.id;

	$scope.uuid = user.id;

	Pubnub.init({
		publish_key: 'pub-c-ffcdc13e-a8fe-4299-8a2d-eb5b41f0dc47',
		subscribe_key: 'sub-c-2d86535e-968a-11e6-94c7-02ee2ddab7fe',
		ssl: true,
		uuid: $scope.uuid
	});

	Pubnub.subscribe({
		channel: $scope.bookingAlertChannel,
		triggerEvents: ['callback', 'connect', 'disconnect'],
		connect : function() {
			// send a message
			console.log('hello');
		}
	});

	Pubnub.subscribe({
		channel: $scope.messageAlertChannel,
		triggerEvents: ['callback', 'connect', 'disconnect'],
		connect : function() {
			// send a message
			console.log('hello');
		}
	});

	// Listening to the callbacks
	$rootScope.$on(Pubnub.getMessageEventNameFor($scope.bookingAlertChannel), function(ngEvent, m) {
		console.log(m);
		$scope.showBookingAlert(m);
	});

	$rootScope.$on(Pubnub.getMessageEventNameFor($scope.messageAlertChannel), function(ngEvent, m) {
		console.log(m);
		console.log($state);
		if(m.content.threadId !== $state.params.chatId){
			$scope.showMessageAlert(m);
		}else{
			$rootScope.getStreamMessage(m);
		}
	});

	$rootScope.$on(Pubnub.getEventNameFor('subscribe', 'connect'), function (ngEvent, payload) {
		$rootScope.isPubnubOnline = 'Online';
		console.log('online');
	});

	$rootScope.$on(Pubnub.getEventNameFor('subscribe', 'disconnect'), function (ngEvent, payload) {
		$rootScope.isPubnubOnline = 'Offline';
		console.log('offline');
	});

});

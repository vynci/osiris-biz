app.controller('MainCtrl', function($scope, $ionicPopup, Pubnub, $pubnubChannel, $state, $rootScope, $ionicLoading, $ionicHistory, $stateParams, $state, customerService, $cordovaLocalNotification, artistService, threadService) {
	console.log('main!');
	console.log($state);
	var user = {
		id : "jsYBzvkOHj"
	}

	var bookingPopup;
	$rootScope.isPubnubOnline = 'Offline';

	if(Parse.User.current()){
		pubnubInit();
	}

	$scope.$on('$ionicView.enter', function(e) {
		console.log($ionicHistory);
		if(Parse.User.current()){
			user.id = Parse.User.current().get('artistId');
		}else{
			// $ionicHistory.nextViewOptions({
			// 	disableBack: true
			// });
			// $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
		}
	});

	$scope.clearHistory = function() {

		$ionicHistory.clearHistory();
	}

	$scope.messageCustomer = function(){
		var customer = $scope.currentCustomerSelected;
		if(customer.customerInfo.id){
			threadService.isThreadExist(customer.customerInfo.id, Parse.User.current().get('artistId'))
			.then(function(results) {
				// Handle the result
				console.log(results);
				bookingPopup.close();
				if(results.length){
					$state.go('tab.chat-detail', {customerId: customer.customerInfo.id, chatId: results[0].id});
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
		}else{
			var alertPopup = $ionicPopup.alert({
				title: 'Customer Not Registered Yet.',
				template: 'You cannot chat with this user yet. <br><br>Please contact the customer through SMS or Phone Call.'
			});

			alertPopup.then(function(res) {
				console.log('Thank you for not eating my delicious ice cream cone');
			});
		}

	}

	$scope.showMessageAlert = function(message) {
		$scope.data = {};
		if(!message.sender.avatar){
			message.sender.avatar = 'img/placeholder.png'
		}
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
						$state.go('tab.chat-detail', {customerId: message.content.userId, chatId: message.content.threadId, isNewMessageArtist: "true"});
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
		$scope.currentCustomerSelected = customer;
		var avatar = customer.customerInfo.avatar || 'img/placeholder.png';
		bookingPopup = $ionicPopup.show({
			template: '<div style="padding: 0px 100px;"><img style="width:100%; border-radius: 50%";" src="' + avatar + '"></div><div style="text-align:center;"><button class="button button-small button-blocked button-energized" ng-click="messageCustomer()"><i class="icon ion-chatboxes"> Chat</i></button> <a class="button button-small button-blocked button-calm" href="sms:'+ customer.customerInfo.contactNumber +'""><i class="icon ion-ios-email"> SMS</i></a>   <a class="button button-small button-balanced" href="tel:'+ customer.customerInfo.contactNumber +'"><i class="icon ion-ios-telephone"> Call</i></a></div> <br><span ng-if="currentCustomerSelected.customerInfo.firstName">Name: ' + customer.customerInfo.firstName + ' ' + customer.customerInfo.lastName +'</span><br>Location: Mandaue, Cebu City<br>Contact: ' + customer.customerInfo.contactNumber +'<br> Schedule: ' + customer.schedule.iso.toString() +' Selected Services: <span ng-repeat="service in currentCustomerSelected.selectedServices">{{service.name}}{{$last ? "" : ", "}}</span><br> Total Bill: P' + customer.totalBill,
			title: '<b>You have a new booking!</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
				{
					text: '<b>Accept</b>',
					type: 'button-balanced',
					onTap: function(e) {
						$scope.acceptAppointment(customer);
					}
				}
			]
		});

		bookingPopup.then(function(res) {
			console.log('Tapped!', res);
		});

	};

	function getArtistProfile(customer){
		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){
		});

		if(Parse.User.current()){
			artistService.getArtistById(Parse.User.current().get('artistId'))
			.then(function(results) {
				// Handle the result
				createNewThread(results[0], customer);


				return results;
			}, function(err) {
				// Error occurred
				$ionicLoading.hide();
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
			"id": customer.customerInfo.id,
			"firstName": customer.customerInfo.firstName,
			"lastName": customer.customerInfo.lastName,
			"avatar": customer.customerInfo.avatar || 'img/placeholder.png'
		});

		thread.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				console.log('last message success');
				$state.go('tab.chat-detail', {customerId: customer.customerInfo.id, chatId: result.id});
				$ionicLoading.hide();
			},
			error: function(gameScore, error) {
				$ionicLoading.hide();
			}
		});
	}

	function openLocalNotification(message, isBooking){
		console.log('local notif!');
		console.log(message);
		var id = '';
		var title = '';
		var text = '';

		if(isBooking){
			var schedule = message.content.schedule.iso.toString();
			id = message.content.objectId;
			title = 'New Booking!';
			text = message.sender.name + ' - ₱' + message.content.totalBill + ' - ' + schedule.slice(0,10);
		}else{
			id = message.content.threadId;
			title = message.sender.name;
			text = message.content.message;
		}

		$cordovaLocalNotification.schedule({
			id: id,
			title: title,
			text: text
		}).then(function (result) {
			// ...
		});
	}

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
						{
							text: '<b>Ok</b>',
							type: 'button-positive',
							onTap: function(e) {

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

	$rootScope.pubnubRestart = function(){
		console.log('pubnub restart!');
		pubnubInit();
	}

	$rootScope.unsubscribe = function(){
		console.log('unsubscribed to, ');
		console.log($scope.bookingAlertChannel);
		console.log($scope.messageAlertChannel);
		$rootScope.isPubnubOnline = 'Offline';
		Pubnub.unsubscribe({
			channel: [$scope.bookingAlertChannel, $scope.messageAlertChannel]
		})
	}

	function pubnubInit(){
		console.log('pubnub init!');

		$scope.bookingAlertChannel = 'book/' + Parse.User.current().get('artistId');
		$scope.messageAlertChannel = 'message/' + Parse.User.current().get('artistId');

		Pubnub.init({
			publish_key: 'pub-c-ffcdc13e-a8fe-4299-8a2d-eb5b41f0dc47',
			subscribe_key: 'sub-c-2d86535e-968a-11e6-94c7-02ee2ddab7fe',
			ssl: true
		});

		Pubnub.subscribe({
			channel: $scope.bookingAlertChannel,
			triggerEvents: ['callback', 'connect', 'disconnect'],
			connect : function() {
				// send a message
				console.log('hello');
				$rootScope.isPubnubOnline = 'Online';
			}
		});

		Pubnub.subscribe({
			channel: $scope.messageAlertChannel,
			triggerEvents: ['callback', 'connect', 'disconnect'],
			connect : function() {
				// send a message
				console.log('hello');
				$rootScope.isPubnubOnline = 'Online';
			}
		});

		// Listening to the callbacks
		$rootScope.$on(Pubnub.getMessageEventNameFor($scope.bookingAlertChannel), function(ngEvent, m) {
			console.log(m);
			openLocalNotification(m, true);
			$scope.showBookingAlert(m);
		});

		$rootScope.$on(Pubnub.getMessageEventNameFor($scope.messageAlertChannel), function(ngEvent, m) {
			console.log(m);
			if(m.content.threadId !== $state.params.chatId){
				openLocalNotification(m, false);
				$scope.showMessageAlert(m);
			}else{
				$rootScope.getStreamMessage(m);
			}
		});

		$rootScope.$on(Pubnub.getEventNameFor('subscribe', 'connect'), function (ngEvent, payload) {
			$rootScope.isPubnubOnline = 'Online';
			console.log($scope.messageAlertChannel);
			console.log('online');
		});

		$rootScope.$on(Pubnub.getEventNameFor('subscribe', 'disconnect'), function (ngEvent, payload) {
			$rootScope.isPubnubOnline = 'Offline';
			console.log('offline');
		});
	}



});

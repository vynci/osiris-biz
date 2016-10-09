app.controller('DashCtrl', function($scope, $ionicPopup, Pubnub, $pubnubChannel, $rootScope) {
	var user = {
		id : "jsYBzvkOHj"
	}

	$scope.showMessageAlert = function(message) {
		$scope.data = {};

		// An elaborate, custom popup
		var myPopup = $ionicPopup.show({
			template: '<textarea rows="4" cols="50" type="password" ng-model="data.wifi">',
			title: '<b>You have a new message!</b> <br><br> <p style="text-align: justify;">' + message.content + '</p>',
			subTitle: '<b>' + message.sender_uuid + '</b>',
			scope: $scope,
			buttons: [
				{ text: 'Cancel' },
				{ text: 'View' },
				{
					text: '<b>Reply</b>',
					type: 'button-positive',
					onTap: function(e) {
						if (!$scope.data.wifi) {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							return $scope.data.wifi;
						}
					}
				}
			]
	});

	myPopup.then(function(res) {
		console.log('Tapped!', res);
	});

	};

	$scope.showBookingAlert = function() {
		$scope.data = {};

		// An elaborate, custom popup
		var myPopup = $ionicPopup.show({
			template: '<div style="padding: 0px 100px;"><img style="width:100%; border-radius: 50%";" src="img/portfolio/a.jpg"><br><div style="text-align:center;"><button class="button button-small button-blocked button-calm"><i class="icon ion-ios-email"> SMS</i></button>   <button class="button button-small button-balanced"><i class="icon ion-ios-telephone"> Call</i></button></div></div> <br>Name: Arya Stark <br>Location: Mandaue, Cebu City<br>Contact: +639272326087<br> Schedule: October 21, 2016 9:00 AM <br> Total Bill: P300',
			title: '<b>You have a new booking!</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
				{
					text: '<b>Chat</b>',
					type: 'button-energized',
					onTap: function(e) {
						$scope.showContactOption();
					}
				},
				{
					text: '<b>Accept</b>',
					type: 'button-balanced',
					onTap: function(e) {
						if (!$scope.data.wifi) {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							return $scope.data.wifi;
						}
					}
				}
			]
		});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});

	};

	$scope.bookingAlertChannel = 'book/' + user.id;
	$scope.messageAlertChannel = 'message/' + user.id;

	$scope.uuid = user.id;

	Pubnub.init({
		publish_key: 'pub-c-a1cd7ac1-585e-478e-925b-65d17ce62f7d',
		subscribe_key: 'sub-c-204f063e-c559-11e5-b764-02ee2ddab7fe',
		ssl: true,
		uuid: $scope.uuid
	});

	Pubnub.subscribe({
		channel: $scope.bookingAlertChannel,
		triggerEvents: ['callback'],
		connect : function() {
			// send a message
			console.log('hello');
		}
	});

	Pubnub.subscribe({
		channel: $scope.messageAlertChannel,
		triggerEvents: ['callback'],
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
		$scope.showMessageAlert(m);
	});


})

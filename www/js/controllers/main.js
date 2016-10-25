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
		publish_key: 'pub-c-ffcdc13e-a8fe-4299-8a2d-eb5b41f0dc47',
		subscribe_key: 'sub-c-2d86535e-968a-11e6-94c7-02ee2ddab7fe',
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
		console.log($state);
		if(m.content.threadId !== $state.params.chatId){
			$scope.showMessageAlert(m);
		}else{
			$rootScope.getStreamMessage(m);
		}

	});


});

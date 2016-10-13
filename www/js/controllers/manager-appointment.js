app.controller('ManagerAppointmentCtrl', function($scope, $ionicPopup) {
	console.log('manager appointment controller');
	$scope.showBookingAlert = function() {
			$scope.data = {};

			// An elaborate, custom popup
			var myPopup = $ionicPopup.show({
				template: '<div style="padding: 0px 100px;"><img style="width:100%; border-radius: 50%";" src="img/portfolio/d.jpg"><br><div style="text-align:center;"><button class="button button-small button-blocked button-calm"><i class="icon ion-ios-email"> SMS</i></button>   <button class="button button-small button-balanced"><i class="icon ion-ios-telephone"> Call</i></button></div></div> <br>Name: Arya Stark <br>Location: Mandaue, Cebu City<br>Contact: +639272326087<br> Schedule: October 21, 2016 9:00 AM <br> Total Bill: P300',
				title: '<b>Booking Details</b>',
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

	$scope.showContactOption = function() {
		$scope.data = {};

		// An elaborate, custom popup
		var myPopup = $ionicPopup.show({
			template: '',
			title: '<b>Choose</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
				{
					text: '<b>Chat</b>',
					type: 'button-energized',
					onTap: function(e) {
						if (!$scope.data.wifi) {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							return $scope.data.wifi;
						}
					}
				},
				{
					text: '<b>SMS</b>',
					type: 'button-balanced',
					onTap: function(e) {
						if (!$scope.data.wifi) {
							//don't allow the user to close unless he enters wifi password
							e.preventDefault();
						} else {
							return $scope.data.wifi;
						}
					}
				},
				{
					text: '<b>Call</b>',
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


	$scope.acceptBooking = function(){
		console.log('accept booking');
	}
})

app.controller('RegisterCtrl', function($scope, $ionicLoading, $rootScope, $ionicHistory, $state, $ionicPopup) {
	console.log('login!');
	var userId = '';
	$scope.userData = {};
	$scope.forgotPasswordEmail = {};

	$scope.register = function(){
		console.log($scope.userData);

		if($scope.userData.firstName && $scope.userData.lastName && $scope.userData.primaryAddress && $scope.userData.contactNumber && $scope.userData.email){
			Parse.Cloud.run('request-register', $scope.userData, {
				success: function(secretString) {
					// obtained secret string
					var alertPopup = $ionicPopup.alert({
						title: 'Submission Successful!',
						template: 'We are now screening the information in your registration form. We will contact you as soon as possible for the next step. <br><br> Thank you so much for submitting.'
					});

					alertPopup.then(function(res) {
						console.log('Thank you for not eating my delicious ice cream cone');
					});
				},
				error: function(error) {
					console.log(error);
					var alertPopup = $ionicPopup.alert({
						title: 'Submission Failed',
						template: 'Sorry, Something went wrong with the registration. Please try again.'
					});

					alertPopup.then(function(res) {
						console.log('Thank you for not eating my delicious ice cream cone');
					});
				}
			});
		}else{
			var alertPopup = $ionicPopup.alert({
				title: 'Submission Failed',
				template: 'Please fill up the required fields:<br><br>*First and Last Name<br>*Primary Address<br>*Email Address<br>*Contact Number'
			});

			alertPopup.then(function(res) {
				console.log('Thank you for not eating my delicious ice cream cone');
			});
		}




	}


});

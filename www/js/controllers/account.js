app.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		enableFriends: true
	};

	$scope.profile = {
		firstName : 'Jackie',
		lastName : 'Burgess',
		gender: 'female',
		email : 'jackieb@gmail.com',
		contactNumber : '+639272526833',
		address : 'BGC, Manila',
		serviceType : 'Makeup Artist'
	}
});

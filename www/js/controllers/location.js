app.controller('LocationCtrl', function($scope, $ionicLoading, $ionicPopup, artistService) {
	var customerLocation = new google.maps.LatLng(10.3454904, 123.9130406);


	var marker;

	var mapOptions = {
		center: customerLocation,
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl : false,
		zoomControl : true,
		streetViewControl : false
	};

	$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

	$scope.map.addListener('click', function(event) {
		console.log(event.latLng.lat());
		var location = {
			lat: event.latLng.lat(),
			lng: event.latLng.lng()
		}

		if(marker){
			marker.setMap(null);
		}

		placeMarker(location);
	});

	function placeMarker(location) {
		console.log(location);

		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});

		var googlelatLng = new google.maps.LatLng(location.lat, location.lng);

		var Profile = Parse.Object.extend("Artist");
		var profile = new Profile();
		profile.id = Parse.User.current().get('profileId');
		profile.set("coordinates", new Parse.GeoPoint({latitude: location.lat, longitude: location.lng}));

		marker = new google.maps.Marker({
			position: googlelatLng,
			map: $scope.map
		});

		profile.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				$ionicLoading.hide();

				var alertPopup = $ionicPopup.alert({
					title: 'Location Update',
					template: 'Your location has been successfully updated.'
				});

				alertPopup.then(function(res) {

				});

			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				$ionicLoading.hide();
				console.log(error);
			}
		});
	}


})

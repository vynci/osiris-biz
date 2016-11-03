app.controller('LocationCtrl', function($scope, $ionicLoading, $ionicPopup, artistService, $ionicHistory, $state) {

	var marker;

	$scope.position = {
		search : ''
	};

	$scope.$on('$ionicView.enter', function(e) {
		if(Parse.User.current()){
			$ionicLoading.show({
				template: 'Loading...'
			}).then(function(){

			});
			getArtistById(Parse.User.current().get('artistId'));
		}else{
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.transitionTo('tab.account-login', null, {reload: true, notify:true});
		}
	});

	$scope.$watch('position.search', function(value, old) {
		console.log(value);
		if(value.geometry){
			// var point = new Parse.GeoPoint({latitude: value.geometry.location.lat(), longitude: value.geometry.location.lng()});
			$scope.map.setCenter(new google.maps.LatLng( value.geometry.location.lat(), value.geometry.location.lng() ) );
		}
	});

	function initMap(lat, lng){
		var customerLocation = new google.maps.LatLng(lat, lng);

		var mapOptions = {
			center: customerLocation,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl : false,
			zoomControl : false,
			streetViewControl : false
		};

		$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

		placeMarker({
			lat : lat,
			lng : lng
		}, true);

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
	}


	function placeMarker(location, isInit) {
		console.log(location);

		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});

		var googlelatLng = new google.maps.LatLng(location.lat, location.lng);

		var Profile = Parse.Object.extend("Artist");
		var profile = new Profile();
		profile.id = Parse.User.current().get('artistId');
		profile.set("coordinates", new Parse.GeoPoint({latitude: location.lat, longitude: location.lng}));

		marker = new google.maps.Marker({
			position: googlelatLng,
			map: $scope.map
		});

		if(!isInit){
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
		}else{
			$ionicLoading.hide();
		}
	}

	function getArtistById(id){
		artistService.getArtistById(id)
		.then(function(results) {
			// Handle the result
			$scope.currentCoordinates = results[0].get('coordinates');
			initMap($scope.currentCoordinates._latitude, $scope.currentCoordinates._longitude);
			$ionicLoading.hide();
			return results;
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}


})

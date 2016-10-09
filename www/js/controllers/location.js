app.controller('LocationCtrl', function($scope) {
	var customerLocation = new google.maps.LatLng(10.3454904, 123.9130406);
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

		placeMarker(location);
	});

	function placeMarker(location) {
		console.log(location);
		var googlelatLng = new google.maps.LatLng(location.lat, location.lng);

		var marker = new google.maps.Marker({
			position: googlelatLng,
			map: $scope.map
		});
	}
})

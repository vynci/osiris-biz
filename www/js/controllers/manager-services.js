app.controller('ManagerServicesCtrl', function($scope, serviceService, $ionicLoading, $ionicHistory, $ionicModal, artistService, $ionicPopup, $state) {
	console.log('manager services controller');

	var userId = '';
	var priceRange = [];
	$scope.service = {};
    $scope.isModalEdit = false;

	if(Parse.User.current()){
		userId = Parse.User.current().get('profileId');

		loading();

		getServiceById(userId);
	}else{
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.transitionTo('tab.account-login', null, {reload: true, notify:true});
	}

	$scope.addService = function(){
		console.log('add service');
        $scope.isModalEdit = false;
        $scope.service = {};
		$scope.modal.show();
	}

	$scope.editService = function(service){
		console.log('edit service');
        $scope.isModalEdit = true;
		$scope.modal.show();
		$scope.currentService = service;
		$scope.service = {
			name : service.get('name'),
			description : service.get('description'),
			duration : service.get('duration'),
			price : service.get('price'),
		};
	}

	$scope.updateService = function(){
		$scope.currentService.set('name', $scope.service.name);
		$scope.currentService.set('description', $scope.service.description);
		$scope.currentService.set('duration', $scope.service.duration);
		$scope.currentService.set('price', $scope.service.price);

		$scope.currentService.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				priceRange.push(parseInt($scope.service.price));
				var alertPopup = $ionicPopup.alert({
					title: 'Service',
					template: 'Service Successfully Updated'
				});
				$ionicLoading.hide();

				alertPopup.then(function(res) {
					$scope.service = {};

					$scope.artistProfile.set("priceRange", {low: findMin(priceRange), high: findMax(priceRange)});

					$scope.artistProfile.save(null, {
						success: function(result) {
							$scope.modal.hide();
                            getServiceById(userId);
						},
						error: function(gameScore, error) {
							// Execute any logic that should take place if the save fails.
							// error is a Parse.Error with an error code and message.
							console.log(error);
                            getServiceById(userId);
						}
					});

				});

			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				$ionicLoading.hide();
                getServiceById(userId);
				var alertPopup = $ionicPopup.alert({
					title: 'Service',
					template: 'Service: Add Failed'
				});

				alertPopup.then(function(res) {
					$scope.service = {};
				});
			}
		});
	}

	$scope.deleteService = function(){
		var service = $scope.currentService;
		var confirmPopup = $ionicPopup.confirm({
			title: 'Service',
			template: 'Are you sure you want to delete this service?',
			okText: 'Yes, I am sure!', // String (default: 'OK'). The text of the OK button.
			okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
		});

		confirmPopup.then(function(res) {
			if(res) {
				loading();
				service.destroy({
					success: function(myObject) {
						// The object was deleted from the Parse Cloud.
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: 'Service',
							template: 'Service Successfully Deleted'
						});

						alertPopup.then(function(res) {
							$scope.modal.hide();
							getServiceById(userId);
						});
					},
					error: function(myObject, error) {
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: 'Service',
							template: 'Service: Delete Failed'
						});

						alertPopup.then(function(res) {
							$scope.modal.hide();
							getServiceById(userId);
						});
					}
				});
			} else {
				console.log('You are not sure');
			}
		});
	}

	$scope.createService = function(){
		loading();
		var Service = Parse.Object.extend("Service");
		var service = new Service();

		service.set("name", $scope.service.name);
		service.set("description", $scope.service.description);
		service.set("price", parseInt($scope.service.price));
		service.set("duration", parseInt($scope.service.duration));
		service.set("ownerId", userId);

		service.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				priceRange.push(parseInt($scope.service.price));
				var alertPopup = $ionicPopup.alert({
					title: 'Service',
					template: 'Service Successfully Added'
				});
				$ionicLoading.hide();

				alertPopup.then(function(res) {
					$scope.service = {};

					$scope.artistProfile.set("priceRange", {low: findMin(priceRange), high: findMax(priceRange)});

					$scope.artistProfile.save(null, {
						success: function(result) {
							$scope.modal.hide();
                            getServiceById(userId);
						},
						error: function(gameScore, error) {
							// Execute any logic that should take place if the save fails.
							// error is a Parse.Error with an error code and message.
                            getServiceById(userId);
							console.log(error);
						}
					});

				});

			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				$ionicLoading.hide();
                getServiceById(userId);
				var alertPopup = $ionicPopup.alert({
					title: 'Service',
					template: 'Service: Add Failed'
				});

				alertPopup.then(function(res) {
					$scope.service = {};
				});
			}
		});
	}

	$ionicModal.fromTemplateUrl('templates/manage-service-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	function loading(){
		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){

		});
	}

	function findMin(prices){
		if(!prices.length){
			return 0;
		}else{
			return Math.min.apply(null, prices);
		}
	}

	function findMax(prices){
		if(!prices.length){
			return 0;
		}else{
			return Math.max.apply(null, prices);
		}
	}

	function parsePriceRange(services){
		angular.forEach(services, function(service){
			var price = service.get('price');
			console.log(price);
			priceRange.push(price);
		});
	}

	function getArtistById(id){
		artistService.getArtistById(id)
		.then(function(results) {
			// Handle the result
			$scope.artistProfile = results[0];

			return results;
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

	function getServiceById(id){
		serviceService.getServiceById(id)
		.then(function(results) {
			// Handle the result
			$scope.artistServices = results;
			getArtistById(userId);
			parsePriceRange(results);
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

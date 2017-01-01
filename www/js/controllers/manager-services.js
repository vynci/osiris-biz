app.controller('ManagerServicesCtrl', function($scope, serviceService, $ionicLoading, $ionicHistory, $ionicModal, artistService, $ionicPopup, $state, $cordovaCamera) {
	console.log('manager services controller');

	var userId = '';
	var priceRange = [];
	$scope.service = {};
  $scope.isModalEdit = false;
	$scope.serviceType = 'Create Service';

	if(Parse.User.current()){
		userId = Parse.User.current().get('artistId');

		$scope.isLoading = true;

		getServiceById(userId);
	}else{
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.transitionTo('tab.account-login', null, {reload: true, notify:true});
	}

	document.addEventListener("deviceready", function () {
		var options = {
			quality: 100,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: true,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 400,
			targetHeight: 400,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false,
			correctOrientation:true,
			cameraDirection : 0
		};

		$scope.takePicture = function(){
			options.sourceType = Camera.PictureSourceType.CAMERA;
			$cordovaCamera.getPicture(options).then(function(imageData) {
				// var image = document.getElementById('myImage');
				// image.src = "data:image/jpeg;base64," + imageData;
				console.log(imageData);

				var file = imageData;

				var uploadFile = new Parse.File('image.jpg', {base64 : file});
				console.log(uploadFile);

				uploadFile.save().then(function(result) {
					// The file has been saved to Parse.
					console.log(result);
					loading();
					$scope.uploadServicePhoto(result._url);
				}, function(error) {
					// The file either could not be read, or could not be saved to Parse.
				});


			}, function(err) {
				// error
			});
		}

		$scope.getFromGallery = function(){
			options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
			$cordovaCamera.getPicture(options).then(function(imageData) {
				// var image = document.getElementById('myImage');
				// image.src = "data:image/jpeg;base64," + imageData;
				console.log(imageData);

				var file = imageData;

				var uploadFile = new Parse.File('image.jpg', {base64 : file});
				loading();
				uploadFile.save().then(function(result) {
					// The file has been saved to Parse.
					console.log(result);
					$scope.uploadServicePhoto(result._url);
				}, function(error) {
					// The file either could not be read, or could not be saved to Parse.
				});

			}, function(err) {
				// error
			});
		}
	}, false);

	$scope.viewServicePhoto = function(photo, arrayNumber){
		if(arrayNumber !== null){
			var myPopup = $ionicPopup.show({
				template: '<div style=""><img style="width:100%;" src="' + photo +'"></div>',
				title: '<b>View Portfolio</b>',
				subTitle: '',
				scope: $scope,
				buttons: [
					{ text: 'Close' },
					{
						text: 'Delete' ,
						type: 'button-assertive',
						onTap: function(e) {
							deleteServicePhoto(arrayNumber, $scope.service.id);
						}
					}
					]
			 });
		}else{
			var myPopup = $ionicPopup.show({
				template: '<div style=""><img style="width:100%;" src="' + photo +'"></div>',
				title: '<b>View Portfolio</b>',
				subTitle: '',
				scope: $scope,
				buttons: [
					{ text: 'Close' }
				]
			});
		}


		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});
	};

	$scope.showUploadOption = function() {
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
					text: '<b>Camera</b>',
					type: 'button-energized',
					onTap: function(e) {
						$scope.takePicture();
					}
				},
				{
					text: '<b>Gallery</b>',
					type: 'button-balanced',
					onTap: function(e) {
						$scope.getFromGallery();
					}
				}
			]
		});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});

	};

	$scope.uploadServicePhoto = function(url){
		$ionicLoading.hide();
		$scope.currentPortfolioDescription = {
			data : ''
		}
		var myPopup = $ionicPopup.show({
			template: '<div style=""><img style="width:100%;" src="' + url +'"></div>',
			title: '<b>New Service Photo</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
				{
					text: '<b>Save</b>',
					type: 'button-balanced',
					onTap: function(e) {
						savePortfolio(url, $scope.service.id);
					}
				}
			]
			});

		myPopup.then(function(res) {
			console.log('Tapped!', res);
		});
	}

	$scope.addService = function(){
		console.log('add service');
		$scope.serviceType = 'Create Service';
    $scope.isModalEdit = false;
    $scope.service = {};
		$scope.modal.show();
	}

	$scope.editService = function(service){
		console.log('edit service');
		$scope.serviceType = 'Edit Service';
		$scope.service = {};
    $scope.isModalEdit = true;
		$scope.modal.show();
		$scope.currentService = service;
		$scope.service = {
			id : service.id,
			name : service.get('name'),
			description : service.get('description'),
			duration : service.get('duration'),
			price : service.get('price'),
			servicePhotos : service.get('servicePhotos'),
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
		service.set("servicePhotos", []);

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

	function savePortfolio(imagePath, id){

		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){

		});

		var Service = Parse.Object.extend("Service");
		var service = new Service();
		$scope.service.servicePhotos.push({
			path : imagePath
		});
		service.id = id;
		service.set("servicePhotos", $scope.service.servicePhotos);

		service.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				console.log(result);

				var alertPopup = $ionicPopup.alert({
					title: 'Service Photo',
					template: 'Successfully Saved!'
				});

				alertPopup.then(function(res) {

				});

				$ionicLoading.hide();
			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				var alertPopup = $ionicPopup.alert({
					title: 'Service Photo',
					template: 'Service Photo: Add Failed'
				});

				alertPopup.then(function(res) {

				});
			}
		});
	}

	function deleteServicePhoto(arrayNumber, id){
		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){

		});

		var Service = Parse.Object.extend("Service");
		var service = new Service();

		if (arrayNumber > -1) {
			$scope.service.servicePhotos.splice(arrayNumber, 1);
		}
		console.log(arrayNumber);
		console.log($scope.service.servicePhotos);
		service.id = id;
		service.set("servicePhotos", $scope.service.servicePhotos);

		service.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				console.log(result);

				var alertPopup = $ionicPopup.alert({
					title: 'Service Photo',
					template: 'Successfully Deleted!'
				});

				alertPopup.then(function(res) {

				});

				$ionicLoading.hide();
			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				var alertPopup = $ionicPopup.alert({
					title: 'Service Photo',
					template: 'Service Photo: Delete Failed'
				});

				alertPopup.then(function(res) {

				});
			}
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
			$scope.isLoading = false;
			return results;
		}, function(err) {
			$scope.isLoading = false;
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

})

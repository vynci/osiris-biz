app.controller('ManagerPortfolioCtrl', function($scope, serviceService, $ionicLoading, portfolioService, $ionicPopup, $ionicHistory, $state, $cordovaCamera, $http) {
	console.log('manager services controller');

	var userId = '';

	if(Parse.User.current()){
		userId = Parse.User.current().get('artistId');

		$scope.isLoading = true;

		getPortfolioById(userId);
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
			targetWidth: 720,
			targetHeight: 720,
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

				$ionicLoading.show({
					template: 'Uploading...'
				}).then(function(){

				});

				uploadFile.save().then(function(result) {
					// The file has been saved to Parse.
					console.log(result);
					$scope.uploadPortfolio(result._url);
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

				$ionicLoading.show({
					template: 'Uploading...'
				}).then(function(){

				});

				uploadFile.save().then(function(result) {
					// The file has been saved to Parse.
					console.log(result);
					$scope.uploadPortfolio(result._url);
				}, function(error) {
					// The file either could not be read, or could not be saved to Parse.
				});

			}, function(err) {
				// error
			});
		}
	}, false);

	$scope.viewPortfolio = function(portfolio){
		console.log(portfolio);
		$scope.currentPortfolioDescription = {
			data : portfolio.get('description')
		}
		var myPopup = $ionicPopup.show({
			template: '<div style=""><img style="width:100%;" src="' + portfolio.attributes.imagePath +'"></div><br><textarea rows="4" cols="50" style="border-width: 1px;border-color: gray; border-style: dashed;" ng-model="currentPortfolioDescription.data"></textarea>',
			title: '<b>View Portfolio</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
      	        {
				    text: 'Delete' ,
				    type: 'button-assertive',
					onTap: function(e) {
						deletePortfolio(portfolio);
					}
				},
				{
					text: '<b>Save</b>',
					type: 'button-balanced',
					onTap: function(e) {
						savePortfolio('', $scope.currentPortfolioDescription.data, portfolio.id);
					}
				}
			]
			});

			myPopup.then(function(res) {
			console.log('Tapped!', res);
		});
	}

	$scope.uploadPortfolio = function(url){
		$ionicLoading.hide();
		$scope.currentPortfolioDescription = {
			data : ''
		}
		var myPopup = $ionicPopup.show({
			template: '<div style=""><img style="width:100%;" src="' + url +'"></div><br><textarea rows="4" cols="50" style="border-width: 1px;border-color: gray; border-style: dashed;" ng-model="currentPortfolioDescription.data"></textarea>',
			title: '<b>View Portfolio</b>',
			subTitle: '',
			scope: $scope,
			buttons: [
				{ text: 'Close' },
				{
					text: '<b>Save</b>',
					type: 'button-balanced',
					onTap: function(e) {
						savePortfolio(url, $scope.currentPortfolioDescription.data, false);
					}
				}
				]
		});

		myPopup.then(function(res) {
				console.log('Tapped!', res);
		});
	}

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

  function deletePortfolio(portfolio){

		var confirmPopup = $ionicPopup.confirm({
			title: 'Service',
			template: 'Are you sure you want to delete this picture?',
			okText: 'Yes, I am sure!', // String (default: 'OK'). The text of the OK button.
			okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
		});

		confirmPopup.then(function(res) {
			if(res) {

                $ionicLoading.show({
                    template: 'Deleting...'
                }).then(function(){

                });

				portfolio.destroy({
					success: function(myObject) {
						// The object was deleted from the Parse Cloud.
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: 'Portfolio',
							template: 'Picture Successfully Deleted'
						});

						alertPopup.then(function(res) {
							getPortfolioById(Parse.User.current().get('artistId'));
						});
					},
					error: function(myObject, error) {
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: 'Portfolio',
							template: 'Picture: Delete Failed'
						});

						alertPopup.then(function(res) {
							getPortfolioById(Parse.User.current().get('artistId'));
						});
					}
				});
			} else {
				console.log('You are not sure');
			}
		});
    }

	function savePortfolio(imagePath, description, id){

		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){

		});

		var Portfolio = Parse.Object.extend("Portfolio");
		var portfolio = new Portfolio();

		if(id){
			portfolio.id = id;
		}else{
			portfolio.set("imagePath", imagePath);
			portfolio.set("ownerId", Parse.User.current().get('artistId'));
			portfolio.set("artistInfo", {id: Parse.User.current().get('artistId')});
		}

		portfolio.set("description", description);

		portfolio.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				console.log(result);

				var alertPopup = $ionicPopup.alert({
					title: 'Portfolio',
					template: 'Successfully Saved!'
				});

				getPortfolioById(Parse.User.current().get('artistId'));

				alertPopup.then(function(res) {

				});

				$ionicLoading.hide();
			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.

				getPortfolioById(Parse.User.current().get('artistId'));
				var alertPopup = $ionicPopup.alert({
					title: 'Portfolio',
					template: 'Portfolio: Add Failed'
				});

				alertPopup.then(function(res) {
					$scope.service = {};
				});
			}
		});
	}

	function getPortfolioById(id){
		portfolioService.getPortfolioById(id)
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.artistPortfolio = results;
			$scope.isLoading = false;
		}, function(err) {
			$scope.isLoading = false;
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}
})

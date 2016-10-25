app.controller('ManagerPortfolioCtrl', function($scope, serviceService, $ionicLoading, portfolioService, $ionicPopup, $ionicHistory, $state, $cordovaCamera, $http) {
	console.log('manager services controller');

	var userId = '';

	if(Parse.User.current()){
		userId = Parse.User.current().get('profileId');

		$ionicLoading.show({
			template: 'Loading...'
		}).then(function(){

		});

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
				  type: 'button-assertive'
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
			portfolio.set("ownerId", Parse.User.current().get('profileId'));
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

				getPortfolioById(Parse.User.current().get('profileId'));

				alertPopup.then(function(res) {

				});

				$ionicLoading.hide();
			},
			error: function(gameScore, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.

				getServiceById(userId);
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
			$ionicLoading.hide();
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}
})

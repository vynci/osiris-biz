app.controller('AccountCtrl', function($scope, $ionicLoading, $rootScope, artistService, $ionicPopup, $ionicHistory, $state, $cordovaCamera) {
	var userId = '';

	$scope.profile = {

	}

	$scope.$on('$ionicView.enter', function(e) {
        if(Parse.User.current()){
            userId = Parse.User.current().get('profileId');
            $ionicLoading.show({
                template: 'Loading...'
            }).then(function(){

            });

            getArtistById(userId);
        }else{
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
        }
	});

	document.addEventListener("deviceready", function () {
		var options = {
			quality: 100,
			destinationType: Camera.DestinationType.DATA_URL,
			sourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: true,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 200,
			targetHeight: 200,
			popoverOptions: CameraPopoverOptions,
			saveToPhotoAlbum: false,
			correctOrientation:true,
			cameraDirection : 0
		};

		$scope.takePicture = function(){
			options.sourceType = Camera.PictureSourceType.CAMERA;
			$cordovaCamera.getPicture(options).then(function(imageData) {
				var file = imageData;
				var uploadFile = new Parse.File('image.jpg', {base64 : file});

				uploadFile.save().then(function(result) {
					// The file has been saved to Parse.
					console.log(result);
					updateAvatar(result._url);
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
				var file = imageData;
				var uploadFile = new Parse.File('image.jpg', {base64 : file});

				uploadFile.save().then(function(result) {
					// The file has been saved to Parse.
					console.log(result);
					updateAvatar(result._url);
				}, function(error) {
					// The file either could not be read, or could not be saved to Parse.
				});

			}, function(err) {
				// error
			});
		}
	}, false);

	$scope.updateProfile = function(){
		updateProfile(false);
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
    
    function updateAvatar(url){
        $ionicLoading.show({
            template: 'Loading...'
        }).then(function(){

        });
        
		$scope.artistProfile.set("avatar", url);

		$scope.artistProfile.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Profile Picture Update',
					template: 'Your profile picture has been successfully updated.'
				});

				alertPopup.then(function(res) {
					$scope.profile.icon = url;
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

	function getArtistById(id){
		artistService.getArtistById(id)
		.then(function(results) {
			// Handle the result
			$scope.artistProfile = results[0];
			$scope.profile = {
				avatar : results[0].get('avatar'),
				firstName : results[0].get('firstName'),
				lastName : results[0].get('lastName'),
				gender : results[0].get('gender'),
				birthDate : results[0].get('birthDate'),
				email : results[0].get('email'),
				address : results[0].get('address'),
				contactNumber : results[0].get('contactNumber'),
				serviceType : results[0].get('serviceType'),
				currentCoordinates : results[0].get('currentCoordinates'),
				icon : results[0].get('icon') || $scope.userPlaceholder
			}
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

	function updateProfile(isAvatar, url){
		$scope.artistProfile.set("firstName", $scope.profile.firstName);
		$scope.artistProfile.set("lastName", $scope.profile.lastName);
		$scope.artistProfile.set("email", $scope.profile.email);
		$scope.artistProfile.set("gender", $scope.profile.gender);
		$scope.artistProfile.set("contactNumber", $scope.profile.contactNumber);
		$scope.artistProfile.set("address", $scope.profile.address);
		$scope.artistProfile.set("serviceType", $scope.profile.serviceType);

		$scope.artistProfile.set("birthDate",$scope.profile.birthDate);

		if(isAvatar){
			$scope.artistProfile.set("icon", url);
		}


		$scope.artistProfile.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				$ionicLoading.hide();
				var alertPopup = $ionicPopup.alert({
					title: 'Account Update',
					template: 'Your account profile has been successfully updated.'
				});

				alertPopup.then(function(res) {
					$scope.profile.icon = url;
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

	$scope.doLogout = function() {
		Parse.User.logOut().then(function(){
			$rootScope.currentUser = Parse.User.current();  // this will now be null
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.transitionTo('tab.account-login', null, {reload: true, notify:true});
		});
	}

});

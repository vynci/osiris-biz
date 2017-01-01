app.controller('ChatsCtrl', function($scope, Chats, $ionicHistory, $state, threadService, $ionicLoading) {
	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};
	$scope.spiral = 'img/placeholder.png'
  var user = {};
	$scope.isLoading = true;
	$scope.$on('$ionicView.enter', function(e) {
        if(Parse.User.current()){
            user.id = Parse.User.current().get('artistId');
						getThreads();
        }else{
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
        }
	});

	$scope.removeThread = function(thread){
		console.log(thread);

		thread.set("isArtistThreadDeleted", true);

		thread.save(null, {
			success: function(result) {
				// Execute any logic that should take place after the object is saved.
				getThreads();
			},
			error: function(gameScore, error) {

			}
		});
	}

	function getThreads(){
		threadService.getThreadById(Parse.User.current().get('artistId'))
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.threads = results;
			$scope.isLoading = false;
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}
})

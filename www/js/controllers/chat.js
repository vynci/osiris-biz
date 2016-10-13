app.controller('ChatsCtrl', function($scope, Chats, $ionicHistory, $state) {
	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};
    
    var user = {};
    
	$scope.$on('$ionicView.enter', function(e) {
        if(Parse.User.current()){
            user.id = Parse.User.current().get('profileId');
        }else{
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
        }
	});        
})

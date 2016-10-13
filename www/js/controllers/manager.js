app.controller('ManagerCtrl', function($scope, $ionicHistory, $state) {
	console.log('manager controller');

	$scope.redirectToPortfolio = function(){
		console.log('redirect to port');
	}
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

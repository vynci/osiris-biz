app.controller('ManagerCtrl', function($scope, $ionicHistory, $state, reviewService, $ionicModal, serviceService, portfolioService) {
	console.log('manager controller');

	$scope.redirectToPortfolio = function(){
		console.log('redirect to port');
	}
  var user = {};

	$scope.isReviewLoading = true;
	$scope.isServiceLoading = true;
	$scope.isPortfolioLoading = true;

	$scope.spiral = "img/placeholder.png"

	$scope.$on('$ionicView.enter', function(e) {

    if(Parse.User.current()){
        user.id = Parse.User.current().get('artistId');
				getReviewsById(Parse.User.current().get('artistId'));
				getServiceById(Parse.User.current().get('artistId'));
				getPortfolioById(Parse.User.current().get('artistId'));
    }else{
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
    }
	});

	$ionicModal.fromTemplateUrl('templates/review-list-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.reviewModal = modal;
	});

	$scope.openReviewModal = function() {
		$scope.reviewModal.show();
	};
	$scope.closeReviewModal = function() {
		$scope.reviewModal.hide();
	};

	function getReviewsById(id){
		reviewService.getReviewsById(id)
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.artistReviews = results;
			$scope.isReviewLoading = false;
		}, function(err) {
			// Error occurred
			$scope.isReviewLoading = false;
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
			$scope.isServiceLoading = false;
			return results;
		}, function(err) {
			// Error occurred
			$scope.isServiceLoading = false;
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

	function getPortfolioById(id){
		portfolioService.getPortfolioById(id)
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.artistPortfolio = results;
			$scope.isPortfolioLoading = false;
		}, function(err) {
			$scope.isPortfolioLoading = false;
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

})

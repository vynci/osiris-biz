app.service('threadService', function($q) {

	var getThreadById = function(id) {
		var defer = $q.defer();
		var ServiceObject = Parse.Object.extend("Thread");
		var query = new Parse.Query(ServiceObject);

		if(id){
			query.equalTo("artistInfo.id", id);
		}

		query.find({
			success: function(results) {
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
			}
		});
		return defer.promise;
	};

	return {
		getThreadById: getThreadById
	};

});

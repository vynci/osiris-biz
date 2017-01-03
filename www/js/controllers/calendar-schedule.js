app.controller('CalendarScheduleCtrl', function($scope, $ionicPopup, appointmentService, $ionicLoading, artistService, threadService, $state) {
  console.log('calendar!');
  $scope.calendar = {};

  var acceptedAppointments = [];
  var bookingPopup;
  $scope.changeMode = function (mode) {
    $scope.calendar.mode = mode;
  };

  $scope.loadEvents = function () {
    $scope.calendar.eventSource = acceptedAppointments;
  };

  $scope.messageCustomer = function(){
    var customer = $scope.currentCustomerSelected;
    if(customer.get('customerInfo').id){
      threadService.isThreadExist(customer.get('customerInfo').id, Parse.User.current().get('artistId'))
      .then(function(results) {
        // Handle the result
        console.log(results);
        bookingPopup.close();
        if(results.length){
          $state.go('tab.chat-detail', {customerId: customer.get('customerInfo').id, chatId: results[0].id});
        }else{
          console.log('create new thread');
          getArtistProfile(customer);
        }

        return results;
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }else{
      var alertPopup = $ionicPopup.alert({
        title: 'Customer Not Registered Yet.',
        template: 'You cannot chat with this user yet. <br><br>Please contact the customer through SMS or Phone Call.'
      });

      alertPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
    }

  }

  $scope.onEventSelected = function (event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
    var customer = event.appointment;
    var avatar = customer.get('customerInfo').avatar || 'img/placeholder.png';
    $scope.currentCustomerSelected = customer;
    bookingPopup = $ionicPopup.show({
      template: '<div style="padding: 0px 100px;"><img class="animate-show" fade-in style="width:100%; border-radius: 50%";" src="' + avatar + '"></div><br><div style="text-align:center;"><button class="button button-small button-blocked button-energized" ng-click="messageCustomer()"><i class="icon ion-chatboxes"> Chat</i></button> <a class="button button-small button-blocked button-calm" href="sms:'+ customer.get('customerInfo').contactNumber +'""><i class="icon ion-ios-email"> SMS</i></a>   <a class="button button-small button-balanced" href="tel:'+ customer.get('customerInfo').contactNumber +'"><i class="icon ion-ios-telephone"> Call</i></a></div> <br><span ng-if="currentCustomerSelected.attributes.customerInfo.firstName">Name: ' + customer.get('customerInfo').firstName + ' ' + customer.get('customerInfo').lastName +'</span><br>Contact: ' + customer.get('customerInfo').contactNumber +'<br> Schedule: ' + customer.get('schedule') +'<br>Selected Services: <span ng-repeat="service in currentCustomerSelected.attributes.selectedServices track by $index">{{service.name}}{{$last ? "" : ", "}}</span> <br> Total Bill: P' + customer.get('totalBill'),
      title: '<b>Booking Details</b>',
      subTitle: '',
      scope: $scope,
      buttons: [
        { text: 'Close' },
        {
          text: '<b>Decline</b>',
          type: 'button-assertive',
          onTap: function(e) {
            $scope.declineAppointment(customer);
          }
        },
        {
          text: '<b>Complete</b>',
          type: 'button-balanced',
          onTap: function(e) {
            $scope.completeAppointment(customer);
          }
        }
      ]
    });

    bookingPopup.then(function(res) {
      console.log('Tapped!', res);
    });

  };

  $scope.declineAppointment = function(appointment){
    console.log('decline!');
    var confirmPopup = $ionicPopup.confirm({
      title: '<b>Decline Booking</b>',
      template: 'Are you sure you want to <b style="color:red;">DECLINE?</b>'
    });

    confirmPopup.then(function(res) {
      if(res) {
        setAppointment(appointment, 'canceled', 'Declined');
      } else {
        console.log('You are not sure');
      }
    });
  }

  $scope.completeAppointment = function(appointment){
    var confirmPopup = $ionicPopup.confirm({
      title: '<b>Complete Booking</b>',
      template: 'Are you sure you want to set this to <b style="color:green;">COMPLETE?</b>'
    });

    confirmPopup.then(function(res) {
      if(res) {
        setAppointment(appointment, 'completed', 'Completed');
      } else {
        console.log('You are not sure');
      }
    });
  }

  $scope.onViewTitleChanged = function (title) {
    $scope.viewTitle = title;
  };

  $scope.today = function () {
    $scope.calendar.currentDate = new Date();
  };

  $scope.isToday = function () {
    var today = new Date(),
    currentCalendarDate = new Date($scope.calendar.currentDate);

    today.setHours(0, 0, 0, 0);
    currentCalendarDate.setHours(0, 0, 0, 0);
    return today.getTime() === currentCalendarDate.getTime();
  };

  $scope.onTimeSelected = function (selectedTime, events) {
    console.log('Selected time: ' + selectedTime + ', hasEvents: ' + (events !== undefined && events.length !== 0));
  };

  $scope.$on('$ionicView.enter', function(e) {
    if(Parse.User.current()){
      clearAppointments();
      getAppointments();
    }else{
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
    }
  });

  $scope.calendar.eventSource = [];

  function getArtistProfile(customer){
    if(Parse.User.current()){
      artistService.getArtistById(Parse.User.current().get('artistId'))
      .then(function(results) {
        // Handle the result
        createNewThread(results[0], customer);


        return results;
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }
  }

  function createNewThread(artist, customer){
    var Thread = Parse.Object.extend("Thread");
    var thread = new Thread();

    thread.set("lastMessage", '');
    thread.set("messages", []);
    thread.set("artistInfo", {
      "id": artist.id,
      "firstName": artist.get('firstName'),
      "lastName": artist.get('lastName'),
      "avatar": artist.get('avatar')
    });

    thread.set("customerInfo", {
      "id": customer.get('customerInfo').id,
      "firstName": customer.get('customerInfo').firstName,
      "lastName": customer.get('customerInfo').lastName,
      "avatar": customer.get('avatar') || 'img/placeholder.png'
    });

    thread.save(null, {
      success: function(result) {
        // Execute any logic that should take place after the object is saved.
        console.log('last message success');
        $state.go('tab.chat-detail', {customerId: customer.get('customerInfo').id, chatId: result.id});
      },
      error: function(gameScore, error) {
      }
    });
  }

  function getAppointments(){
    console.log('get appointments!');
    acceptedAppointments = [];
    $ionicLoading.show({
      template: 'Loading Schedules...'
    }).then(function(){
      console.log("The loading indicator is now displayed");
    });

    appointmentService.getBookingsById(Parse.User.current().get('artistId'))
    .then(function(results) {
      // Handle the result
      angular.forEach(results, function(appointment) {
        if(appointment.get('status')){
          $scope.appointments[appointment.get('status')].push(appointment);
        }
        if(appointment.get('status') === 'accepted'){
          var customerName;
          if(appointment.get('customerInfo').firstName && appointment.get('customerInfo').lastName){
            customerName = appointment.get('customerInfo').firstName + ' ' + appointment.get('customerInfo').lastName;
          }else{
            customerName = 'Anonymous User';
          }

          acceptedAppointments.push({
            title: customerName,
            startTime: appointment.get('schedule'),
            endTime: appointment.get('schedule'),
            appointment : appointment,
            allDay: false
          });
        }
      });
      $scope.loadEvents();
      $ionicLoading.hide();
    }, function(err) {
      $ionicLoading.hide();
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  function clearAppointments(){
    $scope.appointments = {
      'completed' : [],
      'accepted' : [],
      'pending' : [],
      'canceled' : []
    };
  }

  function setAppointment(appointment, status, type){
    appointment.set("status", status);

    appointment.save(null, {
      success: function(result) {
        clearAppointments();

        var alertPopup = $ionicPopup.alert({
          title: '<b>Booking</b>',
          template: 'Booking Successfully ' + type
        });
        $ionicLoading.hide();

        alertPopup.then(function(res) {
          getAppointments();
        });

      },
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
          title: 'Booking',
          template: 'Booking Error on Complete, Please try again'
        });

        alertPopup.then(function(res) {

        });
      }
    });
  }

  function createRandomEvents() {
    var events = [];
    for (var i = 0; i < 50; i += 1) {
      var date = new Date();
      var eventType = Math.floor(Math.random() * 2);
      var startDay = Math.floor(Math.random() * 90) - 45;
      var endDay = Math.floor(Math.random() * 2) + startDay;
      var startTime;
      var endTime;
      if (eventType === 0) {
        startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
        if (endDay === startDay) {
          endDay += 1;
        }
        endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
        events.push({
          title: 'All Day - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: true
        });
      } else {
        var startMinute = Math.floor(Math.random() * 24 * 60);
        var endMinute = Math.floor(Math.random() * 180) + startMinute;
        startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + startDay, 0, date.getMinutes() + startMinute);
        endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDay, 0, date.getMinutes() + endMinute);
        events.push({
          title: 'Event - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: false
        });
      }
    }
    return events;
  }
});

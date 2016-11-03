// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'ui.rCalendar', 'pubnub.angular.service', 'ion-datetime-picker', 'ionic.rating', 'angularMoment', 'ngCordova', 'ion-google-place'])

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  Parse.initialize("myAppId", "myRestAPIKey");
  Parse.serverURL = 'https://muse-rest-api.herokuapp.com/parse';
})

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider

  // setup an abstract state for the tabs directive

  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'MainCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })

  .state('tab.chat-detail', {
    url: '/chats/:chatId/:customerId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })


  .state('tab.location', {
    url: '/location',
    views: {
      'tab-location': {
        templateUrl: 'templates/tab-location.html',
        controller: 'LocationCtrl'
      }
    }
  })

  .state('tab.services', {
    url: '/services',
    views: {
      'tab-services': {
        templateUrl: 'templates/tab-services.html',
        controller : 'ManagerCtrl'
      }
    }
  })

  .state('tab.portfolio', {
    url: '/manage-portfolio',
    views: {
      'tab-services': {
        templateUrl: 'templates/manage-portfolio.html',
        controller : 'ManagerPortfolioCtrl'
      }
    }
  })

  .state('tab.services-services', {
    url: '/manage-services',
    views: {
      'tab-services': {
        templateUrl: 'templates/manage-services.html',
        controller : 'ManagerServicesCtrl'
      }
    }
  })

  .state('tab.services-services-details', {
    url: '/manage-services/:serviceId',
    views: {
      'tab-services': {
        templateUrl: 'templates/manage-service-detail.html',
        controller: 'ManagerServicesCtrl'
      }
    }
  })

  .state('tab.manage-appointments', {
    url: '/manage-appointments',
    views: {
      'tab-dash': {
        templateUrl: 'templates/manage-appointments.html',
        controller : 'ManagerAppointmentCtrl'
      }
    }
  })

  .state('tab.manage-schedule-calendar', {
    url: '/manage-schedule-calendar',
    views: {
      'tab-dash': {
        templateUrl: 'templates/manage-schedule-calendar.html',
        controller: 'CalendarScheduleCtrl'
      }
    }
  })

  .state('tab.account-login', {
    url: '/login',
    views: {
      'tab-account': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});

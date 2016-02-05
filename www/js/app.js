(function() {

var app = angular.module('PeerPlace', ['ionic', 'mynotes.notestore', 'ngCordova']);

//Define State Providers
app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });

  $stateProvider.state('list', {
    url: '/list',
    templateUrl: 'templates/list.html'
  });

  $stateProvider.state('routeDetails', {
      url: '/routeDetails',
      templateUrl: 'templates/routeDetails.html',
      controller: 'routeDetailsCtrl',
      resolve: {
      todos: function(TodosService) {
        return TodosService.getTodos()
      }
    }

    });

  $stateProvider.state('notDeliveredPage', {
      url: '/notDeliveredPage',
      templateUrl: 'templates/notDeliveredPage.html',
      controller: 'NotDeliveredCtrl'
    });

  $stateProvider.state('Location', {
      url: '/Location/:latitude/:longitude/:address',
      templateUrl: 'templates/Location.html',
      controller: 'LocationCtrl'
    });

  $stateProvider.state('contactCareManager', {
      url: '/contactCareManager',
      templateUrl: 'templates/contactCareManager.html',
      controller: 'contactCareManagerCtrl'
    });

  $stateProvider.state('add', {
    url: '/add',
    templateUrl: 'templates/stopDetails.html',
    controller: 'AddCtrl'
  });

  $stateProvider.state('stopDetails', {
    url: '/stopDetails/:todoId',
    templateUrl: 'templates/stopDetails.html',
    controller: 'stopDetailsCtrl',
    resolve: {
      todo: function($stateParams, TodosService) {
        return TodosService.getTodo($stateParams.todoId)
      }
    }
  });

  $urlRouterProvider.otherwise('/login');
});

//Define Controllers 
app.controller('LoginCtrl', function($scope, $state, $ionicHistory) {

  $scope.credentials = {
    username: '',
    password:''
  };

  $scope.login = function () {
      //$ionicHistory.nextViewOptions({historyRoot: true});
      $ionicHistory.nextViewOptions({ disableBack: true});
      $state.go('list');
  };

});

app.controller('ListCtrl', function($scope, $state, NoteStore, $ionicHistory) {

  $scope.reordering = false;
  $scope.routes = [
      {
        id:1,
        title:'Route 1',
        address: "234 N Allen St, NY, NY 11002"
      },
      {
        id:2,
        title:'Route 2',
        address: "307 Summit Ave, Jersey City, NJ 07306"
      },
      {
        id:3,
        title:'Route 3',
        address: "822 SW Jennings Ave, Bartlesville, OK 74003 "
      }
  ];
  // $scope.notes = NoteStore.list();

  // $scope.remove = function(noteId) {
  //   NoteStore.remove(noteId);
  // };

  // $scope.move = function(note, fromIndex, toIndex) {
  //   NoteStore.move(note, fromIndex, toIndex);
  // };

  // $scope.toggleReordering = function() {
  //   $scope.reordering = !$scope.reordering;
  // };

  $scope.logout = function() {
     
     $ionicHistory.nextViewOptions({historyRoot: true});
     $state.go('login');

  }

});

app.controller('routeDetailsCtrl', function($scope, $state, NoteStore, todos) {

  $scope.note = angular.copy(NoteStore.get($state.params.noteId));
  $scope.todos = todos

});


app.controller('AddCtrl', function($scope, $state, NoteStore) {

  $scope.note = {
    id: new Date().getTime().toString(),
    title: '',
    description: ''
  };

  $scope.save = function() {
    NoteStore.create($scope.note);
    $state.go('list');
  };
});

app.controller('stopDetailsCtrl', function($scope, $state, NoteStore, todo, $ionicActionSheet, $cordovaLaunchNavigator, $cordovaGeolocation) {

  $scope.todo = todo

  //Get Current User location
  var posOptions = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function(position) {
        $scope.coords = position.coords;
      }, function(err) {
        console.log('getCurrentPosition error: ' + angular.toJson(err));
      });

   $scope.launchNavigator = function() {
        var destination = todo.address1;
        var start = [$scope.coords.latitude, $scope.coords.longitude];

        launchnavigator.navigate(
        destination,
        null, //This if set to null, defaults to user's current location as start location
        function(){
          //alert("Plugin success");
        },
        function(error){
          alert("Plugin error: "+ error);
        },
        {
          preferGoogleMaps: true,
          //transportMode: "transit",
          enableDebug: true,
          disableAutoGeolocation: true
      });
    };

   
   $scope.moveToNotDeliveredPage = function () {
      //$ionicHistory.nextViewOptions({historyRoot: true});
      //$ionicHistory.nextViewOptions({ disableBack: true});
      $state.go('notDeliveredPage');
  };
  
   $scope.moveToMaps = function () {
      //$ionicHistory.nextViewOptions({historyRoot: true});
      //$ionicHistory.nextViewOptions({ disableBack: true});
     // $state.go('Location');
       $state.go('Location', {latitude: todo.latitude, longitude:todo.longitude, address:todo.address1});
  };

   $scope.showActionsheet = function() {
        
        $ionicActionSheet.show({
          titleText: 'Other options',
          buttons: [
            { text: '<i class="icon ion-navigate"></i> Turn-by-Turn'},
            { text: '<i class="icon ion-map"></i> View in Map'},
            { text: '<i class="icon ion-edit"></i> Alert'},
          ],
          cancelText: 'Cancel',
          cancel: function() {
            console.log('CANCELLED');
          },
          buttonClicked: function(index) {
            console.log('BUTTON CLICKED', index);
            if(index === 0){
              $scope.launchNavigator();
            }
            else if(index === 1){
              $scope.moveToMaps();
            }
            else if(index === 2){
              $state.go('contactCareManager');
            }
            return true;
          },
          destructiveButtonClicked: function() {
            console.log('DESTRUCT');
            return true;
          }
        });
      };
});

app.service('TodosService', function($q) {
  
var globalObject;
  return {
    todos: [
      {
        id:'Stop Number: 1',
        CustomerName:'Name: Chris Smith',
        address: "Address: 24 Madison Avenue Extension, Albany, NY 12203",
        address1: "24 Madison Avenue Extension, Albany, NY 12203",
        UnitsOrdered: 'UnitsOrdered: 2 Hot, 1 Frozen',
        latitude: 42.715376,
        longitude: -73.87824499999999
      },
      {
        id:'Stop Number: 2',
        CustomerName:'Name: Jonathan Gregory',
        address: "Address: 307 Summit Ave, Jersey City, NJ 07306",
        address1: "307 Summit Ave, Jersey City, NJ 07306",
        UnitsOrdered: 'UnitsOrdered: 1 Hot, 1 Frozen',
        latitude: 40.726061,
        longitude: -74.064437
      },
      {
        id:'Stop Number: 3',
        CustomerName:'Name: Mike Donaldson',
        address: "Address: 822 SW Jennings Ave, Bartlesville, OK 74003",
        address1: "822 SW Jennings Ave, Bartlesville, OK 74003",
        UnitsOrdered: 'UnitsOrdered: 2 Hot, 2 Frozen',
        latitude: 36.745011,
        longitude: -95.98104599999999
      }
    ],
    getTodos: function() {
      return this.todos
    },
    getGlobalData: function() {
      return globalObject
    },
    getTodo: function(todoId) {
      var dfd = $q.defer()
      globalObject = todoId;
      this.todos.forEach(function(todo) {
        if (todo.id === todoId) dfd.resolve(todo)
      })
      
      return dfd.promise
    }

  }
})

app.controller('NotDeliveredCtrl', function($scope, $state) {

   $scope.moveToAlertPage = function () {
      //$ionicHistory.nextViewOptions({historyRoot: true});
      //$ionicHistory.nextViewOptions({ disableBack: true});
      $state.go('contactCareManager');
  };

   $scope.moveToMaps = function () {
      //$ionicHistory.nextViewOptions({historyRoot: true});
      //$ionicHistory.nextViewOptions({ disableBack: true});
      $state.go('Location');
  };

});

app.controller('contactCareManagerCtrl', function($scope, $state) {

});

app.controller('LocationCtrl', function($scope, $cordovaGeolocation, $ionicPlatform, $stateParams, $compile) {

  $scope.latitude = $stateParams.latitude;
  $scope.longitude = $stateParams.longitude;
   $scope.address = $stateParams.address;

  console.log($scope.longitude);

   $scope.showDirectionsInMap =function() {
          var directionsService = new google.maps.DirectionsService;
          var directionsDisplay = new google.maps.DirectionsRenderer;
          var map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 7,
            center: {lat: $scope.coords.latitude, lng: $scope.coords.longitude}
          });
          directionsDisplay.setMap(map);

          calculateAndDisplayRoute(directionsService, directionsDisplay);
    }

    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
          directionsService.route({
            origin: {lat: $scope.coords.latitude, lng: $scope.coords.longitude},
            destination: $stateParams.address,
            travelMode: google.maps.TravelMode.DRIVING
          }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
          }); 
    }

    $scope.showWaypointsInMap = function(){
          var directionsService = new google.maps.DirectionsService;
          var directionsDisplay = new google.maps.DirectionsRenderer;
          var map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 6,
            center: '653 New Jersey Ave, Lyndhurst, NJ 07071'
          });
          directionsDisplay.setMap(map);

          calculateAndDisplayRoute1(directionsService, directionsDisplay);
    }
    
    
function calculateAndDisplayRoute1(directionsService, directionsDisplay) {
  var waypts = [];
  // var checkboxArray = document.getElementById('waypoints');
  // for (var i = 0; i < checkboxArray.length; i++) {
  //   if (checkboxArray.options[i].selected) {
      waypts.push({
        location: '307 Summit Ave, Jersey city, NJ 07306',
        stopover: true
      });

      waypts.push({
        location: '675 New County Rd, Secaucus, NJ 07094',
        stopover: true
      });
   // }
  //}

  directionsService.route({
    origin: '653 New Jersey Ave, Lyndhurst, NJ 07071', 
    destination: '99 John Street #2411, New York, NY 10038',
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var summaryPanel = document.getElementById('directions-panel');
      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
            '</b><br>';
        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

  function showMap(coords) {
    // var locations =[];
    // locations.push($stateParams);

    var locations = [
     ['Title A', 3.180967,101.715546, 1],
    ];

   var map = new google.maps.Map(document.getElementById('map-canvas'), {
     zoom: 18,
     center: new google.maps.LatLng($scope.latitude ,$scope.longitude),
     mapTypeId: google.maps.MapTypeId.ROADMAP
});
    var marker, i;
   for (i = 0; i < locations.length; i++) {  
    marker = new google.maps.Marker({
         position: new google.maps.LatLng($scope.latitude, $scope.longitude),
         map: map
    });

      var contentString = "<div><a>{{address}}</a></div>";
      //var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

    var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
         return function() {
            // infowindow.setContent(locations[i][0]);
             infowindow.open(map, marker);
         }
    })(marker, i));
}
  }

  $ionicPlatform.ready(function() {
    var posOptions = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(posOptions)
      .then(function(position) {
        $scope.coords = position.coords;
        //showMap(position.coords);
        $scope.showDirectionsInMap();
      }, function(err) {
        console.log('getCurrentPosition error: ' + angular.toJson(err));
      });
  });

});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

}());
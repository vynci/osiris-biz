

app.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/portfolio/a.jpg'
  },{
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'Hi! I would just like to inquire',
    face: 'img/portfolio/b.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Thanks!',
    face: 'img/portfolio/c.jpg'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'Awesome! See you soon!',
    face: 'img/portfolio/d.jpg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

randomScore = function () {
  return Math.floor(Random.fraction()*10)*5;
}

if (Meteor.isClient) {
  Session.set("orderByScore", true);

  Template.leaderboard.players = function () {
    if (Session.get("orderByScore")) {
      sortOrder = {score: -1, name: 1};
    } else {
      sortOrder = {name: 1, score:-1};
    }

    if (Meteor.userId()) {
      return Players.find({}, {sort: sortOrder});
    } else {
      return Players.find({}, {sort: {name: 1}, fields: {score: 0}});
    }
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click input.changeOrder': function () {
      Session.set("orderByScore", !Session.get("orderByScore"));
    },
    'click input.resetScore': function () {
      players = Players.find().fetch()
      for (var i = 0; i < players.length; i++) {
        Players.update({_id: players[i]._id}, {$set: {score: randomScore()}});
      }
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: randomScore() });
    }
  });


}

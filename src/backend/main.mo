import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  type Profile = {
    username : Text;
    devilFruit : Text;
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Text.compare(p1.username, p2.username);
    };
  };

  type Score = {
    highScore : Int;
    highestLevel : Int;
  };

  type PlayerData = {
    profile : Profile;
    score : Score;
  };

  type PlayerInput = {
    username : Text;
    devilFruit : Text;
    highScore : Int;
    highestLevel : Int;
  };

  module PlayerData {
    public func compare(p1 : PlayerData, p2 : PlayerData) : Order.Order {
      Int.compare(p2.score.highScore, p1.score.highScore);
    };
  };

  let playerDataMap = Map.empty<Principal, PlayerData>();

  public shared ({ caller }) func setPlayerData(input : PlayerInput) : async () {
    let newData = {
      profile = {
        username = input.username;
        devilFruit = input.devilFruit;
      };
      score = {
        highScore = input.highScore;
        highestLevel = input.highestLevel;
      };
    };
    playerDataMap.add(caller, newData);
  };

  public query ({ caller }) func getPlayerData() : async PlayerData {
    switch (playerDataMap.get(caller)) {
      case (null) { Runtime.trap("Player not found") };
      case (?player) { player };
    };
  };

  public query ({ caller }) func getLeaderboard() : async [PlayerData] {
    playerDataMap.values().toArray().sort();
  };
};

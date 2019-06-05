const numDecks = 6;
var turn = "player";
var play = "player";
$(document).ready(function() {
  var hasDeck = localStorage.getItem("deckId");
  console.log(hasDeck);
  if (hasDeck != null) {
    getDeck(hasDeck);
  } else {
    getNewDeck(numDecks);
  }

  $(document).on("getDeckEvent", function(response) {
    dealer.deckId = response.message.deck_id;
    dealer.deck = response.message;
    if (response.message.remaining < 25) {
      getNewDeck(numDecks);

      return;
    }

    deal();
  });
  $(document).on("getNewDeckEvent", function(response) {
    dealer.deckId = response.message.deck_id;
    dealer.deck = response.message;
    localStorage.setItem("deckId", dealer.deckId);
    dealer.shuffle();
  });
  $(document).on("shuffleDeckEvent", function(response) {
    dealer.deck = response.message;
    dealer.deckId = response.message.deck_id;
    deal();
  });
  $(document).on("playerDrawCardEvent", function(response) {
    player1.cards.push(response.message.cards[0]);
    player1.displaycard();
    turn = "dealer";
    deal();
  });
  $(document).on("dealerDrawCardEvent", function(response) {
    dealer.cards.push(response.message.cards[0]);
    dealer.displaycard();
    turn = "player";
    deal();
  });
  $(document).on("addedToPileEvent", function(response) {
    dealer.pile = response.message.piles;
  });
  $("#play-button").click(function(event) {
    playGame();
  });
});

var player1 = {
  cards: [],
  position: 0,
  nextCardFacing: "up",
  draw: function(_dealer) {
    this.position++;
    if (this.cards.length === 3) {
      this.nextCardFacing = "down";
    }
    drawCard(_dealer.deckId, 1, playerDrawCardEvent);
  },
  displaycard: function() {
    showCard(this.cards[this.position - 1], "player");
  }
};
var dealer = {
  deckId: "",
  shuffled: false,
  nextCardFacing: "down",
  position: 0,
  draw: function() {
    this.position++;
    if (this.cards.length === 1) {
      this.nextCardFacing = "up";
    }
    drawCard(this.deckId, 1, dealerDrawCardEvent);
  },
  shuffle: function() {
    shuffleDeck(this.deckId);
  },
  displaycard: function() {
    showCard(this.cards[this.position - 1], "dealer");
  },
  cards: [],
  deck: {},
  pile: {}
};

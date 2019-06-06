const numDecks = 6
var deck = new Deck()
var turn = "player"
var play = "player"
var player1 = new Player("player")
var player1Bank = new Bank(5000.0)
var dealer = new Player("dealer")
var dealerBank = new Bank(100000000.0)
var pot = new Pot(10, player1Bank, dealerBank)
var dealerPlaying = false
console.log(player1Bank)
console.log(dealerBank)
console.log(pot)
var setGetNewDeckFlag = false
var playing = false
var bettingRound = 0
var playTimer = null
var isDealerFirst = true
$(document).ready(function() {
  showOpen();
  
});
function showOpen(){
  var t = function(){$("#game-name").fadeIn(1000)}

 
  setTimeout(t, 400)

setTimeout(beginGame, 2000)
}
function beginGame() {
  clearCards();
  player1.resetPlayer();
  dealer.resetPlayer();
  var hasDeck = localStorage.getItem("deckId");

  if (hasDeck != null) {
    deck.getDeck(hasDeck);
  } else {
    deck.getNewDeck(numDecks);
  }
}
$("#play-button").click(function(event) {
  playGame();
});
$(document).on("getDeckEvent", function(response) {
  if (response.message.data.success && response.message.data.remaining > 24) {
    deck.remaining = response.message.data.remaining;
    deck.deckId = response.message.data.deck_id;
    $("#player-messages").empty();
    deal();
  } else {
    deck.getNewDeck(numDecks);
    return;
  }
});
$(document).on("getNewDeckEvent", function(response) {
  if (response.message.data.success) {
    deck.deckId = response.message.data.deck_id;
    deck.remaining = response.message.other.remaining;
    localStorage.setItem("deckId", deck.deckId);
    $("#player-messages").empty();
    deck.shuffleDeck();
  } else {
    deck.getNewDeck(numDecks);
  }
});
$(document).on("shuffleDeckEvent", function(response) {
  if (response.message.data.success) {
    deck.shuffled = true;
    // if (bettingRound === 0) {
    //   bettingRound++;
    //   doBet();
    // }
    $("#player-messages").empty();
    deal();
  } else {
    deck.shuffleDeck();
  }
});
$("#betRange").change(function(event) {
  var rt = $("#rangtext");
  var rval = $(event.target).val();
  $(rt).val(rval);
});
$("#placeBet").click(function(event) {
  $("#betModal").modal("hide");
});
$(document).on("drawCardEvent", function(response) {
  deck.remaining = response.message.data.remaining;
  if (setGetNewDeckFlag) {
    setGetNewDeckFlag = false;
    deck.getNewDeck(numDecks, response.message.other);
    return;
  }
  if (response.message.other === "dealer") {
    dealer.cards.push(response.message.data.cards[0]);
    dealer.displaycard();
    turn = "player";
    deal();
    return;
  }
  if (response.message.other === "player") {
    switch (player1.playType) {
      case "hit":
        player1.playType = "";
        player1.cards.push(response.message.data.cards[0]);
        player1.displaycard();
        return;
      case "split":
        player1.playType = "splitTop";
        player1.splitTop.push(player1.cards[0]);
        player1.splitTop.push(response.message.data.cards[0]);
        player1.displaycard("splitTop");
        player1.splitBottom.push(player1.cards[1]);
        return;
      case "splitTop":
        player1.playType = "splitTop";
        player1.splitTop.push(response.message.data.cards[0]);
        player1.displaycard("splitTop");
        return;
      case "splitBottom":
        player1.playType = "splitBottom";
        player1.splitBottom.push(response.message.data.cards[0]);
        player1.displaycard("splitBottom");
        return;
      default:
        player1.playType = "";
        player1.cards.push(response.message.data.cards[0]);
        player1.displaycard();
        turn = "dealer";
        deal();
        return;
    }
  }
});
/** Gameplay & Display Functions **/
function doBet() {
  var brang = $("#betRange");
  $(brang)
    .attr("min", 10)
    .attr("max", 500 > player1Bank.balance ? player1Bank.balance : 500.0)
    .val(10);
  $("#betModal").modal("show");
  $("#betModal").on("hidden.bs.modal", function(e) {
    console.log(e);
    var amount = $(brang).val();
    pot.add(amount, player1Bank);
  });
}
function deal() {
  setGetNewDeckFlag = false;
  if (player1.cards.length === 2 && dealer.cards.length === 2) {
    $("#player-buttons").fadeIn(200);
    //$('#player-buttons').append(button)

    playGame();

    return;
  }
  if (turn === "player") {
    if (deck.remaining >= 25) {
      player1.draw(deck, "player");
    } else {
      setGetNewDeckFlag = true;
      player1.draw(deck, "player");
    }
    return;
  }
  if (turn === "dealer") {
    if (deck.remaining >= 25) {
      dealer.draw(deck, "dealer");
    } else {
      setGetNewDeckFlag = true;
      dealer.draw(deck, "dealer");
    }
    return;
  }
}
function playGame() {
  //     NATURALS
  //     If a player's first two cards are an ace and a "ten-card" (a picture card or 10), giving him a count of 21 in two
  //     cards, this is a natural or "blackjack."

  player1.hasBlackJack = false;
  player1.hasBlackJack = (player1.calPoints(1,player1.cards) || player1.calPoints(11,player1.cards))==21 ? true : false
  
  if (player1.hasBlackJack) {
    //CHECK TO SEE IF Dealer has a face card, is 10 or is ace. if not then player auto wis
    //if so dealer must now play to see if he has 21
    if (
      dealer.cards[0].value === "10" ||
      dealer.cards[0].value === "ACE" ||
      countFace(dealer.cards[0])
    ) {
      var card = getFaceDownCard();
      flipcard(card);
      if ((dealer.calPoints(1,dealer.cards) || dealer.calPoints(11,dealer.cards))==21 ? true : false) {
        doTie();
        return;
      }
    }
    doWin();
    return;
  } else {
    whatNext(player1);
  }
}
function whatNext(_player) {
  $("#player-buttons").empty();
  if (_player.canHit()) {
    var hitBtn = createButton("hit", "Hit", _player);
    $("#player-buttons")
      .append(hitBtn)
      .fadeIn(200);
  }

  if (_player.canSplit()) {
    var splitBtn = createButton("split", "Split", _player);
    $("#player-buttons")
      .append(splitBtn)
      .fadeIn(200);
  }

  var stayBtn = createButton("stay", "Stay", _player);
  $("#player-buttons")
    .append(stayBtn)
    .fadeIn(200);

  if (_player.canBet()) {
    var betBtn = createButton("bet", "Bet", _player);
    $("#player-buttons")
      .append(betBtn)
      .fadeIn(200);
  }

  printMessage("What Next?", true);
}
function showCard(card, who) {
  if (who.cards.length > 2 || who.cards.length === 1) {
    displayCard(card, who, "up");
    return;
  }
  if (who.type === "player") {
    displayCard(card, who, "up");
    return;
  }
  if (who.type === "dealer") {
    displayCard(card, who, "down");
    return;
  }
}
function dealersTurn(_dealer) {
 
  $("#player-buttons").empty();
  dealerPlaying = true;
  if (isDealerFirst) {
    isDealerFirst = false;
    var card = getFaceDownCard();
    flipcard(card);
  }
  var scoresofar = 0;
  var scoresofar11 = _dealer.calPoints(11, _dealer.cards);
  var scoresofar1 = _dealer.calPoints(1, _dealer.cards);
  if (scoresofar11 > 21) {
    scoresofar = scoresofar1;
  } else {
    scoresofar = scoresofar11;
  }
  displayScore(_dealer)
  if (scoresofar === 21) {
    dealerPlaying = false;
    $("#dealer-bj").fadeIn(400);

    setTimeout(dealerWins, 2000);
    return;
  }
  if (scoresofar > 21) {
    dealerPlaying = false;
    setTimeout(dealerBust, 2000);
    return;
  }
  if (scoresofar <= 16) {
    printMessage("Dealer Taking Next Card", true);
    playTimer = setTimeout(hitDealer, 2000);
    return;
  }

  if (scoresofar >= 17) {
    dealerPlaying = false;
    var whoWinsthis = function() {
      WhoWins(scoresofar, player1);
    };
    setTimeout(whoWinsthis, 2000);
  }
}
function WhoWins(dealerScore, _player) {
  var playerScore = _player.calPoints(11, _player);
  if (playerScore > 21) {
    playerScore = _player.calPoints(1, _player);
  }
  displayScore(dealer)
  displayScore(_player)
  if (playerScore > 21) {
    printMessage("You Busted!!", true);

    setTimeout(beginGame, 5000);
    return;
  }
  if (playerScore === dealerScore) {
    printMessage("It's a tie!", true);

    setTimeout(beginGame, 5000);
    return;
  }
  if (playerScore > dealerScore) {
    printMessage("You Win!!!", true);

    setTimeout(beginGame, 5000);
    return;
  }
  if (playerScore < dealerScore) {
    printMessage("Dealer Wins!!!", true);

    setTimeout(beginGame, 5000);
    return;
  }
}
function hitDealer() {
  clearTimeout(playTimer);
  deck.drawCard(1, dealer);
}
function dealerBust() {
  console.log("Dealer Bust, You win");
  printMessage("Dealer Bust, You win", true);

  setTimeout(beginGame, 5000);
}
function getFaceDownCard() {
  return $('#dealer-cards div[data-side="back"]')[0];
}
function displayCard(card, who, facing) {
  console.log(card);
  var div = $("<div>");
  //width: 161px;
  //height: 223 px;
  ///background-size: contain;
  $(div)
    .addClass("panel")
    .addClass("m-2");
  if (facing === "up") {
    $(div)
      .attr("data-side", "front")
      .attr("data-suit", card.suit)
      .attr("data-value", card.value)
      .attr("data-cardback", "/images/cardback.png")
      .attr("data-cardfront", card.image);
    $(div)
      .css("background-image", "url(" + card.image + ")")
      .css("min-width", "160px")
      .css("min-height", "223px")
      .css("background-size", "contain")
      .fadeIn(500);
  }
  if (facing === "down") {
    $(div)
      .attr("data-side", "back")
      .attr("data-suit", card.suit)
      .attr("data-value", card.value)
      .attr("data-cardback", "/images/cardback.png")
      .attr("data-cardfront", card.image);
    $(div)
      .css("background-image", 'url("/images/cardback.png")')
      .css("min-width", "160px")
      .css("min-height", "223px")
      .css("background-size", "contain")
      .fadeIn(500);
  }
  if (who.type === "player") {
    $(div).click(function(event) {
      var thecard = event.target;
      var side = $(thecard).attr("data-side");

      if (side === "back") {
        $(thecard).attr("data-side", "front");
        var imagefront = $(thecard).attr("data-cardfront");
        $(thecard)
          .css("background-image", `url(${imagefront})`)
          .fadeIn(500);
      } else {
        $(thecard).attr("data-side", "back");
        var imageback = $(thecard).attr("data-cardback");
        $(thecard)
          .css("background-image", `url(${imageback})`)
          .fadeIn(500);
      }
    });
  }

  if (who.isSplit) {
    if (who.splittingTop) {
      $("#" + who.type + "-cards-split-top")
        .append(div)
        .fadeIn(600);
    }
    if (who.splittingBottom) {
      $("#" + who.type + "-cards-split-bottom")
        .append(div)
        .fadeIn(500);
    }
  } else {
    $("#" + who.type + "-cards")
      .append(div)
      .fadeIn(500);
  }
  if (who.type === "player") {
    var s = displayScore(who);
    var isBust = s > 21 ? true : false;
    who.isBust = isBust;
    if (who.isBust) {
      doBust(who);
    }
  }
}
function flipcard(card) {
  var c = card;
  var img = $(c).attr("data-cardfront");
  $(c).attr("data-side", "front");
  $(c)
    .css("background-image", `url(${img})`)
    .fadeIn();
  displayScore(dealer);
}
function doWin() {
  $("#player-bj").fadeIn(400);
  printMessage("You Got Black Jack!");
  bettingRound = 0;
  setTimeout(function() {
    beginGame();
  }, 5000);
}
function clearCards() {
  $("#player-cards").fadeOut(500);
  $("#dealer-cards").fadeOut(500);
  $("#player-cards-split-top").fadeOut(500);
  $("#player-cards-split-bottom").fadeOut(500);
  $("#player-messages").empty();
  $("#player-buttons").empty();
  $("#player-points").text(0);
  $("#dealer-points").text(0);
  $("#dealer-bj").fadeOut(400);
  $("#player-bj").fadeOut(400);
  player1.resetPlayer();
  dealer.resetPlayer();
  $("#player-cards").empty();
  $("#dealer-cards").empty();
}
function doTie() {
  printMessage("Tie Game!");
  bettingRound = 0;

  setTimeout(function() {
    beginGame();
  }, 5000);
}
function doBust(who) {
  var buster = "";
  if (who.type === "player") {
    buster = "You ";
    // pot.pay(pot.total, dealerBank)
  } else if (who.type === "dealer") {
    buster = "Dealer ";
    // pot.pay(pot.total, player1Bank)
    // printMessage("You won $" + pot.total , false)
  }
  printMessage(buster + "busted!", true);
  // bettingRound = 0
  setTimeout(function() {
    beginGame();
  }, 5000);
}
function printMessage(message, clear = true) {
  var messageArea = $("#player-messages");
  var alert = createAlert(message);
  if (clear) {
    messageArea.empty();
  }
  messageArea.append(alert).fadeIn(500);
}
function createAlert(message) {
  var div = $("<div>");
  $(div)
    .addClass("alert")
    .addClass("alert-warning")
    .addClass("fade")
    .addClass("show")
    .addClass("col-12")
    .attr("role", "alert");
  var mess = $("<strong>");
  $(mess).text(message);
  $(div).append(mess);
  $(div).alert();

  return $(div);
}
function createButton(btnName, btnTitle, player) {
  var btn = $("<button>");
  $(btn).attr("id", btnName + "-" + player.type);
  $(btn)
    .attr("data-player", player.type)
    .addClass("mr-3")
    .addClass("ml-3")
    .addClass("btn btn-info");
  $(btn)
    .text(btnTitle)
    .click(function(event) {
      player.getEventCallBack(event);
    });
  return $(btn);
}
function checkNatural(player) {
  var aceCount = countAces(player.cards);
  var faceCount = countFace(player.cards);
  var tenCount = countTens(player.cards);
  var faceTens = faceCount + tenCount;

  if (faceTens === 1 && aceCount === 1) {
    return true;
  }

  return false;
}
function checkBlackJack(player) {
  var tempcards = player.cards;
  var aceCount = countAces(tempcards);
  var faceCount = countFace(tempcards);
  var tenCount = countTens(tempcards);
  var faceTens = faceCount + tenCount;

  if (faceTens === 1 && aceCount === 1) {
    return true;
  }

  return false;
}
function countAces(cards = []) {
  var count = 0;
  cards.forEach(function(card) {
    if (card.value === "ACE") {
      count++;
    }
  });

  return count;
}
function scoreCard(value) {
  var num = parseInt(value);
  if (isNaN(num)) {
    switch (value) {
      case "JACK":
      case "QUEEN":
      case "KING":
        return 10;
      default:
        return 0;
    }
  } else {
    return num;
  }
}
function countFace(cards = []) {
  var count = 0;
  if (typeof cards === "object") {
    if (
      cards.value === "KING" ||
      cards.value === "QUEEN" ||
      cards.value === "JACK"
    ) {
      count++;
    }
  } else if (Array().isArray(cards)) {
    cards.forEach(function(card) {
      if (
        card.value === "KING" ||
        card.value === "QUEEN" ||
        card.value === "JACK"
      ) {
        count++;
      }
    });
  }
  return count;
}
function countTens(cards = []) {
  var count = 0;
  cards.forEach(function(card) {
    if (card.value === "10") {
      count++;
    }
  });

  return count;
}
function startFresh() {
  localStorage.clear();
  clearCards();
  deck.getNewDeck(numDecks);
}
function updateBets() {
  $("#bets").text("0.00");
  if (pot !== undefined) {
    $("#bets").text(pot.toString());
  }
}
function updateMoney() {
  $("#player-money").text("0.00");
  if (player1Bank !== undefined) {
    $("#player-money").text(player1Bank.toString());
  }
}
function displayScore(player) {
  var pp = 0;
  player.scoreAll();
  if (player.score1 > 21 && player.score2 < 22) {
    pp = player.score2;
  } else {
    pp = player.score1;
  }

  $("#" + player.type + "-points")
    .text(pp)
    .fadeIn();
  return pp;
}
/** Event Handlers */
function dealCardEvent(data, args = {}) {
  $.event.trigger({
    type: "dealCardEvent",
    message: { data: data, other: args }
  });
}
/** PLAYER Constuctor & Methods **/
/** @constructor **/
/** @param {string} type **/
function Pot(amount, playerBank, dealerBank) {
  console.log(amount, playerBank, dealerBank);
  this.total = 0;
  this.bets = [];
  this.add = function(amount, fromBank) {
    var a = fromBank.widthdrawl(amount);
    this.bets.push({
      amount: a,
      round: bettingRound
    });

    this.total += a;
    updateBets();
  };
  this.add(amount, playerBank);
  this.add(amount, dealerBank);
  this.Pay = function(amount, tobank) {
    if (this.total - amount >= 0) {
      this.total -= amount;
      tobank.deposit(amount);
    }
    updateBets();
  };
  this.toString = function() {
    var st = String(parseFloat(this.total)).split(".");
    var dollars = st[0];
    var cents = "00";
    if (st.length > 1) {
      cents = st[1];
      if (cents.length == 1) {
        cents += "0";
      }
    }
    var moneyLength = dollars.length;
    var digits = dollars.split("");
    var holder = "";
    for (let i = 0; i < digits.length; i++) {
      var d = (digits.length - i) % 3;
      if (!d) {
        holder += ",";
      }
      holder += digits[i];
    }
    var newdigits = holder.split("");
    newdigits = newdigits.join("");

    return "$ " + newdigits + "." + cents;
  };
}
/** Bank Construtor & Methods **/
/** @constructor **/
/** @param {string} initDeposit **/
function Bank(initDeposit) {
  this.balance = 0;
  this.deposit = function(amount) {
    this.balance += amount;
    updateMoney();
  };
  this.deposit(initDeposit);
  this.widthdrawl = function(amount) {
    if (this.balance >= amount) {
      this.balance -= amount;
      updateMoney();
      return amount;
    }

    return 0;
  };
  this.isBankrupt = function() {
    return this.balance <= 0;
  };
  this.toString = function() {
    var st = String(parseFloat(this.balance)).split(".");
    var dollars = st[0];
    var cents = "00";
    if (st.length > 1) {
      cents = st[1];
      if (cents.length == 1) {
        cents += "0";
      }
    }
    var moneyLength = dollars.length;
    var digits = dollars.split("");
    var holder = "";
    for (let i = 0; i < digits.length; i++) {
      var d = (digits.length - i) % 3;
      if (!d) {
        holder += ",";
      }
      holder += digits[i];
    }
    var newdigits = holder.split("");
    newdigits = newdigits.join("");

    return "$ " + newdigits + "." + cents;
  };
}
function dealerPlay(_dealer, _player) {
  var is21 = checkBlackJack(_dealer.cards);
  if (!is21) {
    var score1 = _dealer.calPoints(1, _dealer.cards);
  } else {
    dealerWins();
  }
}
function dealerWins() {
  console.log("Dealer Wins");
  printMessage("Dealer Wins!!!", true);
  setTimeout(beginGame, 5000);
}
$(document).on("drawHitCardEvent", function(response) {
  deck.remaining = response.message.data.remaining;
  if (response.message.other === "dealer") {
    dealer.cards.push(response.message.data.cards[0]);
    dealer.displaycard();
    dealersTurn(dealer);
  }
  return;
});

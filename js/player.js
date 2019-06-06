/** PLAYER Constuctor & Methods **/
/** @constructor **/
/** @param {string} type **/
function Player(type) {
    this.cards = []
    this.position = 0,
    this.nextCardFacing = 'up'
    this.type = type
    this.isSplit = false
    this.isBust = false
    this.playType = ''
    this.splitTop = []
    this.splitBottom = []
    this.splittingTop = false
    this.splittingBottom = false
    this.topScore1 = 0
    this.bottomScore1 = 0
    this.topScore2 = 0
    this.bottomScore2 = 0
    this.score1 = 0
    this.score2 = 0
    

this.getEventCallBack = function(event){
    var id = event.target.id.split('-')[0]
    switch (id) {
        case "hit":
            this.hit(event)
            break
        case "stay":
            this.stay(event)
            break
        case "split":
            this.split(event)
            break
        case "bet":
            this.bet(event)
            break
        case "double":
            this.doubleDown(event)
            break
        default:
            break
    }

}
this.draw = function (_deck = deck, playType = '') {
    this.position++
    this.playType = playType
    if (this.cards.length === 1 && this.type === 'dealer') {
        this.nextCardFacing = 'down'
    }
    _deck.draw(this)
}
this.drawCardEvent = function (data, type) {
    $.event.trigger({
        type: "drawCardEvent",
        message: {
            data: data,
            other: type
        }
    });
}
this.drawHitCardEvent = function (data, type) {
    $.event.trigger({
        type: "drawHitCardEvent",
        message: {
            data: data,
            other: type
        }
    });
}
this.displaycard = function (card = null) {
    if (card === null) {
        showCard(this.cards[this.cards.length - 1], this)
    } else {
        showCard(card, this)
    }

}
this.calPoints = function (aceWorth, cards = this.cards) {
    var points = 0
    if (cards.length > 0) {
        cards.forEach(function (card) {
            var v = card.value
            if (v === 'ACE') {
                points += aceWorth
            } else {
                points += scoreCard(v)
            }
        })
    }
    return points
}
this.hit = function (hitEvent) {
    console.log(hitEvent)
    $('#player-messages').empty()
    this.draw(deck, 'hit')
   
}
this.stay = function (stayEvent) {
    turn = 'dealer'
    $('#player-messages').empty()
    printMessage("You Stay!", false)
      player1.hasBlackJack = false
      player1.hasBlackJack = (player1.calPoints(1,player1.cards) || player1.calPoints(11,player1.cards))==21 ? true : false
    if (player1.hasBlackJack) {

        //CHECK TO SEE IF Dealer has a face card, is 10 or is ace. if not then player auto wis
        //if so dealer must now play to see if he has 21
        if (dealer.cards[0].value === "10" || dealer.cards[0].value === "ACE" || countFace(dealer.cards[0])) {
            var card = getFaceDownCard()
            flipcard(card)
            if (checkNatural(dealer)) {
                doTie()
                return
            }
        }
        doWin()
        return
    } else {
        var card = getFaceDownCard()
        flipcard(card)
        dealersTurn(dealer)
    }
   
}
this.doubleDown = function (doubleDownEvent) {
    console.log(doubleDownEvent)
    $('#player-messages').empty()
    printMessage("You Doubled Down!", false)
}
this.bet = function (betEvent) {
    console.log(betEvent)
    $('#player-messages').empty()
    doBet()
    printMessage("You Bet!", false)
}
this.split = function (SplitEvent) {
    this.isSplit = true
    console.log(SplitEvent)
    $('#player-messages').empty()
    printMessage("You Split!", false)
}
this.canSplit = function () {
    if (!this.isSplit) {
        if (this.cards.length === 2) {
            return this.cards[0].value === this.cards[1].value
        }
    }

    return false

}
this.canBet = function () {
    if (bettingRound === 0 ) {
            return true
        }
        return false
}
this.canHit = function (stack = '') {
    this.scoreAll()
    if (this.isSplit) {
        if (stack === 'top') {
            if (this.topScore1 >= 21 || this.topScore2 >= 21) {
                return false
            }
            return true
        }
        if (stack === 'bottom') {
            if (this.bottomScore1 >= 21 || this.bottomScore2 >= 21) {
                return false
            }
            return true
        }


    } else {
        if (this.score1 >= 21 || this.score2 >= 21) {
            return false
        }
        return true
    }

}
this.scoreAll = function () {
    this.getScore1()
    this.getScore2()
    this.getTopScore1()
    this.getTopScore2()
    this.getBottomScore1()
    this.getBottomScore2()
}
this.getScore1 = function () {
      this.score1 = this.calPoints(1, this.cards)
      return this.score1
  }
this.getScore2 = function () {
      this.score2 = this.calPoints(11, this.cards)
      return this.score2
  }
this.getTopScore1 = function () {
      if(!this.splitTop.length) return
      this.topScore1 = this.calPoints(1, this.splitTop)
      return this.topScore1
  }
this.getTopScore2 = function () {
       if (!this.splitTop.length) return
      this.topScore2 = this.calPoints(11, this.splitTop)
      return this.topScore2
  }
this.getBottomScore1 = function () {
       if (!this.splitBottom.length) return
      this.bottomScore1 = this.calPoints(1, this.splitBottom)
      return this.bottomScore1
  }
this.getBottomScore2 = function () {
       if (!this.splitBottom.length) return
      this.bottomScore2 = this.calPoints(11, this.splitBottom)
      return this.bottomScore2
}
this.resetPlayer = function () {
    bettingRound = 0
    turn = 'player'
    play = 'player'
    this.cards = []
    this.splitBottom = []
    this.splitTop = []
    this.isBust = false
    this.isSplit = false
    this.playType = ''
    this.nextCardFacing = 'up'
    this.position = 0
    this.score1 = 0
    this.score2 = 0
    this.splittingBottom = false
    this.splittingTop = false;
}
  
}

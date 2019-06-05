/** Deck Constuctor & Methods **/
/** @constructor **/
function Deck() {
    this.deckId = ''
    this.shuffled = false
    this.remaining = 0
}
Deck.prototype.getDeckEvent = function (data, args = {}) {
    $.event.trigger({
        type: "getDeckEvent",
        message: {
            data: data,
            other: args
        }
    });
}
Deck.prototype.getNewDeckEvent = function (data, args = {}) {
    $.event.trigger({
        type: "getNewDeckEvent",
        message: {
            data: data,
            other: args
        }
    });
}
Deck.prototype.shuffleDeckEvent = function (data, args = {}) {
    $.event.trigger({
        type: "shuffleDeckEvent",
        message: {
            data: data,
            other: args
        }

    });
}
Deck.prototype.draw = function (forWho) {

    this.drawCard(1, forWho)

}
Deck.prototype.getDeck = function (deckId) {
    var endPoint = `https://deckofcardsapi.com/api/deck/${deckId}/`
    $.ajax({
        url: endPoint,
        method: "GET"
    }).then(this.getDeckEvent)
}
Deck.prototype.getNewDeck = function (count = 1, whosDraw = '') {
    var endPoint = `https://deckofcardsapi.com/api/deck/new/?deck_count=${count}`
    if (whosDraw === '') {
        $.ajax({
            url: endPoint,
            method: "GET"
        }).then(function (response) {
            deck.getNewDeckEvent(response)
        }
        )
    } else if (whosDraw) {
            turn = whosDraw
             $.ajax({
                 url: endPoint,
                 method: "GET"
             }).then(function (response) {
                 deck.getNewDeckEvent(response)
             })
        } 
}
Deck.prototype.shuffleDeck = function () {
    var endPoint = `https://deckofcardsapi.com/api/deck/${this.deckId}/shuffle/`
    $.ajax({
        url: endPoint,
        method: "GET"
    }).then(this.shuffleDeckEvent)
}
Deck.prototype.drawCard = function (howMany = 1, who) {
    var endPoint = `https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=${howMany}`
    if (who.type === 'player') {
        $.ajax({
            url: endPoint,
            method: "GET"
        }).then(function (response) {
            player1.drawCardEvent(response, 'player')
        })
    } else if (who.type === 'dealer') {
        $.ajax({
            url: endPoint,
            method: "GET"
        }).then(function (response) {
            if (dealerPlaying) {
                dealerPlaying = false
                dealer.nextCardFacing = "up"
                dealer.drawHitCardEvent(response, 'dealer')
            } else {
                dealer.drawCardEvent(response, 'dealer')
            }
        })
    }

}

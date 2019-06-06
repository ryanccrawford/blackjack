/** Deck Constuctor & Methods **/
/** @constructor **/
function Deck() {
    this.deckId = ''
    this.shuffled = false
    this.remaining = 0
    this.getDeckEvent = function (data, args = {}) {
        $.event.trigger({
            type: "getDeckEvent",
            message: {
                data: data,
                other: args
            }
        });
    }
    this.getNewDeckEvent = function (data, args = {}) {
        $.event.trigger({
            type: "getNewDeckEvent",
            message: {
                data: data,
                other: args
            }
        });
    }
    this.shuffleDeckEvent = function (data, args = {}) {
        $.event.trigger({
            type: "shuffleDeckEvent",
            message: {
                data: data,
                other: args
            }

        });
    }
    this.draw = function (forWho) {

        this.drawCard(1, forWho)

    }
    this.getDeck = function (deckId) {
        var endPoint = `https://deckofcardsapi.com/api/deck/${deckId}/`
        $.ajax({
            url: endPoint,
            method: "GET"
        }).then(this.getDeckEvent)
    }
    this.getNewDeck = function (count = 1, whosDraw = '') {
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
    this.shuffleDeck = function () {
        var endPoint = `https://deckofcardsapi.com/api/deck/${this.deckId}/shuffle/`
        $.ajax({
            url: endPoint,
            method: "GET"
        }).then(this.shuffleDeckEvent)
    }
    this.drawCard = function (howMany = 1, who) {
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
}

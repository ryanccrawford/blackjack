
const numDecks = 1
var turn = 'player'
var play = 'player'
$(document).ready(function () {
    
    var hasDeck = localStorage.getItem('deckId')
    console.log(hasDeck)
    if (hasDeck != null) {
        getDeck(hasDeck)
    } else {
        getNewDeck(numDecks)
    }

    $(document).on("getDeckEvent", function (response) {
        dealer.deckId = response.message.deck_id
        dealer.deck = response.message
        if (response.message.remaining < 25) {
            getNewDeck(numDecks)

            return;
        }


        deal()
    })
    $(document).on("getNewDeckEvent", function (response) {
        dealer.deckId = response.message.deck_id
        dealer.deck = response.message
        localStorage.setItem('deckId', dealer.deckId)
        dealer.shuffle()
    })
    $(document).on("shuffleDeckEvent", function (response) {
        dealer.deck = response.message
        dealer.deckId = response.message.deck_id
        deal()

    })
    $(document).on("playerDrawCardEvent", function (response) {

        player1.cards.push(response.message.cards[0])
        player1.displaycard()
        turn = 'dealer'
        deal()


    })
    $(document).on("dealerDrawCardEvent", function (response) {

        dealer.cards.push(response.message.cards[0])
        dealer.displaycard()
        turn = 'player'
        deal()

    })
    $(document).on("addedToPileEvent", function (response) {
        dealer.pile = response.message.piles
    })
    $('#play-button').click(function (event) {

        playGame()
    })

})

var player1 = {
    cards: [],
    position: 0,
    nextCardFacing: 'up',
    draw: function (_dealer) {
        this.position++
        if (this.cards.length === 3) {
            this.nextCardFacing = 'down'
        }
        drawCard(_dealer.deckId, 1, playerDrawCardEvent)
    },
    displaycard: function () {
        showCard(this.cards[this.position - 1], 'player')
    }

}
var dealer = {
    deckId: '',
    shuffled: false,
    nextCardFacing: 'down',
    position: 0,
    draw: function () {
        this.position++
        if (this.cards.length === 1) {
            this.nextCardFacing = 'up'
        }
        drawCard(this.deckId, 1, dealerDrawCardEvent)
    },
    shuffle: function () {
        shuffleDeck(this.deckId)

    },
    displaycard: function () {
        showCard(this.cards[this.position - 1], 'dealer')
    },
    cards: [],
    deck: {},
    pile: {}
}

function deal() {
    if (player1.cards.length === 2 && dealer.cards.length === 2) {
        $("#play-button").prop('disabled', false)
        return
    }
    if (turn === 'player' && player1.cards.length < 2) {
        if (dealer.deck.remaining >= 10) {
            player1.draw(dealer)
        } else {
            console.log("No More Cards")
            startFresh()
        }

    } else if (turn === 'dealer' && dealer.cards.length < 2) {
        if (dealer.deck.remaining >= 10) {
            dealer.draw(dealer)
        } else {
            console.log("No More Cards")
            startFresh()
        }

    }


}

function playGame() {
    console.log("Playing")
    //     NATURALS
    //     If a player's first two cards are an ace and a "ten-card" (a picture card or 10), giving him a count of 21 in two
    //     cards, this is a natural or "blackjack."
    player1.hasBlackJack = false
    player1.hasBlackJack = checkNatural(player1)
    if (player1.hasBlackJack) {

        console.log('You Have BlackJack')
        play = 'dealer'
        var card = $('#dealer-cards div[data-side="back"]')

        flipcard(card)
        if (checkNatural(dealer)) {
            console.log('Dealer Has BlackJack')
            return doTie()
        }
        return doWin()
    }
    console.log('Player Hit, Stay Bet?')

    var hitBtn = createButton('hit', 'Hit', hit)
    var stayBtn = createButton('stay', 'Stay', stay)
    var betBtn = createButton('bet', 'Bet', bet)
    $('#player-buttons').empty()
    $('#player-buttons').append(hitBtn).append(stayBtn).append(betBtn)
    printMessage("You Play. What would you like to do?", false)

    // If any player has a natural and the dealer does not, the dealer immediately
    //     pays that player one and a half times the amount of his bet. If the dealer has a natural, he immediately collects
    //     the bets of all players who do not have naturals, (but no additional amount). If the dealer and another player both
    //     have naturals, the bet of that player is a stand-off (a tie), and the player takes back his chips.

    //     If the dealer's face-up card is a ten-card or an ace, he looks at his face-down card to see if the two cards make a
    //     natural. If the face-up card is not a ten-card or an ace, he does not look at the face-down card until it is the
    //     dealer's turn to play.
}

function hit(event) {
    printMessage("You Hit!", false)
}

function stay(event) {
    printMessage("You Stay!", false)
}

function doubleDown(event) {
    printMessage("You Doubled Down!", false)
}

function bet(event) {
    printMessage("You Bet!", false)
}

function split(event) {
    printMessage("You Split!", false)
}

function doWin() {
    printMessage("You Got Black Jack!")
    setTimeout(function () {
        clearCards()
        deal()
    }, 5000);
}

function clearCards() {
    $('#player-cards').empty()
    $('#dealer-cards').empty()
    player1.cards = []
    dealer.cards = []
    turn = 'player'
}

function doTie() {
    printMessage("Tie Game!")
    setTimeout(function () {
        clearCards()
        deal()
    }, 5000);
}

function printMessage(message, clear = true) {
    var messageArea = $('#player-messages')
    var alert = createAlert(message)
    if (clear) {
        messageArea.empty()
    }
    messageArea.append(alert)
}

function createAlert(message) {
    var div = $('<div>')
    $(div).addClass('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show').attr('role', 'alert')
    var btn = $('<button>')
    $(btn).attr('type', 'button').addClass('close').attr('data-dismiss', 'alert').attr('aria-label', 'Close')
    var span = $('<span>')
    $(span).attr('aria-hidden', 'true').html('&times;')
    $(btn).append(span)
    var mess = $('<strong>')
    $(mess).text(message)
    $(div).append(btn)
    $(div).append(mess)
    $(div).alert();

    return $(div)
}

function createButton(btnName, btnTitle, clickCallback) {
    var btn = $('<button>')
    $(btn).attr('id', btnName)
    $(btn).text(btnTitle).click(clickCallback)
    return $(btn)
}



function checkNatural(player) {
    var tempcards = player.cards
    var aceCount = countAces(tempcards)
    var faceCount = countFace(tempcards)
    var tenCount = countTens(tempcards)
    var faceTens = faceCount + tenCount

    if (faceTens === 1 && aceCount === 1) {
        return true
    }

    return false
}

function countAces(cards = []) {
    var count = 0
    cards.forEach(function (card) {

        if (card.value === 'ACE') {
            count++
        }

    })

    return count

}

function countFace(cards = []) {
    var count = 0
    cards.forEach(function (card) {

        if (card.value === 'KING' || card.value === 'QUEEN' || card.value === 'JACK') {
            count++
        }

    })

    return count
}

function countTens(cards = []) {
    var count = 0
    cards.forEach(function (card) {

        if (card.value === '10') {
            count++
        }

    })

    return count

}

function startFresh() {

    localStorage.clear()
    dealer.cards.clear()
    player1.cards.clear()
    getNewDeck(1)
}

function addCardsToPile(deckId, cards = [], pileName = '') {
    if (cards.length < 1) {
        return
    }
    if (pileName === '') {
        pileName = deckId
    }
    cards = cards.join(",")
    var endPoint = `https://deckofcardsapi.com/api/deck/${deckId}/pile/${pileName}/add/?cards=${cards}`
    $.ajax({
        url: endPoint,
        method: "GET"
    }).then(getDeckEvent)
}

function getDeck(deckId) {
    var endPoint = `https://deckofcardsapi.com/api/deck/${deckId}/`
    $.ajax({
        url: endPoint,
        method: "GET"
    }).then(getDeckEvent)
}

function getNewDeck(count = 1, promise = getNewDeckEvent) {
    var endPoint = `https://deckofcardsapi.com/api/deck/new/?deck_count=${count}`
    $.ajax({
        url: endPoint,
        method: "GET"
    }).then(promise)
}

function shuffleDeck(deckId) {
    var endPoint = `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`
    $.ajax({
        url: endPoint,
        method: "GET"
    }).then(shuffleDeckEvent)
}

function drawCard(deckId, howMany = 1, who) {
    var endPoint = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${howMany}`
    $.ajax({
        url: endPoint,
        method: "GET"
    }).then(who)
}

function cacheNewShuffledDeck() {
    getNewDeck(1, function (obj) {
        var id = deck_id
        shuffleDeck(obj.id).then(function (obj2) {
            var deckId = obj2.deck_id
            var endPoint = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`
            $.ajax({
                url: endPoint,
                method: "GET"
            }).then(function (deck) {
                console.log(deck)
            })
        })
    })
    

   
}

function getNewDeckEvent(data) {
    $.event.trigger({
        type: "getNewDeckEvent",
        message: data
    });
}

function getDeckEvent(data) {
    $.event.trigger({
        type: "getDeckEvent",
        message: data
    });
}

function shuffleDeckEvent(data) {
    $.event.trigger({
        type: "shuffleDeckEvent",
        message: data
    });
}

function playerDrawCardEvent(data) {
    $.event.trigger({
        type: "playerDrawCardEvent",
        message: data
    });
}

function dealerDrawCardEvent(data) {
    $.event.trigger({
        type: "dealerDrawCardEvent",
        message: data
    });
}

function addedToPileEvent(data) {
    $.event.trigger({
        type: "addedToPileEvent",
        message: data
    });
}

function showCard(card, who) {

    if (who === 'player') {
        displayCard(card, who, 'up')
    } else if (who === 'dealer') {
        if (dealer.position === 2) {
            displayCard(card, who, 'down')
        } else {
            displayCard(card, who, 'up')
        }


    }
}

function displayCard(card, who, facing) {
    console.log(card)
    var div = $('<div>')
    
//    width: 225px;
//height: 314 px;
    $(div).addClass('panel')
    if (facing === 'up') {
        $(div).attr('data-side', 'front').attr('data-suit', card.suit).attr('data-value',
            card.value).attr('data-cardback', 'cardback.png').attr('data-cardfront', card.image)
        $(div).css('background-image', 'url('+card.image+')').css('width','225px').css('height','314px')
    }
    if (facing === 'down') {
        $(div).attr('data-side', 'back').attr('data-suit', card.suit).attr('data-value',
            card.value).attr('data-cardback', 'cardback.png').attr('data-cardfront', card.image)
         $(div).css('background-image', 'url(cardback.png)').css('width', '225px').css('height', '314px')
    }
    if (who === 'player') {
        $(div).click(function (event) {
            var thecard = event.target
            var side = $(thecard).attr('data-side')
    
            if (side === 'back') {
                $(thecard).attr('data-side', 'front')
                var imagefront = $(thecard).attr('data-cardfront')
                $(thecard).css('background-image', `url(${imagefront})`)
            } else {
                $(thecard).attr('data-side', 'back')
                var imageback = $(thecard).attr('data-cardback')
                $(thecard).css('background-image', `url(${imageback})`)
            }
        })

    }

   // $(div).append(img)
    $('#' + who + '-cards').append(div)

}
function flipcard(card) {
    var c = card[0]

    var img = $(c).attr('data-cardfront')
    $(c).attr('data-side', 'front')
    $(c).css('background-image', `url(${img})`)
}


var chips = function (value) {
    this.color = value
    this.getValue = function () {
        switch (this.color) {
            case "green":
                return 10.00;
            case "blue":
                return 20.00;
            case "red":
                return 50.00;
            case "yellow":
                return 100.00;
            case "black":
                return 500.00;
            default:
                return 0.00
        }
    }
    this.getsvg = function() {
        $.get('http://localhost:3000/images/chip.svg', function (svg) {
            getSvgEvent(svg);
        }, 'text');
    }

    this.getSvgEvent = function (data) {
        $.event.trigger({
            type: "getSvgEvent",
            message: {
                svg: data
            }
        });
    }

}

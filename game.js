var level = 0;

var levels = [  ]

var sliderValues = [];
function slide(elem) {
    if(sliderValues[elem.id]) {
        elem.setAttribute('style', 'margin-left: 0%;')
        setTimeout(function() {
            sliderValues[elem.id] = false;
        }, 1000)
    } else {
        elem.setAttribute('style', 'margin-left: 50%;')
        setTimeout(function() {
            sliderValues[elem.id] = true;
        }, 1000)
    }
}

function update() {

}
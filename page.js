var sliderValues = [true, true, true, false, false, false];
function slide(elem) {
    if(sliderValues[elem.id]) {
        elem.setAttribute('style', 'margin-left: 0%;')
        sliderValues[elem.id] = false;
    } else {
        elem.setAttribute('style', 'margin-left: 50%;')
        sliderValues[elem.id] = true;
    }
}
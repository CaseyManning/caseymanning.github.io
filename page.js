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

function centerClicked() {
    if(hash(sliderValues.join('')) == -1411274699) { // [true, false, false, true, false, true]
        document.getElementById('ringInner').setAttribute('style', 'opacity: 0');
        document.getElementById("inside").setAttribute('style', 'display: initial')
        setTimeout(function() {
            document.getElementById('ringInner').setAttribute('style', 'display: none;');
        }, 1000)
    } else {
        document.getElementById('ringInner').setAttribute('style', 'width: 33vw; height: 33vw;');
        setTimeout(function() {
            document.getElementById('ringInner').setAttribute('style', 'width: 35vw; height: 35vw;');
        }, 200)
    }
}

function hash(str) {
    var hash = 0;
    if (str.length == 0) {
        return hash;
    }
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function vwoosh() {
    // document.getElementById("inside").setAttribute('style', 'display: initial; position: fixed; width: 200%; height: 200%; border-radius: 0px')
    document.getElementById("fill").setAttribute('style', 'visibility: visible; opacity: 1')
}
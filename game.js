var level = 0;

var sliderHTML = {
    "center" : ["<div class='indent slider1 center' id='", "'> <div class='slider2 blue' onclick='slide(this)'></div></div>"],
    "centerStatic" : ["<div class='indent slider1 center static' id='", "'> <div class='slider2 blue' onclick='slide(this)'></div></div>"],
    "locker" : ["<div class='indent slider1 locker' id='", "'> <div class='slider2 grey' onclick='slide(this)'></div></div>"],
    "lockerStatic" : ["<div class='indent slider1 locker static' id='", "'> <div class='slider2 grey' onclick='slide(this)'></div></div>"],
    "lockerOn" : ["<div class='indent slider1 locker' id='", "'> <div class='slider2 grey' onclick='slide(this)' style='margin-left: 50%;'></div></div>"],
    "lockerStaticOn" : ["<div class='indent slider1 locker static' id='", "'> <div class='slider2 grey' onclick='slide(this)' style='margin-left: 50%;'></div></div>"],
    "empty" : ["<div class='indent slider1 invis' id='", "'> <div class='slider2 invis' onclick='slide(this)'></div></div>"],
    "gold" : ["<div class='indent slider1 goldOne' id='", "'> <div class='slider2 gold' onclick='slide(this)'></div></div>"],
    "mover" : ["<div class='indent slider1 mover' id='", "'> <div class='slider2 light' onclick='slide(this)'></div></div>"]
}

var levels = {
    0 : {"sliders" : ["center"]},
    1 : {"sliders" : ["lockerOn center locker"]},
    2 : {"sliders" : ["mover mover centerStatic"]},
    3 : {"sliders" : ["mover lockerStaticOn gold", "center", "gold lockerStatic mover"]},
    4 : {"sliders" : ["gold lockerOn gold", "center", "gold lockerOn gold"]}
}

var goldsChecked = false;

var sliderValues = [];
var moverStates = []

window.onload = function() {
    populateSliders()
    update()
}

function slide(elem) {
    if(!elem.parentNode.classList.contains("locked") && !elem.parentNode.classList.contains("static") && !elem.parentNode.classList.contains("goldLocked")) {
        if(elem.parentNode.classList.contains("mover")) {
            moverStates[elem.parentNode.id] = true;
        }
        toggle(elem)
    }

}

function toggle(slider) {
    if(sliderValues[slider.parentNode.id]) {
        slider.setAttribute('style', 'margin-left: 0%;')
        setTimeout(function() {
            sliderValues[slider.parentNode.id] = false;
            update();
        }, 1000)
    } else {
        slider.setAttribute('style', 'margin-left: 50%;')
        setTimeout(function() {
            sliderValues[slider.parentNode.id] = true;
            if(slider.parentNode.classList.contains("center")) {
                nextLevel();
            }
            update();
        }, 1000)
    }
}

function update() {
    console.log("-- updating --")
    var rows = document.getElementById("allSliders").childNodes;
    var goldsChecked = true;
    for(var k = 0; k < rows.length; k++) {
        var sliders = rows[k].childNodes;
        for(var i = 0; i < sliders.length; i++) {
            sliders[i].classList.remove('locked')
        }
        for(var i = 0; i < sliders.length; i++) {
            if(sliders[i].classList.contains("locker")) {
                if(i < sliders.length-1 && sliderValues[sliders[i].id]) {
                    sliders[i+1].classList.add('locked')
                } else if(i > 0 && sliderValues[sliders[i].id] != true) {
                    sliders[i-1].classList.add('locked')
                }
            }
        }

        for(var i = 0; i < sliders.length; i++) {
            if(sliders[i].classList.contains("mover") && moverStates[sliders[i].id]) {
                if(!sliderValues[sliders[i].id] && i>0) {
                    console.log("mover at position " + i + " moving slider to the right")
                    toggle(sliders[i-1].children[0]);
                    console.log(i)
                    var foo = i-1;
                    setTimeout(function() {
                        moverStates[sliders[foo].id] = true;
                    }, 900);
                    sliders[i].children[0].setAttribute('style', 'margin-left: 0%;')
                    sliderValues[sliders[i].id] = false;
                    moverStates[sliders[i].id] = false;
                } else if(i < sliders.length-1) {
                    console.log("mover at position " + i + " moving slider to the left")
                    toggle(sliders[i+1].children[0]);
                    console.log(i)
                    var foo = i+1;
                    setTimeout(function() {
                        moverStates[sliders[foo].id] = true;
                    }, 900);
                    sliders[i].children[0].setAttribute('style', 'margin-left: 0%;')
                    sliderValues[sliders[i].id] = false;
                    moverStates[sliders[i].id] = false;
                }
            }
        }
        for(var i = 0; i < sliders.length; i++) {
            if(sliders[i].classList.contains("goldOne")) {
                if(sliderValues[sliders[i].id] == false) {
                    goldsChecked = false;
                } 
            }
        }
        if(!goldsChecked) {
            document.getElementsByClassName('center')[0].classList.add('goldLocked');
        } else {
            document.getElementsByClassName('center')[0].classList.remove('goldLocked');
        }
    }
}

function nextLevel() {
    level++;
    console.log('starting level ' + level)
    document.getElementById("bod").setAttribute('style', 'opacity: 0')
    setTimeout(function() {
        populateSliders()
        update()
        document.getElementById("bod").setAttribute('style', 'opacity: 1')
    }, 1000)
}

function guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4());
}

function populateSliders() {
    console.log("populating")
    sliderValues = [];
    var sliderLevels = levels[level]["sliders"];
    console.log(sliderLevels)
    var newHTML = '';
    for(var j = 0; j < sliderLevels.length; j++) {  
        var newSliders = sliderLevels[j];
        var sliderNames = newSliders.split(" ");
        newHTML += "<div class='sliderRow'>"
        for(var i = 0; i < sliderNames.length; i++) {
            console.log(sliderNames[i])
            var id = guid()
            if(sliderNames[i].endsWith('On')) {
                sliderValues[id] = true;
            } else {
                sliderValues[id] = false;
            }
            moverStates[id] = false;
            newHTML += sliderHTML[sliderNames[i]][0] + id + sliderHTML[sliderNames[i]][1];
        }
        newHTML += "</div>"
    }
    document.getElementById("allSliders").innerHTML = newHTML;
}
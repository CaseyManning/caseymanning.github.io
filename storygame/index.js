class Moment {
    constructor(name, person) {
        this.name = name;
        this.person = person;
        this.text = "";
        this.options = []
    }
    addOption(val) {
        this.options.push(val)
    }
    addText(val) {
        this.text += val + '\n';
    }

    showMoment() {
        console.log(this)
        if(window["On"+this.name]) {
            window["On"+this.name]();
        }
        clearOptions()

        document.getElementById("personname").innerHTML = people[this.person].name;
        document.getElementById("personimg").src = people[this.person].image

        writeText(document.getElementById("textbox"), this.text, () => {
            for(var i = 0; i < this.options.length; i++) {
                showDialogOption(this.options[i])
            }
        });
        
    }
}

var people = {};

class Person {
    constructor(name, image) {
        this.name = name;
        this.image = image;
        people[name] = this;
    }
}
new Person("Mr. Dialog", "dots1.png")
new Person("Mr. Alignment", "dots2.png")

function writeText(element, text, finished) {
    element = element.firstElementChild;
    element.innerHTML = "";
    var writechar = () => {
        var delay = 15;
        if(text[0] === '\n') {
            element.innerHTML += "<br />";
            if(text[1] === '\n') {
                delay = 200;
            }
        } else {
            element.innerHTML += text[0];
        }
        text = text.substring(1);

        if(text.length == 0) {
            finished();
        } else {
            setTimeout(() => {
                writechar()
            }, delay);
        }
    }
    writechar();
}

function clearOptions() {
    var base = document.getElementById("baseoption");
    for (let i = document.getElementsByClassName("dialogoption").length-1; i >= 0; i--) {
        const element = document.getElementsByClassName("dialogoption")[i];
        if(element.id != "baseoption") {
            element.remove();
        } 
    }
}

function showDialogOption(option) {
    var base = document.getElementById("baseoption");
    base.classList.remove("hidden")
    var newoption = base.cloneNode(true)
    newoption.removeAttribute('id');
    newoption.firstElementChild.innerHTML = option.text;
    base.parentElement.appendChild(newoption)
    base.classList.add("hidden");

    newoption.onclick = function(e) {
        moments[option.destination].showMoment();
    }
}

var moments = {};

var startScene = "start"

function startGame() {
    loadStory("story.txt", () => {
        moments[startScene].showMoment();
    });
}
var selectedScene = "";

function show(name, button) {

    if(button.classList.contains("selected")) {
        document.getElementsByClassName("halfscreen")[0].classList.remove("shrunk");
        document.getElementById("coverimg").classList.remove("hidden");
        document.getElementById("content").classList.add("hidden");
        document.getElementById(name).classList.add("hidden");
        button.classList.remove("selected")
        return;
    }

    var btns = document.getElementsByClassName("selected");
    for(var i = 0; i < btns.length; i++) {
        btns[i].classList.remove("selected");
    }

    document.getElementsByClassName("halfscreen")[0].classList.add("shrunk");
    document.getElementById("coverimg").classList.add("hidden");
    document.getElementById("content").classList.remove("hidden");
    button.classList.add("selected");

    if(selectedScene.length > 1) {
        document.getElementById(selectedScene).classList.add("hidden")
    }
    selectedScene = name;
    document.getElementById(name).classList.remove("hidden");
}

function hideFocused() {
    document.getElementById("fullsc").classList.add("hidden");
}

document.getElementById("focusedimg").click(function(e) {
    e.stopPropagation();
})

document.addEventListener('keydown', (e) => {
    if (e.code === "ArrowLeft") {
       leftClicked(e);
    } else if (e.code === "ArrowRight") {
        rightClicked(e);
    } else if(e.code === "Escape") {
        hideFocused();
    }
  });

  function leftClicked(e) {
    if(sourceImage.previousElementSibling) {
        sourceImage = sourceImage.previousElementSibling;
        if(sourceImage.nodeName == "VIDEO") {
            sourceImage = sourceImage.previousElementSibling;
        }
    } else {
        if(sourceImage.parentElement.id == "ac1") {
            sourceImage = document.getElementById("ac2").lastElementChild;
        } else {
            sourceImage = document.getElementById("ac1").lastElementChild;
        }
    }

    document.getElementById("focusedimg").src = sourceImage.src;
    e.stopPropagation();
}
function rightClicked(e) {
    if(sourceImage.nextElementSibling) {
        sourceImage = sourceImage.nextElementSibling;
        if(sourceImage.nodeName == "VIDEO") {
            sourceImage = sourceImage.nextElementSibling;
        }
        
    } else {
        if(sourceImage.parentElement.id == "ac1") {
            sourceImage = document.getElementById("ac2").firstElementChild;    
        } else {
            sourceImage = document.getElementById("ac1").firstElementChild;
        }
    }

    document.getElementById("focusedimg").src = sourceImage.src;
    e.stopPropagation();
}

function expand(img) {
    console.log(img)
    sourceImage = img;
    var cimg = document.getElementById("focusedimg")
    cimg.src  = img.src;
    document.getElementById("fullsc").classList.remove("hidden");
    document.getElementById("fullsc").style.opacity = "1";

}

window.onload = function() {
    if(window.location.href.includes("artwork")) {
        console.log("showing")
        show("artwork", document.getElementById("artworkbutton"));
    }
    if(window.location.href.includes("games")) {
        console.log("showing")
        show("games", document.getElementById("gamesbutton"));
    }
};
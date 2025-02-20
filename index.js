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
    } else {
        if(sourceImage.parentElement.id == "ac1") {
            sourceImage = document.getElementById("ac2").lastElementChild;
        } else {
            sourceImage = document.getElementById("ac1").lastElementChild;
        }
    }

    updateSource();
    e.stopPropagation();
}

function updateSource() {
    if(sourceImage.nodeName == "VIDEO") {
        document.getElementById("focusedvideo").src = sourceImage.querySelector("source").src;
        document.getElementById("focusedvideo").classList.remove("hidden");
        document.getElementById("focusedimg").classList.add("hidden");
    } else {
        console.log("not video")
        document.getElementById("focusedimg").src = sourceImage.src;
        document.getElementById("focusedimg").classList.remove("hidden");
        document.getElementById("focusedvideo").classList.add("hidden");
    }
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

    updateSource();
    e.stopPropagation();
}

function expand(element) {
    console.log(element)
    var cimg = document.getElementById("focusedimg")
    var focusedvideo = document.getElementById("focusedvideo")

    if(element.nodeName == "VIDEO") {
        const video = element;
        console.log(video)
        sourceImage = video;
        
        focusedvideo.querySelector("source").src = video.querySelector("source").src;
        focusedvideo.load();
        focusedvideo.play();
        focusedvideo.classList.remove("hidden");
        cimg.classList.add("hidden");   
    } else {
        const img = element;
        console.log(img)
        sourceImage = img;
        cimg.src  = img.src;
        focusedvideo.classList.add("hidden");
        cimg.classList.remove("hidden");
    }
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
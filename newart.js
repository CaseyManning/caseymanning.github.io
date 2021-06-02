var sourceImage;

for (let i = 0; i < document.getElementById("grid").children.length; i++) {
    const element = document.getElementById("grid").children[i];
    element.addEventListener("click", function(event) {
        console.log("clicked")
        var img = document.getElementById("focusedimg")
        sourceImage = event.target;
        img.src  = event.target.src;
        document.getElementById("fullsc").classList.remove("hidden");
        document.getElementById("fullsc").style.opacity = "1";

        // var rect = event.target.getBoundingClientRect();
        
        // img.style.left = rect.x + "px";
        // img.style.right = (window.innerWidth - rect.x - rect.width) + "px";
        // img.style.top = rect.y + "px";
        // img.style.bottom = (window.innerHeight - rect.y - rect.height) + "px";
        // img.style.width = rect.width + "px";
        // img.style.height = rect.height + "px";

        // setTimeout(() => {
        //         img.style.transition = "0.5s";
        //     setTimeout(() => {
        //         img.style.left = "0px";
        //         img.style.right = "0px";
        //         img.style.top = "0px";
        //         img.style.bottom = "0px";
        //         img.style.width = "";
        //         img.style.height = "";
        //      }, 0);
        //  }, 0);

    }, false);

    setTimeout(() => {
        element.firstElementChild.style.animation = "none";
        element.firstElementChild.style.transform = "scale(1)";
    }, 2000);
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

function hideFocused() {

    // var img = document.getElementById("focusedimg")

    // var rect = sourceImage.getBoundingClientRect();
    
    // img.style.transition = "0.5s";
    // img.style.left = rect.x + "px";
    // img.style.right = (window.innerWidth - rect.x - rect.width) + "px";
    // img.style.top = rect.y + "px";
    // img.style.bottom = (window.innerHeight - rect.y - rect.height) + "px";
    // img.style.width = rect.width + "px";
    // img.style.height = rect.height + "px";
    // // document.getElementById("fullsc").style.opacity = "0";
    // setTimeout(() => {
        document.getElementById("fullsc").classList.add("hidden");
    //     img.style.transition = "";
    // }, 500);
}

function leftClicked(e) {
    if(sourceImage.parentNode.previousElementSibling) {
        sourceImage = sourceImage.parentNode.previousElementSibling.firstChild;
    } else {
        sourceImage = document.getElementById("grid").children[document.getElementById("grid").children.length-1].firstChild;
    }

    document.getElementById("focusedimg").src = sourceImage.src;
    e.stopPropagation();
}
function rightClicked(e) {
    if(sourceImage.parentNode.nextElementSibling) {
        sourceImage = sourceImage.parentNode.nextElementSibling.firstChild;
    } else {
        sourceImage = document.getElementById("grid").children[0].firstChild;
    }

    document.getElementById("focusedimg").src = sourceImage.src;
    e.stopPropagation();
}
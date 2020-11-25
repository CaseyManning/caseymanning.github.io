function unExpand() {
    document.getElementById("overlay").hidden = true;
    document.getElementById("expanded").hidden = true;
}

function expand(imageSrc) {
    document.getElementById("overlay").hidden = false;
    document.getElementById("expanded").hidden = false;
    document.getElementById("expanded").src=imageSrc;
}

window.onload = function() {
    // alert(window.location.href)

}

if(window.location.href.includes("fade")) {
    document.getElementById('bod').style.opacity = 0;
    setTimeout(function() {
        document.getElementById('bod').style.transition = "ease 1s";
        document.getElementById('bod').style.opacity = 1;
    });
}
function unExpand() {
    document.getElementById("overlay").hidden = true;
    document.getElementById("expanded").hidden = true;
}

function expand(imageSrc) {
    document.getElementById("overlay").hidden = false;
    document.getElementById("expanded").hidden = false;
    document.getElementById("expanded").src=imageSrc;
}
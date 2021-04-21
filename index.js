function hideall() {
    var expands = document.getElementsByClassName("expandable")
    for(var i = 0; i < expands.length; i++) {
        expands[i].style.maxHeight = null;
    }
}

function show(name, button) {
    if(parseInt(document.getElementById(name).style.maxHeight) > 0) {
        button.classList.remove("selected");
        hideall();
        return;
    }
    var btns = document.getElementsByClassName("selected");
    for(var i = 0; i < btns.length; i++) {
        btns[i].classList.remove("selected");
    }
    button.classList.add("selected");
    hideall();
    setTimeout(function() {
    var elem = document.getElementById(name);
    // var parent = elem.parentNode;
    // parent.removeChild(elem)
    // parent.prepend(elem)
    elem.style.maxHeight = elem.scrollHeight + "px";
    }, 300);
}

function saveResume() {
    var elem = window.document.createElement('a');
    elem.href = 'Resume.pdf'
    elem.download = 'Resume.pdf';        
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}
function expandPlayground() {
    var projects = document.getElementById("omelettes");
    var content = projects.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
    document.getElementById('bod').style.transition = "1s";
}

function expandAmanu() {
  var projects = document.getElementById("amanu");
  var content = projects.nextElementSibling;
  if (content.style.maxHeight){
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
  }
}

function artTransition() {
  // document.getElementsByClassName('top')[0].setAttribute('style', 'padding-top: 1400px !important;');
  // document.getElementsByClassName('top')[0].setAttribute('style', 'bottom: 0; clip-path: polygon(0 0, /* left top */ 100% 0, /* right top */ 100vw 100vh, /* right bottom */ 0 100vh /* left bottom */);');
  document.getElementsByClassName('top')[0].setAttribute('style', 'padding-top: 100%; clip-path: polygon(0 0, /* left top */ 100% 0, /* right top */ 100vw 100vh, /* right bottom */ 0 100vh /* left bottom */);');
  setTimeout(function() {location.href='https://caseymanning.github.io/artwork#fade';}, 700)

}

function saveResume() {
    var elem = window.document.createElement('a');
    elem.href = 'Resume.pdf'
    elem.download = 'Resume.pdf';        
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}
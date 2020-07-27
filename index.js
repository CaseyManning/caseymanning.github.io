function expandProjects() {
    var projects = document.getElementById("projects");
    var content = projects.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
}
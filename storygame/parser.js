function loadStory(filename, finished) {
    fetch(filename)
    .then(response => response.text())
    .then(data => {
        var currentMoment;
        for(var i = 0; i < data.split("\n").length; i++) {
            var line = data.split("\n")[i]
            if(!currentMoment) { //new moment, write name and person
                line = line.split(" | ")
                currentMoment = new Moment(line[0], line[1])
                if(!line[0] || !line[1]) {
                    throw 'Malformed input in ' + filename + ', line ' + i;
                }
            } else if(line.startsWith(" > ")) { //dialog option
                line = line.substring(3).split(" | ");
                
                currentMoment.addOption({"text" : line[0], "destination" : line[1]})
            } else if(line.startsWith("---")) {
                moments[currentMoment.name] = currentMoment;
                currentMoment = null;
            } else {
                currentMoment.addText(line)
            }
        }
        if(currentMoment) {
            moments[currentMoment.name] = currentMoment;
        }
        finished();
    });
}
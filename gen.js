var splotches = [];

function setup() {
    background(255, 255, 245)
    createCanvas(windowWidth, windowHeight);
    noLoop();
    blendMode(DARKEST);
    redraw();
}

var huep = 0.75; //Math.random();
var satp = 0;
var valp = 0;

var lastX = 0;
var lastY = 0;

function draw() {
    background(255, 255, 245)
    // huep = Math.random();
    // background(255, 255, 245)
    // for(var i = 0; i < windowWidth / 70; i++) {
    //     for(var j = 0; j < windowWidth / 70; j++) {
    //         splotch(center=[i*70 + random(-200, 200), j*70 + random(-200, 200)])
    //     }
    // }
    // // for(var i = 0; i < 150; i++) {
    // //     splotch(center=[floor(randomGaussian(windowWidth/2, 150)), floor(randomGaussian(windowHeight/2, 150))], radius=random(50, 100))
    // // }
}

// function mousePressed() {
//     redraw();
// }

//hsv: 0.75, 0.61, 0.05

function mousePressed() {
    valp = Math.random()
    satp = (Math.random() + 1) / 2
    splotch([mouseX, mouseY])
    redraw();
}

function mouseDragged() {
    if(Math.sqrt((mouseX - lastX)**2 + (mouseY - lastY)**2) > 30) {
        lastX = mouseX;
        lastY = mouseY;
        splotch([mouseX, mouseY])
        redraw();
    }
}

function splotch(center=[windowWidth/2, windowHeight/2], radius=100, npoints=10, startDepth = 1, iterDepth=3, opLayers=20) {
    // let palatte = [[255, 91, 25], [91, 155, 125]]
    // var index = floor(random(0, palatte.length));
    // // print(index)
    // var color = palatte[index]
    // color = [floor(random(0, 255)), floor(random(0, 255)), floor(random(0, 255))]
    var color = HSVtoRGB(huep, satp, valp + 0.5)
    //console.log(huep)
    fill('rgba('+color.r+', '+color.g+', '+color.b + ', '+0.01+')')
    noStroke()
    var vertices = []
    let angle = TWO_PI / npoints;

    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = center[0] + cos(a) * radius;
      let sy = center[1] + sin(a) * radius;
      vertices.push([sx, sy]);
    }
    var variances = [];
    for(var i = 0; i < vertices.length; i++) {
        variances.push(random(0.1, 1.1))
    }
    for(var i = 0; i < startDepth; i++) {
        vertices = extrude(vertices, variances)
        variances = duplicate(variances)
    }
    for(var k = 0; k < opLayers; k++) {
        var newVerts = [...vertices]
        var newVariances = [...variances];
        for(var i = 0; i < iterDepth; i++) {
            newVerts = extrude(newVerts, newVariances)
            newVariances = duplicate(newVariances)
        }
        drawVerts(newVerts)
    }
}

function drawVerts(verts) {
    beginShape();
    verts.forEach(function(v) {
        vertex(v[0] + random(-5, 5), v[1]  + random(-5, 5));
    });
    endShape(CLOSE);
}

function duplicate(arr) {
    var result = []
    for(var i = 0; i< arr.length;++i){
        result.push(arr[i]);
        result.push(arr[i]);
      }
    return result
}

function extrude(verts, variances) {
    var newVerts = [...verts]
    for(var i = 0; i < verts.length; i++) {
        var i2 = (i+1)%(verts.length)
        var edgeVec = [verts[i2][0] - verts[i][0], verts[i2][1] - verts[i][1]]
        var edgeLength = Math.sqrt(edgeVec[0]*edgeVec[0] + edgeVec[1]*edgeVec[1])
        var extrudeAmount = max(randomGaussian(20, 20) * edgeLength/60, 0) * variances[i] / (edgeLength/100);
        var angle = (TWO_PI / verts.length)*i + random(-3, 3);
        var newVert = [(verts[i][0] + verts[i2][0])/2+cos(angle)*extrudeAmount, (verts[i][1] + verts[i2][1])/2 + +sin(angle)*extrudeAmount]
        newVerts.splice(i*2+1, 0, newVert);
    }
    return newVerts;
}

function clearScreen() {
    clear()
    redraw()
}
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
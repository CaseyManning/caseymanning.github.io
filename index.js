function hideall() {
    document.getElementById("model").style.display = "none";
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



let scene, camera, renderer;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth/(window.innerHeight/2), 1, 5000);
    camera.rotation.y = -45/180 * Math.PI;
    camera.position.x = -6.5;
    camera.position.y = 1;
    camera.position.z = 6.5;


    var hlight = new THREE.AmbientLight(0x404040, 1);
    scene.add(hlight);

    var dirlight = new THREE.DirectionalLight(0xffffff, 1);
    dirlight.castShadow = true;
    dirlight.position.set(-2, 5, 0);
    scene.add(dirlight);

    renderer = new THREE.WebGLRenderer({antialias:true});

    renderer.setSize(window.innerWidth-8, window.innerHeight/2);
    document.getElementById("model").appendChild(renderer.domElement);

    let loader = new THREE.GLTFLoader();
    loader.load('bikeapplied.gltf', function(gltf) {
        scene.add(gltf.scene);
        renderer.render(scene, camera)
    });
}

THREE.Object3D.prototype.rotateAroundWorldAxis = function() {

    // rotate object around axis in world space (the axis passes through point)
    // axis is assumed to be normalized
    // assumes object does not have a rotated parent

    var q = new THREE.Quaternion();

    return function rotateAroundWorldAxis( point, axis, angle ) {

        q.setFromAxisAngle( axis, angle );

        this.applyQuaternion( q );

        this.position.sub( point );
        this.position.applyQuaternion( q );
        this.position.add( point );

        return this;

    }

}();

// var angle = 0;

function animate() {
    console.log('going')
    camera.rotateAroundWorldAxis(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), 0.01);
    // angle += 1;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// window.onload = function() {
//     init();
//     animate();
// };

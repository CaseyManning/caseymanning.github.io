var scene = new THREE.Scene();

var boxGeometry = new THREE.BoxGeometry(2, 2, 2);

var basicMaterial = new THREE.MeshPhongMaterial({
     color: 0x000000,
     specular: 0x555555,
     shininess: 30
});

const loader = new THREE.GLTFLoader();

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var basetree;

var isosp;

loader.load('iso4.glb', function ( gltf ) {

    isosp = gltf.scene;
    isosp.position.y = 0;

    for(var i = isosp.children.length-1; i >= 0 ; i--) {

        var face = isosp.children[i];
        var pivot = new THREE.Group();
        isosp.remove(face);
        isosp.add( pivot );
        pivot.attach(face);
        // face.scale.set(3,3,3);
    }
    isosp.scale.set(3,3,3);

    scene.add(isosp);

    renderer.render(scene, camera)
}, undefined, function ( error ) {
    console.error( error );
} );

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 10;

// const geometry = 
const material = new THREE.MeshPhongMaterial({
    color: 0x607370,
    specular: 0x555555,
    shininess: 30
   });

var light = new THREE.DirectionalLight( 0xffffff, 2 );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

scene.add(camera)

scene.background = new THREE.Color( 0xffffff );

var renderer = new THREE.WebGLRenderer({
    antialias:true
});


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);

function animate() 
{
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
	update();
}

var popTimer = 3;

var popping = [];
var popstart = {};
var amountMoved = {};
var amountRotated = {};
var originalpos = {};
var popDistance = {};

function update()
{
	var delta = clock.getDelta(); // seconds.
    var time = clock.getElapsedTime();
	var moveDistance = 20 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

	// move forwards/backwards/left/right
	if ( keyboard.pressed("W") ) {
		cubeMesh.translateZ( -moveDistance );
    }

    if(isosp) {
        isosp.rotation.x += delta/2;
        isosp.rotation.z += delta;
    }

    popTimer -= delta;
    if(popTimer <= 0 && popping.length != isosp.children.length) {
        popTimer = 2;
        var index;
        do {
            index = Math.floor(Math.random()*isosp.children.length);
        } while(popping.includes(index));
        console.log("popping " + index);
        popping.push(index);
        popstart[index] = time;
        amountMoved[index] = 0;
        amountRotated[index] = 0;
        popDistance[index] = Math.random()/2 + 0.3;
        originalpos[index] = isosp.children[i].children[0].position.clone();
    }
    var toRemove = [];
    for(var i of popping) {
        if(delta > 0) {
            var elem = isosp.children[i].children[0];
            if(amountMoved[i] < popDistance[i]) {
                var moveDistance = 1 * delta;
                elem.translateOnAxis(elem.position, moveDistance);
                amountMoved[i] += moveDistance;
            } else if(amountRotated[i] < 2*Math.PI) {
                elem.parent.rotateOnWorldAxis(new THREE.Vector3(-elem.position.y, elem.position.z, -elem.position.x).normalize(), delta)
                // rotateAboutPoint(elem, new THREE.Vector3(0,0,0), vector, delta, true);
                amountRotated[i] += delta;
            } else if(amountMoved[i] < 2*popDistance[i]) {
                var moveDistance = 1 * delta;   
                elem.translateOnAxis(elem.position, -moveDistance);
                amountMoved[i] += moveDistance;
            } else {
                // elem.translateOnAxis(elem.position, -amountMoved[i]);
                elem.position = originalpos[i];
                toRemove.push(i);
            }
        }
    }
    for(var i of toRemove) {
        popping.splice(popping.indexOf(i), 1)
        amountRotated[i] = 0
        amountMoved[i] = 0
    }
}


animate();
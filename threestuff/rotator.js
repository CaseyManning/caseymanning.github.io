import * as THREE from './three.min.js';

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

var colorPalette = [0x391463, 0x3A0842, 0xD1462F, 0x34F6F2, 0x2541B2]

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
        
        const mat = new THREE.MeshBasicMaterial({
            color: 0x000000
        });
        face.children[0].material = mat;
    }
    isosp.scale.set(3,3,3);
    isosp.rotation.x = 0.5

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

composer = new EffectComposer( renderer );

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);

controls = new OrbitControls( camera, renderer.domElement);
// controls.addEventListener( 'change', render );


function animate() 
{
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
    controls.update();
	update();
}

var popTimer = 1;

var popping = [];
var popstart = {};
var amountMoved = {};
var amountRotated = {};
var originalpos = {};
var popDistance = {};

var levels = {
    0.3: true,
    0.45: true,
    0.6: true,
    0.75 : true
};

function update()
{
	var delta = clock.getDelta(); // seconds.
    var time = clock.getElapsedTime();
	var moveDistance = 20 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

    if(isosp) {
        // isosp.rotation.x += delta/2;
        isosp.rotation.z += delta;
    }

    popTimer -= delta;
    if(popTimer <= 0 && popping.length != isosp.children.length) {
        popTimer = 2;
        var index;
        do {
            index = Math.floor(Math.random()*isosp.children.length);
        } while(popping.includes(index));

        popping.push(index);
        popstart[index] = time;
        amountMoved[index] = 0;
        amountRotated[index] = 0;

        var dist;
        var keys = Object.keys(levels);
        var isFree = false;
        for(var key of keys) {
            if(levels[key]) {
                isFree = true;
            }
        }
        if(isFree) {
            do {
                dist = keys[Math.floor(Math.random()*keys.length)];
            } while(!levels[dist]);
        
            levels[dist] = false;
        } else {
            dist = 0.9;
        }
        console.log("popping at distance: " + dist)
        popDistance[index] = dist;

        if(!originalpos[index]) {
            originalpos[index] = isosp.children[index].children[0].position.clone();
        }
        // console.log(originalpos[index])

        const mat = new THREE.MeshBasicMaterial({
            color: colorPalette[Math.floor(Math.random()*colorPalette.length)]
        });
        // isosp.children[index].children[0].children[0].material = mat;
    }
    var toRemove = [];
    for(var i of popping) {
        if(delta < 1) {
            var elem = isosp.children[i].children[0];
            if(amountMoved[i] < popDistance[i] && amountRotated[i] == 0) {
                var moveDistance = 1 * delta;
                elem.translateOnAxis(elem.position, moveDistance);
                amountMoved[i] += moveDistance;
            } else if(amountRotated[i] < 2*Math.PI) {
                elem.parent.rotateOnWorldAxis(new THREE.Vector3(-elem.position.y, elem.position.z, -elem.position.x).normalize(), delta)
                // rotateAboutPoint(elem, new THREE.Vector3(0,0,0), vector, delta, true);
                amountRotated[i] += delta;
            } else if(amountMoved[i] > 0) {
                var moveDistance = 1 * delta;   
                elem.translateOnAxis(elem.position, -moveDistance);
                amountMoved[i] -= moveDistance;
            } else {
                elem.translateOnAxis(elem.position, -amountMoved[i]);
                elem.parent.rotation.set(0,0,0);
                elem.position = originalpos[i];
                toRemove.push(i);
            }
        }
    }
    for(var i of toRemove) {
        popping.splice(popping.indexOf(i), 1)
        amountRotated[i] = 0
        amountMoved[i] = 0
        levels[popDistance[i]] = true;
    }
}


animate();
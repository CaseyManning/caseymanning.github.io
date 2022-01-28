var scene = new THREE.Scene();

var boxGeometry = new THREE.BoxGeometry(2, 2, 2);

var basicMaterial = new THREE.MeshPhongMaterial({
     color: 0x0033ff,
     specular: 0x555555,
     shininess: 30
});

const loader = new THREE.GLTFLoader();

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var basetree;

loader.load('b1.glb', function ( gltf ) {

    basetree = gltf.scene.children[0];
    basetree.position.y = -0.1;

    for(var i = 0; i < 50; i++) {
        var tree = basetree.clone();
        tree.position.set((Math.random()-0.5)*50, -0.1, (Math.random()-0.5)*50);
        tree.scale.set(1.2, 1.2, 1.2);
        tree.rotation.y = Math.random()*Math.PI*2;
        scene.add(tree);
    }

    renderer.render(scene, camera)
}, undefined, function ( error ) {
    console.error( error );
} );

loader.load('road1.glb', function ( gltf ) {

    var road = gltf.scene;
    road.position.y = 0;
    road.scale.set(4,4,4);

    scene.add(road);

    renderer.render(scene, camera)
}, undefined, function ( error ) {
    console.error( error );
} );

// var rocks = []

// loader.load('lprocks.glb', function ( gltf ) {

//     gltf.scene.position.y = 1;
//     rocks = gltf.scene.children;
    
//     for(var i = 0; i < 50; i++) {
//         var rock = rocks[Math.floor(Math.random()*rocks.length)].clone();
//         rock.position.set((Math.random()-0.5)*50, 1, (Math.random()-0.5)*50);
//         rock.scale.set(0.5, 0.5, 0.5);
//         rock.rotation.y = Math.random()*Math.PI*2;
//         scene.add(rock);
//     }
//     renderer.render(scene, camera)

// }, undefined, function ( error ) {
//     console.error( error );
// } );

var cubeMesh = new THREE.Mesh(boxGeometry, basicMaterial);
cubeMesh.position.set(0, 1, 0);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 10;
camera.position.y = 10;
camera.rotation.set(-0.75, 0, 0)

// const geometry = 
const material = new THREE.MeshPhongMaterial({
    color: 0x607370,
    specular: 0x555555,
    shininess: 30
   });
const groundPlane = new THREE.Mesh( new THREE.PlaneGeometry(100, 100), material );
groundPlane.rotation.set(-1.5707963268, 0, 0);
groundPlane.position.set(0, 0, 0);
scene.add(groundPlane);

var light = new THREE.DirectionalLight( 0xffffff, 2 );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

scene.add(camera)
scene.add(cubeMesh)
// scene.add(plane);

scene.fog = new THREE.FogExp2( 0x435259, 0.055 );
scene.background = new THREE.Color( 0x435259 );

var renderer = new THREE.WebGLRenderer({
    antialias:true
});


composer = new EffectComposer( renderer );

const ssaoPass = new SSAOPass( scene, camera, width, height );
ssaoPass.kernelRadius = 16;
composer.addPass( ssaoPass );

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);

// movement - please calibrate these values
var xSpeed = 0.3;
var ySpeed = 0.3;



function animate() 
{
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
	update();
}

function update()
{
	var delta = clock.getDelta(); // seconds.
	var moveDistance = 20 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

	// move forwards/backwards/left/right
	if ( keyboard.pressed("W") ) {
		cubeMesh.translateZ( -moveDistance );
    }
	if ( keyboard.pressed("S") ) {
        cubeMesh.translateZ(  moveDistance );
    }
	if ( keyboard.pressed("A") ) {
        cubeMesh.translateX( -moveDistance );
    }
	if ( keyboard.pressed("D") ) {
        cubeMesh.translateX(  moveDistance );	
    }

}

animate();
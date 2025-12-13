var scene = new THREE.Scene();

var basicMaterial = new THREE.MeshPhongMaterial({
     color: 0x000000,
     specular: 0x555555,
     shininess: 30
});

const loader = new THREE.GLTFLoader();

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var mixer;  // Animation mixer

var isosp;

var colorPalette = [0x391463, 0x3A0842, 0xD1462F, 0x34F6F2, 0x2541B2]

function loadShader(url) {
    return fetch(url).then(response => response.text());
}

var mouseX = 0;
var mouseY = 0;
var targetRotationX = 0;
var targetRotationY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

async function initScene() {

    const fragmentShader = await loadShader('fragment.glsl');

    // Define the shader material
    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xeeeeee) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: fragmentShader
    });

    class LineMaterial extends THREE.MeshStandardMaterial {
        constructor(options, inkColor, eye=0) {
          super(options);
      
          this.params = {
            roughness: 0.4,
            metalness: 0.1,
            scale: 0.2,
            inkColor: inkColor,
            angleStep: 4,
            angle: 8,
            thickness: 1,
            min: 0.17,
            max: 1,
            rim: 10,
            noiseScale: 0.1,
            noiseAmplitude: 0.3,
            linesNoiseScale: 5,
            linesNoiseAmplitude: 0.5,
            eye: eye,
          };
      
          this.uniforms = {
            resolution: { value: new THREE.Vector2(1, 1) },
            paperTexture: { value: null },
            angleStep: { value: this.params.angleStep },
            scale: { value: this.params.scale },
            angle: { value: this.params.angle },
            thickness: { value: this.params.thickness },
            inkColor: { value: new THREE.Color(this.params.inkColor) },
            range: { value: new THREE.Vector2(this.params.min, this.params.max) },
            rim: { value: this.params.rim },
            noiseScale: { value: this.params.noiseScale },
            noiseAmplitude: { value: this.params.noiseAmplitude },
            linesNoiseScale: { value: this.params.linesNoiseScale },
            linesNoiseAmplitude: { value: this.params.linesNoiseAmplitude },
            eye: { value: this.params.eye },
          };
      
          this.onBeforeCompile = (shader, renderer) => {
            for (const uniformName of Object.keys(this.uniforms)) {
              shader.uniforms[uniformName] = this.uniforms[uniformName];
            }
      
            shader.vertexShader = shader.vertexShader.replace(
                `#include <common>`,
                `#include <common>
                out vec2 vCoords;
                out vec3 vCameraNormal;
                out vec4 vWorldPosition;
                out vec3 vPosition;`
            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>
                vCoords = uv;
                vCameraNormal = normalMatrix * normal;
                vWorldPosition = modelViewMatrix * vec4(position, 1.);
                `
            );
            // shader.vertexShader = shader.vertexShader.replace('USE_SKINNING', 'SHADER_NAME');

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <common>`,
                /* wgsl */`#include <common>
                uniform vec2 resolution;
                uniform sampler2D paperTexture;
                uniform float scale;
                uniform vec3 inkColor;
                uniform float thickness;
                uniform vec2 range;
                uniform float angleStep;
                uniform float angle;
                uniform float rim;
                uniform float noiseScale;
                uniform float noiseAmplitude;
                uniform float linesNoiseScale;
                uniform float linesNoiseAmplitude;
                uniform float eye;
                
                in vec3 vPosition;
                in vec2 vCoords;
                in vec4 vWorldPosition;
                in vec3 vCameraNormal;
        
                #define TAU 6.28318530718
                #define PI 3.141592653589793
        
                // procedural noise from IQ
                vec2 hash( vec2 p )
                {
                  p = vec2( dot(p,vec2(127.1,311.7)),
                      dot(p,vec2(269.5,183.3)) );
                  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
                }
        
                float noise( in vec2 p )
                {
                  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
                  const float K2 = 0.211324865; // (3-sqrt(3))/6;
                  
                  vec2 i = floor( p + (p.x+p.y)*K1 );
                  
                  vec2 a = p - i + (i.x+i.y)*K2;
                  vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
                  vec2 b = a - o + K2;
                  vec2 c = a - 1.0 + 2.0*K2;
                  
                  vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
                  
                  vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
                  
                  return dot( n, vec3(70.0) );
                }
        
                float luma(vec3 color) {
                  return dot(color, vec3(0.299, 0.587, 0.114));
                }
                float luma(vec4 color) {
                  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
                }
        
                float lines( in float l, in vec2 fragCoord, in vec2 resolution, in float thickness, in float e){
                  vec2 center = vec2(resolution.x/2., resolution.y/2.);
                  vec2 uv = fragCoord.xy * resolution;
                
                  float c = (.5 + .5 * sin(uv.x*.5));
                  float f = (c+thickness)*l;
                  f = smoothstep(.5-e, .5+e, f);
                  return f;
                }
        
                float atan2(in float y, in float x){
                    bool s = (abs(x) > abs(y));
                    return mix(PI/2.0 - atan(x,y), atan(y,x), s);
                }
        
                float blendDarken(float base, float blend) {
                  return min(blend,base);
                }
                
                vec3 blendDarken(vec3 base, vec3 blend) {
                  return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
                }
                
                vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
                  return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
                }
                `
              );
              shader.fragmentShader = shader.fragmentShader.replace(
                "#include <dithering_fragment>",
                `#include <dithering_fragment>
                float l = luma(gl_FragColor.rgb);
                l = range.x + l * (range.y - range.x);
        
                vec3 n = normalize(vCameraNormal);
                float a = atan(n.y, n.x);
                a = round(a*angleStep)/angleStep;
        
                float r = max( 0., abs( dot( normalize( vNormal ), normalize( -vWorldPosition.xyz ) ) ) );
                // float de = length(vec2(dFdx(vWorldPosition.x), dFdy(vWorldPosition.y)));
                float de = .001 * length(vec2(dFdx(gl_FragCoord.x), dFdy(gl_FragCoord.y)));
                float e = .1 * de; 
                vec2 coords = scale*100.*(vWorldPosition.xy/(de*500.)) + linesNoiseAmplitude * noise(linesNoiseScale*vWorldPosition.xy);
        
                float border = pow(smoothstep(0., .25, r), rim);
                l *= border;
        
                r = smoothstep(.8, .8+e, r);
                a *= 1.-r;
        
                a += PI / 2.; 
                a += angle;
                
                float s = sin(a);
                float c = cos(a);
                mat2 rot = mat2(c, -s, s, c);
                coords = rot * coords;
        
                float line = lines(l, coords, vec2(5.), thickness + noiseAmplitude * noise(noiseScale *coords.xy), e);
        
                ivec2 size = textureSize(paperTexture, 0);
                vec4 paper = texture(paperTexture, gl_FragCoord.xy / vec2(float(size.x), float(size.y)));
                if(eye > 0.){
                    gl_FragColor.rgb = mix(vec3(178/255, 225/255, 237/255), inkColor, line);
                    return;
                }
                // if(border < 0.5) {
                //     border = 0.;
                // }
                gl_FragColor.rgb = blendDarken(blendDarken(vec3(1.), inkColor, 1.-line), vec3(border));
                // gl_FragColor.rgb = vec3(border + 0.5);
                `
              );

            //   shader.fragmentShader = shader.fragmentShader.replace('USE_SKINNING', 'PI');
          };
        }
    }
    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        skinning: true
    });

    loader.load('angel_export.glb', function ( gltf ) {

        isosp = gltf.scene;
        isosp.position.y = 0;
        isosp.scale.set(2,2,2);

        lineMaterial.skinning = true;
        console.log(lineMaterial.skinning)

        isosp.traverse((node) => {
            if (node.isMesh) {
                console.log(node.name)
                if(node.name == "eye") {
                    node.material = new LineMaterial({
                        skinning: true,
                        color: 0x555555,
                        
                    }, 0xb2e1ed , 1);
                } else {
                    node.material = new LineMaterial({
                        skinning: true,
                        color: 0xffffff,

                    }, 0xeeeeee);
                }
            }
        });
        scene.add(isosp);
        isosp.rotation.y = 0.5;

        mixer = new THREE.AnimationMixer(isosp);
        
        // Play all animations
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });

    }, undefined, function ( error ) {
        console.error( error );
    } );

    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 400);
    camera.position.z = 15;
    camera.position.y = -1;

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
    // scene.background = new THREE.Color( 0xffffff );

    var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
    });


    var scale = window.devicePixelRatio;
    renderer.setSize(window.innerWidth * scale, window.innerHeight * scale);
    renderer.render(scene, camera);

    document.body.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);

    var lastKnownScrollPosition = 0;
    var ticking = false;
    document.addEventListener("scroll", (event) => {
        lastKnownScrollPosition = window.scrollY;
      
        if (!ticking) {
          window.requestAnimationFrame(() => {
            let canvas = document.querySelector("canvas");
            canvas.style.transform = `translateY(${lastKnownScrollPosition/2}px)`;
            ticking = false;
          });
      
          ticking = true;
        }
      });

    // controls = new OrbitControls( camera, renderer.domElement);
    // controls.addEventListener( 'change', render );
    // controls.autoRotateSpeed = 0;

    function animate() 
    {
        requestAnimationFrame( animate );
        renderer.render(scene, camera);
        // controls.update();
        
        update();
    }


    function update()
    {
        var delta = clock.getDelta(); // seconds.
        var time = clock.getElapsedTime();

        //move isosp with sine wave
        
        shaderMaterial.uniforms.time.value = time;
        
        if (mixer) {
            isosp.position.y = Math.sin(mixer.time / 0.4166 + 0.21) * 0.1;
            mixer.update(delta);
        }

        if (isosp) {
            isosp.rotation.y += (0.5 + targetRotationX - isosp.rotation.y) * 0.25;
            isosp.rotation.x += (0.3 + targetRotationY - isosp.rotation.x) * 0.25;
        }
    }
    animate();
}


function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;

    targetRotationX = mouseX * 0.02;
    targetRotationY = mouseY * 0.02;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


initScene();

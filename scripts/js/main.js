var camera,scene,renderer;
var materials,meshes, geometries, textures;
var objects, light;
var mouseX = 0, mouseY = 0;
var touchX = 0, touchY = 0;
var lastMouseX = 0, lastMouseY = 0;
var lastTouchX = 0, lastTouchY = 0;
var windowHalfX, windowHalfY;
var robot;
var lastClick = 0;
var quat,qmod;
var mousePressed = false;
var cameraDeltaX = 0;
var intersects;
var raycaster;

var kb = { key : new Array()};
var ui = {
    isRotating : false,
    cameraFocusOnRobot : true,
    cameraTheta : 0,
    cameraPhi : Math.PI/5,
    lastCameraTheta : 0,
    lastCameraPhi : this.cameraPhi,
    cameraDistanceFromFocus : 80,
    firstPersonCamera : false,
    minimumDistanceFromRobot : 20,
    textureScale: 10 // 10 pixels for 1 centimeter, 1000 pixels for 1 meter
};

const dotGeometry = new THREE.Geometry();
dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
const dotMaterial = new THREE.PointsMaterial( { size: 4, sizeAttenuation: false, color: 0xff0000} );

function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;
    
    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );
    var imageData = context.getImageData( 0, 0, image.width, image.height );
    return imageData;

}


function getImageCanvas( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;
    
    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );
    return canvas;

}

init(); 
animate();

function checkFullScreen() {
    return window.innerWidth == screen.width && window.innerHeight == screen.height;
}

function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    }

    else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
    }

    else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    }

    else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

function closeFullscreen(elem) {
    //	alert("trying to close");
    if (elem.exitFullscreen) {
        elem.exitFullscreen();
    }
    else if (elem.mozCancelFullScreen) {
        /* Firefox */
        elem.mozCancelFullScreen();
    }
    else if (elem.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitExitFullscreen();
    }
    else if (elem.msExitFullscreen) {
        /* IE/Edge */
        elem.msExitFullscreen();
    }
}

var trackFilePath="";

function loadNewTrack(filePath) {
    console.log("file Path : ");
    textures.track = new THREE.TextureLoader().load( filePath );
}

function loadNewTrackFromData(canvas, width, height) {
    var size = width * height;

    textures.track = new THREE.CanvasTexture(canvas);
    meshes.planeMesh.material.map = textures.track;
    meshes.planeMesh.material.map.needsUpdate = true;
}
    
function loadNewTrackFromImage(img) {
    // backgroundData = getImageData(img);
    canvas = getImageCanvas(img);
    loadNewTrackFromData(canvas,img.width,img.height);
    setTrackScaleFromTexture(textures.track);
    console.log("loaded");
}

function setTrackScaleFromTexture(texture) {
    meshes.planeMesh.scale.set(texture.image.width/ui.textureScale,texture.image.height/ui.textureScale,1);
    console.log("scaled");
}

function insertSensors(object) {
    const robotRadius = object.radius;
    var sensorPositions = Array();
    const sensorAmplitude = Math.PI/3;
    for(var i=0; i<5;i++) {
        var ang = i*sensorAmplitude*0.25 + sensorAmplitude + Math.PI;
        var x = robotRadius*Math.cos(ang);
        var y = robotRadius*Math.sin(ang);
        sensorPositions.push([x, y]);

        var sensor = new THREE.Points( dotGeometry, dotMaterial);
        sensor.position.x = x;
        sensor.position.y = y;
        sensor.position.z = 3;
        sensor.name = "sensor_" + i;
        object.add( sensor );
    }
}

function getSensorsPositions(object) {
    for (var i=0;i<5;i++) {
        object = robot.getChildByName("sensor_"+i);
        object.updateMatrixWorld();
    }
}

function readSensors(sensorsPositions) {
    var tempSensor = 0;
    var sum = 0;
    for (var i=0; i<5; i++) {
        // pololu3piSensors[i] = backgroundData.data[(tempy*735+tempx)*4];
        pololu3piSensors[i] = (i == 1 | i == 2 ? 0 : 1); 
        tempSensor += (pololu3piSensors[i]/255.0)*(i+1)*1000;
        sum += pololu3piSensors[i]/255.0;
      }
    
      tempSensor /= sum;
    
      //console.log(tempSensor);
    
      pololu3piSensorsResult = tempSensor;
}

function init() {

    simulationScreen = document.getElementById("simulationScreen");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFFFF);
    // instantiate a loader
    var loader = new THREE.OBJLoader();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000000);
    camera.position.z = 10000;
    camera.up = new THREE.Vector3(0,0,1);

    textures = {
        bg 			: new THREE.TextureLoader().load( 'assets/img/bg.jpg' ),
        // track 	: new THREE.TextureLoader().load( 'assets/img/7pixels.png', function(texture) {geometries.plane = new THREE.PlaneGeometry(texture.image.width,texture.image.height); geometries.plane.needsUpdate=true;} ),
        track 	: new THREE.TextureLoader().load( 'assets/img/3cm.png', setTrackScaleFromTexture ),
        einstein 	: new THREE.TextureLoader().load( 'assets/img/einstein.jpg' )
    };
    
    geometries = {
        box 		: new THREE.BoxGeometry(10, 10, 10),
        plane 		: new THREE.PlaneGeometry(1,1)
    };


    materials = { 
        track 	: new THREE.MeshBasicMaterial({
                                map:textures.track,
                                side : THREE.DoubleSide
                            }),
        einstein 	: new THREE.MeshBasicMaterial({
                                map:textures.einstein,
                                side : THREE.DoubleSide
                            }),
        wired 		: new THREE.MeshBasicMaterial({
                                color: 0xff0000,
                                wireframe: true,
                            })
    };

    meshes = {
        box 		: new THREE.Mesh(geometries.box, materials.wired),
        planeMesh 	: new THREE.Mesh(geometries.plane, materials.track)
    };

    meshes.planeMesh.rotation.x = Math.PI;
    meshes.planeMesh.name = "plane";

    meshes.box.visible = false;

    scene.add(meshes.box);
    scene.add(meshes.planeMesh);

    light = new THREE.DirectionalLight( 0xffffff, 1, 10000 );
    light.position.set( 50, 50, 1000 );
    scene.add( light );

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
        }
    };
    var onError = function () { };

    var objFolder = 'p3pi';
    var objFileName = 'p3pi3';

    

    new THREE.MTLLoader()
        .setPath( 'assets/models/'+objFolder+'/' )
        .load( objFileName+'.mtl', function ( materials ) {
            materials.preload();
            new THREE.OBJLoader()
                .setMaterials( materials )
                .setPath( 'assets/models/'+objFolder+'/' )
                .load( objFileName + '.obj', function ( object ) {
                    robot = object;
                    robot.rotation.z = Math.PI;
                    robot.scale.x = robot.scale.y = robot.scale.z = 1;
                    robot.position.x = robot.position.y = robot.position.z = 0;
                    robot.da = robot.dx = robot.dy = 0;
                    robot.speedFactor = 0;
                    robot.walkSpeed = 1;
                    robot.linearFriction = 0.7;
                    robot.name = "robot";
                    robot.diameter = 9.5;
                    robot.radius = robot.diameter*0.5;
                    insertSensors(robot);
                    scene.add( object );
                }, onProgress, onError );
        } );

    


    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.domElement.id = "scene";
    simulationScreen.appendChild(renderer.domElement);
    renderer.domElement.style.position = "relative";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    console.log("renderer :  " + simulationScreen.offsetWidth + " " + simulationScreen.offsetHeight);
    renderer.setSize(simulationScreen.offsetWidth, simulationScreen.offsetHeight);
    windowHalfX = simulationScreen.offsetWidth / 2;
        windowHalfY = simulationScreen.offsetHeight / 2;
    camera.updateProjectionMatrix();

    renderer.domElement.ondblclick = function() {
        if (checkFullScreen()) {
            closeFullscreen(document);
        }
        else {
            openFullscreen(simulationScreen);
        }
    };

    renderer.domElement.onclick = function () {
        if (Math.abs(lastMouseX - mouseX) < 0.000001 ||
            Math.abs(lastTouchX - touchX) < 2) {
            var actualClick = performance.now();
            if (actualClick - lastClick > 3000) {
                lastClick = actualClick;
            } else if (actualClick - lastClick < 1000) {
                lastClick = 0;
                renderer.domElement.ondblclick();
            } else lastClick = actualClick;
        }
    }
    renderer.domElement.onmousedown = function() {
        event.preventDefault();
        mousePressed = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        ui.isRotating = true;
    }
    renderer.domElement.ontouchstart = function() {
        event.preventDefault();
        mousePressed = true;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        lastTouchX = touchX;
        lastTouchY = touchY;
        ui.isRotating = true;
    }
    renderer.domElement.ontouchend = renderer.domElement.onmouseup = function() {
        event.preventDefault();
        mousePressed = false;
        ui.isRotating = false;
    }

    renderer.domElement.onwheel = function(e) {
        e.preventDefault();
        if (e.deltaY > 0) {
            ui.cameraDistanceFromFocus *= 1. + Math.min((e.deltaY*0.001),1);
            ui.cameraDistanceFromFocus = Math.max(ui.cameraDistanceFromFocus,ui.minimumDistanceFromRobot);
        } else {
            ui.cameraDistanceFromFocus *= 1. + Math.max((e.deltaY*0.001),-0.9);
            ui.cameraDistanceFromFocus = Math.max(ui.cameraDistanceFromFocus,ui.minimumDistanceFromRobot);
        }
    }

}


  function simulateAndShow() {
    console.log("simulateAndShow");
    simulate();
    // drawImageCenter(mini3pi, sim3pi.x, sim3pi.y, sim3pi.rotation);
    //readPixel(sim3pi.x, sim3pi.y, sim3pi.rotation+3.14/2);
    // const sensorPositions = getSensorsPositions(robot);
    // readSensors(sensorPositions);
  
    if(paused == false) {
      var vc2 = jscpp["debugger"].setVariable("robot");
      vc2["robot"].v.members.sensorValues.v = pololu3piSensorsResult;
    }
  
    setTimeout(simulateAndShow, 50);
  }

function animate() {
    requestAnimationFrame(animate);
    readKeys();
    simulate();
    render();
}

function readKeys() {
    if (robot) {
        if(kb.key['w']) {
            robot.speedFactor = 1;
        }
        if(kb.key['s']) {
            robot.speedFactor = -1;
        }
        if(kb.key['a']) {
            robot.da += 0.01;
        }
        if(kb.key['d']) {
            robot.da -= 0.01;
        }

    }
    if (camera) {
        if (kb.key['e']) ui.cameraTheta += 0.1;
        if (kb.key['q']) ui.cameraTheta -= 0.1;
    }
}

function render() {
    if (robot) {
        if (ui.firstPersonCamera) {
            camera.position.x = robot.position.x;
            camera.position.y = robot.position.y;
            camera.position.z = robot.position.z + 10;

            var rot = robot.rotation.z - Math.PI*0.5;

            camera.lookAt(robot.position.x + Math.cos(rot)*50,robot.position.y + Math.sin(rot)*50,0);

        } else {
            camera.position.x = robot.position.x + ui.cameraDistanceFromFocus*Math.sin(ui.cameraTheta)*Math.cos(ui.cameraPhi);
            camera.position.y = robot.position.y - ui.cameraDistanceFromFocus*Math.cos(ui.cameraTheta)*Math.cos(ui.cameraPhi);
            camera.position.z = robot.position.z + ui.cameraDistanceFromFocus*Math.sin(ui.cameraPhi);

            camera.lookAt(robot.position.x,robot.position.y,robot.position.z);
        }

    } else {
        camera.lookAt(0,0,0);
    }
    qmod = new THREE.Quaternion(0,0,0,1);


    camera.updateProjectionMatrix();


    if (kb.key['v'] || kb.key['b']) {
        meshes.box.visible = true;
        raycaster = new THREE.Raycaster();
        // update the picking ray with the camera and mouse position
        var mouse = new THREE.Vector2(mouseX, -mouseY);
        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        intersects = raycaster.intersectObjects( scene.children );
        meshes.box.rotation.z = 0;

        for ( var i = 0; i < intersects.length; i++ ) {

            if (intersects[i].object.name == "plane") {
                meshes.box.position.x = intersects[i].point.x;
                meshes.box.position.y = intersects[i].point.y;
                meshes.box.position.z = intersects[i].point.z;
                if (!kb.key['b']) {
                    meshes.box.material.color.set( 0xff0000 );
                } else if (!kb.key['v']) {
                    meshes.box.material.color.set( 0xff0000 );
                    robot.rotation.z =  Math.atan2(meshes.box.position.y-robot.position.y,meshes.box.position.x-robot.position.x) + Math.PI*0.5;
                    meshes.box.rotation.z = robot.rotation.z;
                }
            }

        }
    }


    renderer.render(scene, camera);

}

document.body.onresize = function() {
    renderer.setSize(simulationScreen.offsetWidth, simulationScreen.offsetHeight);
    camera.aspect = simulationScreen.offsetWidth / simulationScreen.offsetHeight;
    windowHalfX = simulationScreen.offsetWidth / 2;
        windowHalfY = simulationScreen.offsetHeight / 2;
    console.log("renderer " + simulationScreen.offsetWidth + "x" + simulationScreen.offsetHeight);
    camera.updateProjectionMatrix();
};

window.addEventListener("keydown", keyDownListener, true);
window.addEventListener("keyup", keyUpListener, false);
simulationScreen.addEventListener("mouseover",function() {simulationScreen.isMouseOver = true;});
simulationScreen.addEventListener("mouseout",function() {simulationScreen.isMouseOver = false;});

function keyDownListener(e) {
    if (simulationScreen.isMouseOver) {
        kb.key[e.key] = true;
    }
}
function keyUpListener(e) {
    if(kb.key['c']) {
        ui.firstPersonCamera = !ui.firstPersonCamera;
    }
    if (kb.key['v']) {
        robot.position.x = meshes.box.position.x;
        robot.position.y = meshes.box.position.y;
        meshes.box.visible = false;
    } else if (kb.key['b']) {
        meshes.box.visible = false;
    }
    kb.key[e.key] = false;
}

renderer.domElement.addEventListener("mousemove", mouseMove, false);
renderer.domElement.addEventListener("touchmove", touchMove, false);

function mouseMove(event) {
    mouseX = (event.layerX - windowHalfX) / windowHalfX;
        mouseY = (event.layerY - windowHalfY) / windowHalfY;
    
    if (ui.cameraFocusOnRobot) {
        if (!ui.firstPersonCamera) {
                if (ui.isRotating) {
                ui.cameraTheta = ui.lastCameraTheta + Math.PI*(lastMouseX - mouseX);
                ui.cameraPhi = ui.lastCameraPhi + Math.PI*(mouseY - lastMouseY)*0.5;
                ui.cameraPhi = Math.min(Math.PI*0.5,ui.cameraPhi);
                ui.cameraPhi = Math.max(-Math.PI*0.5,ui.cameraPhi);
            } else {
                ui.lastCameraTheta = ui.cameraTheta;
                ui.lastCameraPhi = ui.cameraPhi;
            }
        }
    }
}

function touchMove(event) {
    event.preventDefault();
    mouseX = (event.touches[0].layerX - windowHalfX) / windowHalfX;
        mouseY = (event.touches[0].layerY - windowHalfY) / windowHalfY;
        touchX = mouseX;
        touchY = mouseY;
    
    if (ui.cameraFocusOnRobot) {
            if (ui.isRotating) {
            ui.cameraTheta = ui.lastCameraTheta + Math.PI*(lastTouchX - touchX);
            ui.cameraPhi = ui.lastCameraPhi + Math.PI*(touchY - lastTouchY)*0.5;
            ui.cameraPhi = Math.max(0.001,ui.cameraPhi);
        } else {
            ui.lastCameraTheta = ui.cameraTheta;
            ui.lastCameraPhi = ui.cameraPhi;
        }
    }
}

function simulate() {
    if(paused == true) {
        if (robot) {
            robotAngle = robot.rotation.z - Math.PI/2;
            robot.dx += Math.cos(robotAngle)*robot.walkSpeed*robot.speedFactor;
            robot.dy += Math.sin(robotAngle)*robot.walkSpeed*robot.speedFactor;
            robot.speedFactor = 0;
            robot.dx *= 1-robot.linearFriction;
            robot.dy *= 1-robot.linearFriction;

            robot.rotation.z += robot.da;
            robot.da *= 1-robot.linearFriction;
            robot.position.x += robot.dx;
            robot.position.y += robot.dy;
        }
        return;
    }
    if (robot) {
        // // get robot angle for force direction estimation
        

        console.log("simulate");
        // var x = sim3pi.x;
        // var y = sim3pi.y;
        // var theta = sim3pi.rotation;
    
        var x = robot.position.x;
        var y = robot.position.y;
        var theta = robot.rotation.z;
    
        var dt = 0.01;
    
        var vc = jscpp["debugger"].setVariable("OrangutanMotors");
        var vleft = -vc["OrangutanMotors"].v.members.vleft.v;
        var vright = -vc["OrangutanMotors"].v.members.vright.v;
    
        if (Math.abs(vright) <= 10.9 / 2.9) {
        vright = 0;
        }
        else if (vright > 0) {
        vright = vright * 2.9 - 10.9;
        }
        else {
        vright = vright * 2.9 + 10.9;
        }
    
        if (Math.abs(vleft) < 10.9 / 2.9) {
        vleft = 0;
        }
        else if (vleft > 0) {
        vleft = vleft * 2.9 - 10.9;
        }
        else {
        vleft = vleft * 2.9 + 10.9;
        }
    
        var diameter = 95;
    
        var v = -(vleft + vright) / 2; // x velocity
        var w = (vright - vleft) / diameter; // angular velocity
        var newTheta = theta + w * dt;
        
        // sim3pi.x = x + dt * v * Math.cos(newTheta);
        // sim3pi.y = y + dt * v * Math.sin(newTheta);
        // sim3pi.rotation = theta + dt * w;
    
        robot.position.x = x + dt * v * Math.cos(newTheta);
        robot.position.y = y + dt * v * Math.sin(newTheta);
        robot.rotation.z = theta + dt * w;
        
    }
}

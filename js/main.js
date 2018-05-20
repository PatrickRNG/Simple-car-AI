let counter = 0;
let pos = 0;

// class ObjectScene {
//   constructor(element, pos, posX, posY) {
//     this.element = element;
//     this.pos = pos;
//     this.posX = posX;
//     this.posY = posY;
//     this.height = this.element.clientHeight;
//     this.width = this.element.clientWidth;

//     this.resetPos = () => {
//       this.element.style.left = 'unset';
//       this.element.style.right = '0px';
//       this.posX = this.posX;
//       this.posY = this.posY;
//       this.pos = 0;
//     }
//   }
// }

class Points {
  constructor() {
    this.walls = 0;
    this.avoided = 0;
    this.crash = 0;
  }
}

class ObjectScene {
  constructor(element) {
    this.element = element;
    this.posX = this.element.offsetLeft;
    this.posY = this.element.offsetTop;
    this.elH = this.element.clientHeight;
    this.elW = this.element.clientWidth;
  }
}

// Debug table 1
const debugTb = {
  aiZone: document.getElementById('t_ai_zone'),
  wallzone: document.getElementById('t_wall_zone'),
  expSuccess: document.getElementById('t_exp_success'),
  expSugestion: document.getElementById('t_exp_sugestion'),
  trying: document.getElementById('t_trying')
}

const points = new Points();

function incrementCounter() {
  counter++;
  document.getElementById('stepsDone').value = counter;
  moveWall(); // Move wall to the left
  checkCollision();
  experience();
}

let tickInterval;

// If state = 1, start simulation, else stop
function runSimulation(state) {
  let ai = new ObjectScene(document.getElementById('ai'));
  let wall = new ObjectScene(document.getElementById('wall'));

  if (state == 1) {
    if (counter > 100) {
      runSimulation(0);
    } else {
      tickInterval = setInterval("incrementCounter();", 20);
    }

  } else {
    clearInterval(tickInterval);
    counter = 0;
    document.getElementById('stepsDone').value = counter;
    ai.element.style.top = '50px';
    wall.element.style.left = 'unset';
    wall.element.style.right = '0px';
    points.avoided = 0;
    points.walls = 0;
    points.crash = 0;
  }

}

const startBtn = document.getElementById('startSimulation');
const stopBtn = document.getElementById('stopSimulation');

startBtn.addEventListener('click', function () {
  runSimulation(1);
});

stopBtn.addEventListener('click', function () {
  runSimulation(0);
});

function moveWall() {
  let wall = new ObjectScene(document.getElementById('wall'));
  let ai = new ObjectScene(document.getElementById('ai'));

  let sucessRate = Math.floor(points.avoided / (points.avoided + points.crash) * 100);

  let road = document.getElementById('road');

  const debugTopArea = document.getElementById('debugTop');

  // debugTextArea.textContent += `[${counter}] Wall PosX: ${wall.posX} | Wall PosY: ${wall.posY}\n`;
  debugTopArea.innerHTML =
    `[${counter}]
   Wall (${wall.posX}, ${wall.posY})<br>
   AI (${ai.posX}, ${ai.posY})<br>
   Walls: ${points.walls}, Avoided: ${points.avoided}, Crash: ${points.crash}<br>
   Success Rate: ${sucessRate}`;


  // If it moves all the way to the left
  if (wall.posX <= 0) {
    points.walls++;
  } else {
    wall.posX -= 20;
    wall.element.style.left = `${wall.posX}px`;
  }

}

function moveCar(direction) {
  let ai = new ObjectScene(document.getElementById('ai'));

  if (pos < ai.elH) {
    pos = ai.elH;
  }
  if (pos > road.clientHeight - 100) {
    pos = road.clientHeight - 100;
  }

  if (direction == 'down') {
    pos += 10;
  } else {
    pos -= 10;
  }

  ai.element.style.top = `${pos}px`;

}

let collision = false;

function checkCollision() {
  let sensor2 = new ObjectScene(document.getElementById('sensor_2'));
  let wall = new ObjectScene(document.getElementById('wall'));
  let ai = new ObjectScene(document.getElementById('ai'));

  if (wall.posX < ai.posX + sensor2.elW &&
    ai.posY >= wall.posY &&
    ai.posY < wall.posY + wall.elH ||
    wall.posX < ai.posX + sensor2.elW &&
    wall.posY > ai.posY &&
    wall.posY < ai.posY + ai.elH) {

    sensor2.element.style.backgroundColor = 'red';
    collision = true;

  } else {
    sensor2.element.style.backgroundColor = 'white';
    collision = false;

  }
}

let lastWallCount = 0;
let lastAvoided = 0;
let lastCrash = 0;
let tryZone = 0;

function experience() {
  let wall = new ObjectScene(document.getElementById('wall'));
  let ai = new ObjectScene(document.getElementById('ai'));

  let aiZone;
  let wallZone;

  // -100px from grass and -50px from half the wall
  let getWallCenter = (wall.posY - 100) + 50;

  //get AI and Wall zones  
  if (getWallCenter <= 150) {
    // Zone 0
    debugTb.wallzone.textContent = '0';
    wallZone = '0';
  } else {
    // Zone 1
    debugTb.wallzone.textContent = '1';
    wallZone = '1';
  }

  // -100px from grass and +25 from half the Car
  let getAICenter = (ai.posY - 100) + 25;

  if (getAICenter <= 150) {
    // Zone 0
    debugTb.aiZone.textContent = '0';
    aiZone = '0';
  } else {
    // Zone 1
    debugTb.aiZone.textContent = '1';
    aiZone = '1';
  }

  // Trying
  if (lastWallCount != points.walls) {
    tryZone = Math.floor(Math.random() * 2);
  }

  debugTb.trying.textContent = tryZone;

  let buildVar = aiZone + wallZone + tryZone;
  let experienceDB = document.getElementById(`succ_${buildVar}`);

  // Decide based on table (database)

  if (tryZone == 0) {
    let buildVarAI = aiZone + wallZone + 1;
    let experienceDBAI = document.getElementById(`succ_${buildVarAI}`);
    if (parseInt(experienceDBAI.textContent) > parseInt(experienceDB.textContent) + parseInt(10)) {
      buildVar = buildVarAI;
      tryZone = 1;
    } else {
      moveCar('up');
    }

  }

  if (tryZone == 1) {
    let buildVarAI = aiZone + wallZone + 0;
    let experienceDBAI = document.getElementById(`succ_${buildVarAI}`);
    if (parseInt(experienceDBAI.textContent) > parseInt(experienceDB.textContent) + parseInt(10)) {
      buildVar = buildVarAI;
      tryZone = 0;
    } else {
      moveCar('down');
    }
  }


  // Update when the wall hit left side
  if (lastWallCount != points.walls) {
    lastWallCount = points.walls;

    if (collision == true) {
      experienceDB.textContent = parseInt(experienceDB.textContent) - parseInt(1);
      points.crash++;
    } else {
      experienceDB.textContent = parseInt(experienceDB.textContent) + parseInt(1);
      points.avoided++;
    }

    let randomWallPos = Math.floor(Math.random() * (road.clientHeight - 100) + 1);
    wall.element.style.top = `${randomWallPos}px`;
    wall.element.style.left = 'unset';
    wall.element.style.right = '0px';
  }
}
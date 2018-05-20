let counter = 0;

class ObjectScene {
  constructor(element) {
    this.element = element;
    this.posX = this.element.offsetLeft;
    this.posY = this.element.offsetTop;
    this.height = this.element.clientHeight;
    this.width = this.element.clientWidth;

    this.resetPos = () => {
      this.element.style.left = 'unset';
      this.element.style.right = '0px';
      this.posX = this.element.offsetLeft;
      this.posY = this.element.offsetTop;
    }
  }
}

class Points {
  constructor() {
    this.walls = 0;
    this.avoided = 0;
    this.crash = 0;
  }
}

const wall = new ObjectScene(document.getElementById('wall'));
const sensor2 = new ObjectScene(document.getElementById('sensor_2'));
const ai = new ObjectScene(document.getElementById('ai'));

const points = new Points();

function incrementCounter() {
  counter++;
  document.getElementById('stepsDone').value = counter;
  moveWall(); // Move wall to the left
  checkCollision();
}

let tickInterval;

// If state = 1, start simulation, else stop
function runSimulation(state) {
  
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
    wall.resetPos();
    points.avoided = 0;
    points.walls = 0;
    points.crash = 0;
  }

}

const startBtn = document.getElementById('startSimulation');
const stopBtn = document.getElementById('stopSimulation');

startBtn.addEventListener('click', function() {
  runSimulation(1);
});

stopBtn.addEventListener('click', function() {
  runSimulation(0);
});

function moveWall() {
  let sucessRate = Math.floor(points.avoided/(points.avoided + points.crash)*100);

  let road = document.getElementById('road');

  const debugTextArea = document.getElementById('debugTextArea');
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
    let randomWallPos = Math.floor(Math.random() * (road.clientHeight - 90) + 1);
    wall.element.style.top = `${randomWallPos}px`;
    wall.resetPos();
    points.walls++;
  } else {
    wall.posX -= 20;
    wall.element.style.left = `${wall.posX}px`;
  }

}

function moveCar(direction) {
  let road = document.getElementById('road');

  if (ai.posX < 0) {
    ai.posX = 0;
  }

  if (ai.posX < ai.height) {
    ai.posX = ai.height;
  }
  if (ai.posX > road.clientHeight - 50) {
    ai.posX = road.clientHeight - 50;
  }

  if (direction == 'down') {
    ai.posX += 10;
    ai.posY += 10;
  } else {
    ai.posX -= 10;
    ai.posY -= 10;
  }

  ai.element.style.top = `${ai.posX}px`;

}

function checkCollision() {

      
  if(wall.posX < ai.posX+sensor2.width
    && ai.posY >= wall.posY
    && ai.posY < wall.posY+wall.height
    || wall.posX < ai.posX+sensor2.width
    && wall.posY > ai.posY
    && wall.posY < ai.posY+ai.height) {
    moveCar('down');
    sensor2.element.style.backgroundColor = 'red';

    if (wall.posX < 100) {points.crash++}
  } else {
    sensor2.element.style.backgroundColor = 'white';

    if (wall.posX < 100) {points.avoided++}
  }
}

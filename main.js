const body = document.getElementsByTagName("body")[0];
const canvas = document.getElementById("canvas-main-id");
const canvasBg = document.getElementById("canvas-bg-id");
const canvasWrapper = document.getElementById("wrapper");
const closeSettingsBtn = document.getElementById("close-settings");
const openSettingsBtn = document.getElementById("open-settings");
const overCanvas = document.getElementById("over-canvas-id");
const settings = document.getElementById("settings-id");
const screen = document.getElementById("screen-id");
const msgEl = document.getElementById("screen-msg-id");

//touch control elements (also body, msgEl)
const touchControlsBox = document.getElementsByClassName("touch-controls")[0];
const touchControls = Array.from(document.getElementsByClassName("touch"));
const touchDirControls = Array.from(document.getElementsByClassName("dir"));
const touchHiddenInGame = Array.from(
  document.getElementsByClassName("touch-hidden-in-game")
);
//settings elements
const gridOnOffBtn = document.getElementById("grid-on-off");
const gridToggler = document.getElementById("grid-toggler");
const soundOnOffBtn = document.getElementById("sound-on-off");
const soundToggler = document.getElementById("sound-toggler");
const borderOnOffBtn = document.getElementById("border-on-off");
const borderToggler = document.getElementById("border-toggler");
const saveOnOffBtn = document.getElementById("save-on-off");
const saveToggler = document.getElementById("save-toggler");
const speedSelect = document.getElementById("set-speed");

//display elementes
const speedOptions = document.getElementsByTagName("option");
const scoreDisp = document.getElementById("score-display");
const lengthDisp = document.getElementById("length-display");
const recordDisp = document.getElementById("record-display");
const speedDisp = document.getElementById("speed-display");

//resources
const rabbitImg = document.getElementById("rabbit_img");
const mouseImg = document.getElementById("mouse_img");
const bloodImg = document.getElementById("blood_img");

let musicSound = new Sound("resources/sounds/disco.mp3", 0.1, true); //src, volume, loop
let deathSound = new Sound("resources/sounds/death_sound.mp3");
let rabbitSound = new Sound("resources/sounds/eat_rabbit_sound.mp3");
let mouseSoundsArr = [
  new Sound("resources/sounds/eat_mouse_sound.mp3"),
  new Sound("resources/sounds/eat_mouse_sound.mp3"),
];
let mouseSound = (function (i) {
  //closure to toggle between sounds (to play sound in case two mouses eaten one after another)
  return function () {
    i = i ? 0 : 1;
    return mouseSoundsArr[i];
  };
})(0);
function initSounds() {
  musicSound.init();
  deathSound.init();
  mouseSoundsArr[0].init();
  mouseSoundsArr[1].init();
  rabbitSound.init();
}

let touch = false;
let initialMsg = function () {
  if (!touch) {
    return `Press ENTER to start

  To Pause press SPACE BAR

  Move with ARROW keys
  or H, J, K, L
    (VIM style)`;
  } else {
    return `Tap THERE to START
    To PAUSE tap
    outside game box`;
  }
};
let pauseMsg = function () {
  if (!touch) {
    return `PAUSED

  Press SPACE BAR to play`;
  } else {
    return `PAUSED

    Tap outside game box to PLAY`;
  }
};
let gameOverMsg = function () {
  if (!touch) {
    return `GAME OVER

  Press ENTER to play again.`;
  } else {
    return `GAME OVER
    
    Tap THERE to play again.`;
  }
};

let gameOverRecordMsg = function () {
  if (!touch) {
    return `CONGRATULATIONS!

  You have reached new RECORD:
    ${record}
  
  Press ENTER to play again.`;
  } else {
    return `CONGRATULATIONS!

  You have reached new RECORD:
   ${record}
    
  Tap THERE to play again.`;
  }
};

const stepsCount = 15;
const c = canvas.getContext("2d");
const cBg = canvasBg.getContext("2d");
const gridColor = "rgb(56, 56, 56)";
const borderColor = "rgb(125, 249, 255)";
const snakeColor = "rgba(0, 0, 0, 0.7)";
const rabbitDelayMin = 10; //steps
const rabbitDelayMax = 50; //steps
const rabbitLifeSpanMin = 10;
const rabbitLifeSpanMax = 80;

//main game variables
let userActive = false;
let snake;
let mouse;
let rabbit = null;
let rabbitBornDelay;
let wW; //windowWidth
let canvasSize;
let step;
let resizeTimeout = null;
let gameIntervalID;
let msg = initialMsg();
let isPlaying = false;
let isPaused = false;
let isDead = true; //there is no snake yet
let score = 0;
let showLinksId = null;

///settings variables
let isSaveOn = Number(localStorage.getItem("save")) || 0;
let isGrid = Number(localStorage.getItem("grid")) || 0;
let isBorder = Number(localStorage.getItem("border")) || 0;
let speed = Number(localStorage.getItem("speed")) || 4; //steps per second
let isSound = Number(localStorage.getItem("sound")) || 0;
let record = Number(localStorage.getItem("record")) || 0;
isSaveOn && saveToggler.classList.toggle("on");
isGrid && gridToggler.classList.toggle("on");
isBorder && borderToggler.classList.toggle("on");
isSound && soundToggler.classList.toggle("on");
speedOptions[speed - 1].selected = "selected";
showInitialStatus();

//////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////
resizeCanvas();
applyBorder();
applyGrid();
outOfGameSetup();
gridOnOffBtn.addEventListener("click", toggleGrid);
borderOnOffBtn.addEventListener("click", toggleBorder);
saveOnOffBtn.addEventListener("click", toggleSave);
soundOnOffBtn.addEventListener("click", toggleSound);
speedSelect.addEventListener("change", setSpeed);
window.addEventListener("keydown", control);
msgEl.addEventListener("touchend", firstTouch);
function firstTouch(e) {
  e.preventDefault();
  touch = true;
  msgEl.removeEventListener("touchend", firstTouch);
  window.removeEventListener("keydown", control);
  msgEl.textContent = initialMsg();
  touchControls.forEach((el) => el.addEventListener("touchstart", control));
}

function newGame() {
  if (touch) {
    clearTimeout(showLinksId);
  }
  rabbitBornDelay = randomBetween(rabbitDelayMin, rabbitDelayMax);
  clearInterval(gameIntervalID);
  gameSetup();
  showInitialStatus();
  c.clearRect(0, 0, canvasSize, canvasSize);
  snake = new Snake();
  mouse = new Mouse(getRandomEmptyCell());
  gameIntervalID = setInterval(update, 1000 / snake.speed);
}
function update() {
  deathAngel();
  snake.move();
  adjustStatus();
  makeRabbitWithDelay();
}
function makeRabbitWithDelay() {
  if (rabbitBornDelay === 0 && mouse) {
    //don't show on same location
    rabbit = new Rabbit(getRandomEmptyCell());
    rabbitBornDelay = null;
  } else if (rabbitBornDelay > 0) {
    rabbitBornDelay--;
  }
}

function pauseUnpause() {
  if (isDead) {
    return;
  }
  if (!isPaused) {
    clearInterval(gameIntervalID);
    isPaused = true;
    msg = pauseMsg();
    outOfGameSetup();
  } else {
    gameIntervalID = setInterval(update, 1000 / snake.speed);
    isPaused = false;
    msg = pauseMsg();
    gameSetup();
  }
}
function control(evt) {
  if (!userActive) {
    userActive = true;
    initSounds();
  }

  let controlCode;
  if (!touch) {
    controlCode = evt.code;
  } else {
    controlCode = evt.target.dataset.control;
    if (controlCode.includes("Arrow")) {
      evt.preventDefault(); // to prevent delay
    }
  }
  switch (controlCode) {
    case "Enter":
      if (isDead) {
        newGame();
      }
      break;
    case "ArrowUp":
    case "KeyK":
      if (!snake.dirY) {
        snake.getNewHeadPosition = snake.headUp;
      }
      break;
    case "ArrowDown":
    case "KeyJ":
      if (!snake.dirY) {
        snake.getNewHeadPosition = snake.headDown;
      }
      break;
    case "ArrowLeft":
    case "KeyH":
      if (!snake.dirX) {
        snake.getNewHeadPosition = snake.headLeft;
      }
      break;
    case "ArrowRight":
    case "KeyL":
      if (!snake.dirX) {
        snake.getNewHeadPosition = snake.headRight;
      }
      break;
    case "Space":
      if (!isDead) {
        pauseUnpause();
      }
      break;
  }
}
function showInitialStatus() {
  speedDisp.textContent = speed;
  recordDisp.textContent = record;
  lengthDisp.textContent = length;
  scoreDisp.textContent = score;
}
function adjustStatus() {
  speedDisp.textContent = snake.speed;
  lengthDisp.textContent = snake.body.length;
  scoreDisp.textContent = snake.score;
}
function gameSetup() {
  if (isSound) {
    musicSound.play();
  }
  window.removeEventListener("resize", resizeOptimally);
  openSettingsBtn.style.display = "none";
  settings.style.display = "none";
  overCanvas.style.display = "none";
  if (touch) {
    touchHiddenInGame.forEach((el) => (el.style.display = "none"));
    touchControlsBox.style.display = "flex";
  }
}
function outOfGameSetup() {
  if (isSound) {
    musicSound.stop();
  }
  if (!isPaused) {
    openSettingsBtn.style.display = "block";
  }

  settings.style.display = "none";
  window.addEventListener("resize", resizeOptimally);
  overCanvas.style.display = "flex";
  screen.style.display = "flex";
  msgEl.textContent = msg;
  isSound && musicSound.stop();
  if (touch && isDead) {
    touchControlsBox.style.display = "none";
    showLinksId = setTimeout(function () {
      //timeout to prevent accidentally pressing links
      touchHiddenInGame.forEach((el) => (el.style.display = "flex"));
    }, 1500);
  }
}
closeSettingsBtn.addEventListener("click", function () {
  settings.style.display = "none";
  screen.style.display = "block";
});

openSettingsBtn.addEventListener("click", function () {
  overCanvas.style.display = "flex";
  settings.style.display = "flex";
  screen.style.display = "none";
});

function setSpeed() {
  speed = Number(speedSelect.value);
  localStorage.getItem("save") && localStorage.setItem("speed", speed);
  speedDisp.textContent = speed;
}
function toggleSave() {
  if (isSaveOn) {
    isSaveOn = 0;
    localStorage.clear();
  } else {
    isSaveOn = 1;
    localStorage.setItem("save", isSaveOn);
    localStorage.setItem("grid", isGrid);
    localStorage.setItem("border", isBorder);
    localStorage.setItem("sound", isSound);
    localStorage.setItem("speed", speed);
  }
  saveToggler.classList.toggle("on");
}
function toggleGrid() {
  if (isGrid) {
    isGrid = 0;
    localStorage.getItem("grid") && localStorage.setItem("grid", "0");
  } else {
    isGrid = 1;
    localStorage.getItem("grid") && localStorage.setItem("grid", "1");
  }
  gridToggler.classList.toggle("on");

  applyGrid();
}
function toggleBorder() {
  if (isBorder) {
    isBorder = 0;
    localStorage.getItem("border") && localStorage.setItem("border", "0");
  } else {
    isBorder = 1;
    localStorage.getItem("border") && localStorage.setItem("border", "1");
  }
  borderToggler.classList.toggle("on");

  applyBorder();
}
function toggleSound() {
  if (isSound) {
    isSound = 0;
    localStorage.getItem("sound") && localStorage.setItem("sound", "0");
  } else {
    isSound = 1;
    localStorage.getItem("sound") && localStorage.setItem("sound", "1");
  }
  soundToggler.classList.toggle("on");
}
/////// drawing functions

function drawGrid() {
  let lineWidth = 1;
  if (isGrid) {
    for (let n = step; n <= canvasSize - step; n += step) {
      cBg.lineWidth = lineWidth;
      cBg.strokeStyle = gridColor;
      cBg.beginPath();
      cBg.moveTo(n, 0);
      cBg.lineTo(n, canvasSize + 0);
      cBg.stroke();
      cBg.beginPath();
      cBg.moveTo(0, n);
      cBg.lineTo(canvasSize, n);
      cBg.stroke();
    }
  }
}
function drawSquare(x, y, fillColor) {
  c.fillStyle = fillColor;
  c.fillRect(x + 2, y + 2, step - 4, step - 4);
}
/////// drawing functions

/////// canvas setup functions
function resizeOptimally() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 200);
}

function resizeCanvas() {
  wW = window.innerWidth;
  [canvasSize, step] = decideCanvasSizeByScreen(wW, stepsCount);
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvasBg.width = canvasSize;
  canvasBg.height = canvasSize;
  canvasWrapper.style.width = canvasSize + "px";
  canvasWrapper.style.height = canvasSize + "px";
}

function decideCanvasSizeByScreen(windowWidth, stepsCount) {
  let size; //must be divisible by stepsCount
  let step;
  if (windowWidth < 300) {
    size = 240;
  } else if (windowWidth < 525) {
    size = 300;
  } else if (windowWidth < 1470) {
    size = 525;
  } else if (windowWidth < 1600) {
    size = 600;
  } else {
    size = 750;
  }
  step = size / stepsCount;
  return [size, step];
}
function applyGrid() {
  if (isGrid) {
    drawGrid();
  } else {
    cBg.clearRect(0, 0, canvasSize, canvasSize);
  }
}
function applyBorder() {
  if (isBorder) {
    canvasWrapper.style.border = "4px double rgb(125, 249, 255)";
  } else {
    canvasWrapper.style.border = "none";
  }
}
function adjustSettingsButtonsAppearance() {
  isSaveOn && saveToggler.classList.toggle("on");
  isGrid && gridToggler.classList.toggle("on");
  isBorder && borderToggler.classList.toggle("on");
  isSound && soundToggler.classList.toggle("on");
}
function Sound(src, volume = "1", loop = false) {
  this.vol = volume;
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.preload = true;
  this.sound.setAttribute("controls", "true");
  this.sound.style.display = "none";
  this.sound.volume = 0;
  this.sound.loop = loop;
  document.body.appendChild(this.sound);

  this.play = function () {
    this.sound.play();
  };
  this.stop = function () {
    this.sound.pause();
  };
  this.init = function () {
    this.play();
    this.stop();
    this.sound.volume = this.vol;
  };
}
class Snake {
  constructor() {
    this.speed = speed;
    this.score = 0;
    isDead = false;
    this.deathSound = deathSound;
    this.deathSound.sound.load();
    this.partsToGrow = 0;
    this.timeToGrow = false;
    this.body = [
      [3 * step, 0],
      [2 * step, 0],
      [step, 0],
      [0, 0],
    ];
    this.foodsInBelly = [];
    this.dirX = true; // to prevent moving backwards on direction change
    this.dirY = false; //to prevent moving backwards on direction change
    this.getNewHeadPosition = this.headRight; //sets initial moving direction
    this.drawAll();
  }
  get head() {
    return { x: this.body[0][0], y: this.body[0][1] };
  }
  get tail() {
    return {
      x: this.body[this.body.length - 1][0],
      y: this.body[this.body.length - 1][1],
    };
  }
  checkIfOnFood(newHead) {
    let food = null;
    if (mouse.x === newHead[0] && mouse.y === newHead[1]) {
      food = mouse;
      mouse = null;
    } else if (rabbit && rabbit.x === newHead[0] && rabbit.y === newHead[1]) {
      food = rabbit;
      rabbit = null;
    }
    if (food) {
      isSound && food.dyingSound.play();
      this.foodsInBelly.push(food);
      food.seed();
      food.getsEaten();
    }
  }
  checkIfFinishedDigesting(tail) {
    if (this.foodsInBelly.length > 0) {
      let firstInBelly = this.foodsInBelly[0];
      if (tail.x === firstInBelly.x && tail.y === firstInBelly.y) {
        this.foodsInBelly.shift();
        return true;
      }
    }

    return false;
  }
  headRight() {
    this.dirX = true;
    this.dirY = false;
    let headX = this.head.x;
    let headY = this.head.y;
    let newHeadX = headX + step;
    if (!isBorder) {
      if (headX === canvasSize - step) {
        newHeadX = 0;
      }
    }
    return [newHeadX, headY];
  }
  headLeft() {
    this.dirX = true;
    this.dirY = false;
    let headX = this.head.x;
    let headY = this.head.y;
    let newHeadX = headX - step;
    if (!isBorder) {
      if (headX === 0) {
        newHeadX = headX + step * stepsCount - step;
      }
    }
    return [newHeadX, headY];
  }
  headDown() {
    this.dirX = false;
    this.dirY = true;
    let headX = this.head.x;
    let headY = this.head.y;
    let newHeadY = headY + step;
    if (!isBorder) {
      if (headY === canvasSize - step) {
        newHeadY = 0;
      }
    }
    return [headX, newHeadY];
  }
  headUp() {
    this.dirX = false;
    this.dirY = true;
    let headX = this.head.x;
    let headY = this.head.y;
    let newHeadY = headY - step;
    if (!isBorder) {
      if (headY === 0) {
        newHeadY = headY + step * stepsCount - step;
      }
    }
    return [headX, newHeadY];
  }
  move() {
    let newHead = this.getNewHeadPosition();
    if (this.findCollision(newHead)) {
      this.die();
      return;
    }

    this.checkIfOnFood(newHead);
    this.body.unshift(newHead);
    this.drawHead();
    if (!this.checkIfFinishedDigesting(this.tail)) {
      this.clearTail();
      this.body.pop();
    } else {
      this.clearTail();
      this.drawTail();
    }
  }
  findCollision(newHead) {
    let len = this.body.length;
    let newHeadX = newHead[0];
    let newHeadY = newHead[1];
    let headX = this.head.x;
    let headY = this.head.y;

    if (len > 3) {
      for (let i = 3; i < len; i++) {
        if (snake.body[i][0] === newHeadX && snake.body[i][1] === newHeadY) {
          snake.drawBlood(headX, newHeadX, headY, newHeadY);
          return true;
        }
      }
    }
    if (isBorder) {
      if (
        newHeadX >= canvasSize ||
        newHeadX < 0 ||
        newHeadY >= canvasSize ||
        newHeadY < 0
      ) {
        snake.drawBlood(headX, newHeadX, headY, newHeadY);
        return true;
      }
    }
    return false;
  }
  die() {
    isSound && this.deathSound.play();
    isDead = true;
    if (record < this.score) {
      record = this.score;
      if (isSaveOn) {
        localStorage.setItem("record", record);
      }
      msg = gameOverRecordMsg();
    } else {
      msg = gameOverMsg();
    }
    musicSound.stop();
    clearInterval(gameIntervalID);
    mouse = null;
    rabbit = null;
    rabbitBornDelay = null;
    outOfGameSetup();
  }
  clearTail() {
    c.clearRect(this.tail.x, this.tail.y, step + 2, step + 2);
  }
  drawAll() {
    this.body.forEach(function (bodyPart) {
      drawSquare(bodyPart[0], bodyPart[1], snakeColor);
    });
  }
  drawHead() {
    drawSquare(this.head.x, this.head.y, snakeColor);
  }
  drawBlood(headX, newHeadX, headY, newHeadY) {
    let x;
    let y;
    let w;
    let h;
    c.fillStyle = "rgb(248, 55, 31)";
    if (newHeadY === headY) {
      if (newHeadX > headX) {
        x = headX + step - step / 3;
      } else {
        x = headX;
      }
      y = headY;
      w = step / 3;
      h = step;
    }
    if (newHeadX === headX) {
      if (newHeadY > headY) {
        y = headY + step - step / 3;
      } else {
        y = headY;
      }
      x = headX;
      w = step;
      h = step / 3;
    }
    c.fillRect(x + 2, y + 2, w - 4, h - 4);
  }
  drawTail() {
    drawSquare(this.tail.x, this.tail.y, snakeColor);
  }
}
function deathAngel() {
  //call every game tick to clear rabbits with finished life span
  if (rabbit && rabbit.lifeSpan > 0) {
    rabbit.lifeSpan -= 1;
  } else if (rabbit && rabbit.lifeSpan === 0) {
    c.clearRect(rabbit.x, rabbit.y, step, step); //clear the old one
    rabbit.seed(); // initiate new rabbit
    rabbit = null;
  }
}
class Mouse {
  constructor(emptyCell) {
    this.x = emptyCell[0];
    this.y = emptyCell[1];
    this.dyingSound = mouseSound();
    this.dyingSound.sound.load();
    this.calories = 10; //for score
    this.look = mouseImg;
    this.lifespan = null;
    c.drawImage(this.look, this.x + 4, this.y + 4, step - 8, step - 8);
  }
  seed() {
    mouse = new Mouse(getRandomEmptyCell());
  }
  getsEaten() {
    snake.score += this.calories;
    if (snake.score - snake.speed * 100 >= 100 && snake.speed < 9) {
      snake.speed += 1;
      clearInterval(gameIntervalID);
      gameIntervalID = setInterval(update, 1000 / snake.speed);
    }
  }
}
class Rabbit {
  constructor(emptyCell) {
    this.x = emptyCell[0];
    this.y = emptyCell[1];
    this.calories = 50;
    this.dyingSound = rabbitSound;
    this.dyingSound.sound.load();
    this.look = rabbitImg;
    this.lifeSpan = randomBetween(rabbitLifeSpanMin, rabbitLifeSpanMax);
    c.drawImage(this.look, this.x + 4, this.y + 4, step - 8, step - 8);
  }
  seed() {
    rabbitBornDelay = randomBetween(rabbitDelayMin, rabbitDelayMax);
  }
  getsEaten() {
    snake.score += this.calories;
    if (snake.score - snake.speed * 100 >= 100 && snake.speed < 9) {
      snake.speed += 1;
      clearInterval(gameIntervalID);
      gameIntervalID = setInterval(update, 1000 / snake.speed);
    }
  }
}

///////////helpers
function getRandomEmptyCell() {
  let occupiedCellsArr = [...snake.body];
  mouse && occupiedCellsArr.push([mouse.x, mouse.y]);
  rabbit && occupiedCellsArr.push([rabbit.x, rabbit.y]);
  let randomCellX = Math.floor(Math.random() * stepsCount) * step;
  let randomCellY = Math.floor(Math.random() * stepsCount) * step;
  let isEmpty = true;
  for (let i = 0; i < occupiedCellsArr.length; i++) {
    if (
      occupiedCellsArr[i][0] === randomCellX &&
      occupiedCellsArr[i][1] === randomCellY
    ) {
      isEmpty = false;
      break;
    }
  }
  if (!isEmpty) {
    return getRandomEmptyCell();
  } else {
    return [randomCellX, randomCellY];
  }
}
function randomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

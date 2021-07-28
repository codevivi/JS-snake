"use strict";
window.onload = function snake() {
  const canvas = document.getElementById("canvas-main-id");
  const canvasBg = document.getElementById("canvas-bg-id");
  const canvasWrapper = document.getElementById("wrapper");
  const closeSettingsBtn = document.getElementById("close-settings");
  const openSettingsBtn = document.getElementById("open-settings");
  const overCanvas = document.getElementById("over-canvas-id");
  const settings = document.getElementById("settings-id");
  const screen = document.getElementById("screen-id");
  const msgEl = document.getElementById("screed-msg-id");
  //settings
  const gridOnOffBtn = document.getElementById("grid-on-off");
  const gridToggler = document.getElementById("grid-toggler");
  const soundOnOffBtn = document.getElementById("sound-on-off");
  const soundToggler = document.getElementById("sound-toggler");
  const borderOnOffBtn = document.getElementById("border-on-off");
  const borderToggler = document.getElementById("border-toggler");
  const saveOnOffBtn = document.getElementById("save-on-off");
  const saveToggler = document.getElementById("save-toggler");
  const speedSelect = document.getElementById("set-speed");
  const speedOptions = document.getElementsByTagName("option");

  const stepsCount = 15;
  const c = canvas.getContext("2d");
  const cBg = canvasBg.getContext("2d");

  const gridColor = "rgb(50, 50, 50)";
  const borderColor = "rgb(248, 55, 31)";
  const snakeColor = "rgb(71, 255, 82)";

  let wW; //windowWidth
  let canvasSize;
  let step;
  let resizeTimeout;

  let msg = "";

  ///settings variables
  let isPlaying = false;
  let isPaused = false;
  let isSaveOn = Number(localStorage.getItem("save")) || 0;

  let isGrid = Number(localStorage.getItem("grid")) || 0;
  let isBorder = Number(localStorage.getItem("border")) || 0;
  let speed = Number(localStorage.getItem("speed")) || 4; //steps per second
  let isSound = Number(localStorage.getItem("sound")) || 0;
  isSaveOn && saveToggler.classList.toggle("on");
  isGrid && gridToggler.classList.toggle("on");
  isBorder && borderToggler.classList.toggle("on");
  isSound && soundToggler.classList.toggle("on");
  speedOptions[speed - 1].selected = "selected";

  //adjustSettingsButtonsAppearance();

  let record = Number(localStorage.getItem("record")) || 0;
  let snake;
  resizeCanvas();
  applyBorderAndGrid();

  function gameSetup() {
    window.removeEventListener("resize", resizeOptimally);
    openSettingsBtn.style.display = "none";
    overCanvas.style.display = "none";
  }
  function outOfGameSetup() {
    window.addEventListener("resize", resizeOptimally);
    overCanvas.style.display = "flex";
    msgEl.textContent = msg;
  }

  //  overCanvas.style.display = "none";

  closeSettingsBtn.addEventListener("click", function () {
    settings.style.display = "none";
    screen.style.display = "block";
  });

  openSettingsBtn.addEventListener("click", function () {
    overCanvas.style.display = "flex";
    settings.style.display = "flex";
    screen.style.display = "none";
  });
  gridOnOffBtn.addEventListener("click", toggleGrid);
  borderOnOffBtn.addEventListener("click", toggleBorder);
  saveOnOffBtn.addEventListener("click", toggleSave);
  soundOnOffBtn.addEventListener("click", toggleSound);
  speedSelect.addEventListener("change", setSpeed);
  function setSpeed() {
    speed = speedSelect.value;
    localStorage.getItem("save") && localStorage.setItem("speed", speed);
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

    applyBorderAndGrid();
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

    applyBorderAndGrid();
  }
  function toggleSound() {
    if (isSound) {
      isSound = 0;
      localStorage.getItem("sound") && localStorage.setItem("sound", "0");
    } else {
      isBorder = 1;
      localStorage.getItem("sound") && localStorage.setItem("sound", "1");
    }
    soundToggler.classList.toggle("on");
  }
  /////// drawing functions
  function drawBorder() {
    let lineWidth = 2;
    cBg.lineWidth = lineWidth;
    cBg.strokeStyle = borderColor;
    cBg.beginPath();
    cBg.moveTo(0, 0);
    let b;
    for (let y = 0; y <= canvasSize - step; y += step) {
      cBg.lineTo(0, y + step / 2 - 2);
      cBg.lineTo(4, y + step / 2 + 2);
      cBg.lineTo(0, y + step / 2 + 2);
      cBg.lineTo(0, y + step);
    }
    for (let x = 0; x <= canvasSize - step; x += step) {
      cBg.lineTo(x + step / 2 - 2, canvasSize);
      cBg.lineTo(x + step / 2 + 2, canvasSize - 4);
      cBg.lineTo(x + step / 2 + 2, canvasSize);
      cBg.lineTo(x + step, canvasSize);
    }
    for (let y = canvasSize; y !== 0; y -= step) {
      cBg.lineTo(canvasSize, y - step / 2 + 2);
      cBg.lineTo(canvasSize - 4, y - step / 2 - 2);
      cBg.lineTo(canvasSize, y - step / 2 - 2);
      cBg.lineTo(canvasSize, y - step);
    }
    for (let x = canvasSize; x !== 0; x -= step) {
      cBg.lineTo(x - step / 2 + 2, 0);
      cBg.lineTo(x - step / 2 - 2, 4);
      cBg.lineTo(x - step / 2 - 2, 0);
      cBg.lineTo(x - step, 0);
    }
    // for (let n = canvasSize; n !== 0; n -= step) {
    //   cBg.lineTo(n - step / 2 - 2, 0);
    //   cBg.lineTo(n - step / 2, 4);
    //   cBg.lineTo(n - step / 2 - 2, 2);
    //   cBg.lineTo(n - step, 0);
    // }
    // cBg.lineTo(0, canvasSize);
    // cBg.lineTo(canvasSize, canvasSize);
    // cBg.lineTo(canvasSize, 0);
    // cBg.lineTo(0, 0);
    cBg.stroke();
  }
  function drawGrid() {
    let lineWidth = 1;
    if (isGrid) {
      for (let n = step; n <= canvasSize - step; n += step) {
        cBg.lineWidth = lineWidth;
        cBg.strokeStyle = gridColor;
        cBg.beginPath();
        cBg.moveTo(n, 0);
        cBg.lineTo(n, canvasSize);
        cBg.stroke();
        cBg.beginPath();
        cBg.moveTo(0, n);
        cBg.lineTo(canvasSize, n);
        cBg.stroke();
      }
    }
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
  function applyBorderAndGrid() {
    cBg.clearRect(0, 0, canvasSize, canvasSize);
    if (isGrid) {
      drawGrid();
    }
    if (isBorder) {
      drawBorder();
    }
  }
};
function adjustSettingsButtonsAppearance() {
  isSaveOn && saveToggler.classList.toggle("on");
  isGrid && gridToggler.classList.toggle("on");
  isBorder && borderToggler.classList.toggle("on");
  isSound && soundToggler.classList.toggle("on");
}

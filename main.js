"use strict";
window.onload = function snake() {
  const canvas = document.getElementById("canvas-main-id");
  const canvasBg = document.getElementById("canvas-bg-id");
  const canvasWrapper = document.getElementById("wrapper");
  const closeSettingsBtn = document.getElementById("close-settings");
  const openSettingsBtn = document.getElementById("open-settings");
  const overCanvas = document.getElementById("over-canvas-id");

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

  ///settings variables
  let isPlaying = false;
  let isPaused = false;
  let isGrid = true;
  let isBorder = true;
  let isSound = false;

  resizeCanvas();

  overCanvas.style.display = "none";

  window.addEventListener("resize", resizeOptimally);
  applyBorderAndGrid();
  closeSettingsBtn.addEventListener("click", function () {
    overCanvas.style.display = "none";
  });

  openSettingsBtn.addEventListener("click", function () {
    overCanvas.style.display = "flex";
  });
  function toggleGrid() {
    isGrid = isGrid ? !isGrid : isGrid;
  }
  function toggleBorder() {
    isBorder = isBorder ? !isBorder : isBorder;
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

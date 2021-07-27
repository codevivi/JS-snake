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

  let wW; //windowWidth
  let canvasSize;
  let step;
  let resizeTimeout;

  ///settings variables
  let isGrid = true;
  let isBorder = true;

  resizeCanvas();
  window.addEventListener("resize", resizeOptimally);
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
    cBg.lineTo(0, canvasSize);
    cBg.lineTo(canvasSize, canvasSize);
    cBg.lineTo(canvasSize, 0);
    cBg.lineTo(0, 0);
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
    applyBorderAndGrid();
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

import { useEffect, useRef, useState } from "react";

const BOARD_DIMENSIONS = {
  maxBackgroundRow: 21,
  maxBackgroundColumn: 17,
  maxRow: 22,
  maxColumn: 10,
};

const BLOCK_SIZES = {
  innerBlockWidth: 10,
  innerBlockHeight: 10,
  innerBlockPadding: 2,
  outerBlockPadding: 4,
  outerBlockWidth: 14,
  outerBlockHeight: 14,
  outerBlockWidthWithPadding: 18,
  outerBlockHeightWithPadding: 18,
};

const COLORS = {
  block: "#f8fafc",
  boardCell: "#1a1437",
  boardBackgroundStroke: "#6ee7ff",
  text: "#f8fafc",
  dPadFill: "#231942",
  dPadStroke: "#8b5cf6",
  actionFill: "#ff4d9d",
  actionStroke: "#ffd166",
};

const CONTROL_LAYOUT = {
  padSize: 42,
  padGap: 8,
  dPadCenterX: 126,
  actionRadius: 24,
  actionButtonAOffsetX: 160,
  actionButtonAOffsetY: 66,
  actionButtonBOffsetX: 110,
  actionButtonBOffsetY: 106,
};

const SPAWN_POSITION = {
  row: 2,
  column: 4,
};

const TIMINGS = {
  defaultFrameRate: 1000,
  softDropFrameRate: 50,
};

const gameKeys = new Set([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

const clonePosition = (position) => ({
  row: position.row,
  column: position.column,
});

const clonePotentialTopLeft = (potentialTopLeft) => ({
  down: clonePosition(potentialTopLeft.down),
  left: clonePosition(potentialTopLeft.left),
  right: clonePosition(potentialTopLeft.right),
});

const createGrid = (rowCount, columnCount) =>
  Array.from({ length: rowCount }, () =>
    Array.from({ length: columnCount }, () => ({ x: 0, y: 0, isOccupied: 0 })),
  );

class Tetromino {
  constructor(topLeft) {
    this._topLeft = topLeft;
    this._potentialTopLeft = {
      down: { row: topLeft.row + 1, column: topLeft.column },
      right: { row: topLeft.row, column: topLeft.column + 1 },
      left: { row: topLeft.row, column: topLeft.column - 1 },
    };
    this._currentShapeIndex = 0;
    this._potentialShapeIndex = 1;
  }

  get topLeft() {
    return this._topLeft;
  }

  get potentialTopLeft() {
    return this._potentialTopLeft;
  }

  moveLeft() {
    this._topLeft.column--;
    this._potentialTopLeft.down.column--;
    this._potentialTopLeft.right.column--;
    this._potentialTopLeft.left.column--;
  }

  moveRight() {
    this._topLeft.column++;
    this._potentialTopLeft.down.column++;
    this._potentialTopLeft.right.column++;
    this._potentialTopLeft.left.column++;
  }

  dropSlow() {
    this._topLeft.row++;
    this._potentialTopLeft.down.row++;
    this._potentialTopLeft.right.row++;
    this._potentialTopLeft.left.row++;
  }
}

class OTetromino extends Tetromino {
  constructor(topLeft) {
    super(topLeft);
    this._shape = [
      [1, 1],
      [1, 1],
    ];
    this._potentialShape = this._shape;
  }
  get shape() {
    return this._shape;
  }
  get potentialShape() {
    return this._potentialShape;
  }
  rotate() {}
}

function createRotatingTetromino(topLeft, shapes) {
  return class extends Tetromino {
    constructor(position) {
      super(position ?? topLeft);
      this._rotatedShape = shapes;
      this._shape = shapes[this._currentShapeIndex];
      this._potentialShape = shapes[this._potentialShapeIndex % shapes.length];
    }
    get shape() {
      return this._shape;
    }
    get potentialShape() {
      return this._potentialShape;
    }
    rotate() {
      this._currentShapeIndex = (this._currentShapeIndex + 1) % this._rotatedShape.length;
      this._potentialShapeIndex = (this._potentialShapeIndex + 1) % this._rotatedShape.length;
      this._shape = this._rotatedShape[this._currentShapeIndex];
      this._potentialShape = this._rotatedShape[this._potentialShapeIndex];
    }
  };
}

const LTetromino = createRotatingTetromino(SPAWN_POSITION, [
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1],
    [0, 1],
    [0, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
]);

const JTetromino = createRotatingTetromino(SPAWN_POSITION, [
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [1, 1],
    [1, 0],
    [1, 0],
  ],
]);

const ZTetromino = createRotatingTetromino(SPAWN_POSITION, [
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0],
  ],
]);

const STetromino = createRotatingTetromino(SPAWN_POSITION, [
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
]);

const TTetromino = createRotatingTetromino(SPAWN_POSITION, [
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 1, 0],
    [0, 1, 1],
    [0, 1, 0],
  ],
]);

const BarTetromino = createRotatingTetromino(SPAWN_POSITION, [
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
]);

const TETROMINO_TYPES = [
  OTetromino,
  STetromino,
  ZTetromino,
  TTetromino,
  LTetromino,
  JTetromino,
  BarTetromino,
];

const createRandomTetromino = () => {
  const TetrominoType = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return new TetrominoType(clonePosition(SPAWN_POSITION));
};

const cloneTetromino = (tetromino) => {
  const TetrominoType = tetromino.constructor;
  const clonedTetromino = new TetrominoType(clonePosition(tetromino.topLeft));
  clonedTetromino._potentialTopLeft = clonePotentialTopLeft(tetromino.potentialTopLeft);
  clonedTetromino._currentShapeIndex = tetromino._currentShapeIndex;
  clonedTetromino._potentialShapeIndex = tetromino._potentialShapeIndex;
  clonedTetromino._shape = tetromino.shape;
  clonedTetromino._potentialShape = tetromino.potentialShape;
  return clonedTetromino;
};

const cloneGrid = (landedGrid) =>
  landedGrid.map((row) => row.map((cell) => ({ x: cell.x, y: cell.y, isOccupied: cell.isOccupied })));

const getFilledRows = (landedGrid) => {
  const filledRows = [];
  for (let row = landedGrid.length - 1; row > 1; row--) {
    if (landedGrid[row].every((cell) => cell.isOccupied)) {
      filledRows.push(row);
    }
  }
  return filledRows;
};

const clearRows = (landedGrid, rowIndexes) => {
  const rowIndexSet = new Set(rowIndexes);
  return landedGrid.filter((_, rowIndex) => !rowIndexSet.has(rowIndex)).map((row) => row.map((cell) => ({ ...cell })));
};

const addRows = (landedGrid, count, columnCount) => [...createGrid(count, columnCount), ...cloneGrid(landedGrid)];

const saveTetrominoToGrid = (landedGrid, tetromino) => {
  const nextGrid = cloneGrid(landedGrid);
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let column = 0; column < tetromino.shape[row].length; column++) {
      if (tetromino.shape[row][column]) {
        nextGrid[row + tetromino.topLeft.row][column + tetromino.topLeft.column].isOccupied =
          tetromino.shape[row][column];
      }
    }
  }
  return nextGrid;
};

const hasLanded = (tetromino, landedGrid) => {
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let column = 0; column < tetromino.shape[row].length; column++) {
      if (!tetromino.shape[row][column]) continue;
      const targetRow = row + tetromino.potentialTopLeft.down.row;
      const targetColumn = column + tetromino.potentialTopLeft.down.column;
      if (targetRow >= landedGrid.length || landedGrid[targetRow][targetColumn].isOccupied) {
        return true;
      }
    }
  }
  return false;
};

const canMoveHorizontally = (tetromino, landedGrid, direction) => {
  const targetPosition = tetromino.potentialTopLeft[direction];
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let column = 0; column < tetromino.shape[row].length; column++) {
      if (!tetromino.shape[row][column]) continue;
      const targetRow = row + targetPosition.row;
      const targetColumn = column + targetPosition.column;
      if (landedGrid[targetRow][targetColumn].isOccupied) {
        return false;
      }
    }
  }
  return true;
};

const canRotate = (tetromino, landedGrid) => {
  for (let row = 0; row < tetromino.potentialShape.length; row++) {
    for (let column = 0; column < tetromino.potentialShape[row].length; column++) {
      if (!tetromino.potentialShape[row][column]) continue;
      const targetRow = row + tetromino.topLeft.row;
      const targetColumn = column + tetromino.topLeft.column;
      if (landedGrid[targetRow][targetColumn].isOccupied) {
        return false;
      }
    }
  }
  return true;
};

const isGameOver = (tetromino, landedGrid) => {
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let column = 0; column < tetromino.shape[row].length; column++) {
      if (!tetromino.shape[row][column]) continue;
      const targetRow = row + tetromino.topLeft.row;
      const targetColumn = column + tetromino.topLeft.column;
      if (landedGrid[targetRow][targetColumn].isOccupied) {
        return true;
      }
    }
  }
  return false;
};

const createInitialGameState = () => ({
  landedGrid: createGrid(BOARD_DIMENSIONS.maxRow, BOARD_DIMENSIONS.maxColumn),
  currentTetromino: createRandomTetromino(),
  nextTetromino: createRandomTetromino(),
  score: 0,
  isStopped: false,
});

const settleCurrentTetromino = (gameState) => {
  let landedGrid = saveTetrominoToGrid(gameState.landedGrid, gameState.currentTetromino);
  const filledRows = getFilledRows(landedGrid);
  let score = gameState.score;
  if (filledRows.length) {
    landedGrid = clearRows(landedGrid, filledRows);
    landedGrid = addRows(landedGrid, filledRows.length, BOARD_DIMENSIONS.maxColumn);
    score += filledRows.length * 100;
  }
  const currentTetromino = gameState.nextTetromino;
  const nextTetromino = createRandomTetromino();
  return {
    ...gameState,
    landedGrid,
    currentTetromino,
    nextTetromino,
    score,
    isStopped: isGameOver(currentTetromino, landedGrid),
  };
};

const tickGame = (gameState) => {
  if (gameState.isStopped) return gameState;
  if (hasLanded(gameState.currentTetromino, gameState.landedGrid)) {
    return settleCurrentTetromino(gameState);
  }
  const currentTetromino = cloneTetromino(gameState.currentTetromino);
  currentTetromino.dropSlow();
  return { ...gameState, currentTetromino };
};

const hardDropGame = (gameState) => {
  if (gameState.isStopped) return gameState;
  let nextGameState = gameState;
  let steps = 0;
  const maxSteps = BOARD_DIMENSIONS.maxRow + 2;
  while (!hasLanded(nextGameState.currentTetromino, nextGameState.landedGrid)) {
    if (steps >= maxSteps) {
      break;
    }
    nextGameState = tickGame(nextGameState);
    steps++;
  }
  return settleCurrentTetromino(nextGameState);
};

const drawInnerRect = (drawingPanel, x, y, width, height, color) => {
  drawingPanel.fillStyle = color;
  drawingPanel.fillRect(x, y, width, height);
};

const drawOuterRect = (drawingPanel, x, y, width, height, color) => {
  drawingPanel.strokeStyle = color;
  drawingPanel.strokeRect(x, y, width, height);
};

const drawSingleBlock = (drawingPanel, x, y, color) => {
  drawInnerRect(
    drawingPanel,
    x + BLOCK_SIZES.innerBlockPadding,
    y + BLOCK_SIZES.innerBlockPadding,
    BLOCK_SIZES.innerBlockWidth,
    BLOCK_SIZES.innerBlockHeight,
    color,
  );
  drawOuterRect(drawingPanel, x, y, BLOCK_SIZES.outerBlockWidth, BLOCK_SIZES.outerBlockHeight, color);
};

const drawRoundedRect = (drawingPanel, x, y, width, height, radius, fillColor, strokeColor) => {
  drawingPanel.beginPath();
  drawingPanel.moveTo(x + radius, y);
  drawingPanel.lineTo(x + width - radius, y);
  drawingPanel.quadraticCurveTo(x + width, y, x + width, y + radius);
  drawingPanel.lineTo(x + width, y + height - radius);
  drawingPanel.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  drawingPanel.lineTo(x + radius, y + height);
  drawingPanel.quadraticCurveTo(x, y + height, x, y + height - radius);
  drawingPanel.lineTo(x, y + radius);
  drawingPanel.quadraticCurveTo(x, y, x + radius, y);
  drawingPanel.closePath();
  drawingPanel.fillStyle = fillColor;
  drawingPanel.fill();
  drawingPanel.strokeStyle = strokeColor;
  drawingPanel.stroke();
};

const drawBackground = (drawingPanel, offSetX, offSetY, width, height) => {
  const boardGradient = drawingPanel.createLinearGradient(offSetX, offSetY, offSetX + width, offSetY + height);
  boardGradient.addColorStop(0, "#140b34");
  boardGradient.addColorStop(0.5, "#27115e");
  boardGradient.addColorStop(1, "#0ea5e9");
  drawInnerRect(drawingPanel, offSetX, offSetY, width, height, boardGradient);
  drawOuterRect(drawingPanel, offSetX, offSetY, width, height, COLORS.boardBackgroundStroke);
};

const drawBackgroundBlocks = (drawingPanel, landedGrid, offSetX, offSetY) => {
  for (let row = 2; row < landedGrid.length; row++) {
    for (let column = 0; column < landedGrid[row].length; column++) {
      const x = column * BLOCK_SIZES.outerBlockWidthWithPadding + offSetX;
      const y = row * BLOCK_SIZES.outerBlockHeightWithPadding + offSetY;
      drawSingleBlock(drawingPanel, x, y, COLORS.boardCell);
      landedGrid[row][column].x = x;
      landedGrid[row][column].y = y;
    }
  }
};

const drawLandedBlocks = (drawingPanel, landedGrid) => {
  for (let row = 0; row < landedGrid.length; row++) {
    for (let column = 0; column < landedGrid[row].length; column++) {
      if (landedGrid[row][column].isOccupied) {
        drawSingleBlock(drawingPanel, landedGrid[row][column].x, landedGrid[row][column].y, COLORS.block);
      }
    }
  }
};

const drawTetromino = (drawingPanel, tetromino, landedGrid) => {
  for (let row = 0; row < tetromino.shape.length; row++) {
    const tetrominoRowPosition = row + tetromino.topLeft.row;
    if (tetrominoRowPosition === 1) continue;
    for (let column = 0; column < tetromino.shape[row].length; column++) {
      if (!tetromino.shape[row][column]) continue;
      const tetrominoColumnPosition = column + tetromino.topLeft.column;
      const targetCell = landedGrid[tetrominoRowPosition]?.[tetrominoColumnPosition];
      if (targetCell?.x !== undefined) {
        drawSingleBlock(drawingPanel, targetCell.x, targetCell.y, COLORS.block);
      }
    }
  }
};

const drawText = (drawingPanel, message, x, y, options = {}) => {
  drawingPanel.fillStyle = options.color ?? COLORS.text;
  drawingPanel.font = options.font ?? "20px sans-serif";
  drawingPanel.fillText(message, x, y);
};

const drawTetrominoPreview = (drawingPanel, tetromino, startX, startY) => {
  const previewBlockSize = 16;
  const previewGap = 4;
  const previewStep = previewBlockSize + previewGap;
  for (let row = 0; row < tetromino.shape.length; row++) {
    for (let column = 0; column < tetromino.shape[row].length; column++) {
      if (!tetromino.shape[row][column]) continue;
      const x = startX + column * previewStep;
      const y = startY + row * previewStep;
      drawInnerRect(drawingPanel, x + 2, y + 2, previewBlockSize - 4, previewBlockSize - 4, COLORS.block);
      drawOuterRect(drawingPanel, x, y, previewBlockSize, previewBlockSize, COLORS.block);
    }
  }
};

const drawArrowGlyph = (drawingPanel, direction, centerX, centerY, size, color) => {
  drawingPanel.beginPath();
  if (direction === "up") {
    drawingPanel.moveTo(centerX, centerY - size);
    drawingPanel.lineTo(centerX + size, centerY + size);
    drawingPanel.lineTo(centerX - size, centerY + size);
  }
  if (direction === "down") {
    drawingPanel.moveTo(centerX, centerY + size);
    drawingPanel.lineTo(centerX + size, centerY - size);
    drawingPanel.lineTo(centerX - size, centerY - size);
  }
  if (direction === "left") {
    drawingPanel.moveTo(centerX - size, centerY);
    drawingPanel.lineTo(centerX + size, centerY - size);
    drawingPanel.lineTo(centerX + size, centerY + size);
  }
  if (direction === "right") {
    drawingPanel.moveTo(centerX + size, centerY);
    drawingPanel.lineTo(centerX - size, centerY - size);
    drawingPanel.lineTo(centerX - size, centerY + size);
  }
  drawingPanel.closePath();
  drawingPanel.fillStyle = color;
  drawingPanel.fill();
};

const drawCircleButton = (drawingPanel, centerX, centerY, radius, fillColor, strokeColor, label) => {
  drawingPanel.beginPath();
  drawingPanel.arc(centerX, centerY, radius, 0, Math.PI * 2);
  drawingPanel.closePath();
  drawingPanel.fillStyle = fillColor;
  drawingPanel.fill();
  drawingPanel.strokeStyle = strokeColor;
  drawingPanel.stroke();
  drawingPanel.fillStyle = strokeColor;
  drawingPanel.font = "bold 14px sans-serif";
  drawingPanel.textAlign = "center";
  drawingPanel.textBaseline = "middle";
  drawingPanel.fillText(label, centerX, centerY);
};

const drawControlPanel = (drawingPanel, canvasWidth, canvasHeight) => {
  const { padSize, padGap, dPadCenterX, actionRadius, actionButtonAOffsetX, actionButtonAOffsetY, actionButtonBOffsetX, actionButtonBOffsetY } =
    CONTROL_LAYOUT;
  const dPadCenterY = canvasHeight - 86;
  const directionalButtons = [
    { direction: "up", x: dPadCenterX, y: dPadCenterY - (padSize + padGap) },
    { direction: "left", x: dPadCenterX - (padSize + padGap), y: dPadCenterY },
    { direction: "right", x: dPadCenterX + (padSize + padGap), y: dPadCenterY },
    { direction: "down", x: dPadCenterX, y: dPadCenterY + (padSize + padGap) },
  ];
  directionalButtons.forEach(({ direction, x, y }) => {
    drawRoundedRect(
      drawingPanel,
      x - padSize / 2,
      y - padSize / 2,
      padSize,
      padSize,
      10,
      COLORS.dPadFill,
      COLORS.dPadStroke,
    );
    drawArrowGlyph(drawingPanel, direction, x, y, 8, COLORS.dPadStroke);
  });
  drawRoundedRect(
    drawingPanel,
    dPadCenterX - padSize / 2,
    dPadCenterY - padSize / 2,
    padSize,
    padSize,
    10,
    COLORS.dPadFill,
    COLORS.dPadStroke,
  );
  drawCircleButton(
    drawingPanel,
    canvasWidth - actionButtonAOffsetX,
    canvasHeight - actionButtonAOffsetY,
    actionRadius,
    COLORS.actionFill,
    COLORS.actionStroke,
    "A",
  );
  drawCircleButton(
    drawingPanel,
    canvasWidth - actionButtonBOffsetX,
    canvasHeight - actionButtonBOffsetY,
    actionRadius,
    COLORS.actionFill,
    COLORS.actionStroke,
    "B",
  );
  drawingPanel.textAlign = "start";
  drawingPanel.textBaseline = "alphabetic";
};

const getCanvasAction = (canvasX, canvasY, canvasWidth, canvasHeight) => {
  const { padSize, padGap, dPadCenterX, actionRadius, actionButtonAOffsetX, actionButtonAOffsetY, actionButtonBOffsetX, actionButtonBOffsetY } =
    CONTROL_LAYOUT;
  const dPadCenterY = canvasHeight - 86;
  const halfPad = padSize / 2;
  const dpadButtons = [
    { action: "up", centerX: dPadCenterX, centerY: dPadCenterY - (padSize + padGap) },
    { action: "left", centerX: dPadCenterX - (padSize + padGap), centerY: dPadCenterY },
    { action: "right", centerX: dPadCenterX + (padSize + padGap), centerY: dPadCenterY },
    { action: "down", centerX: dPadCenterX, centerY: dPadCenterY + (padSize + padGap) },
  ];

  for (const button of dpadButtons) {
    if (
      canvasX >= button.centerX - halfPad &&
      canvasX <= button.centerX + halfPad &&
      canvasY >= button.centerY - halfPad &&
      canvasY <= button.centerY + halfPad
    ) {
      return button.action;
    }
  }

  const actionButtons = [
    { action: "rotate", centerX: canvasWidth - actionButtonAOffsetX, centerY: canvasHeight - actionButtonAOffsetY },
    { action: "drop", centerX: canvasWidth - actionButtonBOffsetX, centerY: canvasHeight - actionButtonBOffsetY },
  ];

  for (const button of actionButtons) {
    const distance = Math.hypot(canvasX - button.centerX, canvasY - button.centerY);
    if (distance <= actionRadius) {
      return button.action;
    }
  }

  return null;
};

function TetrisCanvas({ gameState, onControlPress, onControlRelease }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawingPanel = canvas.getContext("2d");
    if (!drawingPanel) return;
    const canvasWidth = 551;
    const canvasHeight = 640;
    const boardWidth = BLOCK_SIZES.outerBlockWidthWithPadding * BOARD_DIMENSIONS.maxBackgroundColumn;
    const boardHeight = BLOCK_SIZES.outerBlockHeightWithPadding * BOARD_DIMENSIONS.maxBackgroundRow;
    const offsetToCanvasTop = BLOCK_SIZES.outerBlockHeightWithPadding * 3;
    const offsetToCanvasLeft = canvasWidth / 2 - boardWidth / 2;
    const offsetToBackgroundTop =
      offsetToCanvasTop - BLOCK_SIZES.innerBlockHeight * 3 + BLOCK_SIZES.innerBlockPadding * 2;
    const offsetToBackgroundLeft = offsetToCanvasLeft + 10;

    drawingPanel.clearRect(0, 0, canvasWidth, canvasHeight);
    const shellGradient = drawingPanel.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    shellGradient.addColorStop(0, "#ff4d9d");
    shellGradient.addColorStop(0.45, "#7c3aed");
    shellGradient.addColorStop(1, "#22d3ee");
    drawRoundedRect(drawingPanel, 0, 0, canvasWidth, canvasHeight, 28, shellGradient, "#f8fafc");
    drawBackground(drawingPanel, offsetToCanvasLeft, offsetToCanvasTop, boardWidth, boardHeight);
    drawBackgroundBlocks(drawingPanel, gameState.landedGrid, offsetToBackgroundLeft, offsetToBackgroundTop);
    drawLandedBlocks(drawingPanel, gameState.landedGrid);
    drawTetromino(drawingPanel, gameState.currentTetromino, gameState.landedGrid);
    drawText(
      drawingPanel,
      "Score",
      offsetToCanvasLeft + BLOCK_SIZES.outerBlockWidthWithPadding * 12.5,
      offsetToCanvasTop + BLOCK_SIZES.outerBlockHeightWithPadding * 1.5,
      { font: "bold 16px sans-serif", color: COLORS.text },
    );
    drawText(
      drawingPanel,
      String(gameState.score),
      offsetToCanvasLeft + BLOCK_SIZES.outerBlockWidthWithPadding * 12.5,
      offsetToCanvasTop + BLOCK_SIZES.outerBlockHeightWithPadding * 3,
      { font: "bold 28px sans-serif", color: COLORS.text },
    );
    drawText(
      drawingPanel,
      "Next",
      offsetToCanvasLeft + BLOCK_SIZES.outerBlockWidthWithPadding * 12.5,
      offsetToCanvasTop + BLOCK_SIZES.outerBlockHeightWithPadding * 6,
      { font: "bold 16px sans-serif", color: COLORS.text },
    );
    drawTetrominoPreview(
      drawingPanel,
      gameState.nextTetromino,
      offsetToCanvasLeft + BLOCK_SIZES.outerBlockWidthWithPadding * 12.5,
      offsetToCanvasTop + BLOCK_SIZES.outerBlockHeightWithPadding * 7,
    );
    drawControlPanel(drawingPanel, canvasWidth, canvasHeight);
  }, [gameState]);

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const canvasX = (event.clientX - bounds.left) * scaleX;
    const canvasY = (event.clientY - bounds.top) * scaleY;
    const action = getCanvasAction(canvasX, canvasY, canvas.width, canvas.height);
    if (!action) return;
    event.preventDefault();
    onControlPress(action);
  };

  const handlePointerUp = () => {
    onControlRelease();
  };

  return (
    <canvas
      ref={canvasRef}
      width={551}
      height={640}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}

export function TetrisGame() {
  const [gameState, setGameState] = useState(() => createInitialGameState());
  const [frameRate, setFrameRate] = useState(TIMINGS.defaultFrameRate);
  const gameStateRef = useRef(gameState);
  const hardDropPressedRef = useRef(false);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (gameState.isStopped) return;
    const timerId = setInterval(() => {
      setGameState((currentGameState) => tickGame(currentGameState));
    }, frameRate);
    return () => clearInterval(timerId);
  }, [frameRate, gameState.isStopped]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!gameKeys.has(event.key)) return;
      event.preventDefault();
      if (event.key === " " && (hardDropPressedRef.current || event.repeat)) return;
      if (event.key === " ") hardDropPressedRef.current = true;
      if (gameStateRef.current.isStopped) return;
      let nextGameState = gameStateRef.current;
      if (event.key === " ") {
        nextGameState = hardDropGame(nextGameState);
      } else if (event.key === "ArrowDown") {
        setFrameRate(TIMINGS.softDropFrameRate);
        nextGameState = tickGame(nextGameState);
      } else if (event.key === "ArrowUp" && canRotate(nextGameState.currentTetromino, nextGameState.landedGrid)) {
        const currentTetromino = cloneTetromino(nextGameState.currentTetromino);
        currentTetromino.rotate();
        nextGameState = { ...nextGameState, currentTetromino };
      } else if (event.key === "ArrowLeft" && canMoveHorizontally(nextGameState.currentTetromino, nextGameState.landedGrid, "left")) {
        const currentTetromino = cloneTetromino(nextGameState.currentTetromino);
        currentTetromino.moveLeft();
        nextGameState = { ...nextGameState, currentTetromino };
      } else if (event.key === "ArrowRight" && canMoveHorizontally(nextGameState.currentTetromino, nextGameState.landedGrid, "right")) {
        const currentTetromino = cloneTetromino(nextGameState.currentTetromino);
        currentTetromino.moveRight();
        nextGameState = { ...nextGameState, currentTetromino };
      }
      gameStateRef.current = nextGameState;
      setGameState(nextGameState);
    };

    const onKeyUp = (event) => {
      if (!gameKeys.has(event.key)) return;
      event.preventDefault();
      if (event.key === " ") hardDropPressedRef.current = false;
      if (event.key === "ArrowDown") setFrameRate(TIMINGS.defaultFrameRate);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const commitGameState = (nextGameState) => {
    gameStateRef.current = nextGameState;
    setGameState(nextGameState);
  };

  const handleGameAction = (action) => {
    if (gameStateRef.current.isStopped) return;
    let nextGameState = gameStateRef.current;

    if (action === "drop") {
      nextGameState = hardDropGame(nextGameState);
    } else if (action === "down") {
      setFrameRate(TIMINGS.softDropFrameRate);
      nextGameState = tickGame(nextGameState);
    } else if ((action === "up" || action === "rotate") && canRotate(nextGameState.currentTetromino, nextGameState.landedGrid)) {
      const currentTetromino = cloneTetromino(nextGameState.currentTetromino);
      currentTetromino.rotate();
      nextGameState = { ...nextGameState, currentTetromino };
    } else if (action === "left" && canMoveHorizontally(nextGameState.currentTetromino, nextGameState.landedGrid, "left")) {
      const currentTetromino = cloneTetromino(nextGameState.currentTetromino);
      currentTetromino.moveLeft();
      nextGameState = { ...nextGameState, currentTetromino };
    } else if (
      action === "right" &&
      canMoveHorizontally(nextGameState.currentTetromino, nextGameState.landedGrid, "right")
    ) {
      const currentTetromino = cloneTetromino(nextGameState.currentTetromino);
      currentTetromino.moveRight();
      nextGameState = { ...nextGameState, currentTetromino };
    }

    commitGameState(nextGameState);
  };

  const handleSoftDropEnd = () => {
    setFrameRate(TIMINGS.defaultFrameRate);
  };

  const handleRestart = () => {
    hardDropPressedRef.current = false;
    setFrameRate(TIMINGS.defaultFrameRate);
    setGameState(createInitialGameState());
  };

  return (
    <section className="tetris-local">
      <header className="tetris-local__hud">
        <div className="tetris-local__copy">
          <p className="tetris-local__eyebrow">XVG Retrowave Edition</p>
          <h1>Tetris</h1>
          <p className="tetris-local__status">
            {gameState.isStopped
              ? "Game over. Start a new run."
              : "Use arrows or tap controls to move and rotate. Press space or tap Drop to hard drop."}
          </p>
        </div>
        <button className="tetris-local__restart" type="button" onClick={handleRestart}>
          Restart
        </button>
      </header>
      <div className="tetris-local__canvas-shell">
        <TetrisCanvas
          gameState={gameState}
          onControlPress={handleGameAction}
          onControlRelease={handleSoftDropEnd}
        />
      </div>
    </section>
  );
}

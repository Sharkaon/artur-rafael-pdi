import type { ImageUpdateParams } from "../DigitalImage";
import type { RGBImageMatrix, RGBPixel } from "../types";
import { threshold } from "./filters";
import { dilatation } from "./mathematical-morphology";

type Location = { i: number; j: number };

type Bounds = {
  topPixel: Location;
  bottomPixel: Location;
  leftMostPixel: Location;
  rightMostPixel: Location;
};

type PillClass = 'broken' | 'circular' | 'oval';

type ObjectData = {
  area: number;
  perimeter: number;
  classification: PillClass;
};

const checkIsObject = (pixel: RGBPixel) => pixel[0] >= 255;

const classifyPill = (
  circularity: number,
  topI: number,
  leftMostI: number,
  rightMostI: number,
  tolerance = 1
): PillClass => {
  const isBroken = (
    Math.abs(leftMostI - topI) <= tolerance &&
    Math.abs(rightMostI - topI) <= tolerance
  );

  if (isBroken) return 'broken';
  if (circularity > 0.5) return 'circular';
  return 'oval';
};

const calculateAreaAndBounds = (
  matrix: RGBImageMatrix,
  start: Location,
  visited: boolean[][]
): { area: number; bounds: Bounds; pixelsSet: Set<string> } => {
  const height = matrix.length;
  const width = matrix[0].length;

  const queue: { i: number; j: number }[] = [start];
  visited[start.i][start.j] = true;

  let topPixel = { ...start };
  let leftMostPixel = { ...start };
  let rightMostPixel = { ...start };
  let bottomPixel = { ...start };
  let area = 0;

  const directions = [
    { di: -1, dj: 0 },
    { di: 1, dj: 0 },
    { di: 0, dj: -1 },
    { di: 0, dj: 1 },
    { di: -1, dj: -1 },
    { di: -1, dj: 1 },
    { di: 1, dj: -1 },
    { di: 1, dj: 1 },
  ];

  const pixelsSet = new Set<string>();

  while (queue.length > 0) {
    const { i, j } = queue.shift()!;

    area++;
    pixelsSet.add(`${i},${j}`);

    if (i < topPixel.i) topPixel = { i, j };
    if (i > bottomPixel.i) bottomPixel = { i, j };
    if (j < leftMostPixel.j) leftMostPixel = { i, j };
    if (j > rightMostPixel.j) rightMostPixel = { i, j };

    for (const { di, dj } of directions) {
      const ni = i + di;
      const nj = j + dj;
      if (ni >= 0 && ni < height && nj >= 0 && nj < width) {
        if (!visited[ni][nj] && checkIsObject(matrix[ni][nj])) {
          visited[ni][nj] = true;
          queue.push({ i: ni, j: nj });
        }
      }
    }
  }

  return {
    area,
    bounds: { topPixel, bottomPixel, leftMostPixel, rightMostPixel },
    pixelsSet,
  };
};

const calculatePerimeter = (
  pixelsSet: Set<string>,
  matrixHeight: number,
  matrixWidth: number
): number => {
  const directions = [
    { di: -1, dj: 0 },
    { di: 1, dj: 0 },
    { di: 0, dj: -1 },
    { di: 0, dj: 1 },
    { di: -1, dj: -1 },
    { di: -1, dj: 1 },
    { di: 1, dj: -1 },
    { di: 1, dj: 1 },
  ];

  let perimeter = 0;

  for (const pixel of pixelsSet) {
    const [pi, pj] = pixel.split(",").map(Number);
    for (const { di, dj } of directions) {
      const ni = pi + di;
      const nj = pj + dj;
      if (
        ni < 0 ||
        ni >= matrixHeight ||
        nj < 0 ||
        nj >= matrixWidth ||
        !pixelsSet.has(`${ni},${nj}`)
      ) {
        perimeter++;
        break;
      }
    }
  }

  return perimeter;
};

const getObjectData = (
  matrix: RGBImageMatrix,
  startingPixelLocation: { i: number; j: number },
  visited: boolean[][]
): ObjectData => {
  const { area, bounds, pixelsSet } = calculateAreaAndBounds(
    matrix,
    startingPixelLocation,
    visited
  );

  const perimeter = calculatePerimeter(
    pixelsSet,
    matrix.length,
    matrix[0].length
  );

  const circularity =
    perimeter === 0 ? 0 : (4 * Math.PI * area) / (perimeter * perimeter);

  const classification = classifyPill(
    circularity,
    bounds.topPixel.i,
    bounds.leftMostPixel.i,
    bounds.rightMostPixel.i
  );

  return {
    area,
    perimeter,
    classification,
  };
};

export const countPills = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
  const { newMatrix: thresholdMatrix } = threshold(pdiMatrix, {
    thresholdLimit: 125,
  });
  const { newMatrix: dilatatedMatrix } = dilatation(thresholdMatrix);

  const detectionMatrix = dilatatedMatrix;

  const height = detectionMatrix.length;
  const width = detectionMatrix[0].length;

  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );

  const objectsData: ObjectData[] = [];

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (visited[i][j]) continue;

      const pixel = detectionMatrix[i][j];
      if (!checkIsObject(pixel)) continue;

      const objectData = getObjectData(detectionMatrix, { i, j }, visited);
      objectsData.push(objectData);
    }
  }

  console.table(
    objectsData.map((obj, idx) => ({
      índice: idx,
      área: obj.area,
      perímetro: obj.perimeter,
      classificação: obj.classification,
    }))
  );

  return { newMatrix: detectionMatrix };
};

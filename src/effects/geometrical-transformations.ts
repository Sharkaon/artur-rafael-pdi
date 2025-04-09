import { ImageUpdateParams } from "../DigitalImage";
import { RGBImageMatrix, RGBPixel } from "../types";

type OperationMatrix = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

type PlacementMatrix = readonly [
  number,
  number,
  number,
];

const multiplyMatrix = (operationMatrix: OperationMatrix, originMatrix: PlacementMatrix): PlacementMatrix => {
  return operationMatrix.map((operationLine): PlacementMatrix[number] =>
    (operationLine[0] * originMatrix[0]) +
  (operationLine[1] * originMatrix[1]) +
  (operationLine[2] * originMatrix[2])
) as unknown as PlacementMatrix;
}

const nearestNeighborInterpolation = (
  originalMatrix: RGBImageMatrix, 
  newWidth: number, 
  newHeight: number
): RGBImageMatrix => {
  const originalHeight = originalMatrix.length;
  const originalWidth = originalMatrix[0].length;

  // Create a new matrix with the scaled size
  const newMatrix: RGBImageMatrix = [];

  for (let y = 0; y < newHeight; y++) {
    const newRow: RGBPixel[] = [];
    for (let x = 0; x < newWidth; x++) {
      // Find the corresponding position in the original image
      const origX = Math.floor((x / newWidth) * originalWidth);
      const origY = Math.floor((y / newHeight) * originalHeight);

      // Push the nearest neighbor's RGB value to the new row
      newRow.push(originalMatrix[origY][origX]);
    }
    newMatrix.push(newRow);
  }

  return newMatrix;
}
const scale = (matrix: RGBImageMatrix, options: {
  x: number;
  y: number;
}): ImageUpdateParams => {
  const {x, y} = options;
  console.log({ matrix });
  
  // First, apply nearest-neighbor interpolation to scale the image
  const scaledMatrix = nearestNeighborInterpolation(matrix, x, y);

  return {
    newMatrix: scaledMatrix,
  };
}


const translate = (pdiMatrix: RGBImageMatrix, options: {
  x: number;
  y: number;
}): ImageUpdateParams => {
  const { x, y } = options;
  const currX = 0;
  const currY = 0;
  const TRANSLATE_MATRIX = [
    [1, 0, x],
    [0, 1, y],
    [0, 0, 1],
  ] as const;
  const CURRENT_MATRIX = [
    currX,
    currY,
    1,
  ] as const;

  const positionMatrix = multiplyMatrix(TRANSLATE_MATRIX, CURRENT_MATRIX);

  return {
    newMatrix: pdiMatrix,
    position: {
      x: positionMatrix[0],
      y: positionMatrix[1],
    },
  }
}

// const scale = (pdiMatrix: RGBImageMatrix, options: {
//   x: number;
//   y: number;
// }): ImageUpdateParams => {
//   const { x, y } = options;
//   const currX = 0;
//   const currY = 0;
//   const SCALE_MATRIX = [
//     [x, 0, 0],
//     [0, y, 0],
//     [0, 0, 1],
//   ] as const;
//   const CURRENT_MATRIX = [
//     currX,
//     currY,
//     1,
//   ] as const;

//   const positionMatrix = multiplyMatrix(SCALE_MATRIX, CURRENT_MATRIX);
//   return {
//     newMatrix: pdiMatrix,
//     position: {
//       x: positionMatrix[0],
//       y: positionMatrix[1],
//     },
//   }
// }


export { translate, scale };
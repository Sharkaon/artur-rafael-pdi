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
  widthToChange: number, 
  heightToChange: number
): RGBImageMatrix => {
  const originalHeight = originalMatrix.length;
  const originalWidth = originalMatrix[0].length;

  const newHeight = heightToChange + originalHeight;
  const newWidth = widthToChange + originalHeight;

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
const increase = (matrix: RGBImageMatrix, options: {
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

const reduce = (matrix: RGBImageMatrix, options: {
  x: number;
  y: number;
}): ImageUpdateParams => {
  const {x, y} = options;
  
  // First, apply nearest-neighbor interpolation to scale the image
  const scaledMatrix = nearestNeighborInterpolation(matrix, x * -1, y * -1);

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

const mirror = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
  const height = pdiMatrix.length;
  const width = pdiMatrix[0].length;

  const newMatrix: RGBImageMatrix = [];

  for(let i = 0; i < height -1; i++){
    const newRow: RGBPixel[] = [];
    for(let j = width - 1; j > 0; j--){
      newRow.push(pdiMatrix[i][j]);
    }
    newMatrix.push(newRow);
  }

  return {
    newMatrix: newMatrix,
  }
}
const rotate = (pdiMatrix: RGBImageMatrix, options: {
  angular: number;
}): ImageUpdateParams => {
  const { angular } = options;
  const ROTATE_MATRIX = [
    [Math.cos(angular), (Math.sin(angular)) * -1, 0],
    [Math.sin(angular),  Math.cos(angular), 0],
    [0, 0, 1],
  ] as const;
  const height = pdiMatrix.length;
  const width = pdiMatrix[0].length;

  const newMatrix: RGBImageMatrix = [];

  for(let i = height - 1; i > 0; i--){
    const newRow: RGBPixel[] = [];
    for(let j = width - 1; j > 0; j--){
      let currX = i;
      let currY = j;
      const CURRENT_MATRIX = [
        currX,
        currY,
        1,
      ] as const;
      let positionMatrix = multiplyMatrix(ROTATE_MATRIX, CURRENT_MATRIX);
      console.log(Math.ceil(positionMatrix[0]) + " " + Math.ceil(positionMatrix[0]));
      if(Math.ceil(positionMatrix[0]) < 0 || Math.ceil(positionMatrix[1]) < 0 || 
         Math.ceil(positionMatrix[0]) >= pdiMatrix.length || Math.ceil(positionMatrix[1]) >= pdiMatrix[0].length){
          newRow.push([0,0,0,255]);
      }else{
        newRow.push(pdiMatrix[Math.ceil(positionMatrix[0])][Math.ceil(positionMatrix[1])]);
      }
      //newRow.push([255,255,255,255]);
    }
    newMatrix.push(newRow);
  }
  return {
    newMatrix: newMatrix,
  }
}

export { translate, increase, mirror, reduce, rotate };
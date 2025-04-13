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
  const radians = angular * (Math.PI / 180);
  const ROTATE_MATRIX = [
    [Math.cos(radians), (Math.sin(radians)) * -1, 0],
    [Math.sin(radians), Math.cos(radians), 0],
    [0, 0, 1],
  ] as const;
  
  const height = pdiMatrix.length;
  const width = pdiMatrix[0].length;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const newMatrix: RGBImageMatrix = [];

  for(let y = 0; y < height; y++) {
    const newRow: RGBPixel[] = [];
    for(let x = 0; x < width; x++) {
      //posição de x e y em relação ao centro (usado para girar com base no meio, ao invés de rodar do 0,0 da imagem)
      const xRel = x - centerX;
      const yRel = y - centerY;
      
      //retorna a posição onde x e y devem ir
      const [rotatedX, rotatedY] = multiplyMatrix(ROTATE_MATRIX, [xRel, yRel, 1]);
      
      //localização do pixel (da matriz) que irá para o pixel X e Y
      const origX = Math.round(rotatedX + centerX);
      const origY = Math.round(rotatedY + centerY);
      
      //verifica se o pixel procurado está dentro dos limites da matriz
      if(origX >= 0 && origX < width && origY >= 0 && origY < height) {
        newRow.push(pdiMatrix[origY][origX]);
      } else {
        newRow.push([0, 0, 0, 255]);
      }
    }
    newMatrix.push(newRow);
  }
  
  return {
    newMatrix: newMatrix,
  };
}

export { translate, increase, mirror, reduce, rotate };
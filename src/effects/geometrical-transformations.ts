import { ImageUpdateParams } from "../DigitalImage";
import { RGBImageMatrix } from "../types";

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
  console.log({ positionMatrix });

    // const matrixAsArray = pdiMatrix.flat(2);

    // const destinyImage = document.getElementById('second-image') as HTMLImageElement;
    // const { width, height } = destinyImage;

    // const canvas = document.createElement('canvas');
    // const ctx = canvas.getContext('2d');

    // canvas.width = width + positionMatrix[0];
    // canvas.height = height + positionMatrix[1];

    // const idata = ctx.createImageData(width, height);
    // idata.data.set(matrixAsArray);
    // ctx.putImageData(idata, positionMatrix[0], positionMatrix[1]);

    // const dataUrl = canvas.toDataURL();

    // destinyImage.src = dataUrl;

  return {
    newMatrix: pdiMatrix,
    position: {
      x: positionMatrix[0],
      y: positionMatrix[1],
    },
  }
}

export { translate };
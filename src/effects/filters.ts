import { ImageUpdateParams } from "../DigitalImage";
import type { AlphaChannel, RGBImageMatrix, RGBPixel } from "../types";
const FULLY_OPAQUE: AlphaChannel = 255;

const grayScale = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
  pdiMatrix.forEach((row) => {
    for (let j = 0; j < row.length; j++) {
      const pixel = row[j];
      const [Red, Green, Blue, _] = pixel;
      const averageOfRBG = (Red + Green + Blue) / 3;
      const grayPixel: RGBPixel = [averageOfRBG, averageOfRBG, averageOfRBG, FULLY_OPAQUE];
      row[j] = grayPixel;
    }
  });
  return {
    newMatrix: pdiMatrix,
  };
}

const threshold = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
  const THRESHOLD_LIMIT = 100 as const;

  pdiMatrix.forEach((row) => {
    for(let j = 0; j < row.length; j++) {

      const pixel = row[j]
      const [Gray, _B, _G, Alpha] = pixel;
      const newPixelValue = Gray > THRESHOLD_LIMIT ? 255 : 0;

      row[j] = [newPixelValue, newPixelValue, newPixelValue, Alpha];
    }
  });

  return {
    newMatrix: pdiMatrix,
  }
}

const contrast = (pdiMatrix: RGBImageMatrix, options: {
  contrast: number;
}): ImageUpdateParams => {
  const { contrast } = options;

  pdiMatrix.forEach((row) => {
    for(let j = 0; j < row.length; j++) {

      const pixel = row[j]
      const [Red, Green, Blue, Alpha] = pixel;
      const adjustedRed = Math.min(Math.max(contrast * Red, 0), 255);
      const adjustedGreen = Math.min(Math.max(contrast * Green, 0), 255);
      const adjustedBlue = Math.min(Math.max(contrast * Blue, 0), 255);
      const thresholdPixel: RGBPixel = [adjustedRed, adjustedGreen, adjustedBlue, Alpha]
      row[j] = thresholdPixel;
    }
  });

  return {
    newMatrix: pdiMatrix,
  };
}

const brightness = (pdiMatrix: RGBImageMatrix, options: {
  brightnessValue: number;
}): ImageUpdateParams => {
  const {brightnessValue} = options;
  pdiMatrix.forEach((row) => {
    for (let j = 0; j < row.length; j++) {
      const pixel = row[j];
      const [Red, Green, Blue, Alpha] = pixel;
      const adjustedRed =  Math.min(Math.max(Red + brightnessValue, 0), 255);
      const adjustedGreen =  Math.min(Math.max(Green + brightnessValue, 0), 255);
      const adjustedBlue =  Math.min(Math.max(Blue + brightnessValue, 0), 255);
      const adjustedPixel: RGBPixel = [adjustedRed, adjustedGreen, adjustedBlue, Alpha];
      row[j] = adjustedPixel;
    }
  });

  return {
    newMatrix: pdiMatrix,
  };
}

const applyMedianMask = (mask: [
  [RGBPixel, RGBPixel, RGBPixel],
  [RGBPixel, RGBPixel, RGBPixel],
  [RGBPixel, RGBPixel, RGBPixel],
]): RGBPixel => {
  const pixelList = mask.flat();
  const firstChannelList = pixelList.map((p) => p[0]);
  const sortedPixelList = firstChannelList.sort();
  const halfIndex = Math.floor(sortedPixelList.length / 2);

  return [sortedPixelList[halfIndex], sortedPixelList[halfIndex], sortedPixelList[halfIndex], FULLY_OPAQUE];
}

// Passa alta
const borders = (matrix: RGBImageMatrix): ImageUpdateParams => {
  const THRESHOLD_LIMIT = 100 as const;

  const X_KERNEL = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ] as const;

  const Y_KERNEL = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ] as const;

  for (let y = 1; y < matrix.length - 1; y++) {
    for (let x = 1; matrix[y] && x < matrix[y].length - 1; x++) {
      let xGradient = 0;
      let yGradient = 0;

      for (let i = 0; i < X_KERNEL.length; i++) {
        if (!matrix[x + (i-1)]) continue;

        for (let j = 0; j < X_KERNEL[0].length; j++) {
          const pixel = matrix[x + (i-1)][y + (j-1)];
          xGradient += pixel[0] * X_KERNEL[i][j];
          yGradient += pixel[0] * Y_KERNEL[i][j];
        }
      }

      const gradient = Math.sqrt(Math.pow(xGradient, 2) + Math.pow(yGradient, 2));
      const newPixelValue = gradient > THRESHOLD_LIMIT ? 255 : 0;

      matrix[y][x] = [newPixelValue, newPixelValue, newPixelValue, matrix[y][x][3]];
    }
  }

  return {
    newMatrix: matrix,
  }
}

// Passa baixa
const filter = (matrix: RGBImageMatrix): ImageUpdateParams => {
  console.log({ matrix });
  for (let i = 1; i < matrix[0].length - 1; i ++) {
    for (let j = 1; matrix[i] && j < matrix[i].length - 1; j++) {
      if (!matrix[i-1] || !matrix[i] || !matrix[i+1]) continue;

      const adjustedPixel = applyMedianMask([
        [matrix[i-1][j-1], matrix[i-1][j], matrix[i-1][j+1]],
        [matrix[i][j-1], matrix[i][j], matrix[i][j+1]],
        [matrix[i+1][j-1], matrix[i+1][j], matrix[i+1][j+1]],
      ])

      matrix[i][j] = adjustedPixel;
    }
  }

  console.log({ matrix });

  return {
    newMatrix: matrix,
  }
}

export { grayScale, contrast, threshold, brightness, filter, borders };

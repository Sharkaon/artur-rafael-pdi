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

// Passa alta
const borders = (matrix: RGBImageMatrix): ImageUpdateParams => {
  const THRESHOLD_LIMIT = 200 as const;

  const X_KERNEL = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ] as const;

  const Y_KERNEL = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ] as const;

  for (let height = 1; height < matrix.length - 1; height++) {
    for (let width = 1; width < matrix[height].length - 1; width++) {
      let xGradient = 0;
      let yGradient = 0;

      for (let kernelHeight = 0; kernelHeight < X_KERNEL.length; kernelHeight++) {
        for (let kernelWidth = 0; kernelWidth < X_KERNEL[0].length; kernelWidth++) {
          const pixel = matrix[height + (kernelHeight-1)][width + (kernelWidth-1)];
          const grayColor = pixel[0];

          xGradient += (grayColor + X_KERNEL[kernelHeight][kernelWidth]);
          yGradient += (grayColor + Y_KERNEL[kernelHeight][kernelWidth]);
        }
      }

      const gradient = Math.sqrt(Math.pow(xGradient, 2) + Math.pow(yGradient, 2));
      const newPixelValue = gradient > THRESHOLD_LIMIT ? 255 : 0;

      matrix[height][width] = [newPixelValue, newPixelValue, newPixelValue, matrix[height][width][3]];
    }
  }

  return {
    newMatrix: matrix,
  }
}

const applyMedianMask = (mask: [
  [RGBPixel, RGBPixel, RGBPixel],
  [RGBPixel, RGBPixel, RGBPixel],
  [RGBPixel, RGBPixel, RGBPixel],
]): RGBPixel => {
  const pixelList = mask.flat();
  const firstChannelList = pixelList.map((p) => p[0]);
  const sortedPixelList = firstChannelList.sort((a, b) => a - b);
  const halfIndex = Math.floor(sortedPixelList.length / 2);

  return [sortedPixelList[halfIndex], sortedPixelList[halfIndex], sortedPixelList[halfIndex], FULLY_OPAQUE];
}

// Passa baixa
const filter = (matrix: RGBImageMatrix): ImageUpdateParams => {
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

  return {
    newMatrix: matrix,
  }
}

export { grayScale, contrast, threshold, brightness, filter, borders };

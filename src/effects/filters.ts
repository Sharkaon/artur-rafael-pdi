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

const filter = (matrix: RGBImageMatrix): ImageUpdateParams => {
  for (let i = 1; i < matrix[0].length - 1; i ++) {
    for (let j = 1; j < matrix[i].length - 1; j++) {
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

export { grayScale, contrast as threshold, brightness, filter };

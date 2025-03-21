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

const threshold = (pdiMatrix: RGBImageMatrix, options: {
  brightness: number;
  contrast: number;
}): ImageUpdateParams => {
  const { brightness, contrast } = options;
  pdiMatrix.forEach((row) => {
    for(let j = 0; j < row.length; j++) {

      const pixel = row[j]
      const [Red, Green, Blue, _] = pixel;
      const adjustedRed = Math.min(Math.max(contrast * Red + brightness, 0), 255);
      const adjustedGreen = Math.min(Math.max(contrast * Green + brightness, 0), 255);
      const adjustedBlue = Math.min(Math.max(contrast * Blue + brightness, 0), 255);
      const thresholdPixel: RGBPixel = [adjustedRed, adjustedGreen, adjustedBlue, FULLY_OPAQUE]
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
      const adjustedRed =  Math.min(Math.max(1 * Red + brightnessValue, 0), 255);
      const adjustedGreen =  Math.min(Math.max(1 * Green + brightnessValue, 0), 255);
      const adjustedBlue =  Math.min(Math.max(1 * Blue + brightnessValue, 0), 255);
      const adjustedPixel: RGBPixel = [adjustedRed, adjustedGreen, adjustedBlue, FULLY_OPAQUE];
      row[j] = adjustedPixel;
    }
  });

  return {
    newMatrix: pdiMatrix,
  };
}

export { grayScale, threshold, brightness };

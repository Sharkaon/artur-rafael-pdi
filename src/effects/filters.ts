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

export { grayScale, contrast as threshold, brightness };

import type { AlphaChannel, RGBImageMatrix, RGBPixel } from "../types";

const FULLY_TRANSPARENT: AlphaChannel = 0;
const FULLY_OPAQUE: AlphaChannel = 255;

const grayScale = (pdiMatrix: RGBImageMatrix): RGBImageMatrix => {
  pdiMatrix.forEach((row) => {
    for (let j = 0; j < row.length; j++) {
      const pixel = row[j];
      const [Red, Green, Blue, _] = pixel;
      const averageOfRBG = (Red + Green + Blue) / 3;
      const grayPixel: RGBPixel = [averageOfRBG, averageOfRBG, averageOfRBG, FULLY_OPAQUE];
      row[j] = grayPixel;
    }
  });

  return pdiMatrix;
}

const Threshold = (pdiMatrix: RGBImageMatrix): RGBImageMatrix => {
  pdiMatrix.forEach((row) => {
    for(let j = 0; j < row.length; j++) {
      const brilho: number = 5;
      const contraste: number = 1.5;
      const pixel = row[j]
      const [Red, Green, Blue, _] = pixel;
      const adjustedRed = Math.min(Math.max(contraste * Red + brilho, 0), 255);
      const adjustedGreen = Math.min(Math.max(contraste * Green + brilho, 0), 255);
      const adjustedBlue = Math.min(Math.max(contraste * Blue + brilho, 0), 255);
      const thresholdPixel: RGBPixel = [adjustedRed, adjustedGreen, adjustedBlue, FULLY_OPAQUE]
      row[j] = thresholdPixel;
    }
  });
  return pdiMatrix;
}

export { grayScale, Threshold };

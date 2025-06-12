import type { ImageUpdateParams } from "../DigitalImage";
import type { RGBImageMatrix } from "../types";
import { threshold } from "./filters";
import { dilatation } from "./mathematical-morphology";

export const countPills = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
  const { newMatrix: thresholdMatrix } = threshold(pdiMatrix, {
    thresholdLimit: 125,
  });
  const { newMatrix: dilatatedMatrix } = dilatation(thresholdMatrix);

  return { newMatrix: dilatatedMatrix };
}
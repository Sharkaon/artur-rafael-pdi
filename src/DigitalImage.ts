import { RGBImageMatrix, RGBPixel } from "./types";

type Position = {
    x: number;
    y: number;
  };

export type ImageUpdateParams = {
  newMatrix: RGBImageMatrix;
  position?: Position;
};

export class DigitalImage {
  private RGBMatrix: RGBImageMatrix = [];
  public destinyImage: HTMLImageElement;

  public constructor() {
    this.RGBMatrix = this.convertImageToCanva('second-image');
    this.destinyImage = document.getElementById('second-image') as HTMLImageElement;
  }

  public apply(effectCallback: (matrix: RGBImageMatrix) => ImageUpdateParams | void): void {
    const output = effectCallback(this.RGBMatrix);
    if (!output) return;

    const {
      newMatrix,
      position
    } = output;

    this.setNewImage({
      newMatrix,
      position: position ?? { x: 0, y: 0 },
    });
  }

  public setNewImage({
    newMatrix,
    position,
  }: ImageUpdateParams) {
    const matrixAsArray = newMatrix.flat(2);

    const { x, y } = position

    const { width, height } = this.destinyImage;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width + x;
    canvas.height = height + y;

    const idata = ctx.createImageData(width, height);
    idata.data.set(matrixAsArray);
    ctx.putImageData(idata, x, y);

    const dataUrl = canvas.toDataURL();
    canvas.remove();

    this.destinyImage.src = dataUrl;
    this.RGBMatrix = newMatrix;
  }

  private convertCanvaArrayToMatrix(data: Uint8ClampedArray): RGBImageMatrix {
    const arrayLength = data.length / 4; // numero de pixeis por linha
    const arrayHeight = data.length / (4 * arrayLength); // numero de linhas

    const rgbMatrix = [];

    for (let i = 0; i < arrayHeight; i++) {
      const row: RGBPixel[] = [];
      for (let j = 0; j < arrayLength; j++) {
        const index = (i * arrayLength + j) * 4; // Calculate the index in the Uint8ClampedArray
        const pixel: RGBPixel = [
          data[index],     // Red
          data[index + 1], // Green
          data[index + 2], // Blue
          data[index + 3], // Alpha
        ];
        row.push(pixel);
      }
      rgbMatrix.push(row);
    }

    return rgbMatrix;
  }

  private convertImageToCanva(elementId = 'image'): RGBImageMatrix {
    const newImgElement = document.getElementById(elementId) as HTMLImageElement;
    if (!newImgElement.src) return [];

    const { width, height } = newImgElement;

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(newImgElement, 0, 0);

    const { data } = ctx.getImageData(0, 0, width, height);
    return this.convertCanvaArrayToMatrix(data);
  }
} 
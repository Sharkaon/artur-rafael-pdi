import { RGBImageMatrix, RGBPixel } from "./types";

export class DigitalImage {
  private RGBMatrix: RGBImageMatrix = [];
  private destinyImage: HTMLImageElement;

  public constructor() {
    this.convertImageToCanva();
    this.destinyImage = document.getElementById('second-image') as HTMLImageElement;
  }

  public apply(effectCallback: (matrix: RGBImageMatrix) => RGBImageMatrix): void {
    const newMatrix = effectCallback(this.RGBMatrix);
    this.setNewImage(newMatrix);
  }

  private setNewImage(newMatrix: RGBImageMatrix) {
    const matrixAsArray = newMatrix.flat(2);

    const { width, height } = this.destinyImage;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    const idata = ctx.createImageData(width, height);
    idata.data.set(matrixAsArray);
    ctx.putImageData(idata, 0, 0);

    const dataUrl = canvas.toDataURL();
    canvas.remove();

    this.destinyImage.src = dataUrl;
  }

  private convertCanvaArrayToMatrix(data: Uint8ClampedArray): RGBImageMatrix {
    const arrayLength = data.length / 4; // numero de pixeis por linha
    const arrayHeight = data.length / (4 * arrayLength); // numero de linhas

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
      this.RGBMatrix.push(row);
    }

    return this.RGBMatrix;
  }

  private convertImageToCanva() {
    const newImgElement = document.getElementById('image') as HTMLImageElement;

    const { width, height } = newImgElement;

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(newImgElement, 0, 0);

    const { data } = ctx.getImageData(0, 0, width, height);
    this.convertCanvaArrayToMatrix(data);
  }
} 
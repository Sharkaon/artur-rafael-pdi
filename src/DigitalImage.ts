// import { RGBImageMatrix, RGBPixel } from "./types";

// type Position = {
//     x: number;
//     y: number;
//   };

// export type ImageUpdateParams = {
//   newMatrix: RGBImageMatrix;
//   position?: Position;
// };

// export class DigitalImage {
//   private RGBMatrix: RGBImageMatrix = [];
//   public destinyImage: HTMLImageElement;

//   public constructor() {
//     this.RGBMatrix = this.convertImageToCanva('second-image');
//     this.destinyImage = document.getElementById('second-image') as HTMLImageElement;
//   }

//   public apply(effectCallback: (matrix: RGBImageMatrix) => ImageUpdateParams | void): void {
//     const output = effectCallback(this.RGBMatrix);
//     console.log({ output });
//     if (!output) return;

//     const {
//       newMatrix,
//       position
//     } = output;

//     this.setNewImage({
//       newMatrix,
//       position: position ?? { x: 0, y: 0 },
//     });
//   }

//   public setNewImage({
//     newMatrix,
//     position,
//   }: ImageUpdateParams) {
//     const matrixAsArray = newMatrix.flat(2);

//     const { x, y } = position

//     const { width, height } = this.destinyImage;

//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');

//     canvas.width = width + x;
//     canvas.height = height + y;

//     const idata = ctx.createImageData(width, height);
//     idata.data.set(matrixAsArray);
//     ctx.putImageData(idata, x, y);

//     const dataUrl = canvas.toDataURL();
//     canvas.remove();

//     this.destinyImage.src = dataUrl;
//     this.RGBMatrix = newMatrix;
//   }

//   private convertCanvaArrayToMatrix(data: Uint8ClampedArray, imageDimensions: {
//     width: number;
//     height: number;
//   }): RGBImageMatrix {
//     const rgbMatrix = [];

//     // TODO: ARRUMAR ESTA BOSTA, TODOS OS PIXELS ESTAO NO MESMO ARRAY
//     for (let i = 0; i < imageDimensions.height; i++) {
//       const row: RGBPixel[] = [];
//       for (let j = 0; j < imageDimensions.width; j++) {
//         const index = (i * imageDimensions.height + j) * 4; // Calculate the index in the Uint8ClampedArray
//         const pixel: RGBPixel = [
//           data[index],     // Red
//           data[index + 1], // Green
//           data[index + 2], // Blue
//           data[index + 3], // Alpha
//         ];
//         row.push(pixel);
//       }
//       rgbMatrix.push(row);
//     }

//     return rgbMatrix;
//   }

//   private convertImageToCanva(elementId = 'image'): RGBImageMatrix {
//     const newImgElement = document.getElementById(elementId) as HTMLImageElement;
//     if (!newImgElement.src) return [];

//     const { width, height } = newImgElement;

//     const canvas = document.createElement('canvas');

//     canvas.width = width;
//     canvas.height = height;

//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(newImgElement, 0, 0);

//     const { data } = ctx.getImageData(0, 0, width, height);
//     return this.convertCanvaArrayToMatrix(data, {
//       height,
//       width,
//     });
//   }
// } 

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
    console.log({ output });
    if (!output) return;

    const { newMatrix, position } = output;

    this.setNewImage({
      newMatrix,
      position: position ?? { x: 0, y: 0 },
    });
  }

  public setNewImage({
    newMatrix,
    position,
  }: ImageUpdateParams) {
    const { x, y } = position;
    const { width, height } = this.destinyImage;
  
    // Debugging: Check the size of the newMatrix
    console.log('newMatrix dimensions:', newMatrix.length, 'x', newMatrix[0]?.length);
  
    // Flatten the matrix into a 1D array (RGBA values for each pixel)
    const matrixAsArray = newMatrix.flat().reduce((acc, pixel) => {
      acc.push(...pixel); // Flatten each pixel (R, G, B, A)
      return acc;
    }, [] as number[]);
  
    // Debugging: Check the length of the matrixAsArray
    console.log('matrixAsArray length:', matrixAsArray.length);
  
    // Ensure the size matches the expected RGBA array size (newWidth * newHeight * 4)
    if (matrixAsArray.length !== newMatrix.length * newMatrix[0].length * 4) {
      throw new Error(`Matrix size does not match expected size. Expected ${newMatrix.length * newMatrix[0].length * 4} but got ${matrixAsArray.length}.`);
    }
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    // Resize the canvas according to the image dimensions
    canvas.width = newMatrix[0].length;
    canvas.height = newMatrix.length;
  
    const idata = ctx.createImageData(canvas.width, canvas.height);
    idata.data.set(matrixAsArray); // Set the pixel data in the canvas imageData
  
    // Put the updated image data onto the canvas
    ctx.putImageData(idata, 0, 0);
  
    // Convert canvas to data URL and update image source
    const dataUrl = canvas.toDataURL();
    canvas.remove();
  
    this.destinyImage.src = dataUrl;
    this.RGBMatrix = newMatrix;
  }
  

  private convertCanvaArrayToMatrix(data: Uint8ClampedArray, imageDimensions: { width: number; height: number }): RGBImageMatrix {
    const rgbMatrix = [];

    for (let i = 0; i < imageDimensions.height; i++) {
      const row: RGBPixel[] = [];
      for (let j = 0; j < imageDimensions.width; j++) {
        const index = (i * imageDimensions.width + j) * 4; // Corrected formula
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

  private convertImageToCanva(elementId = 'image', newWidth?: number, newHeight?: number): RGBImageMatrix {
    const newImgElement = document.getElementById(elementId) as HTMLImageElement;
    if (!newImgElement.src) return [];

    const { width, height } = newImgElement;

    // Create canvas to draw image with new dimensions if resizing is required
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set new dimensions if provided, otherwise use the original image dimensions
    const targetWidth = newWidth || width;
    const targetHeight = newHeight || height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw image with scaling
    ctx.drawImage(newImgElement, 0, 0, targetWidth, targetHeight);

    const { data } = ctx.getImageData(0, 0, targetWidth, targetHeight);
    return this.convertCanvaArrayToMatrix(data, {
      height: targetHeight,
      width: targetWidth,
    });
  }
}

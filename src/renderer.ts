/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

console.log('👋 This message is being logged by "renderer.ts", included via Vite');

type Red = number;
type Blue = number;
type Green = number;
// Transparency
type AlphaChannel = number;

type RGBPixel = [Red, Green, Blue, AlphaChannel]
type RGBLine = RGBPixel[];

type RGBImageMatrix = RGBLine[];

let pdiMatrix: RGBImageMatrix = [];

const convertCanvaArrayToMatrix = (data: Uint8ClampedArray) => {
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
    pdiMatrix.push(row);
  }

  return pdiMatrix;
};
const convertImageToCanva = () => {
    const newImgElement = document.getElementById('image') as HTMLImageElement;

    const w = newImgElement.width, h = newImgElement.height;

    console.log({ w, h });

    // Create a Canvas element
    const canvas = document.createElement('canvas');

    // Size the canvas to the element
    canvas.width = w;
    canvas.height = h;

    // Draw image onto the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(newImgElement, 0, 0);

    // Finally, get the image data
    // ('data' is an array of RGBA pixel values for each pixel)
    const { data } = ctx.getImageData(0, 0, w, h);
    convertCanvaArrayToMatrix(data);
}

(window as any).electronAPI.onFileSelected((filePath: string) => {
    // TODO: Corrigir o file path incorreto
    filePath = 'lena.jpg';
  
    // Atualiza o src da imagem e a exibe
    const imgElement = document.getElementById('image') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = filePath;
      imgElement.style.display = 'block';

      //imgElement.addEventListener('load', convertImageToCanva);
    }
    const secondImgElement = document.getElementById('second-image') as HTMLImageElement;
    if (secondImgElement) {
      secondImgElement.src = filePath;
      secondImgElement.style.display = 'block';

      secondImgElement.addEventListener('load', () => {
        convertImageToCanva();
        convertImageGrayscale();
      });
    }
});

const convertImageGrayscale = () => {
  
  for(let i = 0; i < pdiMatrix.length; i++){
    const row = pdiMatrix[i];
    for(let j = 0; j < row.length; j++){
      const pixel = row[j];
      const [Red, Green, Blue, AlphaChannel] = pixel;
      let grayScale = (Red + Green + Blue) / 3;
      row[j] = [grayScale, grayScale, grayScale, 255];
    }
  }
}
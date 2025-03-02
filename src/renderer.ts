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
type White = number;

type RGBPixel = [Red, Blue, Green, White]
type RGBLine = RGBPixel[];

type RGBImageMatrix = RGBLine[];

const convertCanvaArrayToMatrix = (data: Uint8ClampedArray<ArrayBufferLike>) => {
  const pdiMatrix: RGBImageMatrix = [];
  // TODO: Implementar esta conversão.
}

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

    console.log(data)
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

      setTimeout(convertImageToCanva, 1000);
    }
});
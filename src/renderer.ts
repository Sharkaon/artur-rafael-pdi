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

import { DigitalImage } from './DigitalImage';
import { grayScale, threshold } from './effects/filters';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import './index.css';
import { Effect, RGBImageMatrix } from './types';

console.log('👋 This message is being logged by "renderer.ts", included via Vite');

let digitalImage: DigitalImage;

const handleThreshold = (matrix: RGBImageMatrix) => {
  const divForInputs = document.getElementById('inputs');
  
  const brightnessInput = document.createElement('input')
  brightnessInput.setAttribute('id', 'brightnessInput');

  const contrastInput = document.createElement('input');
  contrastInput.setAttribute('id', 'contrastInput');

  const submitButton = document.createElement('button');
  submitButton.onclick = () => {
    console.log({ digitalImage });

    const contrastInput = document.getElementById('contrastInput') as HTMLInputElement;
    const brightnessInput = document.getElementById('brightnessInput') as HTMLInputElement;

    digitalImage.apply(() => threshold(matrix, {
      brightness: Number(brightnessInput.value),
      contrast: Number(contrastInput.value),
    }));
  }

  divForInputs.appendChild(brightnessInput);
  divForInputs.appendChild(contrastInput);
  divForInputs.appendChild(submitButton);
}

const EffectCallbacks: Record<Effect, (pdiMatrix: RGBImageMatrix) => RGBImageMatrix | void> = {
  grayscale: grayScale,
  threshold: handleThreshold,
} as const;

// //RECEBE DADOS DO FRONT
// const nameValue = document.getElementById("test") as HTMLInputElement;
// const submitButton = document.getElementById("submit") as HTMLButtonElement;
// submitButton.addEventListener("click", function() {
//   console.log(nameValue.value);
//   (window as any).electronAPI.onSendData(nameValue.value);
// });

const setImage = (filePath: string, imageElementId: string): HTMLImageElement => {
    const imgElement = document.getElementById(imageElementId) as HTMLImageElement;
    if (imgElement) {
      imgElement.src = filePath;
      imgElement.style.display = 'block';
    }

    return imgElement;
}

(window as any).electronAPI.onFileSelected((filePath: string) => {
    if (!filePath.startsWith("file:///")) filePath = `file:///${filePath}`;
    setImage(filePath, 'image');

    const secondImgElement = setImage(filePath, 'second-image');
    if (secondImgElement) {
      secondImgElement.addEventListener('load', () => {
        digitalImage = new DigitalImage();
      });
    }
});

(window as any).electronAPI.onEffectClick((effect: Effect) => {
  console.log({ digitalImage })
  if (!digitalImage) {
    console.log("Alert");
  }

  console.log("Applying " + effect);

  const callback = EffectCallbacks[effect];

  console.log(callback);

  if (!callback) {
    console.log('Not yet implemented');
    return;
  }

  digitalImage.apply(callback);
});

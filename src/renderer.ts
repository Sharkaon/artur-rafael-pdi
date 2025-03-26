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

import { DigitalImage, ImageUpdateParams } from './DigitalImage';
import { grayScale, threshold, brightness } from './effects/filters';
import { translate, scale } from './effects/geometrical-transformations';
import { applyFromInputs } from './inputs';
import { Effect, RGBImageMatrix } from './types';
import './index.css';

console.log('👋 This message is being logged by "renderer.ts", included via Vite');

export type CallbackFunc = (matrix: RGBImageMatrix) => ImageUpdateParams | void;

let digitalImage: DigitalImage = new DigitalImage();

const handleContrast = (matrix: RGBImageMatrix) => {
  applyFromInputs(digitalImage, [{
    label: 'Contraste',
    name: 'contrast',
    type: 'number'
  }], threshold);
}

const handleTranslate = (matrix: RGBImageMatrix) => {
  applyFromInputs(digitalImage, [{
    label: "Movimento no eixo X",
    name: 'x',
    type: "number"
  }, {
    label: "Movimento no eixo Y",
    name: "y",
    type: "number"
  }], translate);
}

const handleScale = (matrix: RGBImageMatrix) => {
  applyFromInputs(digitalImage, [{
    label: "X",
    name: 'x',
    type: "number"
  }, {
    label: "Y",
    name: "y",
    type: "number"
  }], scale);
}

const handleBrightness = (matrix: RGBImageMatrix) => {
  applyFromInputs(digitalImage, [{
    label: "Brilho",
    name: "brightnessValue",
    type: "number"}
    ], brightness)
}

const EffectCallbacks: Record<Effect, CallbackFunc> = {
  grayscale: grayScale,
  threshold: handleContrast,
  translate: handleTranslate,
  brightness: handleBrightness,
  scale: handleScale,
} as const;

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
  if (!digitalImage) {
    console.log("Alert");
  }

  console.log("Applying " + effect);

  const callback = EffectCallbacks[effect];

  if (!callback) {
    console.log('Not yet implemented');
    return;
  }

  digitalImage.apply(callback);
});

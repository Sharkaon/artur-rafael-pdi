import { ImageUpdateParams } from "../DigitalImage";
import type { AlphaChannel, RGBImageMatrix, RGBPixel } from "../types";
const FULLY_OPAQUE: AlphaChannel = 255;



const dilatation = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
    const height = pdiMatrix.length;
    const width = pdiMatrix[0].length;
    console.log("Running dilatation");

    const newMatrix: RGBImageMatrix = [];
    for(let y = 1; y < height - 1; y++){
        const newRow: RGBPixel[] = [];
        for(let x = 1; x < width - 1; x++){
            const pixelCima = pdiMatrix[y-1][x];    // cima
            const pixelEsq = pdiMatrix[y][x-1];     // esquerda
            const pixelMeio = pdiMatrix[y][x];      // meio
            const pixelDir = pdiMatrix[y][x+1];     // direita
            const pixelBaixo = pdiMatrix[y+1][x];   // baixo
            const structedElement = [pixelCima, pixelEsq, pixelMeio, pixelDir, pixelBaixo] as const;

            //talvez fazer uma arrowFunction para isso
            const processedPixels: RGBPixel[] = [];
            for(let i = 0; i < structedElement.length; i++){
                const [Red, Green, Blue, _] = structedElement[i];
                const adjustedRed = Red + 10;
                const adjustedGreen = Green + 10;
                const adjustedBlue = Blue + 10;
                const adjustedPixel: RGBPixel = [adjustedRed, adjustedGreen, adjustedBlue, FULLY_OPAQUE];
                processedPixels.push(adjustedPixel);
            }
            if (processedPixels.length > 0) {
                // Pegar o pixel mais brilhante
                let brightestPixel = processedPixels[0];
                for (const pixel of processedPixels) {
                    const sumCurrent = brightestPixel[0] + brightestPixel[1] + brightestPixel[2];
                    const sumNew = pixel[0] + pixel[1] + pixel[2];
                    if (sumNew > sumCurrent) {
                        brightestPixel = pixel;
                    }
                }
                newRow.push(brightestPixel);
            } else {  
                newRow.push(pdiMatrix[y][x]);
            }
        }
    newMatrix.push(newRow);
    }
    return {
        newMatrix: newMatrix,
    }
}

//arrumar nomes de variaveis, ele só faz o contrario por enquanto
const erosion = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
    const height = pdiMatrix.length;
    const width = pdiMatrix[0].length;
    console.log("Running dilatation");

    const newMatrix: RGBImageMatrix = [];
    for(let y = 1; y < height - 1; y++){
        const newRow: RGBPixel[] = [];
        for(let x = 1; x < width - 1; x++){
            const pixelCima = pdiMatrix[y-1][x];    // cima
            const pixelEsq = pdiMatrix[y][x-1];     // esquerda
            const pixelMeio = pdiMatrix[y][x];      // meio
            const pixelDir = pdiMatrix[y][x+1];     // direita
            const pixelBaixo = pdiMatrix[y+1][x];   // baixo
            const structedElement = [pixelCima, pixelEsq, pixelMeio, pixelDir, pixelBaixo]

            //talvez fazer uma arrowFunction para isso
            const processedPixels: RGBPixel[] = [];
            for(let i = 0; i < 5; i++){
                const [Red, Green, Blue, _] = structedElement[i];
                const adjustedRed = Red - 10;
                const adjustedGreen = Green - 10;
                const adjustedBlue = Blue - 10;
                const adjustedPixel: RGBPixel = [adjustedRed, adjustedGreen, adjustedBlue, FULLY_OPAQUE];
                processedPixels.push(adjustedPixel);
            }
            if (processedPixels.length > 0) {
                // Pegar o pixel mais brilhante
                let brightestPixel = processedPixels[0];
                for (const pixel of processedPixels) {
                    const sumCurrent = brightestPixel[0] + brightestPixel[1] + brightestPixel[2];
                    const sumNew = pixel[0] + pixel[1] + pixel[2];
                    if (sumNew < sumCurrent) {
                        brightestPixel = pixel;
                    }
                }
                newRow.push(brightestPixel);
            } else {  
                newRow.push(pdiMatrix[y][x]);
            }
        }
    newMatrix.push(newRow);
    }
    return {
        newMatrix: newMatrix,
    }
}


export {dilatation, erosion}
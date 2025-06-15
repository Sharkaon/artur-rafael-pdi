import type { ImageUpdateParams } from "../DigitalImage";
import type { RGBImageMatrix } from "../types";
import { threshold } from "./filters";
import { dilatation } from "./mathematical-morphology";

type BinaryImage = number[][];

type BoundingBox = {
  label: number;
  width: number;
  height: number;
  aspectRatio: number;
  pixelCount: number;
};

type ItemClassification = { comprimidos: number, pilulas: number, ignorados: number };

//transforma em binários para facilitar a seleção
function toBinaryMatrix(img: RGBImageMatrix): BinaryImage {
  return img.map(row =>
    row.map(pixel => (pixel[0] > 127 ? 1 : 0)) // Assume R=G=B, então qualquer canal serve
  );
}

// usa Flood Fill (DFS) para quando achar um objeto, achar suas dimensões
function labelConnectedComponents(binaryImage: BinaryImage): number[][] {
  const height = binaryImage.length;
  const width = binaryImage[0].length;
  const labels: number[][] = Array.from({ length: height }, () => Array(width).fill(0));
  let currentLabel = 1;

  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
  ];

  function dfs(x: number, y: number) {
    const stack = [[x, y]];
    while (stack.length) {
      const [cx, cy] = stack.pop()!;
      if (
        cx < 0 || cx >= height ||
        cy < 0 || cy >= width ||
        binaryImage[cx][cy] === 0 ||
        labels[cx][cy] !== 0
      ) continue;

      labels[cx][cy] = currentLabel;

      for (const [dx, dy] of directions) {
        stack.push([cx + dx, cy + dy]);
      }
    }
  }

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (binaryImage[i][j] === 1 && labels[i][j] === 0) {
        dfs(i, j);
        currentLabel++;
      }
    }
  }

  return labels;
}

function getObjectBoundingBoxes(labels: number[][]): BoundingBox[] {
  const map = new Map<number, { minX: number; maxX: number; minY: number; maxY: number; count: number }>();

  for (let i = 0; i < labels.length; i++) {
    for (let j = 0; j < labels[0].length; j++) {
      const label = labels[i][j];
      if (label === 0) continue;

      const obj = map.get(label) || {
        minX: i, maxX: i, minY: j, maxY: j, count: 0
      };

      obj.minX = Math.min(obj.minX, i);
      obj.maxX = Math.max(obj.maxX, i);
      obj.minY = Math.min(obj.minY, j);
      obj.maxY = Math.max(obj.maxY, j);
      obj.count += 1;

      map.set(label, obj);
    }
  }

  const results: BoundingBox[] = [];
  for (const [label, box] of map.entries()) {
    const width = box.maxY - box.minY + 1;
    const height = box.maxX - box.minX + 1;
    const aspectRatio = width > height ? width / height : height / width;

    results.push({
      label,
      width,
      height,
      aspectRatio,
      pixelCount: box.count
    });
  }

  return results;
}

function classifyObjects(boxes: BoundingBox[]): ItemClassification {
  let comprimidos = 0;
  let pilulas = 0;
  let ignorados = 0;

  for (const box of boxes) {
    const { width, height, pixelCount, aspectRatio } = box;
    console.log(`label ${box.label}: width=${width}, height=${height}, pixelCount=${pixelCount}, aspectRatio=${aspectRatio.toFixed(2)}`);
    const perimeter = 2 * (width + height);
    const circularity = (4 * Math.PI * pixelCount) / (perimeter * perimeter);

    if (pixelCount < 10) {
      ignorados++;
    } else if (circularity > 0.55 && aspectRatio < 1.10) {
      comprimidos++;
    } else if (circularity > 0.3 && circularity <= 0.55 && aspectRatio >= 1.10 && aspectRatio < 2) {
      pilulas++;
    } else {
      ignorados++;
    }
  }

  return { comprimidos, pilulas, ignorados };
}

const clearPreviousResult = (newId: string) => {
  const resultParagraphs = document.getElementsByClassName('result');

  for (const result of resultParagraphs) {
    if (result.id !== newId)
      result.remove();
  }
}

const showResult = ({
  comprimidos,
  ignorados,
  pilulas,
}: ItemClassification, id: string) => {
  const resultParagraph = document.createElement('p');
  resultParagraph.className = 'result';
  resultParagraph.id = id;
  resultParagraph.innerHTML = `A imagem contém ${comprimidos} comprimido(s) circular(es); ${pilulas} pilula(s) oval(is) e ${ignorados} medicamento(s) que deve(m) ser descartado(s).`;

  const resultDiv = document.getElementById('results') as HTMLDivElement;
  resultDiv.appendChild(resultParagraph);
}

export const countPills = (pdiMatrix: RGBImageMatrix): ImageUpdateParams => {
  const { newMatrix: thresholdMatrix } = threshold(pdiMatrix, {
    thresholdLimit: 125,
  });
  const { newMatrix: dilatatedMatrix } = dilatation(thresholdMatrix);

  const binaryImage = toBinaryMatrix(dilatatedMatrix);

  const labels = labelConnectedComponents(binaryImage);

  const objects = getObjectBoundingBoxes(labels);

  const items = classifyObjects(objects);

  const newResultId = new Date().toISOString();

  clearPreviousResult(newResultId);
  showResult(items, newResultId);
  return { newMatrix: dilatatedMatrix };
}
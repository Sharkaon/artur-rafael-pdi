import { DigitalImage, ImageUpdateParams } from "./DigitalImage";
import { RGBImageMatrix } from "./types";

export type Input = {
  name: string;
  label: string;
  type?: "number"
}

type Callback = (matrix: RGBImageMatrix, params: Record<string, any>) => ImageUpdateParams;

export const applyFromInputs = (
  digitalImage: DigitalImage,
  inputs: Input[],
  callback: Callback,
) => {
  const divForInputs = document.getElementById('inputs');
  const inputElements: HTMLInputElement[] = [];

  inputs.forEach((input) => {
    const inputEl = document.createElement('input');
    inputEl.setAttribute('id', `${input.name}-input`);
    inputEl.setAttribute('placeholder', `${input.label}`);
    if (input.type) inputEl.setAttribute('type', input.type);

    divForInputs.appendChild(inputEl);

    inputElements.push(inputEl);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = "Aplicar";
  const applyEffect = () => {
    const params: Record<string, any> = {};
    inputs.forEach((input) => {
      const value = (document.getElementById(`${input.name}-input`) as HTMLInputElement).value;
      params[input.name] = Number(value);
    });

    digitalImage.apply((matrix: RGBImageMatrix) => callback(matrix, params));

    inputElements.forEach((inputEl) => {
      inputEl.remove();
    });
    submitButton.remove();
  }
  submitButton.onclick = applyEffect;
  divForInputs.appendChild(submitButton);
}
const saveImg = () => {
  const img = document.getElementById('second-image') as HTMLImageElement;
  const inputsDiv = document.getElementById('inputs');

  const downloadLink = document.createElement('a');
  downloadLink.href = img.src;
  downloadLink.target = '_blank';
  downloadLink.download = 'imagem-final.png';
  downloadLink.innerText = 'Baixe a imagem';

  downloadLink.addEventListener('click', () => {
    downloadLink.remove();
  });

  inputsDiv.appendChild(downloadLink);
}

export { saveImg }
// DownloadButton.js
import React from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const DownloadButton = ({ images }) => {
  const handleDownload = async () => {
    const zip = new JSZip();
    const imgFolder = zip.folder('images');

    await Promise.all(
      images.map(async (image) => {
        const response = await fetch(image.src);
        const blob = await response.blob();
        imgFolder.file(`${image.parentName}_${image.coords.x}_${image.coords.y}.png`, blob);
      })
    );

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'cropped_images.zip');
  };

  return (
    <button onClick={handleDownload} disabled={!images.length}>
      Скачать архив
    </button>
  );
};

export default DownloadButton;

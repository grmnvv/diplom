// ImageInput.js
import React from 'react';

const ImageInput = ({ onImagesLoad }) => {
  const handleImagesChange = (e) => {
    const files = e.target.files;
    onImagesLoad(files);
  };

  return (
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleImagesChange}
    />
  );
};

export default ImageInput;
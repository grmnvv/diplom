// CroppedImageGallery.js
import React from 'react';

const CroppedImageGallery = ({ images }) => {
  return (
    <div>
      {images.map((image, index) => (
        <div key={index}>
          <h4>
            {image.parentName} ({image.coords.x}, {image.coords.y})
          </h4>
          <img
            src={image.src}
            alt={`Cropped Image ${index}`}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default CroppedImageGallery;
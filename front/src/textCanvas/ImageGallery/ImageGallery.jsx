// ImageGallery.js
import React from 'react';

const ImageGallery = ({ images, onSelect }) => {
  return (
    <div>
      {images.map((image,index) => (
<img
key={index}
src={image.img.src}
alt={`Image ${index}`}
onClick={() => onSelect(image)}
style={{
border: image.selected ? '1px solid green' : '',
cursor: 'pointer',
width: '100px',
height: '100px',
objectFit: 'cover',
}}
/>
))}
</div>
);
};

export default ImageGallery;
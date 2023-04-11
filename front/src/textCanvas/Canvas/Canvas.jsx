// ImageAnnotator.js
import React, { useState } from 'react';
import { Stage, Layer, Image, Rect, Transformer } from 'react-konva';
import Konva from 'konva';

const Canvas = () => {
  const [image, setImage] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [selectedId, selectShape] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target.result;
      setImage(img);
    };

    reader.readAsDataURL(file);
  };

  const handleAddRectangle = () => {
    setRectangles([
      ...rectangles,
      {
        x: 20,
        y: 20,
        width: 100,
        height: 100,
        id: rectangles.length,
      },
    ]);
  };

  const handleRectangleClick = (id) => {
    selectShape(id);
  };

  const handleStageMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      selectShape(null);
    }
  };

  const saveBoundingBoxes = () => {
    rectangles.forEach((rect, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = rect.width;
      canvas.height = rect.height;
      const context = canvas.getContext('2d');
      context.drawImage(
        image,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height
      );
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `image_${i}.jpg`;
        link.click();
      }, 'image/jpeg');
    });
  };

  return (
    <>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={handleAddRectangle}>Добавить прямоугольник</button>
      <button onClick={saveBoundingBoxes}>Сохранить выделенные области</button>
      <Stage
        width={image ? image.width : 0}
        height={image ? image.height : 0}
        onMouseDown={handleStageMouseDown}
        draggable
      >
        <Layer>
          {image && <Image image={image} />}
          {rectangles.map((rect) => (
            <Rect
              key={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={selectedId === rect.id ? 'rgba(0,0,255,0.5)' : 'rgba(0,0,255,0.2)'}
              draggable
              onDragEnd={(e) => {
                const newRectangles = rectangles.slice();
                newRectangles[rect.id] = {
                  ...newRectangles[rect.id],
                  x: e.target.x(),
                  y: e.target.y(),
                };
                setRectangles(newRectangles);
              }}
              onClick={() => handleRectangleClick(rect.id)}
            />
            ))}
</Layer>
<Layer>
{selectedId !== null && (
<Transformer
ref={(node) => {
if (node) {
node.attachTo(rectangles[selectedId]);
}
}}
boundBoxFunc={(oldBox, newBox) => {
if (newBox.width < 20 || newBox.height < 20) {
return oldBox;
}
return newBox;
}}
onTransformEnd={() => {
const transformer = rectangles[selectedId].getTransformer();
const newRectangles = rectangles.slice();
newRectangles[selectedId] = {
...newRectangles[selectedId],
x: transformer.x(),
y: transformer.y(),
width: transformer.width(),
height: transformer.height(),
};
setRectangles(newRectangles);
transformer.getLayer().batchDraw();
}}
/>
)}
</Layer>
</Stage>
</>
);
};

export default Canvas;
         

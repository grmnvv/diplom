import React from "react";
import { Circle } from "react-konva";

const ResizeAnchor = ({ x, y, onDragMove, onDragEnd }) => {
  return (
    <Circle
      x={x}
      y={y}
      radius={6}
      fill="white"
      stroke="black"
      strokeWidth={1}
      draggable
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export default ResizeAnchor;

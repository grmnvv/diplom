import React from "react";
import { Rect} from "react-konva";
import ResizeAnchor from "../ResizeAnchor/ResizeAnchor";


const BoundingBox = ({
    rect,
    onDragMove,
    onResize,
    onSelect,
    selected,
    onDragEnd,
    onResizeEnd,
    scale
    }) => {
    const handleSelect = () => {
        onSelect(rect.id);
    };

    console.log(scale)
    const anchorPositions = [
        { x: "x", y: "y" },
        { x: "x", y: "y", offsetX: "width" },
        { x: "x", y: "y", offsetY: "height" },
        { x: "x", y: "y", offsetX: "width", offsetY: "height" },
    ];

    return (
        <>
        <Rect
            x={rect.x * scale}
            y={rect.y * scale}
            width={rect.width * scale}
            height={rect.height * scale}
            fill={rect.color}
            opacity={selected ? 0.6 : 0.4}
            draggable
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onClick={handleSelect}
        />
        {selected && (
            <>
            {anchorPositions.map((point, index) => (
                <ResizeAnchor
                key={index}
                x={(rect[point.x] + (point.offsetX ? rect[point.offsetX] : 0)) * scale}
                y={(rect[point.y] + (point.offsetY ? rect[point.offsetY] : 0)) * scale}
                onDragMove={(e) => onResize(e, index)}
                onDragEnd={onResizeEnd}
                />
            ))}
            </>
        )}
        </>
    );
};

  export default BoundingBox
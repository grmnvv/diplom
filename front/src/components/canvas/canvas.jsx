const [images, setImages] = useState([]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [selectedImage, setSelectedImage] = useState(false);
  const [boundingBoxes, setBoundingBoxes] = useState(false);
  const canvasOffSetX = useRef(null);
  const canvasOffSetY = useRef(null);
  const startX = useRef(null);
  const startY = useRef(null);

  useEffect(() => {
      const canvas = canvasRef.current;
      canvas.width = 500;
      canvas.height = 500;

      const context = canvas.getContext("2d");
      context.lineCap = "round";
      context.strokeStyle = "black";
      context.lineWidth = 5;
      contextRef.current = context;

      const canvasOffSet = canvas.getBoundingClientRect();
      canvasOffSetX.current = canvasOffSet.top;
      canvasOffSetY.current = canvasOffSet.left;
  }, []);

  
  const startDrawingRectangle = ({nativeEvent}) => {
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();

    startX.current = nativeEvent.clientX - canvasOffSetX.current;
    startY.current = nativeEvent.clientY - canvasOffSetY.current;

    setIsDrawing(true);
  };

  const drawRectangle = ({nativeEvent}) => {
    if (!isDrawing) {
        return;
    }

    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();

    const newMouseX = nativeEvent.clientX - canvasOffSetX.current;
    const newMouseY = nativeEvent.clientY - canvasOffSetY.current;

    const rectWidht = newMouseX - startX.current;
    const rectHeight = newMouseY - startY.current;

    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    contextRef.current.strokeRect(startX.current, startY.current, rectWidht, rectHeight);
    co
  };

  const stopDrawingRectangle = () => {
    setIsDrawing(false);
  };


  const handleImageUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      uploadedImages.push({ file, url });
    }
    setImages([...images, ...uploadedImages]);
  };

  
  const drawSelectedPhoto = (image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const canvasWidth = canvas.offsetWidth;
      const canvasHeight = canvasWidth / aspectRatio;
      canvas.height = canvasHeight;
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    };
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    console.log(image)
    drawSelectedPhoto(image);
    setBoundingBoxes([]);
  };



  return (
    <div>
      <input type="file" multiple onChange={handleImageUpload} />
      <div style={{ display: "flex", overflowX: "scroll" }}>
        {images.map((image) => (
          <img
            key={image.url}
            src={image.url}
            style={{ maxWidth: "100px", marginRight: "10px" }}
            onClick={() => handleImageSelect(image.url)}
          />
        ))}
      </div>

        <div>
          <h3>Selected Image:</h3>
          <canvas
            ref={canvasRef}
            width='800px'
            onMouseDown={startDrawingRectangle}
            onMouseMove={drawRectangle}
            onMouseUp={stopDrawingRectangle}
            onMouseLeave={stopDrawingRectangle}
          />
          
        </div>

    </div>
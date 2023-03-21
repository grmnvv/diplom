import React from "react";

const ImageCard = ({image, imageName}) => {

    return(
        <div>
            {imageName}
            <img src={image}/>
        </div>
    );
}

export default ImageCard;
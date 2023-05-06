import random
from PIL import Image
import numpy as np
import cv2
from tensorflow.keras.layers import Dense, LSTM, BatchNormalization, Input, Conv2D, MaxPool2D, Lambda, Bidirectional
from tensorflow.keras.models import Model
import tensorflow.keras.backend as K

char_list = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ.-0123456789'

def TextPrediction(image, model):
    
    result = image_prep(image)
    res = get_pred(np.expand_dims(result, axis=0), model)
    return {'result': res}


def TextModel(path):
    #CRNN model
    inputs = Input(shape=(32,128,1))
    
    # convolution layer with kernel size (3,3)
    conv_1 = Conv2D(64, (3,3), activation = 'relu', padding='same')(inputs)
    # poolig layer with kernel size (2,2)
    pool_1 = MaxPool2D(pool_size=(2, 2), strides=2)(conv_1)
    
    conv_2 = Conv2D(128, (3,3), activation = 'relu', padding='same')(pool_1)
    pool_2 = MaxPool2D(pool_size=(2, 2), strides=2)(conv_2)
    
    conv_3 = Conv2D(256, (3,3), activation = 'relu', padding='same')(pool_2)
    
    conv_4 = Conv2D(256, (3,3), activation = 'relu', padding='same')(conv_3)
    # poolig layer with kernel size (2,1)
    pool_4 = MaxPool2D(pool_size=(2, 1))(conv_4)
    
    conv_5 = Conv2D(512, (3,3), activation = 'relu', padding='same')(pool_4)
    # Batch normalization layer
    batch_norm_5 = BatchNormalization()(conv_5)
    
    conv_6 = Conv2D(512, (3,3), activation = 'relu', padding='same')(batch_norm_5)
    batch_norm_6 = BatchNormalization()(conv_6)
    pool_6 = MaxPool2D(pool_size=(2, 1))(batch_norm_6)

    
    conv_7 = Conv2D(512, (2,2), activation = 'relu')(pool_6)
    
    squeezed = Lambda(lambda x: K.squeeze(x, 1))(conv_7)

    # bidirectional LSTM layers with units=128
    blstm_1 = Bidirectional(LSTM(128, return_sequences=True, dropout = 0.2))(squeezed)
    blstm_2 = Bidirectional(LSTM(128, return_sequences=True, dropout = 0.2))(blstm_1)
    
    outputs = Dense(len(char_list)+1, activation = 'softmax')(blstm_2)

    # model to be used at test time
    model = Model(inputs, outputs)

    print(model.summary())
    model.load_weights(path)

    return model


def encode_to_labels(txt):
    dig_lst = []
    for index, char in enumerate(txt):
        try:
            dig_lst.append(char_list.index(char))
        except:
            print(char)
    return dig_lst


def find_dominant_color(image):
    width, height = 150, 150
    image = image.resize((width, height), resample=0)
    pixels = image.getcolors(width * height)
    sorted_pixels = sorted(pixels, key=lambda t: t[0])
    dominant_color = sorted_pixels[-1][1]
    return dominant_color


def preprocess_img(img, imgSize):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    if img is None:
        img = np.zeros([imgSize[1], imgSize[0]])
        print("Image None!")
    (wt, ht) = imgSize
    (h, w) = img.shape
    fx = w / wt
    fy = h / ht
    f = max(fx, fy)

    newSize = (max(min(wt, int(w / f)), 1),
               max(min(ht, int(h / f)), 1))
    img = cv2.resize(img, newSize, interpolation=cv2.INTER_CUBIC)
    most_freq_pixel = find_dominant_color(Image.fromarray(img))
    target = np.ones([ht, wt]) * most_freq_pixel
    target[0:newSize[1], 0:newSize[0]] = img
    img = target

    return img


def image_prep(image):
    image = preprocess_img(image, (128, 32))
    image = np.expand_dims(image, axis=-1)
    image = image / 255.
    return image


def get_pred(array, model):
    output = ''
    array = np.array(array)
    prediction = model.predict(array)
    out = K.get_value(
        K.ctc_decode(prediction, input_length=np.ones(prediction.shape[0]) * prediction.shape[1], greedy=True)[0][0])
    for x in out:
        for p in x:
            if int(p) != -1:
                output += char_list[int(p)]
    return output


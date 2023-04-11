import React, { useState } from "react";
import ndarray from "ndarray";
import * as tf from "@tensorflow/tfjs";



const char_list = [
  "А",
  "Б",
  "В",
  "Г",
  "Д",
  "Е",
  "Ё",
  "Ж",
  "З",
  "И",
  "Й",
  "К",
  "Л",
  "М",
  "Н",
  "О",
  "П",
  "Р",
  "С",
  "Т",
  "У",
  "Ф",
  "Х",
  "Ц",
  "Ч",
  "Ш",
  "Щ",
  "Ъ",
  "Ы",
  "Ь",
  "Э",
  "Ю",
  "Я",
  ".",
  "-",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];
const model = tf.loadLayersModel(
  "/Users/egorgarmanov/Diplome/front/src/pages/augmentation/model.json"
);

function get_pred(array) {
  const char_list = [
    "А",
    "Б",
    "В",
    "Г",
    "Д",
    "Е",
    "Ё",
    "Ж",
    "З",
    "И",
    "Й",
    "К",
    "Л",
    "М",
    "Н",
    "О",
    "П",
    "Р",
    "С",
    "Т",
    "У",
    "Ф",
    "Х",
    "Ц",
    "Ч",
    "Ш",
    "Щ",
    "Ъ",
    "Ы",
    "Ь",
    "Э",
    "Ю",
    "Я",
    ".",
    "-",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  let output = "";
  array = tf.tensor(array.data, array.shape);
  const prediction = model.predict(array);
  const out = tf
    .backend()
    .ctcDecode(
      prediction,
      tf.ones([prediction.shape[0]]) * prediction.shape[1],
      true
    )[0][0];
  for (const x of out) {
    for (const p of x) {
      if (parseInt(p) !== -1) {
        output += char_list[parseInt(p)];
      }
    }
  }
  return output;
}

const Model = () => {


  return (
    <div>
      <button

      >
        Predict Text
      </button>

    </div>
  );
};

export default Model;

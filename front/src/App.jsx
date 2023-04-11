import React, { useRef, useState } from "react";
import {Routes, Route} from 'react-router-dom';
import LoginPage from "./pages/login/login";
import RegisterPage from "./pages/registration/register";
import { observer } from "mobx-react-lite";
import Forgot from "./pages/forgot/forgot";
import ALL from "./components/canvas/canvas";

const App = () => {
  return(
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/registration" element={<RegisterPage/>}/>
      <Route path="/reset-password" element={<Forgot/> }/>
      <Route path="/test" element={<ALL/> }/>
    </Routes>
  );
}

export default observer(App);

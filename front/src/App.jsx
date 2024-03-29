import React, { useRef, useState } from "react";
import {Routes, Route} from 'react-router-dom';
import LoginPage from "./pages/login/login";
import RegisterPage from "./pages/registration/register";
import { observer } from "mobx-react-lite";
import Forgot from "./pages/forgot/forgot";
import Canvas from "./project/canvas/Canvas";
import NewProject from "./project/NewProject/NewProject";
import Projects from "./project/Projects/Projects";
import ConnectionChecker from "./pages/profile/profile";
import EditProject from "./project/editProject/EditProject";
import Homepage from "./pages/HomePage/homepage";

const App = () => {
  return(
    <Routes>
      <Route path="/" element={<Homepage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/registration" element={<RegisterPage/>}/>
      <Route path="/reset-password" element={<Forgot/> }/>
      <Route path="/projects" element={<Projects/> }/>
      <Route path="/project/:id" element={<Canvas/> }/>
      <Route path="/project/edit/:id" element={<EditProject/> }/>
      <Route path="/project/new" element={<NewProject/> }/>
    </Routes>
  );
}

export default observer(App);

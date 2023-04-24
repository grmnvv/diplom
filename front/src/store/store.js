import { makeAutoObservable, runInAction } from "mobx";
import UserDto from "../DTO/userDto";
import AuthService from "../serives/AuthService";

export default class Store {
  isAuth = false;
  isRegistered = false;
  isLoading = false;
  error = '';
  salt = "";
  user = {
    email: "",
    isActivated: false,
    id: "",
    login: "",
  };

  Project = {
    user: "",
    id: "",
    name: "",
    isHelper: false,
    imageData: [
      {
        id: "",
        name: "",
        url: "",
        rects: [
          {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            id: "",
            color: "",
            name: "",
          },
        ],
      },
    ],
  };
  allProjects = new Array();
  constructor() {
    makeAutoObservable(this);
  }
  updateImageDataRects(imageId, newRects) {
    const imageIndex = this.Project.imageData.findIndex(
      (image) => image.id === imageId
    );
    console.log(newRects);

    if (imageIndex !== -1) {
      this.Project.imageData[imageIndex].rects = newRects;
    }
  }
  setAuth(bool) {
    this.isAuth = bool;
  }
  setRegister(bool) {
    this.isRegistered = bool;
  }
  get getError() {
    return this.error;
  }
  setLoading(bool){
    this.isLoading = bool;
  }
  setUser(user) {
    this.user = user;
  }
  setProject(project) {
    this.Project = project;
  }
  setAllProject(project) {
    this.allProjects = project;
  }
  pushProject(project) {
    this.allProjects.push(project);
  }
  setError(error){
    this.error = error;
}
  setSalt(salt) {
    this.salt = salt;
  }

  async loadImageAsBase64(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error loading image from ${url}`);
      }
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }


  async login(email, password) {
    try {
      const response = await AuthService.login(email, password);
      localStorage.setItem('token', response.data.accesToken);
      console.log(response)
      this.setAuth(true);
      this.setUser(response.data.user);
    } catch (e) {
      console.log(e.response?.data?.message);
      this.setError(e.response?.data?.message);
    }
  }


  async registration(email, password, login) {
    this.setError('')
    try {
      const response = await AuthService.registration(email, password, login);
      localStorage.setItem("token", response.data.accessToken);
      this.setRegister(true);
      this.setUser(response.data.user);
    } catch (e) {
      this.setError(e.response?.data?.message);
      console.error(e.response?.data?.message);
    }
  }
  async logout() {
    try {
      await AuthService.logout();
      localStorage.removeItem("token");
      this.setAuth(false);
      this.setUser({});
    } catch (e) {
      console.error(e.response?.data?.message);
    }
  }
  async forgot(id, token, password) {
    try {
      await AuthService.forgot(id, token, password);
    } catch (e) {
      console.error(e.response?.data?.message);
    }
  }

  async sendCode(email, code) {
    try {
      const response = await AuthService.sendCode(email, code);
      this.setSalt(response.data.salt);
      console.log(response.data.salt);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }
  async changePassword(email, password) {
    try {
      console.log("her ", this.salt);
      await AuthService.changePassword(email, password, this.salt);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }
  async createProject(formData) {
    try {
      const response = await AuthService.createProject(formData);
      console.log(response);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }
  async getProject() {
    try {
      this.setAllProject([])
      this.setLoading(true)
      const response = await AuthService.getProject();
      const projects = await Promise.all(
        response.data.map(async (project) => {
          const imageData = await Promise.all(
            project.imageData.map(async (image) => {
              const base64Url = await this.loadImageAsBase64(
                `http://localhost:5001/he${image.url.replace(
                  "Users/egorgarmanov/Desktop/he/",
                  ""
                )}`
              );
              return { ...image, url: base64Url };
            })
          );
          return { ...project, imageData };
        })
      );
      projects.forEach((project) => this.pushProject(project));
      this.setProject(this.allProjects[0]);
    } catch (e) {
      console.log(e.response?.data?.message);
    } finally {
      this.setLoading(false);
    }
  }

  async saveProject() {
    try {
      this.setLoading(true)
      const projectWithoutURLs = {
        ...this.Project,
        imageData: this.Project.imageData.map((image) => {
          const { url, ...rest } = image;
          return rest;
        }),
      };
      const response = await AuthService.saveProject(projectWithoutURLs);
    } catch (e) {
      console.log(e.response?.data?.message);
    } finally{
      this.setLoading(false);
    }
  }

  async selectProject(id) {
    try {
      const index = this.allProjects.findIndex((project) => project.id === id);
      this.setProject(this.allProjects[index]);
    } catch (e) {
      console.log(e.response?.data?.message);
    }
  }
}

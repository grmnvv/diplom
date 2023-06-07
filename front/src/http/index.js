import axios from 'axios';



const $api =  axios.create({
    withCredentials: true,
    baseURL: 'http://194.67.67.177:5001/api'
})

$api.interceptors.request.use((config) =>{
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    return config;
})

export default $api;
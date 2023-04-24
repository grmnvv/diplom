import React, {useContext, useState} from 'react'
import { observer } from "mobx-react-lite";
import { Context } from '../..';

const ForgotPage = () => {

    const {store} = useContext(Context);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [enter, setEnter] = useState('');

    async function sendCode(email, code){
        const Acode = Math.floor(Math.random() * 9000 * 1000)
        setCode(Acode)
        console.log(Acode)
        return await store.sendCode(email, Acode)
    }
    function checkCode(){

        if(enter == code){

            console.log('Everything is good')
        } else {
            console.log('Bad code')
        }
    }
    async function changePassword(email, password){
        setPassword(password)
        await store.changePassword(email, password)
    }
  return (
    <div>
        <input 
            type="email" 
            onChange={(e) => {setEmail(e.target.value)}}
            value={email}
            placeholder='email'
        />
        <input 
            type="text" 
            onChange={(e) => {setEnter(e.target.value)}}
            value={enter}
            placeholder='enter'
        />
        <input 
            type="text" 
            onChange={(e) => {setPassword(e.target.value)}}
            value={password}
            placeholder='password'
        />
        <button onClick={() => {     
            sendCode(email, code)}}>
            sendcode
        </button>
        <button onClick={() => {
            checkCode()}}>
            check
        </button>
        <button onClick={() => {changePassword(email, password)}}>
        password
        </button>
    </div>
  )
}

export default observer(ForgotPage);
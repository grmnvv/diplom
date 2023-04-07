import { observer } from 'mobx-react-lite';
import React, {useState, useContext} from 'react'
import { Context } from '../..';
const RegisterPage = () => {

    const {store} = useContext(Context);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [login, setLogin] = useState('');

    async function handleRegister(email, password, login){
        try {
            await store.registration(email, password, login)
        } catch (e) {
            console.log(e)
        }
    }

  return (
    <div>
        <input 
            type="email" 
            onChange={e => setEmail(e.target.value)}
            value={email}
            placeholder="email"
        />
        <input 
            type="login" 
            onChange={e => setLogin(e.target.value)}
            value={login}
            placeholder="login"
        />
        <input 
            type="password" 
            onChange={e => setPassword(e.target.value)}
            value={password}
            placeholder="password"
        />
        <button
            onClick={() => {handleRegister(email, password, login)}}
        >
            register
        </button>
    </div>
  )
}

export default observer(RegisterPage);
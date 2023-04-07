import { observer } from 'mobx-react-lite';
import React, {useState, useContext} from 'react'
import { Context } from '../..';
const LoginPage = () => {

    const {store} = useContext(Context);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin(email, password){
        try {
            await store.login(email, password)
        } catch (e) {
            console.log(e)
        }
    }

  return (
    <div>
        <input 
            type="text" 
            onChange={e => setEmail(e.target.value)}
            value={email}
            placeholder="email/username"
        />
        <input 
            type="password" 
            onChange={e => setPassword(e.target.value)}
            value={password}
            placeholder="password"
        />
        <button
            onClick={() => {handleLogin(email, password)}}
        >
            login
        </button>
    </div>
  )
}

export default observer(LoginPage);
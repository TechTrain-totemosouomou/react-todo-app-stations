import axios from "axios";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { signIn } from "../authSlice";
import { Header } from "../components/Header";
import { url } from "../const";
import "./signIn.css";

export const SignIn = () => {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState();
  const [, setCookie, ] = useCookies();
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const onSignIn = () => {
    axios.post(`${url}/signin`, {email: email, password: password})
      .then((res) => {
        dispatch(signIn());
        setCookie("token", res.data.token);
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`サインインに失敗しました。${err}`);
      })

      if(auth) return navigate('/');
  }

  return (
    <div>
      <Header/>
      <main className="signin">
        <h2>サインイン</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="signin-form">
          <label className="email-label">メールアドレス</label><br />
          <input type="email" className="email-input" onChange={handleEmailChange} /><br />
          <label className="password-label">パスワード</label><br />
          <input type="password" className="password-input" onChange={handlePasswordChange} /><br />
          <button type="button" className="signin-button" onClick={onSignIn}>サインイン</button>
        </form>
        <Link to="/signup">新規作成</Link>
      </main>
    </div>
  )
}
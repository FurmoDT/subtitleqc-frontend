import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import Production from "./pages/Production";
import QualityControl from "./pages/QualityControl";
import Manual from "./pages/Manual";
import LoginPage from "./pages/LoginPage";
import {publicUrl} from "./utils/config";
import {useEffect, useState} from "react";
import axios, {AxiosInterceptor} from "./utils/axios";
import {HttpStatusCode} from "axios";

function App() {
    const basename = `/${publicUrl.split('/').slice(1).join('/')}`
    const [accessToken, setAccessToken] = useState(null)
    const [fetchAccessTokenCompleted, setFetchAccessTokenCompleted] = useState(false)
    useEffect(() => {
        axios.post('/v1/auth/refresh').then((response) => {
            if (response.status === HttpStatusCode.Ok) setAccessToken(response.data.access_token)
        }).finally(() => setFetchAccessTokenCompleted(true))
    }, [])
    return <div style={{overflow: 'hidden', width: '100vw', height: '100vh'}}>
        <AxiosInterceptor setAccessToken={setAccessToken}>
            <BrowserRouter basename={basename}>
                <Routes>
                    <Route path={"/"} element={<Navbar basename={basename}
                                                       accessToken={accessToken} setAccessToken={setAccessToken}
                                                       fetchAccessTokenCompleted={fetchAccessTokenCompleted}/>}>
                        <Route index element={<MainPage/>}/>
                        <Route path={"/production"} element={<Production/>}/>
                        <Route path={"/qc"} element={<QualityControl/>}/>
                        <Route path={"/manual"} element={<Manual/>}/>
                    </Route>
                    <Route path={"/login"}
                           element={<LoginPage accessToken={accessToken} setAccessToken={setAccessToken}/>}/>
                </Routes>
            </BrowserRouter>
        </AxiosInterceptor>
    </div>
}

export default App;

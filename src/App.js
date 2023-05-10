import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import Production from "./pages/Production";
import QualityControl from "./pages/QualityControl";
import Manual from "./pages/Manual";
import LoginPage from "./pages/LoginPage";
import {publicUrl} from "./utils/config";
import {AxiosInterceptor} from "./utils/axios";
import {AuthProvider} from "./utils/authContext";
import SignupPage from "./pages/SignupPage";

function App() {
    const basename = `/${publicUrl.split('/').slice(1).join('/')}`
    return <div style={{overflow: 'hidden', width: '100vw', height: '100vh'}}>
        <AuthProvider>
            <AxiosInterceptor>
                <BrowserRouter basename={basename}>
                    <Routes>
                        <Route path={"/"} element={<Navbar basename={basename}/>}>
                            <Route index element={<MainPage/>}/>
                            <Route path={"/production"} element={<Production/>}/>
                            <Route path={"/qc"} element={<QualityControl/>}/>
                            <Route path={"/manual"} element={<Manual/>}/>
                        </Route>
                        <Route path={"/login"} element={<LoginPage/>}/>
                        <Route path={"/signup"} element={<SignupPage/>}/>
                    </Routes>
                </BrowserRouter>
            </AxiosInterceptor>
        </AuthProvider>
    </div>
}

export default App;

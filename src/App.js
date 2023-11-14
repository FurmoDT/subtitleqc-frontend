import "./css/AuthCss.css"
import "./css/SplitterCss.css"
import "overlayscrollbars/overlayscrollbars.css";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import Production from "./pages/production/Production";
import QualityControl from "./pages/QualityControl";
import Manual from "./pages/Manual";
import LoginPage from "./pages/auth/LoginPage";
import {googleClientId, publicUrl} from "./utils/config";
import {AxiosInterceptor} from "./utils/axios";
import {AuthContext} from "./contexts/authContext";
import SignupPage from "./pages/auth/SignupPage";
import UserPage from "./pages/user/UserPage";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {useContext} from "react";
import MainPage from "./pages/main/MainPage";
import AuthComponent from "./components/AuthComponent";
import TextPage from "./pages/text/TextPage";
import AwsSignedComponent from "./components/AwsSignedComponent";

function App() {
    const basename = `/${publicUrl.split('/').slice(1).join('/')}`
    const {userState} = useContext(AuthContext);

    return <div className={'app-container'}>
        <AxiosInterceptor>
            <BrowserRouter basename={basename}>
                <Routes>
                    <Route path={"/"} element={userState.isAuthenticated ? <Navbar basename={basename}/> :
                        <Navigate to={'/login'} replace/>}>
                        <Route index element={<MainPage/>}/>
                        <Route path={'/*'} element={<MainPage/>}/>
                        <Route path={"/video"} element={<AwsSignedComponent component={Production} type={'video'}/>}/>
                        <Route path={"/video/*"} element={<AwsSignedComponent component={Production} type={'video'}/>}/>
                        <Route path={"/text"} element={<AwsSignedComponent component={TextPage} type={'text'}/>}/>
                        <Route path={"/text/*"} element={<AwsSignedComponent component={TextPage} type={'text'}/>}/>
                        <Route path={"/qc"} element={<QualityControl/>}/>
                        <Route path={"/manual"} element={<Manual/>}/>
                        <Route path={"/user/*"} element={<AuthComponent component={UserPage}/>}/>
                    </Route>
                    <Route path={"/login"}
                           element={<GoogleOAuthProvider clientId={googleClientId}><LoginPage/></GoogleOAuthProvider>}/>
                    <Route path={"/signup"} element={<SignupPage/>}/>
                </Routes>
            </BrowserRouter>
        </AxiosInterceptor>
    </div>
}

export default App;

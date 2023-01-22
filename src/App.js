import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import Production from "./pages/Production";
import QualityControl from "./pages/QualityControl";

function App() {
    const public_url = process.env.REACT_APP_PUBLIC_URL
    const basename = `/${public_url.split('/').slice(1).join('/')}`
    return <div style={{overflow: 'hidden', width: '100vw', height: '100vh'}}>
        <BrowserRouter basename={basename}>
            <Routes>
                <Route path={"/"} element={<Navbar basename={basename}/>}>
                    <Route index element={<MainPage/>}/>
                    <Route path={"/production"} element={<Production/>}/>
                    <Route path={"/qc"} element={<QualityControl/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </div>
}

export default App;

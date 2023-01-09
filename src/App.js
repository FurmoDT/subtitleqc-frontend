import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import Production from "./pages/Production";
import QualityControl from "./pages/QualityControl";

function App() {
    const public_url = process.env.REACT_APP_PUBLIC_URL
    const basename = public_url.substring(public_url.lastIndexOf('/'))
    return <BrowserRouter basename={basename}>
        <Routes>
            <Route path={"/"} element={<Navbar/>}>
                <Route index element={<MainPage/>}/>
                <Route path={"/production"} element={<Production/>}/>
                <Route path={"/qc"} element={<QualityControl/>}/>
            </Route>
        </Routes>
    </BrowserRouter>
}

export default App;

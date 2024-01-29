import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import 'react-data-grid/lib/styles.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import {AuthProvider} from "./contexts/authContext";
import {WebsocketProvider} from "./contexts/websocketContext";
import {SessionProvider} from "./contexts/sessionContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode>
    <SessionProvider>
        <AuthProvider>
            <WebsocketProvider>
                <App/>
            </WebsocketProvider>
        </AuthProvider>
    </SessionProvider>
</React.StrictMode>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

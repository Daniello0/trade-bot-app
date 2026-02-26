import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './view/main/App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from "react-router";
import BotSettings from "./view/bot-settings/BotSettings";
import Modal from 'react-modal';
import {BotMonitor} from "./view/bot-settings/BotMonitor";
import {BotActionsProvider} from "./context/BotActionsContext";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const rootElement: HTMLElement | null = document.getElementById('root');
if (rootElement) {
    Modal.setAppElement(rootElement);
}

root.render(
  <React.StrictMode>
      <BotActionsProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/console/:botId" element={<BotMonitor />} />
                  <Route path="/" element={<App />} />
                  <Route path="/add-bot" element={<BotSettings />} />
                  <Route path={"/edit-bot/:botId"} element={<BotSettings />} />
                  <Route path="*" element={<div><h1>Страница не найдена (404)</h1></div>} />
              </Routes>
          </BrowserRouter>
      </BotActionsProvider>
  </React.StrictMode>
);
reportWebVitals();

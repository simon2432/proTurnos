import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Inicio from './views/Inicio.jsx';
import PerfilC from './views/PerfilC.jsx';
import PerfilE from './views/PerfilE.jsx';
import TurnosC from './views/TurnosC.jsx';
import TurnosE from './views/TurnosE.jsx';
import AgendaE from './views/AgendaE.jsx';
import AgendaC from './views/AgendaC.jsx';
import Prueba from './views/Prueba.jsx';
import { UserProvider } from './context/UserContext'; 

const routes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/Inicio",
    element: <Inicio />,
  },
  {
    path: "/PerfilC",
    element: <PerfilC />,
  },
  {
    path: "/PerfilE",
    element: <PerfilE />,
  },
  {
    path: "/TurnosC",
    element: <TurnosC />,
  },
  {
    path: "/TurnosE",
    element: <TurnosE />,
  },
  {
    path: "/AgendaE",
    element: <AgendaE />,
  },
  {
    path: "/AgendaC",
    element: <AgendaC />,
  },
  {
    path: "/Prueba",
    element: <Prueba />,
  }
];

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider> {/* Envuelve la aplicación en el UserProvider */}
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>,
);
// src/App.tsx

import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import Menu from './components/Menu';
import Signup from './pages/Signup';
import Login from './pages/Login';

import HomePage from './pages/HomePage';


const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <Menu />
      <IonRouterOutlet>

        <Route path="" component={HomePage} exact={true} />
        <Route path="/home" component={HomePage} exact={true} />
        <Route path="/signup" component={Signup} exact={true} />
        <Route path="/login" component={Login} exact={true} />
       
        
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

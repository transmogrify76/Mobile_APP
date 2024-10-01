import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import Menu from './components/Menu';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import Wallet from './pages/Wallet';
import VehicleCreation from './pages/VehicleCreation';
import UserProfile from './pages/UserProfile';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <Menu />
      <IonRouterOutlet>

        <Route path="" component={Signup} exact={true} />
        <Route path="/home" component={HomePage} exact={true} />
        <Route path="/signup" component={Signup} exact={true} />
        <Route path="/login" component={Login} exact={true} />
        <Route path="/dashboard" component={Dashboard} exact={true} />
        <Route path="/wallet" component={Wallet} exact={true} />
        <Route path="/add-vehicle" component={VehicleCreation} exact={true} />
        <Route path="/userprofile" component={UserProfile} exact={true} />


      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

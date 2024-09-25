// src/App.tsx

import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import Menu from './components/Menu';
import Signup from './pages/Signup';
import OtpVerification from './pages/OTPVerification';


const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <Menu />
      <IonRouterOutlet>
        <Route path="/signup" component={Signup} exact={true} />
        <Route path="/otpverification" component={OtpVerification} exact={true} />
        
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

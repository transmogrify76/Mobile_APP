import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardContent, IonList, IonItem, IonIcon, IonButton, IonRouterLink } from '@ionic/react';
import { search, mapOutline } from 'ionicons/icons';

const HomePage: React.FC = () => {
  return (
    <>
      {/* Header with logo */}
      <IonHeader>
        <IonToolbar className="bg-[#0f4c75] h-20 flex justify-center items-center">
          <IonTitle>
            <img className="mt-2 w-[80%] max-w-[200px]" src="https://transev.in/wp-content/uploads/2023/07/logo-160x57.png" alt="EV Charging Solutions" />
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Main content */}
      <IonContent className="bg-[#bb2214] p-5">
        <div className="mt-5">
          {/* Welcome Card */}
          <IonCard className="rounded-xl shadow-lg w-full max-w-[400px] mx-auto"> 
            <img src="../../../assets/1689757170509.jpg" alt="Charging Station" className="rounded-t-xl" />
            <IonCardHeader className="text-center">
              <IonTitle className="text-xl font-semibold">Welcome to TransEV Charging Solutions</IonTitle>
            </IonCardHeader>
            <IonCardContent className="text-center">
              <p className="text-gray-100">Discover convenient and sustainable charging options for your electric vehicle.</p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* List for navigation */}
        <IonList className="mt-5 w-full">
          <IonItem button routerLink="/stations" lines="none" className="mx-auto w-[80%] max-w-[300px] bg-[#0f4c75] text-white rounded-lg p-3 mb-3 flex items-center">
            <IonIcon icon={search} slot="start" className="mr-2" />
            Find Charging Stations
          </IonItem>

          <IonItem button routerLink="/map" lines="none" className="mx-auto w-[80%] max-w-[300px] bg-[#00adb5] text-white rounded-lg p-3 flex items-center">
            <IonIcon icon={mapOutline} slot="start" className="mr-2" />
            Charging Station Map
          </IonItem>
        </IonList>

        {/* Buttons for Login and Sign Up */}
        <div className="mt-5 flex flex-col items-center">
          <IonButton className="bg-[#dc3545] text-white rounded-2xl mb-2 w-[80%] max-w-[250px] p-3 text-lg font-semibold">
            Login
          </IonButton>
          <IonButton className="bg-[#1a94d5] text-white rounded-2xl mb-2 w-[80%] max-w-[250px] p-3 text-lg font-semibold">
            Sign Up
          </IonButton>
        </div>

        {/* Signup link */}
              <div className="text-center mt-5 text-gray-100">
                  < p>New user? <IonRouterLink routerLink="/signup" className="text-[#1a94d5]">Sign up here</IonRouterLink></p>
              </div>

      </IonContent>
    </>
  );
};

export default HomePage;

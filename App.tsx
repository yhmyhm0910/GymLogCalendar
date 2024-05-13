import React, { lazy, Suspense, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StatusBar } from 'react-native'
import Test from './screens/Test';

const HomeScreen = lazy(() => import('./screens/HomeScreen'))

const Stack = createStackNavigator();

const App: React.FC = () => {

  return (
    <NavigationContainer>
      <StatusBar></StatusBar>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {(props) => (
            <Suspense fallback={<LoadingIndicator />}>
              <HomeScreen />
            </Suspense>
          )}
        </Stack.Screen>
        <Stack.Screen name="Details" component={Test} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Loading indicator component to show while HomeScreen is loading
const LoadingIndicator: React.FC = () => {
  return <Text>Loading...</Text>; // Adjust as needed
};

export default App;

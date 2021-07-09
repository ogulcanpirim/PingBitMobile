import React from 'react';
import {Provider} from 'react-redux';
import { store } from './services';
import ApplicationScreen from './screens/ApplicationScreen';
export default function App() {

  return (
    <Provider store = {store}>
        <ApplicationScreen></ApplicationScreen>
    </Provider>
  );
}


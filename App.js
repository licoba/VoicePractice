/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import MainView from './MainView'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';




const App: () => React$Node = () => {
  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <MainView View style={{ flex: 1 }}></MainView>
    </View>
  );
};


export default App;

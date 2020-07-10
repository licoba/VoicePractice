/**
 * @format
 */

import { AppRegistry,Text } from 'react-native';
import App from './App';
import React from 'react';

import { name as appName } from './app.json';
// import { Button, Text } from 'react-native-elements';

AppRegistry.registerComponent(appName, () => App);

// if (Platform.OS === 'android') {
//     const oldRender = Text.render;
//     Text.render = function (...args) {
//         const origin = oldRender.call(this, ...args);
//         return React.cloneElement(origin, {
//             style: [origin.props.style, { fontFamily: '' }],
//         });
//     };
// }
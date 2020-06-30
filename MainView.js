
import React, { Component } from 'react';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
} from 'react-native';

import {
    Header,
    LearnMoreLinks,
    Colors,
    DebugInstructions,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';



const RecordState = {
    NONE: 'NONE',
    RECORDING: 'RECORDING',
    PLAYING: 'PLAYING',
    FINISHED: 'FINISHED',
}


export default class MainView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recordState: RecordState.NONE,
        };
    }

    render() {
        return (

            <View style={{ flex: 1, flexDirection: 'column' }}>

                <View style={{ flex: 4 }}></View>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#22aaaaaa', alignItems: 'center', justifyContent: 'space-between', }}>
                    <Button title='开始录音' buttonStyle={{ width: 100, height: 60, color: '#4682B4', marginLeft: 20 }}></Button>
                    <Button title='结束录音' buttonStyle={{ width: 100, height: 60, backgroundColor: '#733' }}></Button>
                    <Button title='播放录音' buttonStyle={{ width: 100, height: 60, backgroundColor: '#008000', marginRight: 20 }}></Button>

                </View>
            </View>


        );
    }


}


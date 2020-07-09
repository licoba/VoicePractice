
import React, { Component } from 'react';
import { Button, Input } from 'react-native-elements';
import { PermissionsAndroid, Platform, SafeAreaView, StyleSheet, Switch, Text, View, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    Player,
    Recorder,
    MediaStates
} from '@react-native-community/audio-toolkit';

// 库在这里 https://github.com/react-native-community/react-native-audio-toolkit

const RecordState = {
    NONE: 'NONE',
    RECORDING: 'RECORDING',
    PLAYING: 'PLAYING',
    FINISHED: 'FINISHED',
}

const filename = 'test.mp3';

export default class MainView extends Component {

    player: Player | null;
    recorder: Recorder | null;
    lastSeek: number;
    _progressInterval: IntervalID;

    constructor(props) {
        super(props);
        this.state = {
            recordState: RecordState.NONE,
            error: '',
            responseText: '提交评测后查看结果'
        };
    }

    UNSAFE_componentWillMount() {
        this.player = null;
        this.recorder = null;
        this.lastSeek = 0;

        this._reloadPlayer();
        this._reloadRecorder();

        this._progressInterval = setInterval(() => {
            if (this.player) {
                let currentProgress = Math.max(0, this.player.currentTime) / this.player.duration;
                if (isNaN(currentProgress)) {
                    currentProgress = 0;
                }
                this.setState({ progress: currentProgress });
            }
        }, 100);
    }


    componentWillUnmount() {
        clearInterval(this._progressInterval);
    }

    render() {
        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={{ flex: 6, flexDirection: 'column', alignItems: 'center', }}>
                    <Input
                        placeholder='输入文本'
                        leftIcon={{ type: 'font-awesome', name: 'hand-o-right' }}
                    />
                    <Text style={{ position: 'absolute', fontSize: 14, top: 55, left: 20, textAlign: 'left' }} >评测结果</Text>
                    <ScrollView style={{ flex: 1, marginTop: 4, marginBottom: 20, marginLeft: 20, marginRight: 20, }}>
                        <Text style={{ flex: 1, fontSize: 18, color: '#808080',textAlign: 'left' }}>{this.state.responseText}</Text>
                    </ScrollView>
                    <Button buttonStyle={{ width: 500, height: 50 }}
                        title="提交评测" loading={false} disabled={this.state.recordState == RecordState.FINISHED ? false : true}/>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#22aaaaaa', alignItems: 'center', justifyContent: 'space-between', }}>
                    <Text style={{ position: 'absolute', color: '#DC143C', fontSize: 20, top: 0, left: 20, right: 20, textAlign: 'center' }} >{this.state.error}</Text>
                    <Button title='开始录音' onPress={() => { this._toggleRecord(); }}
                        disabled={this.state.recordState == RecordState.RECORDING ? true : false}
                        buttonStyle={{ width: 100, height: 50, color: '#4682B4', marginLeft: 20 }}></Button>
                    <Button title='结束录音' onPress={() => this._stop()} disabled={this.state.recordState == RecordState.RECORDING ? false : true} buttonStyle={{ width: 100, height: 50, backgroundColor: '#733' }}></Button>
                    <Button title='播放录音' onPress={() => this._playPause()} disabled={this.state.recordState == RecordState.FINISHED ? false : true} buttonStyle={{ width: 100, height: 50, backgroundColor: '#008000', marginRight: 20 }}></Button>
                </View>
            </View>
        );
    }

    _stop() {
        this._toggleRecord()
    }

    _playPause() {
        this.player.play((err) => {
            if (err) {
                this.setState({
                    error: err.message
                });
            } else {
                console.log('播放/暂停')
            }
        });
    }

    _toggleRecord() {

        if (this.player) {
            this.player.destroy();
        }

        let recordAudioRequest;
        if (Platform.OS == 'android') {
            recordAudioRequest = this._requestRecordAudioPermission();
        } else {
            recordAudioRequest = new Promise(function (resolve, reject) { resolve(true); });
        }

        recordAudioRequest.then((hasPermission) => {
            if (!hasPermission) {
                this.setState({
                    error: 'Record Audio Permission was denied'
                });
                return;
            }

            this.setState({ recordState: RecordState.RECORDING });
            this.recorder.toggleRecord((err, stopped) => {
                if (err) {
                    this.setState({
                        error: err.message
                    });
                }
                if (stopped) {
                    this._reloadPlayer();
                    this._reloadRecorder();
                    this.setState({ recordState: RecordState.FINISHED })
                }
            });
        });
    }

    _reloadRecorder() {
        if (this.recorder) {
            this.recorder.destroy();
        }

        this.recorder = new Recorder(filename, {
            bitrate: 256000,
            channels: 1,
            sampleRate: 44100,
            quality: 'max',
            format: 'mp3'
        });

        // this._updateState();
    }

    _reloadPlayer() {
        if (this.player) {
            this.player.destroy();
        }
        this.player = new Player(filename, {
            autoDestroy: false
        }).prepare((err) => {
            if (err) {
                console.log('error at reloadPlayer():');
                console.log(err);
            } else {
                this.player.looping = false
            }
            this._updateState();
        });

        this.player.on('ended', () => {
            console.log('播放结束')
            this._updateState();
        });
        this.player.on('pause', () => {
            console.log('播放暂停')
            this._updateState();
        });
    }

    _updateState(err) {

    }

    async _requestRecordAudioPermission() {
        // console.log('请求录音权限')
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: 'Microphone Permission',
                    message: 'ExampleApp needs access to your microphone to test react-native-audio-toolkit.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error(err);
            return false;
        }
    }


}


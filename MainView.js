import React, { Component } from 'react';
import { Button, Input } from 'react-native-elements';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob'

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

// API 地址
const TEST_URL = "https://t02.io.speechx.cn:8443/MDD_Server/mdd_v18"
// 请求必须要带的Token
const TEST_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzcGVlY2h4X21kZCIsIlNpZ25lZEJ5IjoianN6aG9uZyIsIkVuZ2xpc2hMZXZlbCI6MywiaXNzIjoiYXV0aDAiLCJuR0JfVVMiOjAsImF1ZCI6Imd1ZXN0IiwiaXNGb3JDaGlsZCI6ZmFsc2UsIm5DbGllbnRJRCI6MTU5Mjg5MjM0OCwibk1heENvbmN1cnJlbnRVc2VyIjowLCJQdWJsaXNoZXJOYW1lIjoic2hpa29uZ2h1XzIwMjAwNjIzMTQwNDQ0ODY2IiwiRmVlZEJhY2tUeXBlIjo2LCJleHAiOjE2MjY5Njk2NDgsImlhdCI6MTU5Mjg5MjM0OH0.QvBbuMq-WV49MKhUtc3aBdo9WD4x-OXfhDvug-J2no4"

const filename = 'test.mp3';

export default class MainView extends Component {

    player: Player | null;
    recorder: Recorder | null;
    lastSeek: number;
    _progressInterval: IntervalID;
    musicFile: null;
    fsPath: null;

    constructor(props) {
        super(props);
        this.state = {
            recordState: RecordState.FINISHED,
            error: '',
            responseText: '提交评测后查看结果',
            submitText: 'Can you hear me?',
            scoreText: '',
        };
    }

    UNSAFE_componentWillMount() {
        this.player = null;
        this.recorder = null;
        this.fsPath = '/data/user/0/com.practiceproject/files/test.mp3'
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
        // /data/data/com.practiceproject/files/
        // /data/user/0/com.practiceproject/files/
        // 也就是data/data 和data/user/0 是等价的  /data/user/0 只是一个 /data/data 的 link

        // RNFS.readDir('/data/data/com.practiceproject/files/')
        //     .then(files => {
        //         console.log("found:" + files.length + "个文件 ", JSON.stringify(files))
        //         return files
        //     })
        //     .catch(err => {
        //         console.log("found: error\t")
        //         console.error(err)
        //     })
        RNFetchBlob.fs.ls('/data/data/com.practiceproject/files/')
            // files will an array contains filenames
            .then((files) => {
                console.log('RNFetchBlob fs 扫描到文件:', files)
            })
    }


    async _submitTest() {
        console.log("正在提交评测,文件路径：", this.fsPath)
        let formData = new FormData();
        // /data/user/0/com.practiceproject/files/test.mp3
        // /data/data/com.practiceproject/files/test.mp3
        // file://storage/emulated/0/Android/data/com.practiceproject/files/test.mp3
        console.log('RNFS ExternalStorageDirectoryPath', RNFS.ExternalStorageDirectoryPath);
        console.log('RNFS ExternalDirectoryPath', RNFS.ExternalDirectoryPath);

        // formData.append('file',{
        //     uri:'file://data/user/0/com.practiceproject/files/test.mp3',
        //     type:'application/mp3',
        //     name:"file",
        //     filename:'test.mp3'
        // })//音频文件
        formData.append('user_id', "user_licoba_123")// 用户ID，用来唯一标识
        formData.append('word_name', this.state.submitText)// 用来识别的单词
        try {
            let response = await RNFetchBlob.fetch('post', TEST_URL, {
                'Content-Type': 'multipart/form-data',
                otherHeader: "foo",
                Authorization: 'Bearer ' + TEST_TOKEN
            }, [
                {
                    name: 'myWavfile',
                    filename: 'test.mp3',
                    type: 'application/mp3',
                    data: RNFetchBlob.wrap(this.fsPath)
                },
                {
                    name: 'user_id', data: 'user_licoba_123'
                },
                {
                    name: 'word_name', data: this.state.submitText
                },
                {
                    name: 'Authorization', data: TEST_TOKEN
                }
            ]
            );

            let responseJson = await response.json();
            console.log("请求返回的结果", responseJson)
            if (responseJson.score) { 
            this.setState({
                scoreText: responseJson.score
            })
        }else {
            this.setState({
                scoreText: ""
            })
        }
        this.setState({
            responseText: response.text()
        })
    } catch(error) {
        console.error("请求返回error", error);
    }
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
                    leftIcon={{ type: 'font-awesome', name: 'hand-o-right' }}>{this.state.submitText}</Input>
                <Text style={{ position: 'absolute', color: 'red', fontSize: 20, top: 55, left: 20, textAlign: 'left' }}>{this.state.scoreText === "" ? "" : "得分：" + this.state.scoreText}</Text>
                <ScrollView style={{ flex: 0.6, marginTop: 6, marginBottom: 16, marginLeft: 20, marginRight: 20, }}>
                    <Text style={{
                        fontSize: 18,
                        color: '#808080',
                        textAlign: 'left',
                        fontFamily: ''
                    }}>{this.state.responseText}</Text>
                </ScrollView>
                <Button buttonStyle={{ width: 500, height: 50 }} onPress={() => {
                    this._submitTest();
                }}
                    title="提交评测" loading={false}
                    disabled={this.state.recordState == RecordState.FINISHED ? false : true} />
            </View>
            <View style={{
                flex: 1,
                flexDirection: 'row',
                backgroundColor: '#22aaaaaa',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Text style={{
                    position: 'absolute',
                    color: '#DC143C',
                    fontSize: 20,
                    top: 0,
                    left: 20,
                    right: 20,
                    textAlign: 'center'
                }}>{this.state.error}</Text>
                <Button title='开始录音' onPress={() => {
                    this._toggleRecord();
                }}
                    disabled={this.state.recordState == RecordState.RECORDING ? true : false}
                    buttonStyle={{ width: 100, height: 50, color: '#4682B4', marginLeft: 20 }}></Button>
                <Button title='结束录音' onPress={() => this._stop()}
                    disabled={this.state.recordState == RecordState.RECORDING ? false : true}
                    buttonStyle={{ width: 100, height: 50, backgroundColor: '#733' }}></Button>
                <Button title='播放录音' onPress={() => this._playPause()}
                    disabled={this.state.recordState == RecordState.FINISHED ? false : true} buttonStyle={{
                        width: 100,
                        height: 50,
                        backgroundColor: '#008000',
                        marginRight: 20
                    }}></Button>
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
        recordAudioRequest = new Promise(function (resolve, reject) {
            resolve(true);
        });
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
    // this.recorder.prepare((err) => {
    //     if (err) {
    //         console.log('error at prepareRecorder():', err);
    //     } else {
    //         this.fsPath = this.recorder.fsPath;
    //     }
    // });
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


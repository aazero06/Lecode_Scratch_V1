const React = require('react');
const ReactDOM = require('react-dom');
const bindAll = require('lodash.bindall');
const arduinoIcon = require('./arduino.png');
const ScratchLinkWebSocket = 'wss://device-manager.scratch.mit.edu:20110/scratch/burn';
import PropTypes from 'prop-types';
import {injectIntl} from 'react-intl';
import {connect} from 'react-redux';

//import {Button,FormControl,MenuItem,ButtonGroup,DropdownButton } from 'react-bootstrap';
import {styles} from './arduino-panel.css';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/eclipse';
import {FormattedMessage} from 'react-intl';
//import uploadIcon from './upload.png';
/*import {Icon} from 'react-fa';*/


class ArduinoPanelComponent extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, ['UploadSketch']);
        this.state = {
            uploadMsg: '',
            msgs:[],
            msgId:0
        };
    }

    UploadSketch(e)
    {
        //清空upload log
        this.setState({msgs: [], msgId:0});

        //1. 创建websocket, 判断硬件串口代理程序是否启动
        //this.connection = new WebSocket('ws://localhost:5000');
        this.connection = new WebSocket('wss://device-manager.scratch.mit.edu:20110/scratch/burn');
        var that = this;
        this.connection.onerror = evt => {
            // add the new message to state
            that.setState({
                msgId: that.state.msgId + 1,
                msgs: that.state.msgs.concat(<p key={this.state.msgId} style={{color: '#FF3030'}}>Please confirm the hardware tool is opened!</p>)
            });
        };

        this.connection.onopen = evt => {
            //2. 进行arduino代码转换,生成hex文件
            that.setState({
                msgId: that.state.msgId + 1,
                msgs: that.state.msgs.concat(<p key={this.state.msgId}>Hareware tool is active</p>)
            });

            //直接发送到websocket服务端，进行编译加上传
            //this.connection.send(this.props.code);
            const params = {message:this.props.code};
            const request = {
                jsonrpc: '2.0',
                method: 'complie',
                params
            };
            const messageText = JSON.stringify(request);
            this.connection.send(messageText);
        }
        this.connection.onmessage = evt => {
            //var received_msg = evt.data;
            //that.setState({uploadMsg: received_msg});
            var recivedData = JSON.parse(evt.data.trim());
            var received_msg = recivedData.params["compileMsg"];
            var recived_status = recivedData.params["compileStatus"];

            //如果circleBit没有插入，红色提示
            if(received_msg.indexOf('No circlebit found') != -1)
            {
                that.setState({
                    msgId: that.state.msgId + 1,
                    msgs: that.state.msgs.concat(<p key={this.state.msgId} style={{color: '#FF3030'}}>{received_msg}</p>)
                });
            }
            else {
                that.setState({
                    msgId: that.state.msgId + 1,
                    msgs: that.state.msgs.concat(received_msg.indexOf('Failed') != -1 ?
                        <p key={this.state.msgId} style={{color: '#FF3030'}}>{received_msg}</p> :
                        <p key={this.state.msgId}>{received_msg}</p>)
                });
            }


            //如果当前文件上传成功，则关闭当前web连接
            if(received_msg == 'Upload Successed!')
                that.connection.close();

        };
        /*var ws = new WebSocket('ws://localhost:5000');
        ws.onopen=function(){
            //2. 进行arduino代码转换,生成hex文件
            this.setState({uploadMsg: "Connected"});
        }
        ws.onmessage=function(evt){
            //3. 如果收到了返回的hex文件，发送hex进行烧录
        }
        ws.onclose=function(){

        };
        ws.onerror=function(evt){
            this.setState({uploadMsg: evt.data});
        };*/
    }

    componentDidUpdate() {
        var logs = this.refs.arduinolog;
        var lastLog = logs.childNodes[logs.childNodes.length-1];
        if(lastLog) {
            lastLog.scrollIntoView();
        }
    }

    render() {

        var visible = this.props.visible?'block':'none';
        // var firmwareItems  = this.props.firmwares.map(f => (
        //     <MenuItem eventKey={{ 'name':f.name,'path':f.path}} key={f.name}>{f.name}</MenuItem>
        // ));
        var panelHeight = this.props.windowHeight-48;
        return (
            <div
                style={{
                    position: 'absolute',
                    display: visible,
                    right: 0,
                    width: 490,
                    height: panelHeight,
                    top: 48,
                    bottom: 8,
                    backgroundColor: '#0097a7',
                    zIndex: 101
                }}
            >
            <div className="group" id="code-buttons" style={{top:4,left:4,width:480,position:'absolute'}}>
                {/*<Button style={{marginLeft:5,height:34}} onClick={this.UploadSketch}>
                    <FormattedMessage
                        defaultMessage="Upload"
                        description="Button for upload sketch"
                        id="gui.arduino.upload"
                    />
                </Button>*/}

                <Button style={{marginLeft:5,height:34, backgroudColor: '#ffffff'}} onClick={this.UploadSketch}>
                    <img src={uploadIcon} style={{paddingRight:10}}/>
                    <FormattedMessage
                        defaultMessage="Upload"
                        description="Button for upload sketch"
                        id="gui.arduino.upload"
                    />
                </Button>

                {/* <span style={{marginLeft:5,height:34}}>{this.state.uploadMsg}</span> */}
                {/* <div data-placeholder="内容..." style={{widht:100,height:34}}>{this.state.uploadMsg}</div> */}
             </div>
            <AceEditor
                style={{top:45,left:2,height:panelHeight*0.5+5,width:486}}
                mode="c_cpp"
                theme="eclipse"
                name="arduino-code"
                value={this.props.code}
                editorProps={{$blockScrolling: true}}
                ref={this.props.codeRef}
            />
                <div id="backstyle"
                     style={{
                         position: 'absolute',
                         width:488,
                         height:2,
                         top:panelHeight*0.5+48,
                         backgroundColor: '#0097a7',
                         zIndex: 102
                     }}
                >
                </div>

                <div id="console-log"
                     style={{
                         position: 'absolute',
                         left:2,
                         width:486,
                         height:panelHeight*0.5-50,
                         top:panelHeight*0.5+50,
                         overflowY: 'auto',
                         backgroundColor: '#FBF9F9',
                         color: '#008000',
                         fontSize:18,
                         zIndex: 102
                     }}
                     ref="arduinolog"
                >
                {this.state.msgs}
                </div>

            </div>

        );
    }
};

ArduinoPanelComponent.propTypes = {
    visible:PropTypes.bool,
    code: PropTypes.string,
    restoreFirmware: PropTypes.func,
    uploadProj: PropTypes.func,
    codeRef: PropTypes.string,
    firmwares : PropTypes.array,
    windowHeight: PropTypes.number,
    onCodeUpdate : PropTypes.func
};

const mapStateToProps = state => ({
    visible: state.scratchGui.arduino.visible,
    code: state.scratchGui.arduino.editorCode,
    firmwares: state.scratchGui.arduino.firmwares,
    windowHeight: state.scratchGui.arduino.windowHeight
});

const mapDispatchToProps = dispatch => ({
    onCodeUpdate : () => { dispatch(updateCode());}
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(ArduinoPanelComponent));



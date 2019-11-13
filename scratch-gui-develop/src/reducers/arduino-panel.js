const OPEN_ARDUINO = 'scratch-gui/arduino/OPEN_ARDUINO';
const CLOSE_ARDUINO = 'scratch-gui/arduino/CLOSE_ARDUINO';

const initialState = {
    visible: false,
    //editorCode: '#include <Arduino.h>\n\nvoid setup(){\n}\n\nvoid loop(){\n}\n\n',
    editorCode:'',
    firmwares: [{name: 'arduino', 'path': null}],
    windowHeight: window.innerHeight,
    arduinoProxyOpened: false,
    arduinoOnlyStemConnected: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;

    if (action.type == 'toggleArduino') {

    if (state.visible)
        return Object.assign({}, state, {
            visible: false
        });
    else
        return Object.assign({}, state, {
            visible: true
        });
    }
    else if (action.type == 'updateCode')
    {
        return Object.assign({}, state, {
            editorCode: action.editorCode
        });
    }
    else if (action.type == 'proxyStateUpdate')
    {
        return Object.assign({}, state, {
            arduinoProxyOpened: action.arduinoProxyOpened
        });
    }
    else if (action.type == 'onlyStemStateUpdate')
    {
        return Object.assign({}, state, {
            arduinoOnlyStemConnected: action.arduinoConnectedState
        });
    }
    return state;
};


const toggleArduinoPanel = () => ({
    type: 'toggleArduino'
});

const updateCode = function (editCode) {
    return {
        type: 'updateCode',
        editorCode: editCode
    };
};

const proxyStateUpdate = function (proxyState)
{
    return {
        type: 'proxyStateUpdate',
        arduinoProxyOpened: proxyState
    };
}

const onlyStemStateUpdate = function (connectState)
{
    return {
        type: 'arduinoConnectState',
        arduinoConnectedState: connectState
    };
}


export {
    reducer as default,
    initialState as arduinoInitialState,
    toggleArduinoPanel,
    updateCode
};

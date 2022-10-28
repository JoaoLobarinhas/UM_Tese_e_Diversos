// var socketPath = 'ws://10.0.2.2:65080/';
// var socketPath = 'ws://10.0.2.2:8080/';
// var socketPath = 'ws://spickles-sockets.herokuapp.com/';
var socketPath = 'ws://206.189.108.249:8080'
// var socketPath = 'ws://spickles.ew.r.appspot.com'

export default class WebSocketSessions {
    static instance = WebSocketSessions.instance || new WebSocketSessions()

    constructor(){
        this.ws = new WebSocket(socketPath)
    }

}
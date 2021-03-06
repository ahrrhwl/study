var WebSocketServer = require("websocket").server;

// create a HTTP server
var server = require("http").createServer();

// and a WebSocket server 
var ws = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
});

// create the initially empty client list
var clients = [];

function connectHandler(conn) {
    // set the initial nickname to the client IP
    conn.nickname = conn.remoteAddress;
    conn.on("message", messageHandler);
    conn.on("close", closeHandler);

    // add connection the client list
    clients.push(conn);

    // send message to all clients
    broadcast(conn.nickname + " entered the chat");
}

function broadcast(data) {
    clients.forEach(function(client) {
        client.sendUTF(data);
    });
}

function closeHandler() {
    var index = clients.indexOf(this);
    if(index > -1) {
        clients.splice(index, 1);
    }
    broadcast(this.nickname + " left the chat");
}

function messageHandler(message) {
    var data = message.utf8Data.toString(), 
        firstWord = data.toLowerCase().split(" ")[0];

    // is this a command?
    if (data[0] == "/") {
        switch (firstWord) {
            case "/nick":
                // new nickname is the second word
                var newname = data.split(" ")[1];
                if (newname != "") {
                    broadcast(this.nickname + " changed name to " + newname);
                    this.nickname = newname; // set new nick
                }
                break;
            case "/shutdown": 
                broadcast("Server shutting down. Bye!");
                ws.shutDown();
                server.close();
                break;
            default:
                this.sendUTF("Unknown command: " + firstWord);
                break;
        }
    } else {
        broadcast(this.nickname + " says: " + data);
    }
}


console.log("Chat server listening on port 9999!");

ws.on("connect", connectHandler);
server.listen(9999);


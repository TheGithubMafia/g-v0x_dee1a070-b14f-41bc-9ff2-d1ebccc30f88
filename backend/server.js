const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname, "/../frontend")));
// app.get("/", (req, res) => {
// 	res.sendFile(path.join(__dirname, "/../frontend/index.html"));
// });
const rooms = {};
const state = {};

io.on("connection", (client) => {
	client.on("clicked", (id) => {
		id = JSON.parse(id);
		const [x, y] = id;
		if (client.player === state[client.code].currentPlayer) {
			console.log("inside first if");
			state[client.code][x][y] = client.player;
			// console.log("rooms: ", rooms);
			io.to(client.code).emit("update", `[${x}, ${y}]`, client.player);
			if (
				rooms[client.code][0].player ===
				state[client.code].currentPlayer
			) {
				state[client.code].currentPlayer = rooms[client.code][1].player;
			} else {
				state[client.code].currentPlayer = rooms[client.code][0].player;
			}
			io.to(client.code).emit(
				"currentPlayer",
				state[client.code].currentPlayer
			);
		}

		// console.log(state[`${client.code}`][x][y]);
		// state[client.code][id - 1] = "X";
		// console.log(state[client.code]);
		// console.log(state[client.code][0]);
		console.log(state[client.code]);
	});
	client.on("newGame", (playerOne) => {
		const code = String(Math.round(Math.random() * 1000000));
		client.name = playerOne;
		client.join(code);
		client.player = "X";
		console.log(rooms);
		state[code] = [
			[null, null, null],
			[null, null, null],
			[null, null, null],
		];

		// state[code].currentPlayer = client.id;
		console.log("current clientID", client.id);
		// ensure user hasn't joined other rooms
		client.code = code;
		client.emit("gameCode", code);
		state[code].playerOneName = playerOne;
		client.emit("playerName", playerOne);
		console.log(state[code]);
		rooms[code] = [client];
	});
	client.on("joinGame", (code, playerTwo) => {
		if (rooms[code].length === 2) return;
		// ensure room doesn't have more than 2 players
		client.join(code);
		console.log(rooms);
		client.code = code;
		client.name = playerTwo;
		state[code].playerTwoName = playerTwo;
		io.to(code).emit("playerNames", state[code].playerOneName, playerTwo);
		client.player = "O";
		state[code].currentPlayer = rooms[client.code][0].player;
		io.to(code).emit("currentPlayer", state[code].currentPlayer);
		rooms[code].push(client);
		client.emit("gameCode", code);
	});
});

server.listen(3000);

/* 
close connections and delete resources when connection is closed

determine winner after each move

refactor
*/

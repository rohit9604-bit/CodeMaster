const crypto = require("crypto");
const pool = require("./db");

let waitingPlayers = []; // { socket, userId, username }
let activeMatches = {};  // matchId -> { player1, player2, problemId, status }

const initSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected to socket:", socket.id);

        // Join matchmaking queue
        socket.on("join_queue", async (data) => {
            const { userId, username } = data;
            console.log(`User ${username} joined queue`);

            // Prevent redundant queuing
            const existingIdx = waitingPlayers.findIndex(p => p.userId === userId);
            if (existingIdx !== -1) {
                waitingPlayers[existingIdx].socket = socket; // update socket
            } else {
                waitingPlayers.push({ socket, userId, username });
            }

            // Try to match
            if (waitingPlayers.length >= 2) {
                const player1 = waitingPlayers.shift();
                const player2 = waitingPlayers.shift();

                const matchId = crypto.randomUUID();

                // Get a random problem
                try {
                    const result = await pool.query("SELECT id FROM validated_problems ORDER BY RANDOM() LIMIT 1");
                    let problemId = null;
                    if (result.rows.length > 0) {
                        problemId = result.rows[0].id;
                    } else {
                        problemId = 1; // Fallback
                    }

                    activeMatches[matchId] = {
                        id: matchId,
                        player1: { id: player1.userId, username: player1.username },
                        player2: { id: player2.userId, username: player2.username },
                        problemId: problemId,
                        status: "active"
                    };

                    // Join socket room
                    player1.socket.join(matchId);
                    player2.socket.join(matchId);

                    // Map socket to matchId for disconnect handling
                    player1.socket.matchId = matchId;
                    player2.socket.matchId = matchId;

                    // Notify both players
                    io.to(matchId).emit("match_found", {
                        matchId,
                        problemId,
                        player1: player1.username,
                        player2: player2.username
                    });

                    console.log(`Match created: ${matchId} for problem ${problemId}`);
                } catch (error) {
                    console.error("Matchmaking error:", error);
                    player1.socket.emit("match_error", { message: "Internal error creating match" });
                    player2.socket.emit("match_error", { message: "Internal error creating match" });
                }
            } else {
                socket.emit("waiting_for_opponent", { message: "Waiting for opponent..." });
            }
        });

        socket.on("leave_queue", () => {
            waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            waitingPlayers = waitingPlayers.filter(p => p.socket.id !== socket.id);

            const matchId = socket.matchId;
            if (matchId && activeMatches[matchId] && activeMatches[matchId].status === "active") {
                // Opponent disconnected
                activeMatches[matchId].status = "abandoned";
                io.to(matchId).emit("opponent_disconnected", { message: "Your opponent left the match." });
            }

            // Handle collaboration disconnect
            if (socket.collabRoomId) {
                socket.to(socket.collabRoomId).emit("collab_user_left", { userId: socket.id });
                // We might want to clean up empty collab rooms later, but Socket.io does this automatically for empty rooms
            }
        });

        // --- PAIR PROGRAMMING COLLABORATION LOGIC ---
        socket.on("join_collaboration", (data) => {
            const { roomId } = data;
            if (!roomId) return;

            socket.join(roomId);
            socket.collabRoomId = roomId; // Link socket to room

            // Notify others in room
            socket.to(roomId).emit("collab_user_joined", { userId: socket.id });
            console.log(`User ${socket.id} joined collaboration room ${roomId}`);
        });

        socket.on("code_change", (data) => {
            const { roomId, code } = data;
            if (!roomId || !code) return;
            // Broadcast code to everyone else in the room
            socket.to(roomId).emit("code_update", { code });
        });

        socket.on("language_change", (data) => {
            const { roomId, language } = data;
            if (!roomId || !language) return;
            // Broadcast language change
            socket.to(roomId).emit("language_update", { language });
        });

        socket.on("cursor_change", (data) => {
            const { roomId, position, username } = data;
            if (!roomId || !position) return;
            socket.to(roomId).emit("cursor_update", { position, username });
        });

        socket.on("collab_presence", (data) => {
            const { roomId } = data;
            if (!roomId) return;
            socket.to(roomId).emit("collab_presence", data);
        });

        socket.on("leave_collaboration", (data) => {
            const { roomId } = data;
            if (!roomId) return;

            socket.leave(roomId);
            socket.collabRoomId = null;
            socket.to(roomId).emit("collab_user_left", { userId: socket.id });
            console.log(`User ${socket.id} left collaboration room ${roomId}`);
        });
    });
};

const getActiveMatchByUserId = (userId) => {
    for (const matchId in activeMatches) {
        const match = activeMatches[matchId];
        if (match.status === "active" && (match.player1.id === userId || match.player2.id === userId)) {
            return match;
        }
    }
    return null;
};

const endMatch = (matchId) => {
    if (activeMatches[matchId]) {
        activeMatches[matchId].status = "ended";
    }
};

module.exports = { initSocket, getActiveMatchByUserId, endMatch };

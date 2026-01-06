package socket

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// ClientManager manage active clients
type ClientManager struct {
	clients map[*websocket.Conn]bool
	mutex   sync.Mutex
}

var Manager = ClientManager{
	clients: make(map[*websocket.Conn]bool),
}

// HandleConnections upgrades http to ws
func Handler(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Fatal(err)
	}

	Manager.mutex.Lock()
	Manager.clients[ws] = true
	Manager.mutex.Unlock()

	defer func() {
		Manager.mutex.Lock()
		delete(Manager.clients, ws)
		Manager.mutex.Unlock()
		ws.Close()
	}()

	// Keep alive loop
	for {
		_, _, err := ws.ReadMessage()
		if err != nil {
			break
		}
	}
}

// Broadcast sends a message to all connected clients
func Broadcast(messageType string, content string) {
	Manager.mutex.Lock()
	defer Manager.mutex.Unlock()

	msg := map[string]string{
		"type":    messageType,
		"content": content,
	}

	for client := range Manager.clients {
		err := client.WriteJSON(msg)
		if err != nil {
			log.Printf("Websocket error: %v", err)
			client.Close()
			delete(Manager.clients, client)
		}
	}
}

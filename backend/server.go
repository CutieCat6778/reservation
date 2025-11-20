package main

import (
	"log"
	"net/http"
	"os"
	"revervation/backend/database"
	"revervation/backend/graph"
	"revervation/backend/repository"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/go-chi/chi"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"
const dbPath = "./reservation.db"

func resetDatabase() {
	if err := database.Close(); err != nil {
		log.Printf("Error closing DB: %v", err)
	}

	if err := os.Remove(dbPath); err != nil && !os.IsNotExist(err) {
		log.Printf("Error removing DB: %v", err)
		return
	}

	if err := database.Init(dbPath); err != nil {
		log.Printf("Error re-initializing DB: %v", err)
		return
	}

	log.Println("Database reset successfully")
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	if err := database.Init(dbPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.Close()

	router := chi.NewRouter()

	router.Use(cors.New(cors.Options{
		AllowedOrigins:   []string{"https://reserve.thinis.de", "http://localhost:3000"}, // only your frontend
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler)

	// Cron job to reset DB every day at 08:00
	c := cron.New()
	_, err := c.AddFunc("0 8 * * *", resetDatabase)
	if err != nil {
		log.Fatalf("Failed to schedule cron: %v", err)
	}
	c.Start()
	defer c.Stop()

	resolver := graph.NewResolver()
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: resolver}))

	srv.AddTransport(&transport.Websocket{
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				// Check against your desired domains here
				return r.Host == "reserve.thinis.de"
			},
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
	})

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	router.Handle("/query", repository.Middleware()(srv))

	log.Printf("Server running on https://server.thinis.de:%s/query", port)

	err = http.ListenAndServe(":8080", router)
	if err != nil {
		panic(err)
	}
}

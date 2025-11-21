package main

import (
	"log"
	"net/http"
	"os"
	"revervation/backend/database"
	"revervation/backend/graph"
	"revervation/backend/repository"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/robfig/cron/v3"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"
const dbPath = "./reservation.db"

func resetDatabase() {
	time.Sleep(100 * time.Millisecond)

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
			CheckOrigin: func(r *http.Request) bool { return true },
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

	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"https://reserve.thinis.de", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
		Debug:            false,
	}).Handler

	router := chi.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		return corsMiddleware(next)
	})

	router.Handle("/", repository.Middleware()(playground.Handler("Reservation", "/query")))
	router.Handle("/query", repository.Middleware()(srv))

	// log.Printf("Server running on http://localhost:%s/ (GraphQL Playground at /)", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

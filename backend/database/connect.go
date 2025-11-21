package database

import (
	"database/sql"
	"sync"

	_ "github.com/mattn/go-sqlite3"
)

var (
	db *sql.DB
	mu sync.RWMutex
)

func Init(dbPath string) error {
	mu.Lock()
	defer mu.Unlock()

	if db != nil {
		if err := db.Close(); err != nil {
			return err
		}
		db = nil
	}

	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return err
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	if err = db.Ping(); err != nil {
		db.Close()
		db = nil
		return err
	}

	return createTables()
}

func GetDB() *sql.DB {
	mu.RLock()
	defer mu.RUnlock()
	return db
}

func Close() error {
	mu.Lock()
	defer mu.Unlock()

	if db != nil {
		err := db.Close()
		db = nil
		return err
	}
	return nil
}

func createTables() error {
	schema := `
	CREATE TABLE IF NOT EXISTS reservations (
		id TEXT PRIMARY KEY,
		first_name TEXT,
		last_name TEXT NOT NULL,
		amount INTEGER NOT NULL,
		phone_number TEXT NOT NULL,
		email TEXT NOT NULL,
		created_at DATETIME NOT NULL,
		reserve_at DATETIME NOT NULL,
		status TEXT NOT NULL,
		notes TEXT
	);
	CREATE INDEX IF NOT EXISTS idx_reserve_at ON reservations(reserve_at);
	CREATE INDEX IF NOT EXISTS idx_status ON reservations(status);
	CREATE INDEX IF NOT EXISTS idx_last_name ON reservations(last_name);
	`
	_, err := db.Exec(schema)
	return err
}

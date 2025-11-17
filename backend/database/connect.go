package database

import (
	"database/sql"
	"sync"

	_ "github.com/mattn/go-sqlite3"
)

var (
	db   *sql.DB
	once sync.Once
)

func Init(dbPath string) error {
	var err error
	once.Do(func() {
		db, err = sql.Open("sqlite3", dbPath)
		if err != nil {
			return
		}
		db.SetMaxOpenConns(1)
		err = db.Ping()
		if err != nil {
			return
		}
		err = createTables()
	})
	return err
}

func GetDB() *sql.DB {
	return db
}

func Close() error {
	if db != nil {
		return db.Close()
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

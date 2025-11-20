package graph

import (
	"fmt"
	"os"
	"revervation/backend/graph/model"
	"revervation/backend/mailer"
	"strconv"
	"sync"
)

type Resolver struct {
	mu          sync.RWMutex
	subscribers map[string]chan *model.ReservationEventPayload
	mailer      *mailer.Mailer
}

func NewResolver() *Resolver {
	port, err := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if err != nil {
		panic(err)
	}

	cfg := mailer.Config{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     port,
		Username: os.Getenv("SMTP_USERNAME"),
		Password: os.Getenv("SMTP_PASSWORD"),
		From:     os.Getenv("SMTP_FROM"),
	}

	return &Resolver{
		subscribers: make(map[string]chan *model.ReservationEventPayload),
		mailer:      mailer.NewMailer(cfg),
	}
}

func (r *Resolver) broadcastUpdate(reservation *model.Reservation, event model.ReservationEventBroadcast) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	payload := &model.ReservationEventPayload{
		Reservation: reservation,
		Event:       event,
	}
	go func() {
		err := r.mailer.SendReservationStatusEmail(reservation, event)
		if err != nil {
			fmt.Println(err)
		}
	}()
	for _, ch := range r.subscribers {
		select {
		case ch <- payload:
		default:
		}
	}
}

func (r *Resolver) subscribe(id string) chan *model.ReservationEventPayload {
	r.mu.Lock()
	defer r.mu.Unlock()
	ch := make(chan *model.ReservationEventPayload, 1)
	r.subscribers[id] = ch
	return ch
}

func (r *Resolver) unsubscribe(id string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if ch, ok := r.subscribers[id]; ok {
		close(ch)
		delete(r.subscribers, id)
	}
}

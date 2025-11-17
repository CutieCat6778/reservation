package graph

import (
	"revervation/backend/graph/model"
	"sync"
)

type Resolver struct {
	mu          sync.RWMutex
	subscribers map[string]chan *model.ReservationEventPayload
}

func NewResolver() *Resolver {
	return &Resolver{
		subscribers: make(map[string]chan *model.ReservationEventPayload),
	}
}

func (r *Resolver) broadcastUpdate(reservation *model.Reservation, event model.ReservationEventBroadcast) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	payload := &model.ReservationEventPayload{
		Reservation: reservation,
		Event:       event,
	}
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

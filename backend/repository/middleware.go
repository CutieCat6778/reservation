package repository

import (
	"context"
	"net/http"
	"os"
)

var userCtxKey = &contextKey{"user"}

type contextKey struct{ name string }

type User struct {
	ReservationID string
	IsAdmin       bool
}

func Middleware() func(http.Handler) http.Handler {
	authService := NewAuthService()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c := r.Header.Get("Authentication")
			if c == "" {
				next.ServeHTTP(w, r)
				return
			}

			token, err := authService.ValidateToken(c)
			if err != nil {
				http.Error(w, "Invalid cookie", http.StatusForbidden)
				return
			}

			var user User

			reservationID, err := token.Claims.GetSubject()
			if err != nil {
				http.Error(w, "Failed to get user's username", http.StatusInternalServerError)
				return
			}

			if reservationID == os.Getenv("JWT_SECRET") {
				user.ReservationID = "yoake"
				user.IsAdmin = true
			} else {
				user.ReservationID = reservationID
				user.IsAdmin = false
			}

			ctx := context.WithValue(r.Context(), userCtxKey, &user)
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

func ForContext(ctx context.Context) *User {
	raw, _ := ctx.Value(userCtxKey).(*User)
	return raw
}

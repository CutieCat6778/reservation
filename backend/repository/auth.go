package repository

import (
	"errors"
	"os"
	"time"

	"revervation/backend/graph/model"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	secret []byte
	repo   *ReservationRepository
}

func NewAuthService() *AuthService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("No JWT_SECRET")
	}
	return &AuthService{secret: []byte(secret), repo: NewReservationRepository()}
}

func (a *AuthService) Login(username, password string) (string, error) {
	if username != os.Getenv("ADMIN_USERNAME") || password != os.Getenv("ADMIN_PASSWORD") {
		return "", errors.New("invalid credentials")
	}

	claims := jwt.MapClaims{
		"sub": os.Getenv("JWT_SECRET"),
		"exp": time.Now().Add(16 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(a.secret)
}

func (a *AuthService) LoginWithReservation(id string, lastName string) (*model.LoginWithReservationResponse, error) {
	res, err := a.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if res == nil || res.LastName == "" {
		return nil, errors.New("Reservierung nicht gefunden")
	}

	if res.LastName != lastName {
		return nil, errors.New("Ihre Nachname stimmen sich nicht ein!")
	}

	claims := jwt.MapClaims{
		"sub": res.ID,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(a.secret)

	if err != nil {
		return nil, err
	}

	response := model.LoginWithReservationResponse{
		Token:       tokenString,
		Reservation: res,
	}
	return &response, nil
}

func (a *AuthService) SignToken(id string) (string, error) {
	claims := jwt.MapClaims{
		"sub": id,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(a.secret)
}

func (a *AuthService) ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		return a.secret, nil
	})
}

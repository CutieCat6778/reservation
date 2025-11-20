package repository

import (
	"database/sql"
	"fmt"
	"regexp"
	"revervation/backend/database"
	"revervation/backend/graph/model"
	"revervation/backend/mailer"
	"time"
)

type ReservationRepository struct {
	db *sql.DB
}

func NewReservationRepository() *ReservationRepository {
	return &ReservationRepository{db: database.GetDB()}
}

func (r *ReservationRepository) Create(reservation *model.Reservation) error {
	if reservation.CreatedAt.IsZero() {
		reservation.CreatedAt = time.Now()
	}
	if reservation.ReserveAt.IsZero() {
		return fmt.Errorf("Reservierungsdatum darf nicht leer sein.")
	}
	if reservation.CreatedAt.UTC().After(reservation.ReserveAt.UTC()) {
		return fmt.Errorf("Du kannst nicht in die Vergangenheit reservieren.")
	}
	if reservation.LastName == "" {
		return fmt.Errorf("Nachname ist erfoderlich")
	}
	if reservation.PhoneNumber == "" {
		return fmt.Errorf("Telefonnummer ist erfoderlich")
	}
	if reservation.Email == "" {
		return fmt.Errorf("E-Mail Addresse ist erfoderlich")
	}
	emailRegex := `^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$`
	matched, err := regexp.MatchString(emailRegex, reservation.Email)
	if err != nil {
		return fmt.Errorf("Fehler beim Validieren der E-Mail: %v", err)
	}
	if !matched {
		return fmt.Errorf("Ungültige E-Mail Addresse")
	}
	phoneRegex := `^\(?\+?[\(\)\- 0-9]{8,20}$`
	matched, err = regexp.MatchString(phoneRegex, reservation.PhoneNumber)
	if err != nil {
		return fmt.Errorf("Fehler beim Validieren der Telefonnummer: %v", err)
	}
	if !matched {
		return fmt.Errorf("Ungültige Telefonnummer")
	}
	if reservation.Amount <= 0 {
		return fmt.Errorf("Personen Anzahl darf nicht kleiner als 1 sein.")
	}
	query := `INSERT INTO reservations (id, first_name, last_name, amount, phone_number, email, created_at, reserve_at, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err = r.db.Exec(query, reservation.ID, reservation.FirstName, reservation.LastName, reservation.Amount, reservation.PhoneNumber, reservation.Email, reservation.CreatedAt, reservation.ReserveAt, reservation.Status, reservation.Notes)
	return err
}

func (r *ReservationRepository) Update(id string, firstName, lastName *string, amount *int32, reserveAt *time.Time, notes *string, phoneNumber *string, email *string) (*model.Reservation, error) {
	existing, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}
	if firstName != nil {
		existing.FirstName = firstName
	}
	if lastName != nil {
		existing.LastName = *lastName
	}
	if amount != nil {
		existing.Amount = *amount
	}
	if reserveAt != nil {
		existing.ReserveAt = *reserveAt
	}
	if notes != nil {
		existing.Notes = notes
	}
	if phoneNumber != nil {
		existing.PhoneNumber = *phoneNumber
	}
	if email != nil {
		existing.Email = *email
	}

	query := `UPDATE reservations SET first_name = ?, last_name = ?, amount = ?, reserve_at = ?, notes = ?, status = ?, phone_number = ?, email = ? WHERE id = ?`
	_, err = r.db.Exec(query, existing.FirstName, existing.LastName, existing.Amount, existing.ReserveAt, existing.Notes, model.ReservationStatusOpen, existing.PhoneNumber, existing.Email, id)
	if err != nil {
		return nil, err
	}
	return r.GetByID(id)
}

func (r *ReservationRepository) GetByID(id string) (*model.Reservation, error) {
	query := `SELECT id, first_name, last_name, amount, phone_number, email, created_at, reserve_at, status, notes FROM reservations WHERE id = ?`
	row := r.db.QueryRow(query, id)
	return r.scanReservation(row)
}

func (r *ReservationRepository) GetAll() ([]*model.Reservation, error) {
	query := `SELECT id, first_name, last_name, amount, phone_number, email, created_at, reserve_at, status, notes FROM reservations ORDER BY reserve_at DESC`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scanReservations(rows)
}

func (r *ReservationRepository) GetByFilter(filter model.ReservationFilter) ([]*model.Reservation, error) {
	query := `SELECT id, first_name, last_name, amount, phone_number, email, created_at, reserve_at, status, notes FROM reservations WHERE 1=1`
	args := []any{}
	if filter.ID != nil {
		query += ` AND id = ?`
		args = append(args, *filter.ID)
	}
	if filter.FirstName != nil {
		query += ` AND first_name LIKE ?`
		args = append(args, "%"+*filter.FirstName+"%")
	}
	if filter.LastName != nil {
		query += ` AND last_name LIKE ?`
		args = append(args, "%"+*filter.LastName+"%")
	}
	if filter.Status != nil {
		query += ` AND status = ?`
		args = append(args, *filter.Status)
	}
	if filter.DateFrom != nil {
		query += ` AND reserve_at >= ?`
		args = append(args, *filter.DateFrom)
	}
	if filter.DateTo != nil {
		query += ` AND reserve_at <= ?`
		args = append(args, *filter.DateTo)
	}
	query += ` ORDER BY reserve_at DESC`
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scanReservations(rows)
}

func (r *ReservationRepository) GetAllByFilter(filter model.ReservationFilter) ([]*model.Reservation, error) {
	query := `SELECT id, first_name, last_name, amount, phone_number, email, created_at, reserve_at, status, notes FROM reservations WHERE 1=1`
	args := []any{}

	if filter.ID != nil {
		query += ` AND id = ?`
		args = append(args, *filter.ID)
	}
	if filter.FirstName != nil {
		query += ` AND first_name LIKE ?`
		args = append(args, "%"+*filter.FirstName+"%")
	}
	if filter.LastName != nil {
		query += ` AND last_name LIKE ?`
		args = append(args, "%"+*filter.LastName+"%")
	}
	if filter.Status != nil {
		query += ` AND status = ?`
		args = append(args, *filter.Status)
	}
	if filter.Amount != nil {
		query += ` AND amount >= ?`
		args = append(args, *filter.Amount)
	}
	if filter.DateFrom != nil {
		query += ` AND reserve_at >= ?`
		args = append(args, *filter.DateFrom)
	}
	if filter.DateTo != nil {
		query += ` AND reserve_at <= ?`
		args = append(args, *filter.DateTo)
	}
	if filter.Email != nil {
		query += ` AND email LIKE ?`
		args = append(args, "%"+*filter.Email+"%")
	}
	if filter.PhoneNumber != nil {
		query += ` AND phone_number LIKE ?`
		args = append(args, "%"+*filter.PhoneNumber+"%")
	}

	query += ` ORDER BY reserve_at DESC`
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scanReservations(rows)
}
func (r *ReservationRepository) UpdateStatus(id string, status model.ReservationStatus) (*model.Reservation, error) {
	query := `UPDATE reservations SET status = ? WHERE id = ?`
	_, err := r.db.Exec(query, status, id)
	if err != nil {
		return nil, err
	}
	return r.GetByID(id)
}

func (r *ReservationRepository) GetStats(date *time.Time) (*model.ReservationInfo, error) {
	var totalReservation, totalPerson, totalBigReservation, totalOpen, totalConfirmed, totalCanceled int32

	// Overall totals query including big reservations
	query := `SELECT 
		COUNT(*), 
		COALESCE(SUM(amount), 0),
		COALESCE(SUM(CASE WHEN amount >= 5 THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END), 0),
		COALESCE(SUM(CASE WHEN status = 'CANCELED' THEN 1 ELSE 0 END), 0)
		FROM reservations`
	args := []any{}
	if date != nil {
		loc, _ := time.LoadLocation("Europe/Berlin") // adjust to your local timezone
		startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, loc)
		endOfDay := startOfDay.Add(24 * time.Hour)
		query += " WHERE reserve_at >= ? AND reserve_at < ?"
		args = append(args, startOfDay.UTC(), endOfDay.UTC()) // convert to UTC for DB
	}
	err := r.db.QueryRow(query, args...).Scan(&totalReservation, &totalPerson, &totalBigReservation, &totalOpen, &totalConfirmed, &totalCanceled)
	if err != nil {
		return nil, err
	}

	// By 30-minute intervals from 17:00 to 22:30 local time
	byHours := []*model.ReservationInfoByHour{}
	loc, _ := time.LoadLocation("Europe/Berlin")
	if date == nil {
		currentDate := time.Now().In(loc)
		date = &currentDate
	}

	startLocal := time.Date(date.Year(), date.Month(), date.Day(), 17, 0, 0, 0, loc)
	endLocal := time.Date(date.Year(), date.Month(), date.Day(), 22, 30, 0, 0, loc)

	for current := startLocal; current.Before(endLocal); current = current.Add(30 * time.Minute) {
		next := current.Add(30 * time.Minute)

		var hourTotal, hourPerson, hourBig int32
		hourQuery := `SELECT 
				COUNT(*),
				COALESCE(SUM(amount),0),
				COALESCE(SUM(CASE WHEN amount >= 5 THEN 1 ELSE 0 END),0)
			FROM reservations
			WHERE reserve_at >= ? AND reserve_at < ? AND status = ?`
		err := r.db.QueryRow(hourQuery, current.UTC(), next.UTC(), "OPEN").Scan(&hourTotal, &hourPerson, &hourBig)
		if err != nil {
			return nil, err
		}

		byHours = append(byHours, &model.ReservationInfoByHour{
			TotalReservation:    hourTotal,
			TotalPerson:         hourPerson,
			TotalBigReservation: hourBig,
			StartsAt:            current,
			EndsAt:              next,
		})
	}

	return &model.ReservationInfo{
		TotalReservation:          totalReservation,
		TotalPerson:               totalPerson,
		TotalBigReservation:       totalBigReservation,
		TotalOpenReservation:      totalOpen,
		TotalConfirmedReservation: totalConfirmed,
		TotalCanceledReservation:  totalCanceled,
		ByHours:                   byHours,
	}, nil
}

func (r *ReservationRepository) scanReservation(row *sql.Row) (*model.Reservation, error) {
	var reservation model.Reservation
	var firstName, notes sql.NullString
	var createdAt, reserveAt time.Time
	var status, phoneNumber, email string

	err := row.Scan(&reservation.ID, &firstName, &reservation.LastName, &reservation.Amount, &phoneNumber, &email, &createdAt, &reserveAt, &status, &notes)
	if err != nil {
		return nil, err
	}

	if firstName.Valid {
		reservation.FirstName = &firstName.String
	}
	if notes.Valid {
		reservation.Notes = &notes.String
	}

	reservation.PhoneNumber = phoneNumber
	reservation.Email = email
	reservation.CreatedAt = createdAt
	reservation.ReserveAt = reserveAt
	reservation.Status = model.ReservationStatus(status)

	return &reservation, nil
}

func (r *ReservationRepository) SendMessageToReservation(id string, content string, mailer *mailer.Mailer) error {
	resv, err := r.GetByID(id)
	if err != nil {
		return err
	}
	if resv == nil || resv.Email == "" {
		return fmt.Errorf("reservation not found or missing email")
	}

	if err := mailer.SendCustomHTMLEmail(resv.Email, "Ihre Reservierung bei Yoake", content); err != nil {
		return err
	}

	return nil
}

func (r *ReservationRepository) scanReservations(rows *sql.Rows) ([]*model.Reservation, error) {
	var reservations []*model.Reservation
	for rows.Next() {
		var reservation model.Reservation
		var firstName, notes sql.NullString
		var createdAt, reserveAt sql.NullTime
		var status, phoneNumber, email string

		if err := rows.Scan(&reservation.ID, &firstName, &reservation.LastName, &reservation.Amount, &phoneNumber, &email, &createdAt, &reserveAt, &status, &notes); err != nil {
			return nil, err
		}

		if firstName.Valid {
			reservation.FirstName = &firstName.String
		}
		if notes.Valid {
			reservation.Notes = &notes.String
		}
		if createdAt.Valid {
			reservation.CreatedAt = createdAt.Time
		}
		if reserveAt.Valid {
			reservation.ReserveAt = reserveAt.Time
		}

		reservation.PhoneNumber = phoneNumber
		reservation.Email = email
		reservation.Status = model.ReservationStatus(status)

		reservations = append(reservations, &reservation)
	}

	return reservations, nil
}

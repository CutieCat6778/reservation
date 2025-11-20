package mailer

import (
	"fmt"
	"net/smtp"
	"revervation/backend/graph/model"
)

type Config struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

type Mailer struct {
	config Config
	auth   smtp.Auth
}

func NewMailer(cfg Config) *Mailer {
	auth := smtp.PlainAuth("", cfg.Username, cfg.Password, cfg.Host)
	return &Mailer{config: cfg, auth: auth}
}

func (m *Mailer) SendReservationStatusEmail(reservation *model.Reservation, event model.ReservationEventBroadcast) error {
	to := reservation.Email
	subject := fmt.Sprintf("Ihre Reservierung wurde %s", formatEvent(event))
	body := m.buildHTMLBody(reservation, event)
	msg := fmt.Sprintf("From: %s\r\n", m.config.From) +
		fmt.Sprintf("To: %s\r\n", to) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		"MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n" +
		body
	addr := fmt.Sprintf("%s:%d", m.config.Host, m.config.Port)
	return smtp.SendMail(addr, m.auth, m.config.From, []string{to}, []byte(msg))
}

// SendCustomHTMLEmail sends an email with custom HTML content using the same layout
func (m *Mailer) SendCustomHTMLEmail(to string, subject string, customHTML string) error {
	body := fmt.Sprintf(`
		<html>
		<head>
		<style>
		body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
		.container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; }
		h2 { color: #2c3e50; }
		p { line-height: 1.5; }
		.footer { margin-top: 20px; font-size: 0.85em; color: #999; }
		</style>
		</head>
		<body>
		<div class="container">
		%s
		</div>
		</body>
		</html>
		`, customHTML)

	msg := fmt.Sprintf("From: %s\r\n", m.config.From) +
		fmt.Sprintf("To: %s\r\n", to) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		"MIME-version: 1.0;\r\nContent-Type: text/html; charset=\"UTF-8\";\r\n\r\n" +
		body

	addr := fmt.Sprintf("%s:%d", m.config.Host, m.config.Port)
	return smtp.SendMail(addr, m.auth, m.config.From, []string{to}, []byte(msg))
}

func formatEvent(event model.ReservationEventBroadcast) string {
	switch event {
	case model.ReservationEventBroadcastConfirmed:
		return "bestätigt"
	case model.ReservationEventBroadcastCanceled:
		return "storniert"
	case model.ReservationEventBroadcastDeclined:
		return "abgelehnt"
	case model.ReservationEventBroadcastCreated:
		return "erfasst"
	case model.ReservationEventBroadcastUpdated:
		return "aktualisiert"
	default:
		return "aktualisiert"
	}
}

func (m *Mailer) buildHTMLBody(reservation *model.Reservation, event model.ReservationEventBroadcast) string {
	notes := "Keine"
	if reservation.Notes != nil && *reservation.Notes != "" {
		notes = *reservation.Notes
	}
	var statusMessage string
	switch event {
	case model.ReservationEventBroadcastConfirmed:
		statusMessage = "Ihre Reservierung wurde bestätigt. Wir freuen uns, Sie begrüßen zu dürfen!"
	case model.ReservationEventBroadcastCanceled:
		statusMessage = "Leider wurde Ihre Reservierung storniert. Wir entschuldigen uns für die Unannehmlichkeiten."
	case model.ReservationEventBroadcastDeclined:
		statusMessage = "Ihre Reservierung wurde abgelehnt."
	case model.ReservationEventBroadcastCreated:
		statusMessage = "Ihre Reservierung wurde erfolgreich erfasst."
	case model.ReservationEventBroadcastUpdated:
		statusMessage = "Ihre Reservierung wurde aktualisiert."
	default:
		statusMessage = "Ihre Reservierung wurde aktualisiert."
	}
	return m.wrapHTML(reservation, statusMessage, notes)
}

func (m *Mailer) wrapHTML(reservation *model.Reservation, message string, notes string) string {
	return fmt.Sprintf(`
		<html>
		<head>
		<style>
		body { font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; }
		.container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; }
		h2 { color: #2c3e50; }
		p { line-height: 1.5; }
		.footer { margin-top: 20px; font-size: 0.85em; color: #999; }
		.status { font-weight: bold; color: #e67e22; }
		</style>
		</head>
		<body>
		<div class="container">
		<h2>Hallo %s %s,</h2>
		<p class="status">%s</p>
		<p><strong>Reservierungsdetails:</strong></p>
		<ul>
		<li>Datum & Uhrzeit: %s</li>
		<li>Anzahl Personen: %d</li>
		<li>Notizen: %s</li>
		</ul>
		<p>Vielen Dank für Ihre Reservierung!</p>
		<div class="footer">
		Ihr Yoake Restaurant-Team
		</div>
		</div>
		</body>
		</html>
		`, *reservation.FirstName, reservation.LastName, message, reservation.ReserveAt.Local().Format("02.01.2006 15:04"), reservation.Amount, notes)
}

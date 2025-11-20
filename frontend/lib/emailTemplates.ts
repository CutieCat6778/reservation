import { Reservation } from "@/lib/modelTypes";

export const emailTemplates = (reservation: Reservation) => ({
  before18after20: {
    title: "Vor 18 Uhr und nach 20 Uhr",
    body: `<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>leider können wir Ihre Reservierung nur vor 18 Uhr oder nach 20 Uhr anbieten.</p>`,
  },
  mondayClosed: {
    title: "Montag geschlossen",
    body: `<p>Sehr geehrte/r <strong>${reservation.firstName} ${reservation.lastName}</strong>,</p>
<p>wir müssen Ihnen leider mitteilen, dass unser Restaurant montags geschlossen ist.</p>`,
  },
  from20: { title: "Ab 20 Uhr", body: `<p>Wir können Ihre Reservierung leider erst ab 20 Uhr anbieten.</p>` },
  from19: { title: "Ab 19 Uhr", body: `<p>Wir können Ihre Reservierung leider erst ab 19 Uhr anbieten.</p>` },
  from18: { title: "Ab 18 Uhr", body: `<p>Wir können Ihre Reservierung leider erst ab 18 Uhr anbieten.</p>` },
  from17: { title: "Ab 17 Uhr", body: `<p>Wir können Ihre Reservierung leider erst ab 17 Uhr anbieten.</p>` },
  notOpen: { title: "Nicht geöffnet", body: `<p>Leider ist das Restaurant zu diesem Zeitpunkt nicht geöffnet.</p>` },
});

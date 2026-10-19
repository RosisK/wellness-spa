# Waves Spa

A small website for Waves Spa in Lakeside, Pokhara. It includes service and price listings, spa information, visit details, and an appointment request form that opens a prefilled WhatsApp message.

## Run locally

```sh
npm install
npm run dev
```

The appointment form currently hands the request to WhatsApp for confirmation. It does not reserve a slot or store guest information. That keeps the first version simple while making the next step clear: add a hosted database when the spa is ready to manage requests from a shared inbox or dashboard.

## Data storage

For a small booking system, Supabase is a good first database: use Postgres for appointments and a server-side endpoint for writes. Keep the public database key restricted with row-level security, and never put a service-role key in browser code. A useful first version can store a guest name, contact number, treatment, preferred date and time, notes, and booking status. Add authentication before exposing an appointment dashboard to staff.

Until then, WhatsApp requests are the source of truth; the site does not claim a booking is confirmed until a person replies.

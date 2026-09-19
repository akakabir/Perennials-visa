sed -i 's/from: process.env.RESEND_FROM_EMAIL || '\''Acme <onboarding@resend.dev>'\''/from: req.body.from || process.env.RESEND_FROM_EMAIL || '\''Acme <onboarding@resend.dev>'\''/' server.ts
sed -i 's/const { to, subject, html } = req.body;/const { to, subject, html, from } = req.body;/' server.ts

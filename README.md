# Perennials Visa

A premium, production-grade Visa Consultancy web application built with React 19, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore, and serverless API functions.

---

## 1. Architecture Overview

- **Frontend**: React 19 SPA running on Vite, Tailwind CSS v4, Lucide icons, Motion, and Recharts.
- **Admin Authentication**: Firebase Authentication (Email/Password) backed by a dedicated `admins` collection in Firestore. Sessions persist via `onAuthStateChanged`. Role-based access control (RBAC) ensures only verified admins with `status != 'inactive'` can access the portal and protected collections.
- **Security & Database**: Cloud Firestore with strict security rules (`firestore.rules`):
  - `visaPlans`, `processSteps`, and `siteSettings/global`: Public read, admin-only write.
  - `reviews`: Public read of approved reviews, public creation with pending status and validation; admin-only moderation.
  - `applications`: Public creation with strict schema validation (`status == 'New'`); admin-only read/update/delete.
  - `admins`: Admin-only read, no client writes (all admin management handled through `/api/admin/*` endpoints).
  - `emailTemplates`, `emailDrafts`: Admin-only access.
  - `adminRecovery`, `auditLogs`, `statusChecks`: Server-side only via `firebase-admin` (client access completely blocked).
- **Serverless API Layer (`/api`)**: Vercel-compatible serverless functions:
  - `/api/chat`: Hardened AI chat proxy stripping client system prompts, constructing context dynamically from active visa plans, and enforcing strict rate limits and origin checks.
  - `/api/health`: Live health probes verifying Firestore read latency and Groq AI availability, aggregating 24-hour service metrics.
  - `/api/application-status`: Minimal, rate-limited public endpoint returning only `{ referenceId, firstName, planName, status }`.
  - `/api/recovery-code/generate`: Issues high-entropy single-use recovery codes, securely hashed with scrypt.
  - `/api/recovery-code/redeem`: Rate-limited recovery endpoint allowing admins to regain access via single-use codes.
  - `/api/admin/*`: Verification, creation, updating, and deletion endpoints for admin users with superadmin authorization.
- **Payments**: Out of scope by design. Consultation and processing fees are discussed and arranged directly between applicants and visa specialists.

---

## 2. Environment Variables

Configure these in `.env` for local development and in the Vercel Project Settings for production:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `APP_URL` | Base public URL of the application | `https://perennialsvisa.com` |
| `GROQ_API_KEY` | API Key from console.groq.com | `gsk_...` |
| `GROQ_MODEL` | Groq model identifier | `openai/gpt-oss-20b` |
| `FIREBASE_PROJECT_ID` | GCP / Firebase Project ID | `perennials-visa-288d6` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin Service Account Email | `firebase-adminsdk-...@iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin Private Key (with `\n`) | `-----BEGIN PRIVATE KEY-----\n...` |

---

## 3. Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in the Firebase and Groq credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000` with the Vite dev server and API proxy handlers mounted.

4. **Verify TypeScript & Build**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 4. Creating the First Admin

To bootstrap the initial superadmin account:

```bash
npx tsx scripts/create-admin.ts admin@perennialsvisa.com "SecurePassword123!" superadmin
```

Or set the credentials in environment variables:
```bash
ADMIN_EMAIL="admin@perennialsvisa.com" ADMIN_PASSWORD="SecurePassword123!" npx tsx scripts/create-admin.ts
```

This script:
1. Creates or updates the user in Firebase Authentication.
2. Creates the corresponding document in Firestore under `admins/{uid}` with `role: "superadmin"` and `status: "active"`.

Once created, log in at `/admin/login`.

---

## 5. Password Management & Recovery Codes

### Changing Passwords (Inside Portal)
1. Log in to the Admin Portal at `/admin`.
2. Navigate to **Settings** → **Security**.
3. Under **Change Password**, provide your current password, enter a new password (min. 10 characters), and submit.
4. The system re-authenticates your credential with Firebase Auth and securely updates the password without transmitting it to custom storage.

### Generating an Emergency Recovery Code
1. In **Settings** → **Security**, click **Generate Recovery Code**.
2. A single-use 24-character security code is generated and displayed **once**.
3. The server computes a salted `crypto.scrypt` hash and saves it to `adminRecovery/{uid}`.
4. Store this code securely offline. Generating a new code automatically invalidates previous codes.

### Redeeming an Emergency Recovery Code
1. On `/admin/login`, click **Forgot password?** → **Use recovery code**.
2. Enter your admin email, the 24-character recovery code, and your desired new password.
3. The server verifies the code against the salted hash, updates your Firebase Auth password, marks the recovery code as used, writes an audit record, and prompts you to log in with your new password.
4. Rate limited to 5 attempts per hour per IP and email to prevent brute-force attacks.

---

## 6. Vercel Deployment

1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. The build preset automatically detects Vite. Ensure the build command is:
   ```bash
   npm run build
   ```
   and output directory is `dist`.
4. The serverless functions in `/api` are automatically deployed as edge/serverless routes.
5. Add all required environment variables under **Project Settings** → **Environment Variables**.

---

## 7. Connecting a Custom Domain

1. **Vercel DNS**:
   - In Vercel Project Settings → **Domains**, add your custom domain (e.g. `perennialsvisa.com` and `www.perennialsvisa.com`).
   - Configure the DNS records (A record pointing to `76.76.21.21` or CNAME to `cname.vercel-dns.com`) at your domain registrar.
2. **Firebase Auth Authorized Domains**:
   - Go to [Firebase Console](https://console.firebase.google.com) → **Authentication** → **Settings** → **Authorized domains**.
   - Add your custom domain (e.g. `perennialsvisa.com`). This ensures password resets, email verifications, and auth handshakes work seamlessly.
3. **Update APP_URL**:
   - Update `APP_URL` in your Vercel Environment Variables to `https://perennialsvisa.com`.

---

## 8. Moving to a New Firebase Project

If migrating the application to a new Firebase project:

1. **Create Firebase Project**:
   - Enable **Firebase Authentication** with the **Email/Password** provider.
   - Provision a **Cloud Firestore** database.
2. **Download Service Account Credentials**:
   - Go to Project Settings → **Service Accounts** → Generate New Private Key.
   - Update `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.
3. **Deploy Firestore Rules**:
   - Deploy `firestore.rules` via the Firebase CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```
4. **Firestore Collections Used**:
   - `admins`: Admin user accounts (`uid`, `email`, `role`, `status`, `createdAt`).
   - `visaPlans`: Visa types, pricing variants, requirements, and processing times.
   - `applications`: Submitted applicant forms and status tracking.
   - `reviews`: Client testimonials and ratings.
   - `processSteps`: 4-step consultation flow shown on the homepage.
   - `siteSettings`: Global branding, contact info, and company metadata (`global` doc).
   - `emailTemplates`: Prepared email templates for applicant updates.
   - `emailDrafts`: Saved email compositions.
   - `adminRecovery`: Salted scrypt hashes for single-use recovery codes (server-only).
   - `auditLogs`: Security and authentication audit events (server-only).
   - `statusChecks`: System uptime and latency snapshots (server-only).
5. **Seed Initial Data**:
   - Run the initial seed script:
     ```bash
     npx tsx scripts/seed.ts
     ```
   - Run the admin bootstrap script to create the first admin user:
     ```bash
     npx tsx scripts/create-admin.ts <your-email> <your-password> superadmin
     ```

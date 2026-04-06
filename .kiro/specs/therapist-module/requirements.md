# Requirements Document

## Introduction

The Therapist Module extends the existing MERN-stack mental health journaling application with a professional support layer. It introduces a verified therapist role, an admin-controlled verification workflow, a practice-code-based connection system between therapists and their clients, a read-only therapist dashboard with AI-powered patient insights, and real-time Socket.io chat between connected therapists and users. Privacy is preserved through a user-controlled toggle that limits therapist access to AI summaries rather than raw journal text.

---

## Glossary

- **System**: The full-stack mental health journaling application (React + Vite frontend, Express + Node backend).
- **User**: A registered account with `role: 'user'` who writes journal entries.
- **Therapist**: A registered account with `role: 'therapist'` who has been verified by an Admin.
- **Admin**: A registered account with `role: 'admin'` who manages the platform and verifies therapists.
- **Verification_Service**: The backend subsystem that handles therapist credential upload, admin review, and approval/rejection.
- **Connection_Service**: The backend subsystem that manages practice codes and therapist–user connection records.
- **Therapist_Dashboard**: The frontend view available exclusively to verified therapists showing their patient list and per-patient insights.
- **Chat_Service**: The backend subsystem that manages real-time Socket.io messaging between a therapist and a connected user.
- **Privacy_Toggle**: A user-controlled setting that determines whether a therapist can view raw journal text or only AI-generated insights.
- **Practice_Code**: A unique 6-character alphanumeric code assigned to a verified therapist, used by users to initiate a connection request.
- **Connection**: A MongoDB document recording the relationship between a Therapist and a User, with a status of `pending` or `active`.
- **ChatRoom**: A MongoDB document representing a real-time messaging channel between a verified Therapist and a connected User.
- **AI_Summary_Service**: The Gemini-powered backend service that generates a 3-sentence summary of a patient's recent journal patterns.
- **isVerifiedTherapist_Middleware**: Express middleware that permits access only when `req.user.role === 'therapist'` AND `req.user.isVerified === true`.
- **Upload_Middleware**: The existing Multer + Cloudinary middleware used to store uploaded files.

---

## Requirements

### Requirement 1: Therapist Registration

**User Story:** As a prospective therapist, I want to register with a therapist role and upload my license credentials, so that I can apply for platform verification.

#### Acceptance Criteria

1. WHEN a user submits the registration form with `role: 'therapist'`, THE System SHALL create a User document with `role: 'therapist'`, `isVerified: false`, `licenseNumber`, `specialization`, and `documentUrl` fields populated.
2. WHEN a therapist uploads a credential document during registration, THE Upload_Middleware SHALL accept JPG, PNG, and JPEG image formats only and store the file in Cloudinary, returning a secure URL saved to `documentUrl`.
3. IF a therapist submits registration without a `licenseNumber` or without a credential document, THEN THE System SHALL return a 400 error with a descriptive validation message.
4. WHEN therapist registration succeeds, THE System SHALL respond with a JWT token and user object where `isVerified: false`.

---

### Requirement 2: Pending Verification State

**User Story:** As a newly registered therapist, I want to see a "Waiting for Approval" screen after signup, so that I understand my account is under review and cannot access patient data yet.

#### Acceptance Criteria

1. WHEN an authenticated therapist with `isVerified: false` accesses the application, THE System SHALL redirect the therapist to a "Waiting for Approval" page.
2. WHILE a therapist's `isVerified` field is `false`, THE isVerifiedTherapist_Middleware SHALL return a 403 response for all protected therapist routes.
3. THE "Waiting for Approval" page SHALL display the therapist's submitted license number and a status message indicating the review is in progress.

---

### Requirement 3: Admin Verification Workflow

**User Story:** As an admin, I want to review pending therapist applications, view their uploaded credentials, and approve or reject them, so that only qualified professionals gain access to patient data.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display a "Pending Verification" table listing all therapist accounts where `isVerified: false` and `role: 'therapist'`, showing name, email, license number, specialization, and a link to the uploaded credential document.
2. WHEN an admin clicks "Verify" for a therapist, THE Verification_Service SHALL set `isVerified: true` on the therapist's User document and assign a unique Practice_Code.
3. WHEN an admin clicks "Reject" for a therapist, THE Verification_Service SHALL delete the therapist's User document and remove the associated Cloudinary document.
4. IF a verify or reject action targets a non-existent or already-verified therapist ID, THEN THE Verification_Service SHALL return a 404 error.
5. WHEN a therapist is approved, THE System SHALL send an email notification to the therapist's registered email address confirming approval and including their Practice_Code.
6. WHEN a therapist is rejected, THE System SHALL send an email notification to the therapist's registered email address explaining the rejection.

---

### Requirement 4: Practice Code Generation and Uniqueness

**User Story:** As the system, I want each verified therapist to have a unique practice code, so that users can connect to the correct therapist without ambiguity.

#### Acceptance Criteria

1. WHEN a therapist is approved by an admin, THE Connection_Service SHALL generate a unique 6-character alphanumeric Practice_Code and persist it to the therapist's User document.
2. THE Connection_Service SHALL guarantee that no two therapist documents share the same Practice_Code value.
3. IF a generated Practice_Code already exists in the database, THEN THE Connection_Service SHALL regenerate until a unique code is produced, up to 10 attempts before returning a 500 error.

---

### Requirement 5: User–Therapist Connection Request

**User Story:** As a user, I want to enter my therapist's practice code in a "Professional Support" tab, so that I can send a connection request to my therapist.

#### Acceptance Criteria

1. WHEN a user submits a valid Practice_Code, THE Connection_Service SHALL locate the matching verified therapist and create a Connection document with `status: 'pending'`, referencing both the user's ID and the therapist's ID.
2. IF the submitted Practice_Code does not match any verified therapist, THEN THE Connection_Service SHALL return a 404 error with the message "Practice code not found".
3. IF a Connection document already exists between the same user and therapist with `status: 'pending'` or `status: 'active'`, THEN THE Connection_Service SHALL return a 409 error to prevent duplicate connections.
4. THE "Professional Support" tab SHALL display the user's current connection status: no connection, pending, or active, along with the connected therapist's name and specialization when active.

---

### Requirement 6: Therapist Connection Management

**User Story:** As a verified therapist, I want to see incoming connection requests and accept or decline them, so that I control which users become my patients.

#### Acceptance Criteria

1. WHEN a verified therapist accesses the connection requests view, THE Connection_Service SHALL return all Connection documents where `therapistId` matches the therapist and `status: 'pending'`, including the requesting user's name and last journal date.
2. WHEN a therapist accepts a connection request, THE Connection_Service SHALL update the Connection document's `status` to `'active'` and create a ChatRoom document linking the therapist and user.
3. WHEN a therapist declines a connection request, THE Connection_Service SHALL delete the Connection document.
4. WHEN a connection becomes active, THE Therapist_Dashboard SHALL display the connected user in the therapist's Patient List.
5. WHEN a connection becomes active, THE System SHALL display the therapist's name and specialization in the user's "My Therapist" section.

---

### Requirement 7: Therapist Dashboard — Patient List

**User Story:** As a verified therapist, I want to see a list of my active patients with their latest mood and journal activity, so that I can quickly assess who may need attention.

#### Acceptance Criteria

1. WHEN a verified therapist accesses the Patient List, THE Therapist_Dashboard SHALL display a table with each active patient's name, last journal date, and current vibe (the `mood` field from the patient's most recent Analysis document).
2. THE isVerifiedTherapist_Middleware SHALL protect all Therapist_Dashboard data routes, returning 403 for unauthenticated or unverified requests.
3. WHEN a therapist clicks on a patient row, THE Therapist_Dashboard SHALL navigate to that patient's Detail View.

---

### Requirement 8: Therapist Dashboard — Patient Detail View

**User Story:** As a verified therapist, I want to view a patient's mood trend chart and an AI-generated summary of their recent journal patterns, so that I can prepare for sessions with clinical context.

#### Acceptance Criteria

1. WHEN a therapist opens a patient's Detail View, THE Therapist_Dashboard SHALL render a mood trend chart covering the patient's Analysis documents from the last 30 days, using the same chart logic as the Admin panel.
2. WHEN a therapist opens a patient's Detail View, THE AI_Summary_Service SHALL generate a 3-sentence Gemini summary of the patient's recent journal patterns and return it to the Therapist_Dashboard.
3. THE AI_Summary_Service SHALL use the patient's most recent 10 Analysis documents (mood, sentimentScore, distortions, keywords) as input context for the summary prompt, without including raw journal text in the prompt.
4. WHERE a patient has enabled the Privacy_Toggle to share raw journals, THE Therapist_Dashboard SHALL display the patient's actual journal entry text alongside AI insights.
5. WHERE a patient has NOT enabled the Privacy_Toggle, THE Therapist_Dashboard SHALL display only AI-generated insights and mood data, and SHALL NOT expose raw journal text to the therapist.

---

### Requirement 9: Privacy Toggle

**User Story:** As a user, I want to control whether my therapist can read my raw journal entries, so that I maintain ownership of my personal data.

#### Acceptance Criteria

1. THE System SHALL add a `shareJournalsWithTherapist` boolean field (default `false`) to the User model.
2. WHEN a user toggles "Share Raw Journals" to enabled in their profile settings, THE System SHALL set `shareJournalsWithTherapist: true` on the user's document.
3. WHEN a user toggles "Share Raw Journals" to disabled, THE System SHALL set `shareJournalsWithTherapist: false` on the user's document.
4. WHEN the Therapist_Dashboard requests patient journal data, THE System SHALL check `shareJournalsWithTherapist` and omit raw entry text from the response if the value is `false`.

---

### Requirement 10: Real-Time Therapist–User Chat

**User Story:** As a user or therapist in an active connection, I want to send and receive real-time messages, so that we can communicate between sessions.

#### Acceptance Criteria

1. WHEN a therapist accepts a connection, THE Chat_Service SHALL create a ChatRoom document containing `therapistId`, `userId`, and an empty `messages` array.
2. WHEN a user or therapist sends a message, THE Chat_Service SHALL persist a Message subdocument to the ChatRoom containing `senderId`, `text`, and `timestamp`, then emit a `'message'` Socket.io event to the room identified by the ChatRoom's `_id`.
3. WHEN a user or therapist connects to a Socket.io room, THE Chat_Service SHALL emit the last 50 messages from the ChatRoom to the connecting client.
4. THE isVerifiedTherapist_Middleware SHALL protect therapist-side chat routes; THE protect middleware SHALL protect user-side chat routes.
5. IF a message is sent to a ChatRoom where the sender is neither the linked therapist nor the linked user, THEN THE Chat_Service SHALL return a 403 error.

---

### Requirement 11: Security Middleware

**User Story:** As the system, I want dedicated middleware to gate all therapist-specific routes, so that unverified or non-therapist accounts cannot access patient data.

#### Acceptance Criteria

1. THE isVerifiedTherapist_Middleware SHALL verify that `req.user.role === 'therapist'` AND `req.user.isVerified === true` before calling `next()`.
2. IF `req.user.role` is not `'therapist'`, THEN THE isVerifiedTherapist_Middleware SHALL return a 403 response with the message "Access denied: therapist role required".
3. IF `req.user.isVerified` is `false`, THEN THE isVerifiedTherapist_Middleware SHALL return a 403 response with the message "Access denied: therapist verification pending".
4. THE isVerifiedTherapist_Middleware SHALL be applied to all routes under `/api/therapist/`.

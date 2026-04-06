# Implementation Plan: Therapist Module

## Overview

Implement the therapist module on top of the existing MERN stack (equil). Work proceeds backend-first (models → middleware → controllers → routes → socket), then frontend (pages → components → routing → API layer), with property-based tests woven in close to each implementation step.

## Tasks

- [ ] 1. Extend data models and add utility
  - [x] 1.1 Extend `server/models/User.js` with therapist fields
    - Add `'therapist'` to the `role` enum
    - Add `isVerified` (Boolean, default false), `licenseNumber` (String), `specialization` (String), `documentUrl` (String), `practiceCode` (String, unique, sparse)
    - Add `shareJournalsWithTherapist` (Boolean, default false)
    - _Requirements: 1.1, 9.1_

  - [x] 1.2 Create `server/models/Connection.js`
    - Fields: `userId` (ObjectId ref User, required), `therapistId` (ObjectId ref User, required), `status` (enum pending/active, default pending), timestamps
    - Add compound unique index `{ userId: 1, therapistId: 1 }`
    - _Requirements: 5.1, 5.3_

  - [x] 1.3 Create `server/models/TherapistChatRoom.js`
    - Fields: `therapistId` (ObjectId ref User, required), `userId` (ObjectId ref User, required), `messages` array with subdocuments `{ senderId, text, timestamp }`
    - Add unique index `{ therapistId: 1, userId: 1 }`
    - _Requirements: 10.1_

  - [x] 1.4 Create `server/utils/generatePracticeCode.js`
    - Generate a random 6-char uppercase alphanumeric string
    - Retry up to 10 times checking `User.findOne({ practiceCode })` for uniqueness
    - Throw an error after 10 failed attempts
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 1.5 Write property tests for practice code generation (P5, P6)
    - **Property 5: Practice code format invariant** — for any generated code, assert it is exactly 6 chars and matches `/^[A-Z0-9]{6}$/`
    - **Property 6: Practice codes are globally unique** — mock `User.findOne` to always return null, generate N codes, assert all are distinct
    - **Validates: Requirements 4.1, 4.2**

- [ ] 2. Add therapist middleware and extend upload middleware
  - [~] 2.1 Create `server/middleware/therapistMiddleware.js`
    - Wrap `protect` then check `req.user.role === 'therapist'` → 403 if not
    - Check `req.user.isVerified === true` → 403 if not
    - Call `next()` only when both conditions pass
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [~] 2.2 Write property test for `isVerifiedTherapist` middleware (P4)
    - **Property 4: isVerifiedTherapist middleware enforces role and verification**
    - Generate all combinations of `{ role: fc.constantFrom('user','admin','therapist'), isVerified: fc.boolean() }`, assert `next()` called iff role==='therapist' && isVerified===true, else 403
    - **Validates: Requirements 2.2, 11.1, 11.2, 11.3**

  - [~] 2.3 Extend `server/middleware/uploadMiddleware.js` with a credential-specific upload
    - Add a `fileFilter` that rejects files whose `mimetype` is not `image/jpeg`, `image/jpg`, or `image/png`, calling `cb(new Error('Only JPG, PNG, and JPEG images are allowed'), false)`
    - Export a second multer instance `uploadCredential` using this filter
    - _Requirements: 1.2_

  - [~] 2.4 Write property test for credential upload format filter (P2)
    - **Property 2: Credential upload rejects non-image formats**
    - Generate random mime type strings; assert the filter accepts only `image/jpeg`, `image/jpg`, `image/png` and rejects all others
    - **Validates: Requirements 1.2**

- [ ] 3. Extend auth controller and routes for therapist registration
  - [~] 3.1 Extend `server/controller/authController.js` — add `registerTherapist`
    - Validate presence of `licenseNumber` and `req.file`; return 400 if missing
    - Check for existing email; return 400 if duplicate
    - Create User with `{ role: 'therapist', isVerified: false, licenseNumber, specialization, documentUrl: req.file.path }`
    - Respond with JWT token and user object including `isVerified: false`
    - _Requirements: 1.1, 1.3, 1.4_

  - [~] 3.2 Write property test for therapist registration document shape (P1)
    - **Property 1: Therapist registration produces correct document shape**
    - Generate random valid payloads `{ name, email, licenseNumber, specialization, documentUrl }`; assert created document has `role: 'therapist'`, `isVerified: false`, all fields non-empty
    - **Validates: Requirements 1.1, 1.4**

  - [~] 3.3 Write property test for incomplete registration rejection (P3)
    - **Property 3: Incomplete registration is rejected**
    - Generate payloads with `licenseNumber` or `documentUrl` omitted; assert 400 response and no User document created
    - **Validates: Requirements 1.3**

  - [~] 3.4 Add therapist registration route to `server/routes/authRoutes.js`
    - `POST /register/therapist` → `uploadCredential.single('credential')`, `registerTherapist`
    - _Requirements: 1.1, 1.2_

- [ ] 4. Implement admin therapist verification endpoints
  - [~] 4.1 Add `getPendingTherapists`, `verifyTherapist`, `rejectTherapist` to `server/controller/adminController.js`
    - `getPendingTherapists`: query `User.find({ role: 'therapist', isVerified: false })`, return name, email, licenseNumber, specialization, documentUrl
    - `verifyTherapist`: find therapist by id + role + isVerified:false (404 if not found), call `generatePracticeCode()`, set `isVerified: true` and `practiceCode`, save, send approval email with practice code
    - `rejectTherapist`: find therapist (404 if not found), extract Cloudinary public ID from `documentUrl`, call `cloudinary.uploader.destroy()` (non-blocking on failure), delete user, send rejection email
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [~] 4.2 Add approval and rejection email templates to `server/services/emailService.js`
    - `sendTherapistApprovalEmail(email, name, practiceCode)` — include practice code prominently
    - `sendTherapistRejectionEmail(email, name)` — explain rejection
    - _Requirements: 3.5, 3.6_

  - [~] 4.3 Add admin therapist routes to `server/routes/adminRoutes.js`
    - `GET /therapists/pending` → `adminProtect`, `getPendingTherapists`
    - `POST /therapists/:id/verify` → `adminProtect`, `verifyTherapist`
    - `DELETE /therapists/:id/reject` → `adminProtect`, `rejectTherapist`
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5. Implement connection controller and routes
  - [~] 5.1 Create `server/controller/connectionController.js`
    - `createConnection`: find verified therapist by `practiceCode` (404 if not found), check for existing Connection (409 if exists), create `Connection { userId, therapistId, status: 'pending' }`
    - `getMyConnection`: return Connection for `req.user._id` as userId, populated with therapist name and specialization
    - `getConnectionRequests`: return pending Connections where `therapistId === req.user._id`, populated with user name and last journal date
    - `acceptConnection`: find Connection by id + therapistId, set status to 'active', create `TherapistChatRoom { therapistId, userId, messages: [] }`, return updated connection
    - `deleteConnection`: find Connection by id + therapistId, delete it
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_

  - [~] 5.2 Write property test for connection creation with valid practice code (P7)
    - **Property 7: Connection creation with valid practice code**
    - Generate user/therapist pairs with valid codes; assert Connection has `status: 'pending'`, correct `userId` and `therapistId`
    - **Validates: Requirements 5.1**

  - [~] 5.3 Write property test for invalid practice code returns 404 (P8)
    - **Property 8: Invalid practice code returns 404**
    - Generate random strings not matching any practiceCode; assert 404 response with message "Practice code not found"
    - **Validates: Requirements 5.2**

  - [~] 5.4 Write property test for pending connection filter (P9)
    - **Property 9: Pending connection list is correctly filtered**
    - Generate mixed Connection data with varying therapistIds and statuses; assert endpoint returns only pending connections for the requesting therapist
    - **Validates: Requirements 6.1**

  - [~] 5.5 Write property test for accept → active + ChatRoom (P10)
    - **Property 10: Accepting a connection activates it and creates a chat room**
    - Generate pending Connections; after accept, assert `status === 'active'` and TherapistChatRoom exists with matching ids and empty messages array
    - **Validates: Requirements 6.2, 10.1**

  - [~] 5.6 Create `server/routes/connectionRoutes.js` and wire into `server/app.js`
    - `POST /` → `protect`, `createConnection`
    - `GET /my` → `protect`, `getMyConnection`
    - `GET /requests` → `protect`, `isVerifiedTherapist`, `getConnectionRequests`
    - `PATCH /:id/accept` → `protect`, `isVerifiedTherapist`, `acceptConnection`
    - `DELETE /:id` → `protect`, `isVerifiedTherapist`, `deleteConnection`
    - Mount at `/api/connections` in `app.js`
    - _Requirements: 5.1, 6.1, 6.2, 6.3_

- [ ] 6. Implement therapist controller and routes
  - [~] 6.1 Create `server/controller/therapistController.js`
    - `getPatients`: find active Connections for `therapistId === req.user._id`, for each userId fetch name, last journal date, and most recent Analysis mood
    - `getPatientDetail`: fetch last 30 days of Analysis documents for userId; fetch up to 10 most recent Analyses for AI summary prompt (mood, sentimentScore, distortions, keywords — no raw text); call Gemini to generate 3-sentence summary; if `shareJournalsWithTherapist === true` include decrypted entry text, else omit
    - `getChatRooms`: find TherapistChatRooms where `therapistId === req.user._id`, populate userId name
    - _Requirements: 7.1, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [~] 6.2 Write property test for AI summary prompt constraints (P11)
    - **Property 11: AI summary uses at most 10 analyses and no raw text**
    - Generate patients with 0–20 Analysis documents; assert prompt contains at most 10 analyses, includes mood/sentimentScore/distortions/keywords, and contains no raw entry text
    - **Validates: Requirements 8.3**

  - [~] 6.3 Write property test for privacy toggle controls raw journal exposure (P12)
    - **Property 12: Privacy toggle controls raw journal exposure**
    - Generate patients with `shareJournalsWithTherapist` true/false; assert response includes raw text iff toggle is true
    - **Validates: Requirements 8.4, 8.5, 9.2, 9.3, 9.4**

  - [~] 6.4 Write property test for 30-day mood chart data bounds (P15)
    - **Property 15: 30-day mood chart data is correctly bounded**
    - Generate Analysis documents with varying `createdAt` dates; assert only documents within last 30 days are returned
    - **Validates: Requirements 8.1**

  - [~] 6.5 Create `server/routes/therapistRoutes.js` and wire into `server/app.js`
    - `GET /patients` → `protect`, `isVerifiedTherapist`, `getPatients`
    - `GET /patients/:userId` → `protect`, `isVerifiedTherapist`, `getPatientDetail`
    - `GET /chat-rooms` → `protect`, `isVerifiedTherapist`, `getChatRooms`
    - Mount at `/api/therapist` in `app.js`
    - _Requirements: 7.2, 11.4_

- [ ] 7. Extend user controller with privacy toggle
  - [~] 7.1 Add `togglePrivacy` to `server/controller/userController.js`
    - `PATCH /privacy-toggle`: set `shareJournalsWithTherapist` to the boolean value from `req.body.shareJournalsWithTherapist`, save, return updated field
    - Add route `PATCH /privacy-toggle` → `protect`, `togglePrivacy` in `server/routes/userRoutes.js`
    - _Requirements: 9.2, 9.3_

- [ ] 8. Extend Socket.io handler for therapist chat
  - [~] 8.1 Extend the Socket.io handler in `server/server.js` (or its chat handler file) with therapist chat events
    - `joinTherapistRoom`: find TherapistChatRoom by `chatRoomId`, verify socket user is therapist or user of that room (emit error if not), join socket room, emit `therapistHistory` with last 50 messages
    - `therapistMessage`: find room, verify sender is participant (403 if not), push `{ senderId, text, timestamp }` to messages, save, emit `therapistMessage` to room
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

  - [~] 8.2 Write property test for message persistence and authorization (P13)
    - **Property 13: Message persistence and authorization**
    - Generate ChatRooms with random sender IDs; assert messages from therapistId or userId are persisted, all others return 403
    - **Validates: Requirements 10.2, 10.5**

  - [~] 8.3 Write property test for chat history cap at 50 messages (P14)
    - **Property 14: Chat history load is capped at 50 messages**
    - Generate ChatRooms with 0–100 messages; assert `therapistHistory` emits exactly `min(N, 50)` messages
    - **Validates: Requirements 10.3**

- [ ] 9. Checkpoint — backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Build frontend API layer
  - [~] 10.1 Create `client/src/api/therapistAPI.js`
    - `getPatients()` → `GET /api/therapist/patients`
    - `getPatientDetail(userId)` → `GET /api/therapist/patients/:userId`
    - `getChatRooms()` → `GET /api/therapist/chat-rooms`
    - _Requirements: 7.1, 8.1_

  - [~] 10.2 Create `client/src/api/connectionAPI.js`
    - `submitPracticeCode(practiceCode)` → `POST /api/connections/`
    - `getMyConnection()` → `GET /api/connections/my`
    - `getConnectionRequests()` → `GET /api/connections/requests`
    - `acceptConnection(id)` → `PATCH /api/connections/:id/accept`
    - `deleteConnection(id)` → `DELETE /api/connections/:id`
    - _Requirements: 5.1, 6.1, 6.2, 6.3_

  - [~] 10.3 Extend `client/src/api/adminAPI.js` with therapist admin calls
    - `getPendingTherapists()` → `GET /api/admin/therapists/pending`
    - `verifyTherapist(id)` → `POST /api/admin/therapists/:id/verify`
    - `rejectTherapist(id)` → `DELETE /api/admin/therapists/:id/reject`
    - _Requirements: 3.1, 3.2, 3.3_

  - [~] 10.4 Extend `client/src/api/userAPI.js` with privacy toggle call
    - `togglePrivacy(share)` → `PATCH /api/user/privacy-toggle`
    - _Requirements: 9.2, 9.3_

  - [~] 10.5 Extend `client/src/api/authAPI.js` with therapist registration call
    - `registerTherapist(formData)` → `POST /api/auth/register/therapist` with `multipart/form-data`
    - _Requirements: 1.1, 1.2_

- [ ] 11. Build frontend pages and components
  - [~] 11.1 Create `client/src/pages/WaitingApproval.jsx`
    - Display therapist's `licenseNumber` and a status message indicating review is in progress
    - No navigation to protected routes
    - _Requirements: 2.1, 2.3_

  - [~] 11.2 Create `client/src/pages/TherapistDashboard.jsx` with `PatientList` sub-view
    - Fetch patients via `getPatients()`; render table with name, last journal date, current vibe (mood)
    - Row click navigates to `/therapist/patients/:id`
    - Include a "Connection Requests" section showing pending requests with accept/decline buttons (calls `getConnectionRequests`, `acceptConnection`, `deleteConnection`)
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.3_

  - [~] 11.3 Create `client/src/pages/PatientDetail.jsx`
    - Fetch patient detail via `getPatientDetail(userId)`
    - Render 30-day mood trend chart (reuse Recharts AreaChart pattern from AdminDashboard)
    - Display AI summary text
    - Conditionally render raw journal entries if included in response
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [~] 11.4 Create `client/src/pages/TherapistChat.jsx`
    - Connect to Socket.io on mount, emit `joinTherapistRoom` with `chatRoomId` from route params
    - Listen for `therapistHistory` to populate initial messages
    - Listen for `therapistMessage` to append new messages
    - Send messages via `therapistMessage` event
    - _Requirements: 10.2, 10.3, 10.4_

  - [~] 11.5 Create `client/src/pages/UserTherapistChat.jsx`
    - Same Socket.io pattern as `TherapistChat.jsx` but from the user's perspective
    - Route: `/chat/therapist/:roomId`
    - _Requirements: 10.2, 10.3_

  - [~] 11.6 Add `ProfessionalSupport` tab to `client/src/pages/Profile.jsx`
    - Fetch connection status via `getMyConnection()` on tab open
    - If no connection: show practice code input form calling `submitPracticeCode`
    - If pending: show pending status with therapist name
    - If active: show therapist name, specialization, and link to chat room; show privacy toggle calling `togglePrivacy`
    - _Requirements: 5.4, 6.4, 6.5, 9.2, 9.3_

  - [~] 11.7 Add pending therapist verification table to `client/src/pages/AdminDashboard.jsx`
    - Fetch via `getPendingTherapists()` on mount
    - Render table with name, email, licenseNumber, specialization, credential image link
    - "Verify" button calls `verifyTherapist(id)`, "Reject" button calls `rejectTherapist(id)` with confirmation modal
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 12. Add routing and route guards
  - [~] 12.1 Create `client/src/components/TherapistRoute.jsx`
    - Redirect to `/pending-approval` if `user.role === 'therapist' && !user.isVerified`
    - Redirect to `/login` if not authenticated
    - Otherwise render `<Outlet />`
    - _Requirements: 2.1, 2.2_

  - [~] 12.2 Update `client/src/App.jsx` with all new routes
    - Add `<Route path="/pending-approval" element={<WaitingApproval />} />` inside `ProtectedRoute`
    - Add `TherapistRoute` guard wrapping:
      - `<Route path="/therapist" element={<TherapistDashboard />} />`
      - `<Route path="/therapist/patients/:id" element={<PatientDetail />} />`
      - `<Route path="/therapist/chat/:roomId" element={<TherapistChat />} />`
    - Add `<Route path="/chat/therapist/:roomId" element={<AppLayout><UserTherapistChat /></AppLayout>} />` inside `ProtectedRoute`
    - _Requirements: 2.1, 7.3_

  - [~] 12.3 Update `client/src/context/AuthProvider.jsx` to expose `isVerified` and therapist fields from the stored user object
    - Ensure `isVerified`, `licenseNumber`, `shareJournalsWithTherapist` are included in the auth context user
    - _Requirements: 2.1, 2.3_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** and must run a minimum of 100 iterations each
- Property tests are tagged with `// Feature: therapist-module, Property N: <property_text>`
- `TherapistChatRoom` is separate from the existing `ChatSession` model (which is AI-only)
- Cloudinary cleanup on rejection is non-blocking: log errors but still delete the user document

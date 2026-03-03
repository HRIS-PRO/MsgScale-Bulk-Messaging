# MsgScale Enterprise - Development Roadmap

This document outlines the engineering tasks required to transition from a high-fidelity prototype to a production-ready messaging platform.

## 🏗 Phase 1: Global State & Persistence
- [ ] **State Management**: Implement a `Context API` or `Zustand` store for global state (Auth, User Profile, active Workspace).
- [ ] **Persistence Layer**: Create a utility to sync application state (Campaigns, Contacts) to `localStorage` or an IndexedDB for offline resilience.
- [ ] **API Key Selection**: Ensure compliance with Gemini requirements by implementing the `window.aistudio.hasSelectedApiKey()` check before allowing AI features.

## 🔐 Phase 2: Authentication & Workspaces
- [ ] **Auth Session**: Implement a real session check in `App.tsx`. Redirect to `/auth/login` if `localStorage` session is missing.
- [ ] **OTP Mock Logic**: Implement a "fake" successful OTP (e.g., `123456`) that sets a valid JWT/token in the browser.
- [ ] **Workspace Logic**: Ensure that selecting a workspace filters all data (Campaigns/Contacts) to only show items belonging to that specific organization.

## 🚀 Phase 3: Campaign Lifecycle Management
- [ ] **Wizard Step Persistence**: Save wizard progress to `localStorage` so users don't lose drafts on page refresh.
- [ ] **Step 1 & 2 Implementation**: Build out the forms for "Campaign Details" (Channel selection) and "Audience" (Segment selection).
- [ ] **Simulation Engine**: Create a "Sending" state for campaigns. Use `setInterval` to mock a delivery progress bar with real-time success/failure counts.

## 👥 Phase 4: Contact & Audience Engine
- [ ] **Real CRUD**: Connect the `AddContact` form to the global contacts store.
- [ ] **Bulk Import**: Implement a CSV parser (using `PapaParse` or native Blob API) to allow users to upload their own contact lists.
- [ ] **Segmentation**: Add logic to filter contacts into "Groups" (VIP, Leads, etc.) and allow these segments to be targeted in the Campaign Wizard.

## 🧠 Phase 5: AI & Insights (Gemini Core)
- [ ] **Context Injection**: Update `geminiService.ts` to automatically pull data from the active workspace for every query.
- [ ] **Proactive Insights**: Trigger an automatic AI analysis when a user opens a report that has "Degraded Performance" or a low "Open Rate."
- [ ] **Function Calling**: Experiment with Gemini tools to allow the AI to "Create a draft campaign" or "Export this segment" via natural language.

## ⚙️ Phase 6: Workspace, Teams & Integrations
- [ ] **Workspace Branding**: Implement the logo upload logic (base64 storage in state) and workspace naming persistence.
- [ ] **Team Management**: Build the "Team" tab to allow adding/removing members and assigning RBAC (Role-Based Access Control) levels (Admin, Editor, Viewer).
- [ ] **Integration Hub**: Implement a secure way to store and manage "Provider Keys" (e.g., Twilio SID/Token, WhatsApp API Keys, SMTP Credentials).
- [ ] **Webhooks**: Create a UI for users to register webhooks for delivery status callbacks (DLRs).
- [ ] **Billing Mockup**: Connect the "Billing" tab to a mock subscription state, allowing users to "upgrade" their tier to unlock more monthly messages.

## 📊 Phase 7: Reporting & Analytics
- [ ] **Dynamic Charts**: Connect `recharts` to the real Campaign/Delivery data instead of using `mockData`.
- [ ] **Real-time Latency**: Update the "Carrier Breakdown" latency values based on simulated network pings.

## ✨ Phase 8: UX & Polishing
- [ ] **Toast System**: Add a notification system for "Campaign Sent," "Contact Saved," or "AI Analysis Failed."
- [ ] **Form Validation**: Add `zod` or simple regex validation for Emails and International Phone Numbers.
- [ ] **Theme Polish**: Audit all components to ensure no hardcoded colors remain that break in "Dark Mode."

---
*Last Updated: 2024-05-24*
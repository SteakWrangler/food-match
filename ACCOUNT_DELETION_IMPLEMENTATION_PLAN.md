# Account Deletion Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for adding account deletion functionality to the Toss or Taste app. Account deletion will include proper warnings, subscription handling, and complete data removal.

## Phase 1: Backend Infrastructure (1-2 days)

### 1.1 Create Account Deletion Supabase Function
- [ ] **1.1.1** Create `supabase/functions/delete-account/index.ts`
- [ ] **1.1.2** Implement user authentication validation
- [ ] **1.1.3** Add Stripe subscription cancellation logic
- [ ] **1.1.4** Add Apple IAP subscription handling
- [ ] **1.1.5** Implement user deletion with proper cascade
- [ ] **1.1.6** Add comprehensive error handling and logging
- [ ] **1.1.7** Test function with dummy data

### 1.2 Create Account Data Export Function (Optional)
- [ ] **1.2.1** Create `supabase/functions/export-account-data/index.ts`
- [ ] **1.2.2** Export user profile data
- [ ] **1.2.3** Export favorites list
- [ ] **1.2.4** Export room history
- [ ] **1.2.5** Return as downloadable JSON file

### 1.3 Database Foreign Key Constraints
- [ ] **1.3.1** Create migration to add foreign key constraints with `ON DELETE CASCADE`
- [ ] **1.3.2** Add constraint for `user_favorites.user_id` → `auth.users(id)`
- [ ] **1.3.3** Add constraint for `room_history.user_id` → `auth.users(id)`
- [ ] **1.3.4** Add constraint for `processed_sessions.user_id` → `auth.users(id)`
- [ ] **1.3.5** Test cascade deletion in development environment
- [ ] **1.3.6** Create backup/restore procedures for testing

### 1.4 Additional Data Cleanup
- [ ] **1.4.1** Add processed_sessions table cleanup to deletion function
- [ ] **1.4.2** Add rooms table cleanup (delete rooms where user is host)
- [ ] **1.4.3** Add api_usage table cleanup (optional - no user linkage but contains user-agent data)

## Phase 2: Subscription Management (1-2 days)

### 2.1 Stripe Integration
- [ ] **2.1.1** Add function to cancel active Stripe subscriptions
- [ ] **2.1.2** Add function to delete Stripe customer
- [ ] **2.1.3** Handle partial refunds if applicable
- [ ] **2.1.4** Test with Stripe test environment

### 2.2 Apple IAP Integration
- [ ] **2.2.1** Research Apple IAP cancellation requirements
- [ ] **2.2.2** Implement server-side subscription status check
- [ ] **2.2.3** Add warning about manual cancellation needed
- [ ] **2.2.4** Test with sandbox environment

### 2.3 Data Calculation for Warnings
- [ ] **2.3.1** Create function to calculate subscription value remaining
- [ ] **2.3.2** Create function to count user's favorites
- [ ] **2.3.3** Create function to count room history entries
- [ ] **2.3.4** Create function to get remaining room credits count

## Phase 3: Frontend UI Components (2-3 days)

### 3.1 Delete Account Dialog Components
- [ ] **3.1.1** Create `DeleteAccountDialog.tsx` base component
- [ ] **3.1.2** Create `DeleteWarningStep.tsx` - initial warning
- [ ] **3.1.3** Create `SubscriptionWarningStep.tsx` - subscription impacts
- [ ] **3.1.4** Create `FinalConfirmationStep.tsx` - type DELETE confirmation
- [ ] **3.1.5** Create `DeletionProgressStep.tsx` - loading/progress indicator

### 3.2 Account Deletion Hook
- [ ] **3.2.1** Create `useAccountDeletion.tsx` hook
- [ ] **3.2.2** Implement multi-step state management
- [ ] **3.2.3** Add data fetching for warning calculations
- [ ] **3.2.4** Add deletion API call logic
- [ ] **3.2.5** Add error handling and retry logic

### 3.3 Integration with User Profile Modal
- [ ] **3.3.1** Add "Danger Zone" section to UserProfileModal
- [ ] **3.3.2** Add "Delete Account" button styling
- [ ] **3.3.3** Integrate DeleteAccountDialog with modal
- [ ] **3.3.4** Handle modal state management during deletion flow

## Phase 4: API Integration & Services (1 day)

### 4.1 Frontend API Service
- [ ] **4.1.1** Add `deleteAccount()` function to auth service
- [ ] **4.1.2** Add `exportAccountData()` function (optional)
- [ ] **4.1.3** Add proper error types and handling
- [ ] **4.1.4** Add loading states management

### 4.2 Auth Context Updates
- [ ] **4.2.1** Add account deletion methods to useAuth hook
- [ ] **4.2.2** Handle sign-out after successful deletion
- [ ] **4.2.3** Clear all cached data after deletion

## Phase 5: Testing & Validation (1-2 days)

### 5.1 Backend Testing
- [ ] **5.1.1** Test account deletion with no subscription
- [ ] **5.1.2** Test account deletion with active Stripe subscription
- [ ] **5.1.3** Test account deletion with Apple IAP subscription
- [ ] **5.1.4** Test error scenarios (network failures, API errors)
- [ ] **5.1.5** Verify complete data removal from database

### 5.2 Frontend Testing
- [ ] **5.2.1** Test complete deletion flow with test account
- [ ] **5.2.2** Test cancellation at each step
- [ ] **5.2.3** Test error handling and retry flows
- [ ] **5.2.4** Test responsive design on mobile/desktop
- [ ] **5.2.5** Test accessibility (keyboard navigation, screen readers)

### 5.3 Integration Testing
- [ ] **5.3.1** Test with real Stripe test subscription
- [ ] **5.3.2** Test with Apple IAP sandbox subscription
- [ ] **5.3.3** Test edge cases (poor network, concurrent sessions)

## Phase 6: Security & Compliance (1 day)

### 6.1 Security Review
- [ ] **6.1.1** Verify proper authentication on all deletion endpoints
- [ ] **6.1.2** Ensure user can only delete their own account
- [ ] **6.1.3** Add rate limiting to prevent abuse
- [ ] **6.1.4** Review logs for sensitive data exposure

### 6.2 Compliance Considerations
- [ ] **6.2.1** Ensure GDPR compliance (right to be forgotten)
- [ ] **6.2.2** Add privacy policy updates if needed
- [ ] **6.2.3** Consider data retention policies
- [ ] **6.2.4** Document deletion process for support team

## Phase 7: Documentation & Deployment (0.5 days)

### 7.1 Documentation
- [ ] **7.1.1** Update API documentation
- [ ] **7.1.2** Create troubleshooting guide
- [ ] **7.1.3** Update user help documentation
- [ ] **7.1.4** Document subscription cancellation process

### 7.2 Deployment
- [ ] **7.2.1** Deploy Supabase functions to staging
- [ ] **7.2.2** Test in staging environment
- [ ] **7.2.3** Deploy to production
- [ ] **7.2.4** Monitor for errors after deployment

## Optional Enhancements (Low Priority)

### Account Recovery Grace Period
- [ ] **8.1.1** Implement 30-day grace period before permanent deletion
- [ ] **8.1.2** Add account recovery email/link
- [ ] **8.1.3** Update deletion flow to mention grace period

### Data Export Feature
- [ ] **8.2.1** Add "Export My Data" button before deletion
- [ ] **8.2.2** Generate comprehensive data export
- [ ] **8.2.3** Email export file to user

## Technical Architecture

### File Structure
```
src/
├── components/
│   ├── account-deletion/
│   │   ├── DeleteAccountDialog.tsx
│   │   ├── DeleteWarningStep.tsx
│   │   ├── SubscriptionWarningStep.tsx
│   │   ├── FinalConfirmationStep.tsx
│   │   └── DeletionProgressStep.tsx
│   └── UserProfileModal.tsx (updated)
├── hooks/
│   ├── useAccountDeletion.tsx
│   └── useAuth.tsx (updated)
└── services/
    └── accountDeletion.ts

supabase/
└── functions/
    ├── delete-account/
    │   └── index.ts
    └── export-account-data/
        └── index.ts
```

### Data Flow
1. User clicks "Delete Account" → Initial warning dialog
2. Fetch user data (subscriptions, favorites count, etc.)
3. Show subscription impact warnings if applicable
4. Final confirmation with "DELETE" typing requirement
5. Call backend deletion function
6. Handle Stripe/Apple IAP cancellations
7. Delete user from Supabase Auth (cascades to all tables)
8. Sign out user and redirect to landing page

## Estimated Timeline
- **Phase 1-2**: 2-4 days (Backend & Subscriptions)
- **Phase 3-4**: 3-4 days (Frontend & Integration)
- **Phase 5-7**: 2-3 days (Testing & Deployment)
- **Total**: 7-11 days

## Risk Mitigation
- Test thoroughly in development environment first
- Implement comprehensive logging for debugging
- Have rollback plan for production deployment
- Monitor error rates after deployment
- Keep support team informed of new feature
<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into PMMSherpa. This includes client-side initialization via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), a server-side PostHog client helper, a reverse proxy configuration to improve ad-blocker resilience, 13 tracked events across 8 files, user identification on login/signup, and server-side event capture for critical business operations.

| Event | Description | File |
|-------|-------------|------|
| `user_signed_up` | User completes signup (email or Google OAuth) | `src/app/(auth)/signup/page.tsx` |
| `user_logged_in` | User successfully logs in with email/password | `src/app/(auth)/login/page.tsx` |
| `profile_completed` | User submits LinkedIn URL and consent, completing onboarding | `src/app/(auth)/complete-profile/page.tsx` |
| `starter_plan_selected` | User selects the paid Starter plan and initiates Stripe checkout | `src/app/(auth)/complete-profile/page.tsx` |
| `message_sent` | User sends a chat message (includes model, attachments flag) | `src/components/chat/ChatContainer.tsx` |
| `conversation_created` | New conversation created (first message in a session) | `src/components/chat/ChatContainer.tsx` |
| `landing_tile_clicked` | User clicks a prompt tile on the empty chat screen | `src/components/chat/ChatContainer.tsx` |
| `voice_mode_opened` | User opens the voice mode overlay | `src/components/chat/ChatContainer.tsx` |
| `model_changed` | User changes LLM model from the model selector | `src/components/chat/ModelSelector.tsx` |
| `file_uploaded` | User uploads a file attachment (includes type and size) | `src/components/chat/ChatInput.tsx` |
| `usage_limit_hit` | *(Server-side)* User hits the free-tier monthly message limit | `src/app/api/chat/route.ts` |
| `chat_message_completed` | *(Server-side)* Chat response finished streaming successfully | `src/app/api/chat/route.ts` |
| `access_request_submitted` | *(Server-side)* Access request / waitlist form submitted | `src/app/api/access-request/route.ts` |

### Additional files created/modified

| File | Change |
|------|--------|
| `instrumentation-client.ts` | PostHog client-side initialization (Next.js 15.3+ pattern) |
| `src/lib/posthog-server.ts` | Server-side PostHog singleton client |
| `next.config.ts` | Added `/ingest/*` reverse proxy rewrites |
| `src/components/auth/AuthRedirectHandler.tsx` | Identify users on `SIGNED_IN` event (covers Google OAuth) |

## Next steps

We've built a dashboard and five insights for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/391943/dashboard/1494944)
- **Insight**: [Signup → Profile → First Message Funnel](https://us.posthog.com/project/391943/insights/ioUF5DO9)
- **Insight**: [Daily Messages Sent (Engagement)](https://us.posthog.com/project/391943/insights/VpvytAom)
- **Insight**: [Usage Limit Hit (Churn Signal)](https://us.posthog.com/project/391943/insights/oBhuZYV4)
- **Insight**: [Starter Plan Selected (Conversion)](https://us.posthog.com/project/391943/insights/M5wlMuzS)
- **Insight**: [Top Landing Tiles Clicked](https://us.posthog.com/project/391943/insights/9KU6Jrfj)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

import { redirect } from 'next/navigation'

// Profile-completion gate was removed — users go directly from /signup to /chat
// after auth. This stub catches anyone with stale links (old onboarding emails,
// browser bookmarks, Stripe cancel URLs from before the refactor).
export default function CompleteProfilePage() {
  redirect('/chat')
}

// Super Admin Configuration
export const SUPER_ADMIN_EMAIL = 'abhishekratna@gmail.com'

// Use Cases for Access Request form
export const USE_CASES = [
  'Positioning & Messaging Strategy',
  'Go-to-Market Planning',
  'Competitive Intelligence',
  'Customer Research & Personas',
  'Sales Enablement Content',
  'Product Launch Planning',
  'Content Creation (blogs, case studies)',
  'Pricing Strategy',
  'Market Analysis',
  'Other'
] as const

export type UseCase = (typeof USE_CASES)[number]

// Check if email is super admin
export const isSuperAdmin = (email: string | null | undefined): boolean => {
  return email === SUPER_ADMIN_EMAIL
}

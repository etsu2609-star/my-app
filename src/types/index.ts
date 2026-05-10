export type Profile = {
  id: string
  role: 'employee' | 'user'
  display_name: string
  bio: string
  avatar_url: string
  job_title: string
  is_public: boolean
  region: string
  age: number | null
  phone: string
  gender: 'male' | 'female' | 'other' | '' | null
  therapist_years: number | null
  created_at: string
}

export type Menu = {
  id: string
  employee_id: string
  tab: string
  name: string
  price: number
  description: string
  sort_order: number
}

export type Tag = {
  id: string
  name: string
}
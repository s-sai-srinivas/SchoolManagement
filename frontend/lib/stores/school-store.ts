import { create } from 'zustand'

interface School {
    id: string
    name: string
    logoUrl: string | null
    createdAt: string
    updatedAt: string
}

interface SchoolState {
    school: School | null

    // Actions
    setSchool: (school: School) => void
    updateSchool: (school: Partial<School>) => void
    clearSchool: () => void
}

export const useSchoolStore = create<SchoolState>((set) => ({
    school: null,

    setSchool: (school) => set({ school }),

    updateSchool: (updatedSchool) =>
        set((state) => ({
            school: state.school ? { ...state.school, ...updatedSchool } : null,
        })),

    clearSchool: () => set({ school: null }),
}))

import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    schoolName: z.string().min(3, 'School name must be at least 3 characters'),
    adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

// User Schemas
export const createUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['ADMIN', 'TEACHER', 'PARENT']),
})

export const updateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
})

// Student Schemas
export const createStudentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    admissionNo: z.string().min(3, 'Admission number is required'),
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required'),
})

export const updateStudentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    class: z.string().min(1, 'Class is required').optional(),
    section: z.string().min(1, 'Section is required').optional(),
})

// Homework Schemas
export const createHomeworkSchema = z.object({
    subject: z.string().min(2, 'Subject is required'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required'),
    dueDate: z.string().optional(),
})

export const updateHomeworkSchema = z.object({
    subject: z.string().min(2, 'Subject is required').optional(),
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
})

// Notice Schemas
export const createNoticeSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
})

// Fee Structure Schema
export const feeStructureSchema = z.object({
    annualAmount: z.number().min(1, 'Annual amount must be greater than 0'),
    installments: z.number().min(1, 'Must have at least 1 installment').max(12, 'Maximum 12 installments'),
})

// School Update Schema
export const updateSchoolSchema = z.object({
    name: z.string().min(3, 'School name must be at least 3 characters').optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>
export type FeeStructureInput = z.infer<typeof feeStructureSchema>
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>

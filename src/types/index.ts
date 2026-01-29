// src/types/index.ts
export interface Document {
  id: string
  name: string
  type: string
  size: number
  uploaded_at: string
  url: string
  description?: string
}

export interface UploadDocumentForm {
  file: File | null
  description: string
}
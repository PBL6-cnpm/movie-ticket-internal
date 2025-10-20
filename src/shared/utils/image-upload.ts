/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
}

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP image.'
        }
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size too large. Maximum size is 5MB.'
        }
    }

    return { valid: true }
}

/**
 * Create image preview URL from file
 */
export const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file)
}

/**
 * Clean up image preview URL
 */
export const revokeImagePreview = (url: string): void => {
    URL.revokeObjectURL(url)
}

"use client"

import React, { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled,
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      toast.error('Image upload is not configured. Please set up Cloudinary environment variables.')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      const imageUrl = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress)
      })
      onChange(imageUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      let errorMessage = 'Failed to upload image'
      
      if (error instanceof Error) {
        if (error.message.includes('Cloudinary configuration')) {
          errorMessage = 'Image upload is not configured properly. Please contact administrator.'
        } else if (error.message.includes('Only image files')) {
          errorMessage = 'Please select a valid image file (PNG, JPG, GIF).'
        } else if (error.message.includes('File size must be less')) {
          errorMessage = 'Image size must be less than 5MB. Please choose a smaller image.'
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    onRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />
      
      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <img
              src={value}
              alt="Uploaded image"
              className="object-cover w-full h-full"
            />
          </div>
          <Button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
            isCloudinaryConfigured() 
              ? 'cursor-pointer hover:border-gray-400' 
              : 'cursor-not-allowed opacity-60'
          }`}
          onClick={() => isCloudinaryConfigured() && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                {isCloudinaryConfigured() 
                  ? 'Click to upload batch thumbnail'
                  : 'Image upload not configured'
                }
              </p>
              <p className="text-xs text-gray-400">
                {isCloudinaryConfigured()
                  ? 'PNG, JPG, GIF up to 5MB • Auto-optimized'
                  : 'Please configure Cloudinary in environment variables'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
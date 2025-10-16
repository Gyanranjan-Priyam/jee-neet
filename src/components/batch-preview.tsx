"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, GraduationCap, User } from 'lucide-react'

interface BatchPreviewProps {
  batchData: {
    name: string
    category: string
    classType: string
    description: string
    thumbnail?: string
    schedule: {
      days: string[]
      startTime: string
      endTime: string
    }
    capacity: number
    fees: number
    enrolledStudents?: number
    startDate?: string
    endDate?: string
    teacherInfo?: {
      name: string
      subject: string
      experience: string
      qualification: string
      bio: string
    }
  }
}

export const BatchPreview: React.FC<BatchPreviewProps> = ({ batchData }) => {
  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDays = (days: string[]) => {
    if (!days.length) return 'No days selected'
    return days.join(', ')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Batch Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thumbnail */}
          {batchData.thumbnail ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <img
                src={batchData.thumbnail}
                alt="Batch thumbnail"
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-gray-100 rounded-lg border flex items-center justify-center">
              <div className="text-center text-gray-400">
                <GraduationCap className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No thumbnail uploaded</p>
              </div>
            </div>
          )}

          {/* Batch Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {batchData.name || 'Batch Name'}
              </h3>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{batchData.category || 'Category'}</Badge>
                <Badge variant="outline">{batchData.classType || 'Class'}</Badge>
              </div>
            </div>

            {batchData.description && (
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{batchData.description}</p>
              </div>
            )}

            {/* Schedule */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Days:</strong> {formatDays(batchData.schedule.days)}
                </span>
              </div>
              
              {(batchData.schedule.startTime || batchData.schedule.endTime) && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Time:</strong> {formatTime(batchData.schedule.startTime)} - {formatTime(batchData.schedule.endTime)}
                  </span>
                </div>
              )}

              
              {/* Date Range */}
              {(batchData.startDate || batchData.endDate) && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Duration:</strong> 
                    {batchData.startDate && ` ${new Date(batchData.startDate).toLocaleDateString()}`}
                    {batchData.endDate && ` - ${new Date(batchData.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  <strong>Enrolled:</strong> {batchData.enrolledStudents || 0} / {batchData.capacity || 0} students
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <strong>Fees:</strong> ₹{batchData.fees || 0}/month
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Info */}
          {batchData.teacherInfo && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Teacher Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {batchData.teacherInfo.name || 'Teacher Name'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {batchData.teacherInfo.subject || 'Subject'} • {batchData.teacherInfo.experience || 'Experience'}
                  </p>
                </div>
                
                {batchData.teacherInfo.qualification && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Qualification:</p>
                    <p className="text-sm text-gray-600">{batchData.teacherInfo.qualification}</p>
                  </div>
                )}

                {batchData.teacherInfo.bio && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Bio:</p>
                    <p className="text-sm text-gray-600">{batchData.teacherInfo.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
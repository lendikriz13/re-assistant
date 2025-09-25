// src/app/api/activities/create/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface ActivityFormData {
  nextAction: string
  activityType: string
  dateTime: string | null
  notes: string
  followupRequired: boolean
  contactId: string
  propertyId: string
export async function POST(request: NextRequest) {
  try {
    const formData: ActivityFormData = await request.json()

    // Define activity fields interface
    interface ActivityFields {
      'Next Action': string;
      'Activity Type': string;
      'Notes'?: string;
      'Follow-up Required': boolean;
      'Status': string;
      'Date'?: string;
      'Contact'?: string[];
      'Property'?: string[];
    }

    // Add date if provided
    if (formData.dateTime) {
      activityData.Date = formData.dateTime
    }

    // Link to contact and property if provided
    if (formData.contactId) {
      activityData.Contact = [formData.contactId]
    }
    if (formData.propertyId) {
      activityData.Property = [formData.propertyId]
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Activities`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{ fields: activityData }]
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create activity')
    }

    const activity = await response.json()
    return NextResponse.json({ 
      success: true, 
      activity: activity.records[0],
      message: 'Activity created successfully'
    })

  } catch (error: any) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create activity' },
      { status: 500 }
    )
  }
}
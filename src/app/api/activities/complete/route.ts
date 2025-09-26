// src/app/api/activities/complete/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { activityId } = await request.json()

    if (!activityId) {
      throw new Error('Activity ID is required')
    }

    // Update the activity to mark it as completed
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Activities`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              id: activityId,
              fields: {
                Status: 'Completed',
                'Follow-up Required': false
              }
            }
          ]
        })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to complete activity')
    }

    const activity = await response.json()
    return NextResponse.json({ 
      success: true, 
      activity: activity.records[0],
      message: 'Activity marked as completed'
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete activity'
    console.error('Error completing activity:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
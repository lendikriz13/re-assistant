import { NextResponse } from 'next/server';

interface Activity {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export async function GET() {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Activities`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch activities')
    }

    const data: { records: Activity[] } = await response.json();
    return NextResponse.json(data.records)
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
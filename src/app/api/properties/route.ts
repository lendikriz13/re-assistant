import { NextResponse } from 'next/server';

interface Property {
  id: string;
  fields: {
    Address: string;
    'Asking Price'?: number;
    'Property Type'?: string;
    'ARV Estimate'?: number;
    'Repair Estimate'?: number;
    Notes?: string;
    'Contact Name'?: string;
    'Contact Email'?: string;
    'Contact Phone'?: string;
    'Contact Type'?: string;
  };
  createdTime: string;
}

export async function GET() {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Properties`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch properties')
    }

    const data: { records: Property[] } = await response.json();
    return NextResponse.json(data.records)
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
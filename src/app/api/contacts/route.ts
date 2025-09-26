import { NextResponse } from 'next/server';

interface Contact {
  id: string;
  fields: {
    Name: string;
    Email?: string;
    Phone?: string;
    Type?: string;
    'Last Contacted'?: string;
    Notes?: string;
  };
  createdTime: string;
}

export async function GET() {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Contacts`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch contacts')
    }

    const data: { records: Contact[] } = await response.json();
    return NextResponse.json(data.records)
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}
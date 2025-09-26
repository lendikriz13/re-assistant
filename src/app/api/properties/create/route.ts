// src/app/api/properties/create/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface PropertyFormData {
  address: string
  askingPrice: number | ''
  propertyType: string
  dealStage: string
  arvEstimate: number | ''
  repairEstimate: number | ''
  notes: string
  contactName: string
  contactEmail: string
  contactPhone: string
  contactType: string
}

export async function POST(request: NextRequest) {
  try {
    const formData: PropertyFormData = await request.json()

    // First, create or find the contact
    let contactId = null
    
    if (formData.contactName) {
      // Check if contact already exists
      const existingContactResponse = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Contacts?filterByFormula={Name}="${formData.contactName}"`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const existingContacts = await existingContactResponse.json()

      if (existingContacts.records && existingContacts.records.length > 0) {
        // Use existing contact
        contactId = existingContacts.records[0].id
      } else {
        // Create new contact
        const newContactResponse = await fetch(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Contacts`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              records: [
                {
                  fields: {
                    Name: formData.contactName,
                    Email: formData.contactEmail || undefined,
                    'Phone Number': formData.contactPhone || undefined,
                    'Contact Type': formData.contactType || 'Seller',
                    Temperature: 'Warm', // Default temperature
                    'Preferred Contact Method': formData.contactEmail ? 'Email' : 'Phone'
                  }
                }
              ]
            })
          }
        )

        const newContact = await newContactResponse.json()
        if (newContact.records && newContact.records.length > 0) {
          contactId = newContact.records[0].id
        }
      }
    }

    // Create the property
    const propertyData: Record<string, unknown> = {
      Address: formData.address,
      'Property Type': formData.propertyType,
      'Deal Stage': formData.dealStage,
      Notes: formData.notes || undefined
    }

    // Add numeric fields only if they have values
    if (formData.askingPrice !== '') {
      propertyData['Asking Price'] = Number(formData.askingPrice)
    }
    if (formData.arvEstimate !== '') {
      propertyData['ARV Estimate'] = Number(formData.arvEstimate)
    }
    if (formData.repairEstimate !== '') {
      propertyData['Repair Estimate'] = Number(formData.repairEstimate)
    }

    // Link to contact if we have one
    if (contactId) {
      propertyData.Contact = [contactId]
    }

    const propertyResponse = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Properties`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{ fields: propertyData }]
        })
      }
    )

    if (!propertyResponse.ok) {
      const error = await propertyResponse.json()
      throw new Error(error.error?.message || 'Failed to create property')
    }

    const property = await propertyResponse.json()
    return NextResponse.json({ 
      success: true, 
      property: property.records[0],
      message: 'Property created successfully'
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create property'
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
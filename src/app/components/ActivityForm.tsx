// src/app/components/ActivityForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { Calendar, User, Building2, Plus, AlertCircle, CheckCircle } from 'lucide-react'

interface ActivityFormData {
  nextAction: string
  activityType: string
  date: string
  time: string
  notes: string
  followupRequired: boolean
  contactId: string
  propertyId: string
}

interface Contact {
  id: string
  fields: {
    Name: string
    Email?: string
  }
}

interface Property {
  id: string
  fields: {
    Address: string
    'Property Type'?: string
  }
}

export default function ActivityForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<ActivityFormData>({
    nextAction: '',
    activityType: 'Call',
    date: '',
    time: '',
    notes: '',
    followupRequired: true,
    contactId: '',
    propertyId: ''
  })

  const [contacts, setContacts] = useState<Contact[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)

  // Load contacts and properties
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, propertiesRes] = await Promise.all([
          fetch('/api/contacts'),
          fetch('/api/properties')
        ])
        
        const contactsData = await contactsRes.json()
        const propertiesData = await propertiesRes.json()
        
        setContacts(contactsData.records || [])
        setProperties(propertiesData.records || [])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      // Combine date and time
      const dateTime = formData.date && formData.time 
        ? `${formData.date}T${formData.time}:00.000Z`
        : formData.date
        ? `${formData.date}T12:00:00.000Z`
        : null

      const response = await fetch('/api/activities/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateTime
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({ success: true, message: 'Activity created successfully!' })
        // Reset form
        setFormData({
          nextAction: '',
          activityType: 'Call',
          date: '',
          time: '',
          notes: '',
          followupRequired: true,
          contactId: '',
          propertyId: ''
        })
        if (onSuccess) onSuccess()
      } else {
        setSubmitResult({ success: false, message: result.error || 'Failed to create activity' })
      }
    } catch {
      setSubmitResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Calendar className="h-6 w-6 mr-2" />
        Add New Activity
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Activity Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Action *</label>
              <input
                type="text"
                name="nextAction"
                required
                value={formData.nextAction}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Call to discuss repair estimate"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
              <select
                name="activityType"
                value={formData.activityType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Text">Text</option>
                <option value="Meeting">Meeting</option>
                <option value="Site Visit">Site Visit</option>
                <option value="Offer">Offer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="followupRequired"
                checked={formData.followupRequired}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Follow-up Required</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Additional details about this activity..."
            />
          </div>
        </div>

        {/* Contact and Property Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Link to Contact & Property</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Contact
              </label>
              <select
                name="contactId"
                value={formData.contactId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.fields.Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                Property
              </label>
              <select
                name="propertyId"
                value={formData.propertyId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.fields.Address}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Result */}
        {submitResult && (
          <div className={`p-4 rounded-md flex items-center ${
            submitResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {submitResult.success ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {submitResult.message}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Activity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
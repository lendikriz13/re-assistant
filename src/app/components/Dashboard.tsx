'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, Calendar, Target, TrendingUp, Phone, Mail } from 'lucide-react'

interface Property {
  id: string
  fields: {
    Address: string
    'Asking Price': number
    'ARV Estimate': number
    'Repair Estimate': number
    'Property Type': string
    'Deal Stage': string
    Notes?: string
  }
}

interface Contact {
  id: string
  fields: {
    Name: string
    Email?: string
    'Phone Number'?: string
    'Contact Type': string
    Temperature: string
    'Last Contact Date'?: string
    'Next Follow-up Date'?: string
  }
}

interface Activity {
  id: string
  fields: {
    'Next Action': string
    'Activity Type': string
    Date?: string
    'Name (from Contact)'?: string[]
    'Address (from Property)'?: string[]
    Status?: string
  }
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from Airtable API
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Replace with your actual API calls
      const [propertiesRes, contactsRes, activitiesRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/contacts'), 
        fetch('/api/activities')
      ])

      const propertiesData = await propertiesRes.json()
      const contactsData = await contactsRes.json()
      const activitiesData = await activitiesRes.json()

      setProperties(propertiesData.records || [])
      setContacts(contactsData.records || [])
      setActivities(activitiesData.records || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalProperties = properties.length
  const activeDeals = properties.filter(p => 
    p.fields['Deal Stage'] && !['Closed', 'Dead'].includes(p.fields['Deal Stage'])
  ).length
  
  const totalPortfolioValue = properties.reduce((sum, p) => 
    sum + (p.fields['Asking Price'] || 0), 0
  )
  
  const potentialProfit = properties.reduce((sum, p) => {
    const arv = p.fields['ARV Estimate'] || 0
    const asking = p.fields['Asking Price'] || 0
    const repair = p.fields['Repair Estimate'] || 0
    return sum + Math.max(0, arv - asking - repair)
  }, 0)

  const hotContacts = contacts.filter(c => c.fields.Temperature === 'Hot').length
  
  const overdueActivities = activities.filter(a => {
    if (!a.fields.Date) return false
    const activityDate = new Date(a.fields.Date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activityDate < today
  }).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Real Estate CRM Dashboard</h1>
            <p className="mt-2 text-gray-600">Your complete property and contact management system</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Properties"
            value={totalProperties.toString()}
            icon={<Building2 className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Active Deals"
            value={activeDeals.toString()}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Portfolio Value"
            value={`$${(totalPortfolioValue / 1000).toFixed(0)}K`}
            icon={<Target className="h-6 w-6" />}
            color="purple"
          />
          <StatCard
            title="Potential Profit"
            value={`$${(potentialProfit / 1000).toFixed(0)}K`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
          />
          <StatCard
            title="Hot Contacts"
            value={hotContacts.toString()}
            icon={<Users className="h-6 w-6" />}
            color="red"
          />
          <StatCard
            title="Overdue Tasks"
            value={overdueActivities.toString()}
            icon={<Calendar className="h-6 w-6" />}
            color="yellow"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Properties Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.slice(0, 10).map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{property.fields.Address}</div>
                        <div className="text-sm text-gray-500">{property.fields['Property Type']}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${property.fields['Asking Price']?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDealStageColor(property.fields['Deal Stage'])}`}>
                          {property.fields['Deal Stage']}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Math.max(0, 
                          (property.fields['ARV Estimate'] || 0) - 
                          (property.fields['Asking Price'] || 0) - 
                          (property.fields['Repair Estimate'] || 0)
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hot Contacts & Overdue Activities */}
          <div className="space-y-8">
            {/* Hot Contacts */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Hot Contacts</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {contacts.filter(c => c.fields.Temperature === 'Hot').slice(0, 5).map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{contact.fields.Name}</h4>
                        <p className="text-sm text-gray-600">{contact.fields['Contact Type']}</p>
                      </div>
                      <div className="flex space-x-2">
                        {contact.fields.Email && (
                          <button className="p-2 text-gray-400 hover:text-blue-600">
                            <Mail className="h-4 w-4" />
                          </button>
                        )}
                        {contact.fields['Phone Number'] && (
                          <button className="p-2 text-gray-400 hover:text-green-600">
                            <Phone className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overdue Activities */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Overdue Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {activities.filter(a => {
                    if (!a.fields.Date) return false
                    const activityDate = new Date(a.fields.Date)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return activityDate < today
                  }).slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.fields['Next Action']}</h4>
                        <p className="text-sm text-gray-600">
                          {activity.fields['Name (from Contact)']?.[0]} • {activity.fields['Address (from Property)']?.[0]}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-red-600 font-medium">{activity.fields['Activity Type']}</span>
                        <p className="text-xs text-gray-500">
                          {activity.fields.Date && new Date(activity.fields.Date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, icon, color }: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white',
    yellow: 'bg-yellow-500 text-white',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Helper function for deal stage colors
function getDealStageColor(stage: string) {
  switch (stage) {
    case 'New Lead':
      return 'bg-gray-100 text-gray-800'
    case 'Contacted':
      return 'bg-blue-100 text-blue-800'
    case 'Analyzing':
      return 'bg-yellow-100 text-yellow-800'
    case 'Negotiating':
      return 'bg-orange-100 text-orange-800'
    case 'Under Contract':
      return 'bg-purple-100 text-purple-800'
    case 'Closed':
      return 'bg-green-100 text-green-800'
    case 'Dead':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
// src/app/components/DataEntry.tsx
'use client'

import { useState } from 'react'
import { Upload, Plus, Building2, User, AlertCircle, CheckCircle } from 'lucide-react'

type TabType = 'manual' | 'bulk'

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

interface BulkImportResult {
  success: boolean
  total: number
  successful: number
  failed: number
  errors: string[]
}

interface CsvRow {
  [key: string]: string
}

export default function DataEntry() {
  const [activeTab, setActiveTab] = useState<TabType>('manual')
  const [formData, setFormData] = useState<PropertyFormData>({
    address: '',
    askingPrice: '',
    propertyType: 'Single Family',
    dealStage: 'New Lead',
    arvEstimate: '',
    repairEstimate: '',
    notes: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactType: 'Seller'
  })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CsvRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null)

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('Estimate') ? (value === '' ? '' : Number(value)) : value
    }))
  }

  // Submit single property
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/properties/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitResult({ success: true, message: 'Property created successfully!' })
        // Reset form
        setFormData({
          address: '',
          askingPrice: '',
          propertyType: 'Single Family',
          dealStage: 'New Lead',
          arvEstimate: '',
          repairEstimate: '',
          notes: '',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          contactType: 'Seller'
        })
      } else {
        setSubmitResult({ success: false, message: result.error || 'Failed to create property' })
      }
    } catch {
      setSubmitResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      parseCSV(file)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  // Parse CSV file
  const parseCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim())
          const obj: CsvRow = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })
      setCsvData(data)
    }
    reader.readAsText(file)
  }

  // Submit bulk import
  const handleBulkImport = async () => {
    setIsSubmitting(true)
    setBulkResult(null)

    try {
      const response = await fetch('/api/properties/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: csvData })
      })

      const result = await response.json()
      setBulkResult(result)
    } catch {
      setBulkResult({
        success: false,
        total: csvData.length,
        successful: 0,
        failed: csvData.length,
        errors: ['Network error occurred']
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Add Properties</h1>
            <p className="mt-2 text-gray-600">Create individual properties or import multiple properties from CSV</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manual')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Manual Entry
                </div>
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bulk'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Bulk Import
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Manual Entry Form */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="Single Family">Single Family</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Triplex">Triplex</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asking Price ($)</label>
                    <input
                      type="number"
                      name="askingPrice"
                      value={formData.askingPrice}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="150000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deal Stage</label>
                    <select
                      name="dealStage"
                      value={formData.dealStage}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Offer Made">Offer Made</option>
                      <option value="Under Contract">Under Contract</option>
                      <option value="Closed">Closed</option>
                      <option value="Dead">Dead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ARV Estimate ($)</label>
                    <input
                      type="number"
                      name="arvEstimate"
                      value={formData.arvEstimate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="200000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Repair Estimate ($)</label>
                    <input
                      type="number"
                      name="repairEstimate"
                      value={formData.repairEstimate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="25000"
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
                    placeholder="Additional property details..."
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Type</label>
                    <select
                      name="contactType"
                      value={formData.contactType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="Seller">Seller</option>
                      <option value="Buyer">Buyer</option>
                      <option value="Agent">Agent</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      placeholder="555-123-4567"
                    />
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
                      Create Property
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Import */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            {/* CSV Template */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">CSV Template</h3>
              <p className="text-blue-700 text-sm mb-4">
                Your CSV file should have these column headers (in any order):
              </p>
              <div className="bg-white p-3 rounded border text-sm font-mono">
                Address,Asking Price,Property Type,ARV Estimate,Repair Estimate,Notes,Contact Name,Contact Email,Contact Phone,Contact Type
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900">
                    {csvFile ? csvFile.name : 'Choose CSV file'}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    Click to browse or drag and drop
                  </span>
                </label>
              </div>
            </div>

            {/* Data Preview */}
            {csvData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Data Preview ({csvData.length} records)
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(csvData[0]).map((header) => (
                          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {csvData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: string, i) => (
                            <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      ... and {csvData.length - 5} more records
                    </p>
                  )}
                </div>

                {/* Import Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleBulkImport}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import {csvData.length} Properties
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Import Results */}
            {bulkResult && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{bulkResult.total}</div>
                    <div className="text-sm text-blue-700">Total Records</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{bulkResult.successful}</div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{bulkResult.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>
                
                {bulkResult.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {bulkResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
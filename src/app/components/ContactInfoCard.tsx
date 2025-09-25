'use client'

import { Mail, Phone } from 'lucide-react';
import type { Contact } from '../types';
import { useEffect, useRef } from 'react';

type ContactInfoCardProps = {
  contact: Contact | null;
  onClose: () => void;
  type: 'email' | 'phone' | null;
};

export default function ContactInfoCard({ contact, onClose, type }: ContactInfoCardProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!contact || !type) return null;

  // Get the appropriate display value based on type
  const displayValue = type === 'email' 
    ? contact.fields.Email 
    : contact.fields['Phone Number'];

  // Get the appropriate icon and label
  const Icon = type === 'email' ? Mail : Phone;
  const label = type === 'email' ? 'Email' : 'Phone';
  const actionUrl = type === 'email' 
    ? `mailto:${contact.fields.Email}` 
    : `tel:${contact.fields['Phone Number']}`;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden transform transition-all"
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {contact.fields.Name}
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            {contact.fields['Contact Type'] || 'Contact'}
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
            {displayValue ? (
              <a 
                href={actionUrl}
                className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors break-all"
              >
                {displayValue}
              </a>
            ) : (
              <p className="text-gray-500 text-sm">No {type} available</p>
            )}
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export interface Contact {
  id: string;
  fields: {
    Name: string;
    Email?: string;
    'Phone Number'?: string;
    'Contact Type': string;
    Temperature: string;
    'Last Contact Date'?: string;
    'Next Follow-up Date'?: string;
  };
}

# Real Estate CRM

A modern real estate CRM built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Property management
- Contact management
- Activity tracking
- Dashboard with key metrics
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Airtable account with API access

### Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_airtable_pat
```

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

### Vercel

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository on [Vercel](https://vercel.com/new)
3. Add the following environment variables in your Vercel project settings:
   - `NEXT_PUBLIC_AIRTABLE_BASE_ID`: Your Airtable Base ID
   - `AIRTABLE_PERSONAL_ACCESS_TOKEN`: Your Airtable Personal Access Token
4. Deploy!

### Required Airtable Tables

Make sure your Airtable base has the following tables with the correct fields:

- **Properties**: Address, Asking Price, ARV Estimate, Repair Estimate, Property Type, Deal Stage, Days on Market, Notes
- **Contacts**: Name, Email, Phone Number, Contact Type, Last Contact Date, Notes
- **Activities**: Next Action, Activity Type, Date, Contact (linked to Contacts), Property (linked to Properties), Status, Follow-up Required, Notes

## Built With

- [Next.js](https://nextjs.org/) - The React Framework
- [TypeScript](https://www.typescriptlang.org/) - TypeScript is a typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Airtable](https://airtable.com/) - Flexible database and API
- [Recharts](https://recharts.org/) - Chart library for React

# **App Name**: EstateFlow

## Core Features:

- Manual Transaction Input: Simple form to manually add transaction details (date, vendor, amount, etc.) with dropdowns for investor, project, and card.
- Receipt OCR Parser: Receipt OCR tool leveraging Google Vision API to automatically extract transaction data from uploaded receipt images and pre-fill the manual entry form, enabling users to review and edit auto-generated values.
- Transactions Table: Sortable, filterable, and paginated tabular view of all transactions with columns for all relevant data. Allows filtering transactions by date, investor, card or project. Each line in the table displays the corresponding Receipt Link, if it exists.
- Dashboard: Dashboard displaying key metrics using charts and graphs, focusing on total spend, category spend breakdown, and monthly trend. Includes a list of alerts shown when the user exceeds budget for a project or card.
- Export to Google Sheets: Generates spreadsheets with all data (date, vendor, description, amount, category, investor, project, card used, receipt link, reconciled). Allows user to download it as a CSV or send it directly to Google Sheets.

## Style Guidelines:

- Primary color: HSL(210, 60%, 50%) - A moderate, inviting blue (#3391FF) to instill trust and clarity in financial tracking.
- Background color: HSL(210, 20%, 97%) - Very light, desaturated blue (#F4F8FF) for a calm and professional workspace.
- Accent color: HSL(180, 50%, 50%) - Complementary cyan (#33FFDA) used for highlights and interactive elements to guide user focus.
- Clean, sans-serif typography that ensures readability and a modern feel.
- Minimalist icons for navigation and transaction categories, providing visual cues and enhancing usability.
- A clean and structured layout, emphasizing ease of use with clear information hierarchy.
- Subtle transitions and animations on data updates and navigation to provide a smooth user experience.
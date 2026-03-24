# ArtworksTable App

A React application that displays artworks from the Art Institute of Chicago API with server-side pagination, multi-selection, and bulk selection functionality.

## Live Demo
https://myartworksapp.netlify.app/

## Features

- Fetches artworks data from (https://api.artic.edu/api/v1/artworks)
- Server-side pagination
- Checkbox selection per row
- Bulk selection via overlay panel using chevron icon
- Auto-fill selection to meet a target count
- Prevents re-selecting manually deselected rows
- Displays the following fields:
  - Title
  - Place of Origin
  - Artist
  - Inscriptions
  - Date Start
  - Date End

## Technologies Used

- React (with hooks)
- TypeScript
- PrimeReact UI library
- Fetch API

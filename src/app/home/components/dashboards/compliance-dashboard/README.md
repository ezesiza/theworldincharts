# Compliance Dashboard Component

This Angular component displays an interactive bar chart showing advertiser counts by location/region using D3.js.

## Features

- **Interactive Bar Chart**: Displays advertiser counts for different countries/regions
- **Responsive Design**: Automatically adjusts to different screen sizes
- **Data Loading**: Loads data from CSV file with fallback to hardcoded data
- **Hover Effects**: Interactive tooltips showing exact advertiser counts
- **Country Name Mapping**: Converts country codes to full country names
- **Sorted Display**: Countries are sorted by advertiser count in descending order

## Data Source

The component uses the `advertiser_location_summary.csv` file located in `/src/assets/datasets/`. The CSV contains:
- `location`: Country code (e.g., 'US', 'DE', 'FR')
- `advertiser_count`: Number of advertisers in that location

## Usage

1. Navigate to `/compliance` route
2. The chart will automatically load and display
3. Hover over bars to see detailed information
4. The chart is responsive and will adjust to window resizing

## Technical Details

- **Framework**: Angular 17
- **Visualization Library**: D3.js v6.7.0
- **Styling**: LESS with responsive design
- **Data Format**: CSV with automatic country code to name conversion

## Component Structure

```
compliance-dashboard/
├── compliance-dashboard.component.ts    # Main component logic
├── compliance-dashboard.component.html  # Template
├── compliance-dashboard.component.less  # Styles
└── README.md                           # This documentation
```

## Data Processing

1. Loads CSV data from assets
2. Maps country codes to full names using predefined mapping
3. Sorts data by advertiser count (descending)
4. Creates D3.js visualization with proper scaling
5. Adds interactive elements (tooltips, hover effects)

## Styling

The component uses a clean, modern design with:
- Light gray background with white chart container
- Teal-colored bars (#69b3a2) with hover effects
- Responsive breakpoints for different screen sizes
- Professional typography using system fonts 
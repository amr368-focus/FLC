
  # PULSE - Project Management Tool

This is a comprehensive project management tool originally based on a Figma design, now enhanced with advanced features.

## Recent Updates

### UI/UX Improvements
- ✅ **Navigation**: Renamed to "PULSE" with clickable logo to return home
- ✅ **Modal Backgrounds**: Changed from solid black to elegant blur effect
- ✅ **Kanban View**: Fixed layout and improved responsiveness
- ✅ **Gantt Chart**: Now fully functional with timeline visualization
- ✅ **Settings**: Removed placeholder settings page for cleaner navigation

### Feature Enhancements
- ✅ **Tags System**: Add custom tags to tasks for better organization
- ✅ **Dependencies**: Track task dependencies with visual indicators
- ✅ **Filtering**: Filter tasks by status in list view
- ✅ **Sorting**: Click column headers to sort by title, status, assignee, or due date
- ✅ **Export**: "Export CSV" buttons in project list and detail views (requires backend)

### Data Improvements
- ✅ Enhanced task data model with tags and dependencies
- ✅ Sample data includes realistic tags ('infrastructure', 'cloud', 'training', etc.)
- ✅ Sample dependencies between related tasks

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

Open http://localhost:3000 in your browser.

## Features

- **Executive Dashboard**: High-level overview with key metrics and initiative cards
- **Department Views**: Organize projects by department with status tracking
- **Multiple Views**: List, Kanban, and Gantt chart views for tasks
- **Tags & Dependencies**: Organize and track task relationships
- **Filtering & Sorting**: Easily find and organize tasks
- **Real-time Status Updates**: Track progress with color-coded statuses
- **Comments**: Collaborate with team updates on tasks
- **Export**: Download project data to CSV (backend required)

## Project Structure

- `src/components/` - React components
- `src/types.ts` - TypeScript type definitions
- `src/App.tsx` - Main application component
- `src/utils/` - Utility functions (including CSV download helper)

## Notes

- Export CSV feature requires a backend endpoint at `/api/export/csv`
- The application uses mock data for demonstration purposes
- All dates and progress metrics are illustrative
- Original Figma design: https://www.figma.com/design/hNAiY8mtxXs8D2xXOV9oYe/Project-management-tool
  
# Mr. Reacto

An athletic reaction training app designed to improve athletes' response time through randomly timed visual and audio cues.

## Features

- **Configurable Training Sessions**: Set the duration and interval timing for signals
- **Visual and Audio Signals**: Receive random visual flashes and audio cues during training
- **Responsive Design**: Works on both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Navigate to the project directory:
   ```bash
   cd reaction-training
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm start
```

The application will launch in your default browser at [http://localhost:3000](http://localhost:3000).

### Building for Production

Create a production build:
```bash
npm run build
```

## Usage

1. **Configure Training Session**:
   - Set the session duration (30 seconds to 60 minutes)
   - Set minimum and maximum intervals between signals
   - Click "Start Training" to begin

2. **During Training**:
   - The screen will flash and a gunshot sound will play at random intervals
   - A timer displays the remaining session time
   - Click "Stop Training" to end training early

## Development

This application was built following Test-Driven Development (TDD) principles:

### Running Tests

```bash
npm test
```

## Technologies Used

- React
- TypeScript
- CSS
- Jest and React Testing Library for testing

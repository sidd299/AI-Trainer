# AI Trainer - Mobile-First Workout App

A modern, AI-powered workout application built with Next.js, React, and Tailwind CSS. Features intelligent exercise recommendations, progress tracking, and a mobile-first design optimized for personal training.

## Features

### 🏋️ Workout Management
- **Today's Workout** main view with 4 collapsible sections:
  - 🔥 Warmup
  - 💪 Main Workout  
  - ❤️ Cardio
  - 🧘 Cooldown

### 📱 Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interactions
- Smooth animations and transitions
- Glass morphism effects and modern UI

### 🤖 AI-Driven Features
- **Smart Exercise Recommendations**: AI suggests exercises based on muscle groups and preferences
- **Floating AI Tips**: Contextual workout tips and motivation
- **Interactive Tooltips**: AI-powered help and guidance
- **Progress Tracking**: Intelligent progress monitoring with visual feedback
- **AI Chat Interface**: Real-time conversation with Gemini AI to modify workouts
- **Voice Commands**: Natural language instructions to add, remove, or modify exercises

### 🎯 Exercise Management
- **Exercise Cards**: Expandable cards with detailed information
- **Set Tracking**: Log reps, weights, and completion status
- **Favorite System**: Mark exercises as favorites for personalized recommendations
- **Exercise Swapping**: AI-suggested alternative exercises
- **Smart Deletion**: Two deletion options:
  - Delete for now (can reappear in future plans)
  - Don't recommend (permanently removed from AI suggestions)

### 📊 Progress Visualization
- Real-time progress bars for sections and overall workout
- Visual completion indicators
- Animated progress tracking
- Achievement-style completion feedback

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: Google Gemini AI
- **Mobile Optimization**: PWA-ready with mobile-first design

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-trainer
```

2. Install dependencies:
```bash
npm install
```

3. Set up Gemini AI (optional, for chat functionality):
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env.local` file in the project root
   - Add: `NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
ai-trainer/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── AIFloatingSuggestions.tsx  # AI-powered floating tips
│   ├── AITooltip.tsx             # Interactive tooltips
│   ├── ChatButton.tsx            # Floating chat button
│   ├── ChatWindow.tsx            # AI chat interface
│   ├── ExerciseCard.tsx          # Individual exercise component
│   ├── SetDropdown.tsx           # Sets management component
│   ├── TodayWorkout.tsx          # Main workout view
│   └── WorkoutSection.tsx        # Workout section component
├── lib/                   # Utilities and data
│   ├── data.ts           # Dummy data and TypeScript interfaces
│   ├── gemini.ts         # Gemini AI integration
│   └── workoutActions.ts # Workout modification handlers
└── public/               # Static assets
```

## Key Components

### TodayWorkout
Main container component that manages the overall workout state and coordinates between sections.

### WorkoutSection
Collapsible sections (Warmup, Main Workout, Cardio, Cooldown) with progress tracking and exercise management.

### ExerciseCard
Individual exercise component with:
- Expandable set tracking
- Favorite functionality
- Exercise swapping
- Smart deletion options
- Progress visualization

### SetDropdown
Interactive set management with:
- Rep and weight input
- Completion tracking
- Dynamic set addition/removal
- Visual completion indicators

### ChatWindow
AI-powered chat interface with:
- Real-time conversation with Gemini AI
- Natural language workout modifications
- Message history and timestamps
- Quick suggestion buttons
- Smooth animations and transitions

### ChatButton
Floating action button with:
- Animated chat icon
- Pulse effect to draw attention
- AI indicator badge
- Tooltip with helpful text

## Design System

### Colors
- **Primary**: Blue gradient system for interactive elements
- **AI**: Neutral gray system for text and backgrounds
- **Status**: Green (success), Red (danger), Yellow (warning)

### Typography
- System font stack for optimal performance
- Responsive text sizing
- Clear hierarchy with proper contrast

### Animations
- Smooth transitions for all interactions
- Staggered animations for lists
- Progress bar animations
- Hover and active states

## Mobile Optimization

- Touch-friendly button sizes (44px minimum)
- Optimized for portrait orientation
- Smooth scrolling and momentum
- Reduced motion support
- PWA-ready configuration

## AI Chat Features

The AI chat interface allows you to naturally modify your workout:

### Example Commands
- **"Add more cardio"** - Adds high-intensity cardio exercises
- **"Make push-ups easier"** - Reduces reps or suggests modifications
- **"Remove burpees"** - Removes specific exercises
- **"I want to focus on my core"** - Adds core-focused exercises
- **"Increase squat weight by 10 lbs"** - Modifies exercise parameters
- **"I only have 20 minutes"** - Adjusts workout for time constraints

### Supported Actions
- Add/remove exercises
- Modify sets, reps, and weights
- Swap exercises with alternatives
- Adjust workout difficulty
- Provide personalized advice
- Goal-based modifications

## Future Enhancements

- [ ] Voice input for chat
- [ ] User authentication and profiles
- [ ] Workout history and analytics
- [ ] Social features and sharing
- [ ] Advanced AI recommendations
- [ ] Offline support
- [ ] Push notifications
- [ ] Integration with fitness trackers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## License

MIT License - see LICENSE file for details

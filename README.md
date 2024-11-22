<a href="https://livekit.io/">
  <img src="./.github/assets/livekit-mark.png" alt="LiveKit logo" width="100" height="100">
</a>

# Voice-Enabled Food Tracking Assistant

A voice-enabled AI assistant that helps track daily food consumption and nutrition information. Built using LiveKit's [Agents Framework](https://github.com/livekit/agents-js) and Node.js.

This is a slightly modified version of the [Node Multimodal Agent](https://github.com/livekit-examples/multimodal-agent-node) example.

## Features

- Voice-based interaction for natural conversation
- Track food consumption with nutritional information
- Record calories, protein, carbohydrates, and fats
- Get daily nutrition totals
- Persistent storage of food consumption data using SQLite
- Per-user data tracking based on LiveKit identity

## Dev Setup

Clone the repository and install dependencies:

```bash
pnpm install
```

Set up the environment by copying `.env.example` to `.env.local` and filling in the required values:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `OPENAI_API_KEY`

You can set up LiveKit-specific environment variables automatically using the LiveKit CLI:

```bash
lk app env
```

### Database Setup

The application uses SQLite for data storage. To set up the database:

1. Generate the Prisma client:
```bash
pnpm prisma generate
```

2. Create and initialize the database with the schema:
```bash
pnpm prisma migrate dev
```

This will create a `food_tracker.db` file in your project root.

### Running the Agent

To run the agent:
    
```bash
pnpm build
node dist/agent.js dev
```

## Usage

Connect to the agent using a LiveKit-compatible frontend. You can:

1. Tell the assistant what food you've eaten
2. Include nutritional information if known (calories, protein, carbs, fats)
3. Ask for your daily nutrition totals

The assistant will respond via voice and maintain a record of your food consumption.

Example interactions:
- "I just ate a banana, go ahead and guess the nutrition and add it"
- "I had a chicken breast with 200 calories and 30 grams of protein"
- "How much protein have I eaten today?"
- "How many calories have I eaten today?"

### User Identity and Data Persistence

Nutrition data is stored and retrieved based on the user's LiveKit identity. To maintain persistent records:

1. Use a consistent identity when connecting to LiveKit
2. Ideally, use a verified token
3. Different identities will track separate nutrition histories

This allows multiple users to maintain their own food tracking history in the same instance of the application.

## Technologies Used

- LiveKit Agents Framework
- OpenAI GPT-4 with voice capabilities
- Prisma ORM
- SQLite database
- TypeScript/Node.js

# Nebula Chat

Nebula Chat is a modern, multi-modal AI chat application built with Next.js and Genkit. It allows users to have conversations with Google's Gemini models, generate images, and manage their chat history.

## Features

- **Multi-Modal Conversations:** Chat with text or upload images for context.
- **Image Generation:** Create images directly from a text prompt.
- **Conversation History:** All your chats are saved locally and can be accessed from the sidebar.
- **Chat Management:** Rename or delete conversations to keep your history organized.
- **Sleek UI:** A modern, dark-themed interface built with ShadCN UI and Tailwind CSS.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit)
- **AI Models:** Google Gemini 1.5 Flash
- **UI:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- A **Google AI API Key**. You can get one from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/nebula-chat.git
    cd nebula-chat
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of your project directory and add your Google AI API key.

    ```
    GOOGLE_API_KEY=your_api_key_here
    ```

4.  **Run the application:**
    You need to run two processes in separate terminals.

    -   **Terminal 1: Start the Genkit AI flows:**
        This command starts the Genkit development server, which handles the AI logic.
        ```bash
        npm run genkit:watch
        ```

    -   **Terminal 2: Start the Next.js development server:**
        This command starts the frontend application.
        ```bash
        npm run dev
        ```

5.  **Open in browser:**
    Once both servers are running, open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

## Available Scripts

-   `npm run dev`: Runs the Next.js application in development mode with Turbopack.
-   `npm run genkit:dev`: Starts the Genkit server once.
-   `npm run genkit:watch`: Starts the Genkit server and watches for file changes.
-   `npm run build`: Creates a production-ready build of the Next.js application.
-   `npm run start`: Starts the production server for the built application.
-   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.

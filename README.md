# DXBiti

This project contains the BoujeeBot concierge widget and supporting Netlify Functions for chat completions and lead capture.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file with your OpenAI key (and optional WhatsApp number):
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_WHATSAPP_BUSINESS=9715XXXXXXX
   ```
3. Run the development server with Netlify Functions emulation:
   ```bash
   npx netlify dev
   ```

## Deployment notes

- Netlify’s UI build command may be locked to `gatsby build`. A lightweight shim is included so the command simply runs `npm run build`, which executes `next build && next export`.
- Functions live in `netlify/functions`. They expose the chat completion and lead capture endpoints at `/.netlify/functions/chat` and `/.netlify/functions/lead`.
- The static site output is generated in the `out` directory.

# Smart Note Taker with Hugging Face API Integration

This application uses Hugging Face's API to generate summaries and flashcards from your notes.

## Setup

1. Create a `.env` file in the root directory
2. Add your Hugging Face API key to the `.env` file:
   ```
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```
3. Open `index.html` in your browser

## Features

- **Note Taking**: Enter your notes in the text area
- **AI-Powered Summarization**: Uses Hugging Face's `facebook/bart-large-cnn` model to generate concise summaries
- **Flashcard Generation**: Uses Hugging Face's `valhalla/t5-base-qa-qg-hl` model to create question-answer flashcards
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. Enter your notes in the text area
2. Click "Generate Summary & Flashcards"
3. The application sends your text to Hugging Face's API
4. The API returns a summary and generates flashcards
5. The results are displayed in the respective sections

## API Integration

The application uses two Hugging Face models:

- `facebook/bart-large-cnn` for text summarization
- `valhalla/t5-base-qa-qg-hl` for question generation

If the API key is not configured or if the API call fails, the application falls back to a simple algorithm that extracts sentences from your text.

## Troubleshooting

- If you see "API key not configured" messages, check that your `.env` file exists and contains a valid API key
- If the API is not responding, there might be rate limits or the model might be loading - try again later

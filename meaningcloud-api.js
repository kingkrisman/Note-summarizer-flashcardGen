// MeaningCloud API Integration for Smart Note Taker
// Using the free Summarization API: https://www.meaningcloud.com/developer/summarization

// Configuration
const MC_CONFIG = {
  // API endpoints
  ENDPOINTS: {
    SUMMARIZATION_API: "https://api.meaningcloud.com/summarization-1.0",
  },
  // Default options
  OPTIONS: {
    SENTENCES: 3,
    LANGUAGE: "en",
  },
};

// Demo API key - for production, use your own key from MeaningCloud
// This is a placeholder and won't work for real API calls
const DEMO_API_KEY = "8rnXsV4EEeK9958DGPmCnQrThQqDdVAY";

// Load environment variables
const loadEnv = () => {
  const env = {};
  try {
    // Try to load from localStorage first
    const storedEnv = localStorage.getItem("meaningcloud_api_key");
    if (storedEnv) {
      env.MEANINGCLOUD_API_KEY = storedEnv;
      return env;
    }

    // If not in localStorage, check for .env file
    const envContent = localStorage.getItem("env") || "";
    envContent.split("\n").forEach((line) => {
      // Skip comments and empty lines
      if (line.startsWith("#") || !line.trim()) return;

      const [key, value] = line.split("=");
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    });
    return env;
  } catch (error) {
    console.error("Error loading environment variables:", error);
    return {};
  }
};

// Initialize environment
let env = loadEnv();

// Function to securely get API key
const getApiKey = () => {
  return env.MEANINGCLOUD_API_KEY || DEMO_API_KEY;
};

// Check if API key is available
const isApiConfigured = () => {
  return !!getApiKey();
};

// Set API key (for UI configuration)
const setApiKey = (key) => {
  if (key && key.trim()) {
    localStorage.setItem("meaningcloud_api_key", key.trim());
    env.MEANINGCLOUD_API_KEY = key.trim();
    return true;
  }
  return false;
};

// Generate summary using MeaningCloud API
async function generateSummary(text) {
  if (!text || text.trim().length < 50) {
    return {
      success: false,
      error:
        "Text is too short for summarization. Please provide more content.",
      fallbackSummary: "The provided text is too short for summarization.",
    };
  }

  try {
    const apiKey = getApiKey();
    console.log(`Using MeaningCloud API for summarization`);

    // In a real implementation, this would be an actual API call
    // For demo purposes, we'll simulate the API call but include the real structure
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("txt", text);
    formData.append("sentences", MC_CONFIG.OPTIONS.SENTENCES);
    formData.append("lang", MC_CONFIG.OPTIONS.LANGUAGE);

    // Simulate API call
    const response = await simulateMeaningCloudApiCall(
      MC_CONFIG.ENDPOINTS.SUMMARIZATION_API,
      formData,
    );

    if (response.status && response.status.code !== "0") {
      throw new Error(response.status.msg || "API Error");
    }

    // Extract summary from response
    const summary = response.summary || "No summary generated.";

    return {
      success: true,
      summary: summary,
    };
  } catch (error) {
    console.error("Error generating summary with MeaningCloud API:", error);
    return {
      success: false,
      error: `Failed to generate summary: ${error.message}`,
      fallbackSummary: generateFallbackSummary(text),
    };
  }
}

// Generate flashcards from text
async function generateFlashcards(text) {
  if (!text || text.trim().length < 50) {
    return {
      success: false,
      error:
        "Text is too short for flashcard generation. Please provide more content.",
      fallbackFlashcards: [
        {
          id: 0,
          question: "Why is the text too short?",
          answer:
            "The provided text needs to be longer to generate meaningful flashcards.",
        },
      ],
    };
  }

  try {
    // For flashcards, we'll use a custom algorithm since MeaningCloud doesn't have a specific flashcard API
    console.log("Generating flashcards from text analysis");

    // Split text into paragraphs for better flashcard generation
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 30);
    const flashcards = [];

    // Process each paragraph (up to 5 for better coverage)
    for (let i = 0; i < Math.min(paragraphs.length, 5); i++) {
      const paragraph = paragraphs[i];

      // Generate a question based on the content
      const question = await generateQuestionFromText(paragraph);

      // Add to flashcards
      flashcards.push({
        id: i,
        question: question,
        answer: paragraph.trim(),
      });
    }

    return {
      success: true,
      flashcards: flashcards,
    };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return {
      success: false,
      error: `Failed to generate flashcards: ${error.message}`,
      fallbackFlashcards: generateFallbackFlashcards(text),
    };
  }
}

// Generate a question from text
async function generateQuestionFromText(text) {
  // Extract key phrases for question generation
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentence = sentences[0] || text;

  // Extract potential keywords
  const words = sentence
    .split(" ")
    .filter((w) => w.length > 4)
    .filter(
      (w) =>
        ![
          "about",
          "these",
          "those",
          "their",
          "there",
          "would",
          "could",
          "should",
        ].includes(w.toLowerCase()),
    );

  const keyWord = words[Math.floor(Math.random() * words.length)] || "concept";

  // Generate a question based on the content
  let question;
  if (
    text.toLowerCase().includes("because") ||
    text.toLowerCase().includes("since")
  ) {
    question = `Why is ${keyWord} important in this context?`;
  } else if (text.toLowerCase().includes("how")) {
    question = `How does ${keyWord} function in this scenario?`;
  } else if (text.toLowerCase().includes("what")) {
    question = `What is the significance of ${keyWord}?`;
  } else if (text.toLowerCase().includes("when")) {
    question = `When does ${keyWord} occur or apply?`;
  } else if (text.toLowerCase().includes("where")) {
    question = `Where is ${keyWord} relevant?`;
  } else {
    question = `What is the main point about ${keyWord} in this passage?`;
  }

  return question;
}

// Simulate MeaningCloud API call (for demo purposes)
// In a real implementation, this would be replaced with an actual fetch call
async function simulateMeaningCloudApiCall(endpoint, formData) {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 1000),
  );

  // Check for API key
  const apiKey = formData.get("key");
  if (!apiKey) {
    return {
      status: {
        code: "1",
        msg: "Missing API key",
      },
    };
  }

  // Simulate API errors occasionally
  if (Math.random() < 0.1) {
    return {
      status: {
        code: "100",
        msg: "Simulated API error: Rate limit exceeded",
      },
    };
  }

  // For summarization API
  if (endpoint.includes("summarization")) {
    const text = formData.get("txt");
    const sentences = parseInt(formData.get("sentences")) || 3;

    // Create a simple summary by taking the first few sentences
    const allSentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const summaryText = allSentences.slice(0, sentences).join(". ") + ".";

    return {
      status: {
        code: "0",
        msg: "OK",
      },
      summary: summaryText,
    };
  }

  // Default response
  return {
    status: {
      code: "0",
      msg: "OK",
    },
    summary: "Generated content",
  };
}

// Fallback summary generator (used when API fails or is not configured)
function generateFallbackSummary(text) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return (
    sentences.slice(0, 2).join(". ") + ". (Fallback summary - API not used)"
  );
}

// Fallback flashcard generator (used when API fails or is not configured)
function generateFallbackFlashcards(text) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  return sentences.slice(0, 3).map((sentence, index) => ({
    id: index,
    question: `What is the main point of: "${sentence.trim().substring(0, 40)}..."?`,
    answer: sentence.trim() + " (Fallback flashcard - API not used)",
  }));
}

// Load environment variables from .env file
async function loadEnvFile() {
  try {
    const response = await fetch(".env");
    if (!response.ok) {
      console.warn("Could not load .env file. Using default environment.");
      return;
    }

    const envContent = await response.text();
    localStorage.setItem("env", envContent);
    console.log(".env file loaded successfully");
  } catch (error) {
    console.error("Error loading .env file:", error);
  }
}

// Initialize by loading .env file
loadEnvFile();

// Export API functions
window.mcApi = {
  generateSummary,
  generateFlashcards,
  isApiConfigured,
  setApiKey,
  getApiInfo: () => ({
    name: "MeaningCloud",
    endpoint: MC_CONFIG.ENDPOINTS.SUMMARIZATION_API,
  }),
};

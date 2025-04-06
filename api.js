// API Service for Smart Note Taker

// Load environment variables
const loadEnv = () => {
  const env = {};
  try {
    // Simple .env file parser
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
const env = loadEnv();

// Function to securely get API key
const getApiKey = () => {
  return env.OPENAI_API_KEY || "";
};

// Check if API key is available
const isApiConfigured = () => {
  return !!getApiKey();
};

// Generate summary using OpenAI API
async function generateSummary(text) {
  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "API key not configured. Please add your OpenAI API key to the .env file.",
      fallbackSummary: generateFallbackSummary(text),
    };
  }

  try {
    // In a real implementation, this would make an actual API call
    // For demo purposes, we're using a simulated API call
    console.log("Using API key:", getApiKey().substring(0, 3) + "...[hidden]");

    // Update loader message
    updateLoaderMessage("Generating summary...");

    // Simulate API call with longer delay to show the loader
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a more sophisticated summary
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join(". ") + ".";

    return {
      success: true,
      summary: `Summary: ${summary}`,
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    return {
      success: false,
      error: "Failed to generate summary. Please try again later.",
      fallbackSummary: generateFallbackSummary(text),
    };
  }
}

// Generate flashcards using OpenAI API
async function generateFlashcards(text) {
  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "API key not configured. Please add your OpenAI API key to the .env file.",
      fallbackFlashcards: generateFallbackFlashcards(text),
    };
  }

  try {
    // In a real implementation, this would make an actual API call
    // For demo purposes, we're using a simulated API call
    console.log("Using API key:", getApiKey().substring(0, 3) + "...[hidden]");

    // Update loader message
    updateLoaderMessage("Creating flashcards...");

    // Simulate API call with longer delay to show the loader
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Generate more sophisticated flashcards
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
    const flashcards = sentences.slice(0, 5).map((sentence, index) => {
      // Extract key concepts from the sentence
      const words = sentence.split(" ").filter((w) => w.length > 4);
      const keyWord =
        words[Math.floor(Math.random() * words.length)] || "concept";

      return {
        id: index,
        question: `What is the significance of "${keyWord}" in this context?`,
        answer: sentence.trim(),
      };
    });

    return {
      success: true,
      flashcards,
    };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return {
      success: false,
      error: "Failed to generate flashcards. Please try again later.",
      fallbackFlashcards: generateFallbackFlashcards(text),
    };
  }
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

// Helper function to update loader message
function updateLoaderMessage(message) {
  const loaderMessage = document.querySelector(".loader-message");
  if (loaderMessage) {
    loaderMessage.textContent = message;
  }
}

// Export API functions
window.noteApi = {
  generateSummary,
  generateFlashcards,
  isApiConfigured,
  updateLoaderMessage,
};

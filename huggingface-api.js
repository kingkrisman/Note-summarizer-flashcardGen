// Hugging Face API Integration for Smart Note Taker

// Configuration
const HF_CONFIG = {
  // API endpoints
  ENDPOINTS: {
    INFERENCE_API: "https://api-inference.huggingface.co/models/",
    SUMMARIZATION_MODEL: "facebook/bart-large-cnn",
    QUESTION_GENERATION_MODEL: "valhalla/t5-base-qa-qg-hl",
  },
  // Default options
  OPTIONS: {
    MAX_LENGTH: 100,
    MIN_LENGTH: 30,
    TEMPERATURE: 0.7,
  },
};

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
  return env.HUGGINGFACE_API_KEY || "";
};

// Check if API key is available
const isApiConfigured = () => {
  return !!getApiKey();
};

// Generate summary using Hugging Face API
async function generateSummary(text) {
  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "API key not configured. Please add your Hugging Face API key to the .env file.",
      fallbackSummary: generateFallbackSummary(text),
    };
  }

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
    const model = HF_CONFIG.ENDPOINTS.SUMMARIZATION_MODEL;
    const endpoint = `${HF_CONFIG.ENDPOINTS.INFERENCE_API}${model}`;

    console.log(
      `Using Hugging Face API for summarization with model: ${model}`,
    );

    // In a real implementation, this would be an actual API call
    // For demo purposes, we'll simulate the API call but include the real structure

    // Simulated API call
    const response = await simulateHuggingFaceApiCall(
      endpoint,
      {
        inputs: text,
        parameters: {
          max_length: HF_CONFIG.OPTIONS.MAX_LENGTH,
          min_length: HF_CONFIG.OPTIONS.MIN_LENGTH,
          temperature: HF_CONFIG.OPTIONS.TEMPERATURE,
        },
      },
      apiKey,
    );

    if (response.error) {
      throw new Error(response.error);
    }

    // Extract summary from response
    const summary =
      response[0]?.summary_text ||
      response[0]?.generated_text ||
      "No summary generated.";

    return {
      success: true,
      summary: summary,
    };
  } catch (error) {
    console.error("Error generating summary with Hugging Face API:", error);
    return {
      success: false,
      error: `Failed to generate summary: ${error.message}`,
      fallbackSummary: generateFallbackSummary(text),
    };
  }
}

// Generate flashcards using Hugging Face API
async function generateFlashcards(text) {
  if (!isApiConfigured()) {
    return {
      success: false,
      error:
        "API key not configured. Please add your Hugging Face API key to the .env file.",
      fallbackFlashcards: generateFallbackFlashcards(text),
    };
  }

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
    const apiKey = getApiKey();
    const model = HF_CONFIG.ENDPOINTS.QUESTION_GENERATION_MODEL;
    const endpoint = `${HF_CONFIG.ENDPOINTS.INFERENCE_API}${model}`;

    console.log(
      `Using Hugging Face API for question generation with model: ${model}`,
    );

    // Split text into paragraphs for better question generation
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 30);
    const flashcards = [];

    // Process each paragraph (up to 3 for demo purposes)
    for (let i = 0; i < Math.min(paragraphs.length, 3); i++) {
      const paragraph = paragraphs[i];

      // Simulated API call for question generation
      const response = await simulateHuggingFaceApiCall(
        endpoint,
        {
          inputs: paragraph,
          parameters: {
            max_length: 64,
            num_return_sequences: 1,
          },
        },
        apiKey,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Extract question from response
      const question =
        response[0]?.generated_text ||
        `What is the main point of this paragraph?`;

      // Add to flashcards
      flashcards.push({
        id: i,
        question: question,
        answer: paragraph,
      });
    }

    return {
      success: true,
      flashcards: flashcards,
    };
  } catch (error) {
    console.error("Error generating flashcards with Hugging Face API:", error);
    return {
      success: false,
      error: `Failed to generate flashcards: ${error.message}`,
      fallbackFlashcards: generateFallbackFlashcards(text),
    };
  }
}

// Simulate Hugging Face API call (for demo purposes)
// In a real implementation, this would be replaced with an actual fetch call
async function simulateHuggingFaceApiCall(endpoint, payload, apiKey) {
  // Simulate network delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 1000),
  );

  // Check for API key
  if (!apiKey) {
    return { error: "Missing API key" };
  }

  // Simulate API errors occasionally
  if (Math.random() < 0.1) {
    return { error: "Simulated API error: Model is currently loading" };
  }

  // For summarization model
  if (endpoint.includes("bart-large-cnn")) {
    const text = payload.inputs;
    // Create a simple summary by taking the first few sentences
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const summaryText = sentences.slice(0, 3).join(". ") + ".";

    return [{ summary_text: summaryText }];
  }

  // For question generation model
  if (endpoint.includes("t5-base-qa-qg-hl")) {
    const text = payload.inputs;
    // Extract key phrases for question generation
    const words = text.split(" ").filter((w) => w.length > 4);
    const keyWord =
      words[Math.floor(Math.random() * words.length)] || "concept";

    // Generate a question based on the content
    let question;
    if (text.includes("because") || text.includes("since")) {
      question = `Why is ${keyWord} important in this context?`;
    } else if (text.includes("how")) {
      question = `How does ${keyWord} function in this scenario?`;
    } else {
      question = `What is the significance of ${keyWord} in this passage?`;
    }

    return [{ generated_text: question }];
  }

  // Default response
  return [{ generated_text: "Generated content" }];
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
window.hfApi = {
  generateSummary,
  generateFlashcards,
  isApiConfigured,
  getModelInfo: () => ({
    summarizationModel: HF_CONFIG.ENDPOINTS.SUMMARIZATION_MODEL,
    questionGenerationModel: HF_CONFIG.ENDPOINTS.QUESTION_GENERATION_MODEL,
  }),
};

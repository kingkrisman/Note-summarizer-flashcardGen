// Main application script
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const noteTextarea = document.getElementById("note-textarea");
  const generateButton = document.getElementById("generate-button");
  const clearButton = document.getElementById("clear-button");
  const summaryContent = document.getElementById("summary-content");
  const flashcardsList = document.getElementById("flashcards-list");
  const emptyFlashcards = document.getElementById("empty-flashcards");
  const loader = document.getElementById("loader");
  const loaderMessage = document.querySelector(".loader-message");
  const noteStats = document.getElementById("note-stats");
  const settingsButton = document.getElementById("settings-button");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsButton = document.getElementById("close-settings");
  const saveSettingsButton = document.getElementById("save-settings");
  const cancelSettingsButton = document.getElementById("cancel-settings");
  const apiKeyInput = document.getElementById("api-key-input");
  const themeToggle = document.getElementById("theme-toggle");
  const clearStorageButton = document.getElementById("clear-storage-button");
  const copySummaryButton = document.getElementById("copy-summary");
  const copyFlashcardsButton = document.getElementById("copy-flashcards");
  const toastContainer = document.getElementById("toast-container");

  // Application state
  const state = {
    note: "",
    summary: "",
    flashcards: [],
    isGenerating: false,
    apiError: null,
    apiInfo: {
      name: "MeaningCloud",
      configured: false,
    },
    settings: {
      theme: "dark",
      apiKey: "",
    },
  };

  // Event listeners
  noteTextarea.addEventListener("input", handleNoteInput);
  generateButton.addEventListener("click", handleGenerateClick);
  clearButton.addEventListener("click", handleClearClick);
  settingsButton.addEventListener("click", openSettingsModal);
  closeSettingsButton.addEventListener("click", closeSettingsModal);
  cancelSettingsButton.addEventListener("click", closeSettingsModal);
  saveSettingsButton.addEventListener("click", saveSettings);
  themeToggle.addEventListener("change", toggleTheme);
  clearStorageButton.addEventListener("click", clearStorage);
  copySummaryButton.addEventListener("click", () => copyToClipboard("summary"));
  copyFlashcardsButton.addEventListener("click", () =>
    copyToClipboard("flashcards"),
  );

  // Initialize the application
  init();

  // Functions
  function init() {
    // Load saved data from localStorage
    loadFromLocalStorage();

    // Check if API is configured
    if (window.mcApi && typeof window.mcApi.isApiConfigured === "function") {
      state.apiInfo.configured = window.mcApi.isApiConfigured();
      if (state.apiInfo.configured) {
        const apiInfo = window.mcApi.getApiInfo();
        state.apiInfo.endpoint = apiInfo.endpoint;
      }
    }

    // Update UI based on loaded state
    updateNoteStats();
    updateButtonStates();

    // Apply saved theme
    applyTheme(state.settings.theme);
    themeToggle.checked = state.settings.theme === "light";

    // Set API key in settings modal
    apiKeyInput.value = state.settings.apiKey || "";
  }

  function handleNoteInput(event) {
    state.note = event.target.value;
    updateNoteStats();
    updateButtonStates();
    saveToLocalStorage();
  }

  function updateNoteStats() {
    const text = state.note || "";
    const charCount = text.length;
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    noteStats.textContent = `${charCount} characters | ${wordCount} words`;
  }

  function updateButtonStates() {
    generateButton.disabled = !state.note || state.isGenerating;
    clearButton.disabled =
      !state.note && !state.summary && state.flashcards.length === 0;
  }

  async function handleGenerateClick() {
    if (!state.note || state.isGenerating) return;

    try {
      // Set generating state
      state.isGenerating = true;
      state.apiError = null;
      updateButtonStates();

      // Show loader
      showLoader("Processing your notes...");

      // Generate summary
      await generateSummary();

      // Generate flashcards
      await generateFlashcards();

      // Show success toast
      showToast("Content generated successfully!", "success");
    } catch (error) {
      console.error("Error generating content:", error);
      state.apiError = "An unexpected error occurred. Please try again.";

      // Set fallback content
      setFallbackContent();

      // Show error toast
      showToast("Error generating content. Using fallback method.", "error");
    } finally {
      // Reset state
      state.isGenerating = false;
      updateButtonStates();

      // Hide loader
      hideLoader();

      // Save to localStorage
      saveToLocalStorage();
    }
  }

  function handleClearClick() {
    // Clear all content
    state.note = "";
    state.summary = "";
    state.flashcards = [];
    state.apiError = null;

    // Update UI
    noteTextarea.value = "";
    updateNoteStats();
    updateSummaryUI();
    updateFlashcardsUI();
    updateButtonStates();

    // Save to localStorage
    saveToLocalStorage();

    // Show toast
    showToast("All content cleared", "info");
  }

  async function generateSummary() {
    updateLoaderMessage("Generating summary with MeaningCloud...");

    if (window.mcApi && typeof window.mcApi.generateSummary === "function") {
      // Use MeaningCloud API
      const result = await window.mcApi.generateSummary(state.note);

      if (result.success) {
        state.summary = result.summary;
      } else {
        state.apiError = result.error;
        state.summary = result.fallbackSummary;
      }
    } else {
      // Fallback if API is not available
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const sentences = state.note
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      state.summary =
        sentences.slice(0, 3).join(". ") + ". (API not available)";
    }

    // Update UI
    updateSummaryUI();
  }

  async function generateFlashcards() {
    updateLoaderMessage("Creating flashcards...");

    if (window.mcApi && typeof window.mcApi.generateFlashcards === "function") {
      // Use MeaningCloud API
      const result = await window.mcApi.generateFlashcards(state.note);

      if (result.success) {
        state.flashcards = result.flashcards;
      } else {
        state.apiError = state.apiError || result.error;
        state.flashcards = result.fallbackFlashcards;
      }
    } else {
      // Fallback if API is not available
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const sentences = state.note
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 5);
      state.flashcards = sentences.slice(0, 3).map((sentence, index) => ({
        id: index,
        question: `What is the main point of: "${sentence.trim()}"?`,
        answer: sentence.trim() + " (API not available)",
      }));
    }

    // Update UI
    updateFlashcardsUI();
  }

  function setFallbackContent() {
    // Set fallback summary
    state.summary = "Could not generate summary. Please try again.";
    updateSummaryUI();

    // Set fallback flashcards
    state.flashcards = [
      {
        id: 0,
        question: "Error generating flashcards",
        answer: "Please try again later.",
      },
    ];
    updateFlashcardsUI();
  }

  function updateSummaryUI() {
    // Clear previous content
    summaryContent.innerHTML = "";

    // Add API info if available
    if (state.apiInfo.name) {
      const apiInfoElement = document.createElement("div");
      apiInfoElement.style.fontSize = "12px";
      apiInfoElement.style.color = "var(--primary-color)";
      apiInfoElement.style.marginBottom = "8px";

      if (state.apiInfo.configured) {
        apiInfoElement.textContent = `Using ${state.apiInfo.name} API`;
      } else {
        apiInfoElement.textContent = `${state.apiInfo.name} API not configured - using fallback`;
      }

      summaryContent.appendChild(apiInfoElement);
    }

    // Add summary content
    const summaryTextElement = document.createElement("div");
    summaryTextElement.textContent =
      state.summary || "Your summary will appear here...";
    summaryContent.appendChild(summaryTextElement);

    // Add error message if any
    if (state.apiError) {
      const errorElement = document.createElement("div");
      errorElement.style.color = "var(--error-color)";
      errorElement.style.marginTop = "10px";
      errorElement.textContent = `Note: ${state.apiError}`;
      summaryContent.appendChild(errorElement);
    }
  }

  function updateFlashcardsUI() {
    // Clear previous flashcards
    const existingFlashcards =
      flashcardsList.querySelectorAll(".flashcard-item");
    existingFlashcards.forEach((card) => card.remove());

    if (state.flashcards.length > 0) {
      // Hide empty message
      emptyFlashcards.style.display = "none";

      // Create and append flashcards
      state.flashcards.forEach((card) => {
        const flashcardElement = createFlashcardElement(card);
        flashcardsList.appendChild(flashcardElement);
      });
    } else {
      // Show empty message
      emptyFlashcards.style.display = "block";
    }
  }

  function createFlashcardElement(card) {
    const flashcardElement = document.createElement("div");
    flashcardElement.className = "flashcard-item";
    flashcardElement.dataset.id = card.id;

    const questionElement = document.createElement("p");
    questionElement.className = "flashcard-question";

    const questionLabel = document.createElement("span");
    questionLabel.textContent = "Q: ";

    const questionText = document.createElement("span");
    questionText.textContent = card.question;

    questionElement.appendChild(questionLabel);
    questionElement.appendChild(questionText);

    const answerElement = document.createElement("p");
    answerElement.className = "flashcard-answer";

    const answerLabel = document.createElement("span");
    answerLabel.textContent = "A: ";

    const answerText = document.createElement("span");
    answerText.textContent = card.answer;

    answerElement.appendChild(answerLabel);
    answerElement.appendChild(answerText);

    flashcardElement.appendChild(questionElement);
    flashcardElement.appendChild(answerElement);

    return flashcardElement;
  }

  function showLoader(message) {
    updateLoaderMessage(message);
    loader.classList.add("active");
  }

  function hideLoader() {
    loader.classList.remove("active");
  }

  function updateLoaderMessage(message) {
    if (loaderMessage) {
      loaderMessage.textContent = message;
    }
  }

  // Settings modal functions
  function openSettingsModal() {
    settingsModal.classList.add("active");
  }

  function closeSettingsModal() {
    settingsModal.classList.remove("active");
  }

  function saveSettings() {
    // Save API key
    const newApiKey = apiKeyInput.value.trim();
    if (newApiKey !== state.settings.apiKey) {
      state.settings.apiKey = newApiKey;

      // Update API configuration
      if (window.mcApi && typeof window.mcApi.setApiKey === "function") {
        const success = window.mcApi.setApiKey(newApiKey);
        if (success) {
          state.apiInfo.configured = true;
          showToast("API key saved successfully", "success");
        } else {
          showToast("Invalid API key format", "error");
        }
      }
    }

    // Save theme
    state.settings.theme = themeToggle.checked ? "light" : "dark";
    applyTheme(state.settings.theme);

    // Save to localStorage
    saveSettingsToLocalStorage();

    // Close modal
    closeSettingsModal();
  }

  function toggleTheme() {
    const newTheme = themeToggle.checked ? "light" : "dark";
    applyTheme(newTheme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function clearStorage() {
    localStorage.removeItem("smartNoteTaker");
    showToast("All saved data cleared", "info");
  }

  // Copy to clipboard functions
  function copyToClipboard(contentType) {
    let textToCopy = "";

    if (contentType === "summary") {
      textToCopy = state.summary || "No summary available";
    } else if (contentType === "flashcards") {
      if (state.flashcards.length === 0) {
        textToCopy = "No flashcards available";
      } else {
        textToCopy = state.flashcards
          .map((card) => `Q: ${card.question}\nA: ${card.answer}`)
          .join("\n\n");
      }
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showToast(
          `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} copied to clipboard`,
          "success",
        );
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        showToast("Failed to copy to clipboard", "error");
      });
  }

  // Toast notification functions
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.className = "toast-close";
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", () => {
      toast.remove();
    });

    toast.appendChild(messageSpan);
    toast.appendChild(closeButton);
    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  // Local storage functions
  function saveToLocalStorage() {
    const dataToSave = {
      note: state.note,
      summary: state.summary,
      flashcards: state.flashcards,
    };

    localStorage.setItem("smartNoteTaker", JSON.stringify(dataToSave));
  }

  function saveSettingsToLocalStorage() {
    localStorage.setItem(
      "smartNoteTakerSettings",
      JSON.stringify(state.settings),
    );
  }

  function loadFromLocalStorage() {
    // Load content
    const savedData = localStorage.getItem("smartNoteTaker");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        state.note = parsedData.note || "";
        state.summary = parsedData.summary || "";
        state.flashcards = parsedData.flashcards || [];

        // Update textarea
        noteTextarea.value = state.note;

        // Update UI
        updateSummaryUI();
        updateFlashcardsUI();
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }

    // Load settings
    const savedSettings = localStorage.getItem("smartNoteTakerSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        state.settings = { ...state.settings, ...parsedSettings };
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }
});

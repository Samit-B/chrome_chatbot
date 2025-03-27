const startButton = document.getElementById("startRecording");
const stopButton = document.getElementById("stopRecording");
const userQuerySpan = document.getElementById("userQuery");
const aiResponseSpan = document.getElementById("aiResponse");

let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
} else {
  alert("Speech Recognition not supported in this browser.");
}

startButton.addEventListener("click", () => {
  recognition.start();
  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener("click", () => {
  recognition.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
});

recognition.onresult = async (event) => {
  const userQuery = event.results[0][0].transcript;
  userQuerySpan.textContent = userQuery;

  try {
    const response = await fetch("http://localhost:8000/chat/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userQuery })
    });

    if (!response.ok) throw new Error("Failed to fetch AI response");

    const data = await response.json();
    const aiResponse = data.response;
    aiResponseSpan.textContent = aiResponse;

    const utterance = new SpeechSynthesisUtterance(aiResponse);
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error("Error:", error);
    aiResponseSpan.textContent = "Error fetching AI response.";
  }
};

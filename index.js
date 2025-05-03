const section2 = document.getElementById('section2');
const inputBox = document.getElementById('input');
const sendBtn = document.getElementById('btn');

const mediaInput = document.getElementById('mediaInput');
const btn1 = document.getElementById('btn1');

btn1.addEventListener('click', () => {
  mediaInput.click(); // Open file picker
});

mediaInput.addEventListener('change', handleMedia);

function handleMedia(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileType = file.type;

  if (fileType.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function (e) {
      displayMedia('Image selected:', e.target.result);
    };
    reader.readAsDataURL(file);
  } else if (fileType.startsWith('video/')) {
    const reader = new FileReader();
    reader.onload = function (e) {
      displayMedia('Video selected:', e.target.result, true);
    };
    reader.readAsDataURL(file);
  } else {
    alert('Unsupported file type.');
  }
}

function displayMedia(label, src, isVideo = false) {
  const mediaElement = document.createElement(isVideo ? 'video' : 'img');
  mediaElement.src = src;
  mediaElement.controls = isVideo;
  mediaElement.style.maxWidth = '100%';
  mediaElement.style.marginTop = '10px';

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', 'user');
  msgDiv.textContent = label;

  const container = document.createElement('div');
  container.appendChild(msgDiv);
  container.appendChild(mediaElement);

  document.getElementById('section2')?.appendChild(container);
}

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCjVlRhxuKHeb7igmNTkaGqGFIn4EL5rgI";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  }
};

// Input handling
sendBtn.addEventListener('click', handleInput);
inputBox.addEventListener('keypress', function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    handleInput();
  }
});

function handleInput() {
  const userMsg = inputBox.value.trim();
  if (userMsg) {
    user.message = userMsg;
    appendMsg("user", userMsg);
    inputBox.value = "";
    generateResponse(userMsg);
  }
}

// Append chat message to section2
function appendMsg(sender, message) {
  const newDiv = document.createElement("div");
  newDiv.classList.add("message", sender);
  newDiv.textContent = message;
  section2.appendChild(newDiv);
  section2.scrollTop = section2.scrollHeight;
}

// Generate Gemini response
async function generateResponse(message) {
  appendMsg("bot", "Thinking........");

  const parts = [{ text: message }];
  if (user.file?.data) {
    parts.push({ inline_data: user.file });
  }

  const requestBody = {
    contents: [
      {
        parts: parts
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // Replace temporary "Typing..." message with real response
    section2.lastChild.remove();

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const botReply = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      appendMsg("bot", botReply);
    } else {
      appendMsg("bot", "⚠️ No response from Gemini.");
    }

  } catch (error) {
    console.error("Gemini API error:", error);
    section2.lastChild.remove();
    appendMsg("bot", "⚠️ Error fetching response. Try again.");
  } finally {
    user.file = {}; // Reset file state
  }
}

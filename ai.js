// ai.js
const OPENROUTER_API_KEY = "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"; 

const META_ICON_URL = "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg";
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// --- MULTI-PAGE PAGE DETECTION BLOCK LOGIC ---
const isChatPage = window.location.pathname.includes('chat.html');

// Executed inside entry view page context panel
window.startInitialAnalysisRoutine = async function() {
    const instaId = document.getElementById('instaId').value.trim();
    const contentType = document.getElementById('contentType').value.trim();
    const avgViews = document.getElementById('avgViews').value;
    const uploadTime = document.getElementById('uploadTime').value;
    const errorText = document.getElementById('errorText');

    errorText.classList.add('hidden');

    if(!instaId || !contentType || !avgViews || !uploadTime) {
        errorText.innerText = "Please fill all the details to continue.";
        errorText.classList.remove('hidden');
        return;
    }
    if(!instaId.startsWith('@') || instaId.includes(' ')) {
        errorText.innerText = "Please enter a valid username starting with @ (no spaces).";
        errorText.classList.remove('hidden');
        return;
    }

    document.getElementById('analyzeBtn').classList.add('hidden');
    const loadingCard = document.getElementById('loadingCard');
    const loadingStepText = document.getElementById('loadingStepText');
    const loadingSubText = document.getElementById('loadingSubText');
    loadingCard.classList.remove('hidden');
    
    loadingStepText.innerText = "Locating Account...";
    loadingSubText.innerText = `Searching for ${instaId} on Instagram network`;
    await delay(1200);

    loadingStepText.innerText = "Analyzing Content Matrix...";
    loadingSubText.innerText = `Evaluating the ${contentType} algorithm`;
    await delay(1200);

    loadingStepText.innerText = "Processing Data...";
    loadingSubText.innerText = `Calculating metrics based on ${avgViews} average views`;
    await delay(1200);

    // Storing data temporarily across storage frames to fetch in chat view panel components 
    localStorage.setItem('ig_user_meta_data', JSON.stringify({ instaId, contentType, avgViews, uploadTime }));
    
    // Redirect to chat workspace structure
    window.location.href = 'chat.html';
};

// --- CHAT WORKSPACE CONTEXT SCRIPTS ---
let chatHistory = [];

if(isChatPage) {
    window.addEventListener('DOMContentLoaded', () => {
        initChatSessionWorkflow();
    });
}

async function initChatSessionWorkflow() {
    const rawData = localStorage.getItem('ig_user_meta_data');
    if(!rawData) {
        window.location.href = 'ai.html';
        return;
    }
    const data = JSON.parse(rawData);

    const initialPrompt = `You are a highly skilled Instagram Growth Expert. 
    User details: 
    - Username: ${data.instaId}
    - Niche: ${data.contentType}
    - Avg Views: ${data.avgViews}
    - Current Upload Time: ${data.uploadTime}
    
    Write a brief, highly actionable initial response covering:
    1. Acknowledge their niche.
    2. Give the absolute BEST upload time specifically for their niche.
    3. One secret algorithm tip to double their views.
    Keep it conversational, professional, and very brief. Use bullet points.`;

    chatHistory = [
        { 
            "role": "system", 
            "content": "You are an Instagram Growth Assistant named Meta. YOU MUST STRICTLY ONLY discuss Instagram, social media growth, followers, reels, and content creation. If the user asks about ANYTHING ELSE, politely refuse and state that you can only help with Instagram-related queries." 
        },
        { "role": "user", "content": initialPrompt }
    ];

    appendAIMessage("", true); // Show typing animation
    await fetchAIResponse();
}

window.toggleMenuOverlay = function() {
    const menu = document.getElementById('menuOverlay');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
};

window.triggerMenuNewChat = function() {
    // Clear structural context profiles records
    localStorage.removeItem('ig_user_meta_data');
    chatHistory = [];
    // Redirect back cleanly to primary interface frame setup tracking 
    window.location.href = 'ai.html';
};

function appendUserMessage(text) {
    const chatBox = document.getElementById('chatBox');
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper user-side';
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bubble msg-user-bubble';
    msgDiv.innerText = text;
    wrapper.appendChild(msgDiv);
    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendAIMessage(content, isTyping = false) {
    const chatBox = document.getElementById('chatBox');
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper ai-side';
    if(isTyping) wrapper.id = 'typingIndicator';

    if(!isTyping) {
        const nameLabel = document.createElement('div');
        nameLabel.className = 'ai-name-tag';
        nameLabel.innerText = "Meta";
        wrapper.appendChild(nameLabel);
    }

    const aiRow = document.createElement('div');
    aiRow.className = 'ai-row';
    const icon = document.createElement('img');
    icon.className = 'ai-icon';
    icon.src = META_ICON_URL;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'bubble msg-ai-bubble';
    
    if (isTyping) {
        msgDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    } else {
        msgDiv.innerHTML = content;
    }

    aiRow.appendChild(icon);
    aiRow.appendChild(msgDiv);
    wrapper.appendChild(aiRow);
    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchAIResponse() {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "nvidia/nemotron-3-ultra-550b-a55b:free", 
                "messages": chatHistory
            })
        });

        const data = await response.json();
        const aiReply = data.choices[0].message.content;
        chatHistory.push({ "role": "assistant", "content": aiReply });

        let formattedReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();

        appendAIMessage(formattedReply, false);

    } catch (error) {
        console.error(error);
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
        appendAIMessage("<span style='color:red'>Oops! Connection failed.</span>", false);
    }
}

window.sendMessage = async function() {
    const inputField = document.getElementById('userChatInput');
    const userText = inputField.value.trim();
    if(!userText) return;

    appendUserMessage(userText);
    inputField.value = '';
    chatHistory.push({ "role": "user", "content": userText });
    
    appendAIMessage("", true);
    await fetchAIResponse();
};

if(isChatPage) {
    document.getElementById('userChatInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') window.sendMessage();
    });
}
/**
 * Sx06 Luxe - AI Assistant Chatbot Module
 * Client-side chatbot with intent recognition and response handling
 * Integrates with logging system for conversation tracking
 */

class Sx06Chatbot {
  constructor(config = {}) {
    this.config = {
      intentsPath: config.intentsPath || '/data/chat-intents.json',
      maxHistoryLength: config.maxHistoryLength || 50,
      typingDelay: config.typingDelay || 800,
      enableLogging: config.enableLogging !== undefined ? config.enableLogging : true,
      storageKey: 'sx06_chat_history',
      sessionKey: 'sx06_chat_session',
      ...config
    };

    this.intents = null;
    this.conversationHistory = [];
    this.sessionId = this.getOrCreateSession();
    this.isTyping = false;

    // DOM elements (will be set on init)
    this.elements = {};
  }

  /**
   * Initialize the chatbot
   */
  async init() {
    try {
      // Load intents
      await this.loadIntents();

      // Setup DOM elements
      this.setupDOM();

      // Load conversation history
      this.loadHistory();

      // Setup event listeners
      this.setupEventListeners();

      // Log initialization
      this.log('Chatbot initialized successfully');

      // Track chatbot initialization
      if (window.logger && this.config.enableLogging) {
        window.logger.trackEvent('chatbot_initialized', {
          sessionId: this.sessionId
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      // Fallback to basic intents
      this.intents = this.getFallbackIntents();
      return false;
    }
  }

  /**
   * Setup DOM elements
   */
  setupDOM() {
    this.elements = {
      trigger: document.getElementById('chat-trigger'),
      window: document.getElementById('chat-window'),
      close: document.getElementById('chat-close'),
      messages: document.getElementById('chat-messages'),
      input: document.getElementById('chat-input'),
      send: document.getElementById('chat-send'),
      quickReplies: document.getElementById('quick-replies')
    };

    // Validate all elements exist
    Object.entries(this.elements).forEach(([key, element]) => {
      if (!element) {
        console.warn(`Chatbot element not found: ${key}`);
      }
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle chat window
    if (this.elements.trigger) {
      this.elements.trigger.addEventListener('click', () => this.toggleChat());
    }

    if (this.elements.close) {
      this.elements.close.addEventListener('click', () => this.closeChat());
    }

    // Send message
    if (this.elements.send) {
      this.elements.send.addEventListener('click', () => this.sendMessage());
    }

    // Enter key to send
    if (this.elements.input) {
      this.elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Close chat on outside click
    document.addEventListener('click', (e) => {
      if (this.elements.window && 
          this.elements.window.classList.contains('active') &&
          !this.elements.window.contains(e.target) &&
          !this.elements.trigger.contains(e.target)) {
        this.closeChat();
      }
    });
  }

  /**
   * Load intents from JSON file
   */
  async loadIntents() {
    try {
      const response = await fetch(this.config.intentsPath);
      if (!response.ok) throw new Error('Failed to load intents');
      this.intents = await response.json();
      this.log('Intents loaded successfully');
    } catch (error) {
      this.log('Using fallback intents');
      this.intents = this.getFallbackIntents();
    }
  }

  /**
   * Fallback intents if JSON fails to load
   */
  getFallbackIntents() {
    return {
      greeting: {
        patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'greetings'],
        responses: [
          "Hello! Welcome to Sx06 Luxe 👋 How can I assist you today?",
          "Hi there! Thanks for visiting Sx06 Luxe. What can I help you with?",
          "Welcome! I'm here to help you explore our luxury collection."
        ],
        quickReplies: ['Shop Collection', 'Brand Story', 'Shipping Info', 'Contact Us']
      },
      shop: {
        patterns: ['shop', 'buy', 'purchase', 'collection', 'products', 'catalog'],
        responses: [
          "Explore our exclusive collection! Visit our <a href='gallery.html'>Gallery</a> to see customer looks and our latest pieces.",
          "Check out our <a href='gallery.html'>Gallery</a> for stunning customer photos and videos showcasing our luxury pieces!"
        ],
        quickReplies: ['Shipping Info', 'Sizing Guide', 'Contact Us']
      },
      story: {
        patterns: ['story', 'about', 'founded', 'founder', 'who', 'history', 'brand'],
        responses: [
          "Sx06 Luxe was founded by Abdulmuqeet in October 2025. The '06' represents the founder's day - a symbol of legacy and personal significance. We combine timeless sophistication with sustainable craft. Learn more on our <a href='about.html'>About page</a>.",
          "Our brand represents the intersection of luxury, sustainability, and innovation. Founded by Abdulmuqeet, the '06' honors the founder's special day. Discover our full story <a href='about.html'>here</a>."
        ],
        quickReplies: ['Shop Collection', 'Sustainability', 'Contact Us']
      },
      shipping: {
        patterns: ['ship', 'shipping', 'deliver', 'delivery', 'send', 'international'],
        responses: [
          "We ship worldwide! 🌍 Standard shipping takes 5-7 business days. Express options available. Free shipping on orders over $200.",
          "Shipping to your location: Standard (5-7 days), Express (2-3 days). Free shipping on orders $200+. Track your order anytime!"
        ],
        quickReplies: ['Returns Policy', 'Shop Collection', 'Track Order']
      },
      contact: {
        patterns: ['contact', 'email', 'phone', 'reach', 'talk', 'support', 'help'],
        responses: [
          "We'd love to hear from you! 💌<br>Email: hello@sx06luxe.com<br>Visit our <a href='contact.html'>Contact page</a><br>Response time: Within 24 hours",
          "Get in touch:<br>📧 hello@sx06luxe.com<br>📞 Available on our <a href='contact.html'>Contact page</a><br>We typically respond within 24 hours!"
        ],
        quickReplies: ['Shop Collection', 'Shipping Info', 'Returns']
      },
      sizing: {
        patterns: ['size', 'sizing', 'fit', 'measurements', 'dimensions'],
        responses: [
          "We offer sizes XS-XXL with detailed measurements on each product page. Need personalized fitting advice? Contact us at hello@sx06luxe.com or check our size guide.",
          "Our size range: XS, S, M, L, XL, XXL. Each product has detailed measurements. Not sure? We offer free size consultations - just contact us!"
        ],
        quickReplies: ['Shop Collection', 'Contact Us', 'Returns Policy']
      },
      returns: {
        patterns: ['return', 'refund', 'exchange', 'policy', 'unhappy'],
        responses: [
          "30-day return policy on unworn items with tags. Free returns on all orders. Items must be in original condition. <a href='contact.html'>Contact us</a> to initiate a return.",
          "Returns made easy: 30 days, free return shipping, full refund or exchange. Items must be unworn with tags. Start your return by contacting us!"
        ],
        quickReplies: ['Shop Collection', 'Contact Us', 'Shipping Info']
      },
      sustainability: {
        patterns: ['sustainable', 'sustainability', 'eco', 'environment', 'ethical', 'green'],
        responses: [
          "Sustainability is core to Sx06 Luxe. We use 100% sustainable materials, ethical manufacturing, and carbon-neutral shipping. Learn more about our commitment on our <a href='about.html'>About page</a>.",
          "We're committed to luxury without compromise: sustainable materials, ethical labor practices, minimal waste, and carbon-neutral operations. It's luxury you can feel good about. 🌿"
        ],
        quickReplies: ['Brand Story', 'Shop Collection', 'Materials Info']
      },
      price: {
        patterns: ['price', 'cost', 'expensive', 'cheap', 'affordable', 'how much'],
        responses: [
          "Our pieces range from $150-$800, reflecting premium materials and ethical craftsmanship. Each item is an investment in timeless luxury. View pricing in our <a href='gallery.html'>Gallery</a>.",
          "Prices vary by piece ($150-$800). We believe in transparent pricing that reflects true value: sustainable materials, fair wages, and exceptional quality."
        ],
        quickReplies: ['Shop Collection', 'Sustainability', 'Payment Options']
      },
      payment: {
        patterns: ['payment', 'pay', 'checkout', 'credit card', 'paypal', 'installment'],
        responses: [
          "We accept: Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay. Installment plans available through Shop Pay (4 interest-free payments).",
          "Payment options: All major credit cards, PayPal, Apple/Google Pay. Plus flexible installment plans through Shop Pay!"
        ],
        quickReplies: ['Shop Collection', 'Security Info', 'Contact Us']
      },
      gallery: {
        patterns: ['gallery', 'photos', 'pictures', 'images', 'customers', 'reviews'],
        responses: [
          "Check out our <a href='gallery.html'>Customer Gallery</a>! See real customers wearing Sx06 Luxe with photos and videos. You can even submit your own!",
          "Our <a href='gallery.html'>Gallery</a> showcases authentic customer moments. Real people, real luxury. Add your photos too!"
        ],
        quickReplies: ['View Gallery', 'Submit Photo', 'Shop Collection']
      },
      fallback: {
        patterns: [],
        responses: [
          "I'm here to help! I can assist with shopping, shipping, returns, sizing, our brand story, or any questions you have. What would you like to know?",
          "I didn't quite catch that. I can help with: shopping our collection, shipping info, returns, sizing, or brand information. What interests you?",
          "Let me help you! Try asking about our collection, shipping details, our sustainability practices, or how to contact us."
        ],
        quickReplies: ['Shop Collection', 'Brand Story', 'Shipping Info', 'Contact Us']
      },
      email_capture: {
        patterns: ['email', 'subscribe', 'newsletter', 'updates'],
        responses: [
          "Stay connected! 💌 Please enter your email below and we'll send you exclusive updates, new arrivals, and special offers.",
          "Join our community! Share your email and be first to know about new collections and exclusive offers."
        ],
        action: 'capture_email',
        quickReplies: ['Shop Collection', 'No Thanks']
      }
    };
  }

  /**
   * Toggle chat window
   */
  toggleChat() {
    if (this.elements.window) {
      const isActive = this.elements.window.classList.contains('active');
      
      if (isActive) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }
  }

  /**
   * Open chat window
   */
  openChat() {
    if (this.elements.window) {
      this.elements.window.classList.add('active');
      if (this.elements.input) {
        this.elements.input.focus();
      }

      // Track chat opened
      if (window.logger && this.config.enableLogging) {
        window.logger.trackEvent('chat_opened', {
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Close chat window
   */
  closeChat() {
    if (this.elements.window) {
      this.elements.window.classList.remove('active');
      
      // Save conversation history
      this.saveHistory();

      // Track chat closed
      if (window.logger && this.config.enableLogging) {
        window.logger.trackEvent('chat_closed', {
          sessionId: this.sessionId,
          messageCount: this.conversationHistory.length
        });
      }
    }
  }

  /**
   * Send user message
   */
  sendMessage() {
    const message = this.elements.input?.value.trim();
    
    if (!message || this.isTyping) return;

    // Add user message
    this.addMessage(message, true);
    
    // Clear input
    if (this.elements.input) {
      this.elements.input.value = '';
    }

    // Process message
    this.processMessage(message);
  }

  /**
   * Add message to chat
   */
  addMessage(text, isUser = false, skipHistory = false) {
    if (!this.elements.messages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
    
    this.elements.messages.appendChild(messageDiv);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;

    // Add to conversation history
    if (!skipHistory) {
      this.conversationHistory.push({
        text: text,
        isUser: isUser,
        timestamp: new Date().toISOString()
      });

      // Limit history length
      if (this.conversationHistory.length > this.config.maxHistoryLength) {
        this.conversationHistory.shift();
      }
    }
  }

  /**
   * Process user message and generate response
   */
  async processMessage(message) {
    this.isTyping = true;
    
    // Show typing indicator
    this.showTypingIndicator();

    // Small delay for natural feel
    await this.delay(this.config.typingDelay);

    // Match intent
    const intent = this.matchIntent(message);
    const response = this.generateResponse(intent);

    // Remove typing indicator
    this.hideTypingIndicator();

    // Add bot response
    this.addMessage(response.text);

    // Update quick replies
    if (response.quickReplies) {
      this.updateQuickReplies(response.quickReplies);
    }

    this.isTyping = false;

    // Log conversation
    if (window.logger && this.config.enableLogging) {
      window.logger.trackChatbotInteraction(intent, message, {
        type: 'text',
        responseTime: this.config.typingDelay
      }, { sessionId: this.sessionId });
    }
  }

  /**
   * Match user message to intent
   */
  matchIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check each intent's patterns
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      if (intentData.patterns) {
        for (const pattern of intentData.patterns) {
          if (lowerMessage.includes(pattern.toLowerCase())) {
            return intentName;
          }
        }
      }
    }

    return 'fallback';
  }

  /**
   * Generate response from intent
   */
  generateResponse(intentName) {
    const intent = this.intents[intentName] || this.intents.fallback;
    
    // Pick random response if multiple available
    const responseText = Array.isArray(intent.responses) 
      ? intent.responses[Math.floor(Math.random() * intent.responses.length)]
      : intent.responses;

    return {
      text: responseText,
      quickReplies: intent.quickReplies || [],
      action: intent.action
    };
  }

  /**
   * Update quick reply buttons
   */
  updateQuickReplies(replies) {
    if (!this.elements.quickReplies) return;

    this.elements.quickReplies.innerHTML = '';
    
    replies.forEach(reply => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = reply;
      btn.addEventListener('click', () => {
        this.addMessage(reply, true);
        this.processMessage(reply);
      });
      this.elements.quickReplies.appendChild(btn);
    });
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    if (!this.elements.messages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="message-bubble"><span class="loading">Typing</span></div>';
    
    this.elements.messages.appendChild(typingDiv);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * Save conversation history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.conversationHistory));
    } catch (error) {
      this.log('Failed to save chat history:', error);
    }
  }

  /**
   * Load conversation history from localStorage
   */
  loadHistory() {
    try {
      const history = localStorage.getItem(this.config.storageKey);
      if (history) {
        this.conversationHistory = JSON.parse(history);
        
        // Render last few messages (max 10)
        const recentMessages = this.conversationHistory.slice(-10);
        recentMessages.forEach(msg => {
          this.addMessage(msg.text, msg.isUser, true);
        });
      }
    } catch (error) {
      this.log('Failed to load chat history:', error);
    }
  }

  /**
   * Get or create session ID
   */
  getOrCreateSession() {
    let sessionId = sessionStorage.getItem(this.config.sessionKey);
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(this.config.sessionKey, sessionId);
    }
    
    return sessionId;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    localStorage.removeItem(this.config.storageKey);
    
    if (this.elements.messages) {
      this.elements.messages.innerHTML = '<div class="chat-message bot"><div class="message-bubble">Chat history cleared. How can I help you?</div></div>';
    }
  }

  /**
   * Export conversation for analysis
   */
  exportConversation() {
    return {
      sessionId: this.sessionId,
      messages: this.conversationHistory,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Utility: Delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Utility: Logging
   */
  log(...args) {
    console.log('[Sx06 Chatbot]', ...args);
  }
}

// Initialize chatbot on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  const chatbot = new Sx06Chatbot({
    enableLogging: true,
    typingDelay: 600
  });

  await chatbot.init();

  // Make globally available
  window.Sx06Chatbot = chatbot;

  console.log('✅ Sx06 Chatbot initialized and ready');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sx06Chatbot;
} 
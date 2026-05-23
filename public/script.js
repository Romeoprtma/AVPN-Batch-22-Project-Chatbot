document.addEventListener("DOMContentLoaded", () => {
  const langToggles =
    document.querySelectorAll(".lang-switch");

  const setLanguage = (lang) => {
    langToggles.forEach((toggle) => {
      toggle.setAttribute("data-lang", lang);
      const options =
        toggle.querySelectorAll(".lang-option");
      options.forEach((opt) => {
        if (opt.getAttribute("data-target") === lang) {
          opt.classList.add("active");
        } else {
          opt.classList.remove("active");
        }
      });
    });

    const elements = document.querySelectorAll(
      "[data-id][data-en]",
    );
    elements.forEach((el) => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (
          el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA"
        ) {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });

    // Save preference
    localStorage.setItem("inka_lang", lang);

    // Update chat welcome message if it hasn't been overwritten
    const welcomeMsg = document.querySelector(
      ".chat-welcome-msg",
    );
    if (welcomeMsg) {
      welcomeMsg.innerHTML = welcomeMsg.getAttribute(
        `data-${lang}`,
      );
    }
  };

  // Check for saved language, default to 'id'
  const savedLang =
    localStorage.getItem("inka_lang") || "id";
  setLanguage(savedLang);

  // Add click events to toggles
  langToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      const currentLang = toggle.getAttribute("data-lang");

      if (e.target.classList.contains("lang-option")) {
        const targetLang =
          e.target.getAttribute("data-target");
        if (targetLang !== currentLang)
          setLanguage(targetLang);
      } else {
        const newLang = currentLang === "id" ? "en" : "id";
        setLanguage(newLang);
      }
    });
  });

  // Sticky Navbar & Scroll Styling
  const navbar = document.getElementById("navbar");
  const navLogo = document.getElementById("nav-logo");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileMenuBtn = document.getElementById(
    "mobile-menu-btn",
  );
  const mobileMenu = document.getElementById("mobile-menu");

  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.remove("bg-transparent", "py-4");
      navbar.classList.add("bg-white", "shadow-md", "py-2");

      // Logo text
      navLogo.classList.remove("text-white");
      navLogo.classList.add("text-inka-charcoal");

      // Nav links
      navLinks.forEach((link) => {
        link.classList.remove("text-white");
        link.classList.add("text-inka-charcoal");
      });

      // Mobile btn
      mobileMenuBtn.classList.remove("text-white");
      mobileMenuBtn.classList.add("text-inka-charcoal");
    } else {
      navbar.classList.add("bg-transparent", "py-4");
      navbar.classList.remove(
        "bg-white",
        "shadow-md",
        "py-2",
      );

      // Logo text
      navLogo.classList.add("text-white");
      navLogo.classList.remove("text-inka-charcoal");

      // Nav links
      navLinks.forEach((link) => {
        link.classList.add("text-white");
        link.classList.remove("text-inka-charcoal");
      });

      // Mobile btn
      mobileMenuBtn.classList.add("text-white");
      mobileMenuBtn.classList.remove("text-inka-charcoal");
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  // Mobile Menu Toggle
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  // Close mobile menu on click
  document
    .querySelectorAll("#mobile-menu a")
    .forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });

  // Scroll Reveal Animation
  const revealElements =
    document.querySelectorAll(".reveal");

  const revealCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Run once
      }
    });
  };

  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px",
  };

  const revealObserver = new IntersectionObserver(
    revealCallback,
    revealOptions,
  );
  revealElements.forEach((el) =>
    revealObserver.observe(el),
  );

  // Portfolio Filter
  const filterBtns =
    document.querySelectorAll(".filter-btn");
  const portfolioItems =
    document.querySelectorAll(".filter-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.remove(
          "active",
          "border-inka-gold",
          "text-inka-charcoal",
        );
        b.classList.add(
          "border-transparent",
          "text-gray-500",
        );
      });
      btn.classList.remove(
        "border-transparent",
        "text-gray-500",
      );
      btn.classList.add(
        "active",
        "border-inka-gold",
        "text-inka-charcoal",
      );

      const filterValue = btn.getAttribute("data-filter");

      portfolioItems.forEach((item) => {
        if (
          filterValue === "all" ||
          item.classList.contains(filterValue)
        ) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
          }, 50);
        } else {
          item.style.opacity = "0";
          item.style.transform = "scale(0.8)";
          setTimeout(() => {
            item.style.display = "none";
          }, 300);
        }
      });
    });
  });

  // Chatbot UI Logic
  const chatbotToggle = document.getElementById(
    "chatbot-toggle",
  );
  const chatWindow = document.getElementById("chat-window");
  const closeChatBtn =
    document.getElementById("close-chat");
  const chatInputForm = document.getElementById(
    "chat-input-form",
  );
  const chatInput = document.getElementById("chat-input");
  const chatMessages =
    document.getElementById("chat-messages");

  let conversationHistory = [];

  chatbotToggle.addEventListener("click", () => {
    chatWindow.classList.toggle("hidden");
    chatbotToggle.style.display =
      chatWindow.classList.contains("hidden")
        ? "flex"
        : "none";
    if (!chatWindow.classList.contains("hidden")) {
      chatInput.focus();
    }
  });

  closeChatBtn.addEventListener("click", () => {
    chatWindow.classList.add("hidden");
    chatbotToggle.style.display = "flex";
  });

  function appendMessage(sender, text) {
    const isUser = sender === "user";
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex gap-3 max-w-[85%] ${
      isUser ? "self-end flex-row-reverse" : ""
    }`;

    let avatarHTML = isUser
      ? ""
      : `
                    <div class="w-8 h-8 rounded-full bg-inka-gold flex-shrink-0 flex items-center justify-center mt-1">
                        <i class="fas fa-robot text-white text-xs"></i>
                    </div>
                `;

    let bgClass = isUser
      ? "bg-inka-charcoal text-white rounded-tr-none"
      : "bg-white text-gray-700 rounded-tl-none border border-gray-100";

    msgDiv.innerHTML = `
                    ${avatarHTML}
                    <div class="p-3 rounded-2xl shadow-sm text-sm ${bgClass}">
                        ${text}
                    </div>
                `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = `flex gap-3 max-w-[85%]`;
    typingDiv.innerHTML = `
                    <div class="w-8 h-8 rounded-full bg-inka-gold flex-shrink-0 flex items-center justify-center mt-1">
                        <i class="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                    </div>
                `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById(
      "typing-indicator",
    );
    if (indicator) indicator.remove();
  }

  chatInputForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Show user message
    appendMessage("user", message);
    chatInput.value = "";

    chatInput.disabled = true;

    // Simpan ke history array
    conversationHistory.push({
      role: "user",
      text: message,
    });

    // Show typing indicator
    showTypingIndicator();

    // Call AI API dengan mengirim history
    const responseText = await sendMessageToAI(
      conversationHistory,
    );

    // Remove typing and re-enable input
    removeTypingIndicator();
    chatInput.disabled = false;
    chatInput.focus();

    // Tampilkan response
    if (responseText) {
      appendMessage("bot", responseText);

      // Simpan jawaban AI ke history
      conversationHistory.push({
        role: "model",
        text: responseText,
      });
    } else {
      const currentLang =
        localStorage.getItem("inka_lang") || "id";
      const fallbackMsg =
        currentLang === "id"
          ? "Maaf, saya mengalami masalah koneksi ke server saat ini. Tim desain kami akan segera menghubungi Anda."
          : "Sorry, I am experiencing connection issues right now. A member of our design team will contact you shortly.";

      appendMessage("bot", fallbackMsg);

      // Hapus pesan user terakhir karena gagal diproses (mencegah error konteks)
      conversationHistory.pop();
    }
  });

  // ==============================
  // AI CHATBOT API INTEGRATION
  // ==============================

  async function sendMessageToAI(historyArray) {
    try {
      const response = await fetch(
        "http://localhost:3000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation: historyArray,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Server error: ${response.status}`,
        );
      }

      const data = await response.json();

      return data.result;
    } catch (error) {
      console.error("Chatbot API Error:", error);
      return null;
    }
  }

  // ==============================
  // RESEND EMAIL API INTEGRATION (Placeholder)
  // ==============================
  const contactForm =
    document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const submitSpinner = document.getElementById(
    "submit-spinner",
  );
  const btnText = submitBtn.querySelector(".btn-text");
  const formStatus = document.getElementById("form-status");

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      service: document.getElementById("service").value,
      message: document.getElementById("message").value,
    };

    // UI Loading state
    submitBtn.disabled = true;
    btnText.style.opacity = "0.5";
    submitSpinner.classList.remove("hidden");
    formStatus.className = "hidden"; // reset

    try {
      // Call the placeholder function to send email
      const response = await sendEmailViaResend(formData);

      if (response.success) {
        // Success UI
        const currentLang =
          localStorage.getItem("inka_lang") || "id";
        const successMsg =
          currentLang === "id"
            ? "Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda!"
            : "Your message has been sent successfully. We will contact you soon!";

        formStatus.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${successMsg}`;
        formStatus.className =
          "text-sm p-3 rounded-sm bg-green-50 text-green-700 border border-green-200 mt-4 block";
        contactForm.reset();
      } else {
        throw new Error("Failed to send message.");
      }
    } catch (error) {
      console.error("Email Sending Error:", error);
      // Error UI
      const currentLang =
        localStorage.getItem("inka_lang") || "id";
      const errorMsg =
        currentLang === "id"
          ? "Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi."
          : "Sorry, there was an error sending your message. Please try again.";

      formStatus.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i> ${errorMsg}`;
      formStatus.className =
        "text-sm p-3 rounded-sm bg-red-50 text-red-700 border border-red-200 mt-4 block";
    } finally {
      // Reset UI Loading state
      submitBtn.disabled = false;
      btnText.style.opacity = "1";
      submitSpinner.classList.add("hidden");

      // Hide status after a few seconds
      setTimeout(() => {
        formStatus.className =
          "hidden text-sm p-3 rounded-sm";
      }, 5000);
    }
  });

  async function sendEmailViaResend(data) {
    const backendEndpoint = "/api/send-contact-email";

    return new Promise((resolve) => {
      console.log(
        "Simulating sending data to backend:",
        data,
      );
      setTimeout(() => {
        resolve({
          success: true,
          message:
            "Email processed by backend successfully.",
        });
      }, 1500);
    });
  }
});

// FAQ Accordion Logic
const faqButtons = document.querySelectorAll(".faq-button");

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const icon = button.querySelector(".faq-icon");

    const isOpen = answer.style.maxHeight;

    document
      .querySelectorAll(".faq-answer")
      .forEach((ans) => {
        ans.style.maxHeight = null;
      });
    document
      .querySelectorAll(".faq-icon")
      .forEach((icn) => {
        icn.style.transform = "rotate(0deg)";
        icn.classList.remove("fa-minus");
        icn.classList.add("fa-plus");
      });

    if (!isOpen) {
      answer.style.maxHeight = answer.scrollHeight + "px";
      icon.style.transform = "rotate(180deg)";
      icon.classList.remove("fa-plus");
      icon.classList.add("fa-minus");
    }
  });
});

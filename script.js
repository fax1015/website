// --- Cursor ---
const cursor = document.getElementById("cursor");

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
const speed = 0.15;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  const target = e.target;
  const style = window.getComputedStyle(target);
  if (style.cursor === "pointer") {
    cursor.classList.add("active");
  } else {
    cursor.classList.remove("active");
  }
});

function animateCursor() {
  const dx = mouseX - cursorX;
  const dy = mouseY - cursorY;

  cursorX += dx * speed;
  cursorY += dy * speed;

  cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.addEventListener("mousedown", () => {
  cursor.classList.add("click");
});

document.addEventListener("mouseup", () => {
  cursor.classList.remove("click");
});

// Hide cursor when hovering iframes (since they swallow mouse events)
const iframes = document.querySelectorAll("iframe");
iframes.forEach((iframe) => {
  iframe.addEventListener("mouseenter", () => {
    cursor.style.opacity = "0";
  });
  iframe.addEventListener("mouseleave", () => {
    cursor.style.opacity = "1";
  });
});

// --- Popup ---

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-popup]");

  buttons.forEach(btn => {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerText = btn.getAttribute("data-popup");
    document.body.appendChild(popup);

    const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    if (isMobile) {
      // Mobile: fixed popup above button
      btn.addEventListener("mouseenter", () => {
        const rect = btn.getBoundingClientRect();
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top - 40}px`;
        popup.style.transform = "translateX(-50%)";
        popup.classList.add("show");
      });

      btn.addEventListener("mouseleave", () => {
        popup.classList.remove("show");
      });
    } else {
      // Desktop: smooth follow
      let popupTargetX = 0, popupTargetY = 0;
      let popupX = 0, popupY = 0;
      const popupSpeed = 0.15;
      const offsetX = 30, offsetY = 24;

      btn.addEventListener("mouseenter", (e) => {
        popup.classList.add("show");
        popupTargetX = e.pageX + offsetX;
        popupTargetY = e.pageY - offsetY;
        popupX = popupTargetX;
        popupY = popupTargetY;
      });

      btn.addEventListener("mousemove", (e) => {
        let x = e.pageX + offsetX;
        let y = e.pageY - offsetY;
        const rect = popup.getBoundingClientRect();

        if (x + rect.width > window.innerWidth) {
          x = e.pageX - rect.width - offsetX;
        }
        if (y < 0) {
          y = e.pageY + offsetY;
        }
        popupTargetX = x;
        popupTargetY = y;
      });

      btn.addEventListener("mouseleave", () => {
        popup.classList.remove("show");
      });

      function animatePopup() {
        const dx = popupTargetX - popupX;
        const dy = popupTargetY - popupY;
        popupX += dx * popupSpeed;
        popupY += dy * popupSpeed;
        popup.style.left = `${popupX}px`;
        popup.style.top = `${popupY}px`;
        requestAnimationFrame(animatePopup);
      }
      animatePopup();
    }
  });
});


// --- Loading Animation ---
window.addEventListener("load", () => {
  const loaderScreen = document.getElementById("loading-screen");
  const loaderIcon = loaderScreen.querySelector("l-grid");

  setTimeout(() => {
    loaderScreen.classList.add("hidden");

    loaderScreen.addEventListener("transitionend", () => {
      loaderIcon.remove();
      loaderScreen.remove();
    }, { once: true });
  }, 800);
});

function copyDiscord(e, el) {
  e.preventDefault();

  const discordHandle = el.getAttribute("value");

  // helper: show popup animation
  function showPopup(message) {
    const popup = Array.from(document.querySelectorAll(".popup"))
      .find(p => p.innerText === el.getAttribute("data-popup"));

    el.setAttribute("data-popup", message);
    if (popup) {
      popup.innerText = message;
      popup.classList.add("popup-animate");
      setTimeout(() => popup.classList.remove("popup-animate"), 400);
    }

    // reset popup text after delay
    setTimeout(() => {
      el.setAttribute("data-popup", discordHandle);
      if (popup) popup.innerText = discordHandle;
    }, 1500);
  }

  // try secure clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(discordHandle)
      .then(() => showPopup("Copied!"))
      .catch(err => {
        console.warn("Clipboard copy failed:", err);
        fallbackCopy(discordHandle, showPopup);
      });
  } else {
    // fallback for HTTP or older browsers
    fallbackCopy(discordHandle, showPopup);
  }
}

// fallback copy using execCommand (works on HTTP)
function fallbackCopy(text, callback) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = 0;
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) callback("Copied!");
    else callback("Failed");
  } catch (err) {
    console.error("Fallback copy failed:", err);
    callback("Failed");
  }

  document.body.removeChild(textarea);
}



// --- Parallax Background + 3D sync (desktop only) ---
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.addEventListener("mousemove", (e) => {
    const { innerWidth, innerHeight } = window;

    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;

    const maxOffset = 1.5;
    const offsetY = x * maxOffset;
    const offsetX = -y * maxOffset;

    // Foreground sections
    const baseLeft = { x: 30, y: 30, z: -10 };
    const baseRight = { x: -30, y: -30, z: -10 };

    document.querySelector(".section-left").style.transform =
      `rotateX(${baseLeft.x + offsetX}deg) rotateY(${baseLeft.y + offsetY}deg) rotateZ(${baseLeft.z}deg)`;

    document.querySelector(".section-right").style.transform =
      `rotateX(${baseRight.x + offsetX * 0.5}deg) rotateY(${baseRight.y + offsetY * 0.5}deg) rotateZ(${baseRight.z}deg)`;

    // Background layers
    const layers = document.querySelectorAll(".parallax .layer");
    layers.forEach((layer, index) => {
      const depth = (index + 0.5) ** 3.5;
      const moveX = x * depth;
      const moveY = y * depth;

      layer.style.transform =
        `translate(${moveX}px, ${moveY}px) scale(1.05)
         rotateX(${offsetX * 0.5}deg) rotateY(${offsetY * 0.5}deg)`;
    });
  });
}

// --- New Releases ---
const releaseData = {
  title: "take me where the wind blows",
  type: "Album",
  image: "https://f4.bcbits.com/img/a0985209893_16.jpg",
  link: "https://hypeddit.com/nlm090"
};

function renderReleaseContent() {
  const content = `
    <a href="${releaseData.link}" class="release-item" target="_blank">
      <img src="${releaseData.image}" alt="${releaseData.title}">
      <div class="release-info">
        <p class="release-name">${releaseData.title}</p>
        <p class="release-type">${releaseData.type}</p>
      </div>
    </a>
  `;

  // Render in Notice
  const noticeContainer = document.querySelector(".releases-container");
  if (noticeContainer) noticeContainer.innerHTML = content;

  // Render in Grid (Item 4)
  const gridItem4 = document.querySelector(".item-4");
  if (gridItem4) {
    gridItem4.innerHTML = content;
    gridItem4.classList.add("no-padding"); // remove padding for full fit if desired, or keep it.
    // Let's actually NOT add no-padding by default unless it looks bad, but based on typical bento, 
    // replacing the inner content is the key.
    // However, to make it look like the release item card itself is the grid item, 
    // we might want to adjust styling. 
    // For now, simple injection.
  }
}

document.addEventListener("DOMContentLoaded", renderReleaseContent);

function closeReleases() {
  const notice = document.querySelector(".new-releases-notice");
  if (notice) {
    notice.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      notice.style.display = "none";
    }, 300);
  }
}

// Add slideOut animation
const style = document.createElement("style");
style.textContent = `
  @keyframes slideOut {
    to {
      opacity: 0;
      transform: translateX(-100px);
    }
  }
`;
document.head.appendChild(style);

// --- FAQ ---

document.addEventListener("DOMContentLoaded", () => {
  const faqButton = document.querySelector(".fa-circle-question"); // footer icon
  const menuLinks = document.querySelector(".menu-links");
  const faqSection = document.querySelector(".faq-section");
  const backButton = document.querySelector(".faq-back");

  if (faqButton && menuLinks && faqSection) {
    faqButton.addEventListener("click", (e) => {
      e.preventDefault();

      const showingFaq = faqSection.classList.contains("show");

      if (showingFaq) {
        faqSection.classList.remove("show");
        menuLinks.classList.remove("hide");
      } else {
        faqSection.classList.add("show");
        menuLinks.classList.add("hide");
      }
    });
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      faqSection.classList.remove("show");
      menuLinks.classList.remove("hide");
    });
  }
});

// --- Layout Toggle ---
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("layoutToggleBtn");
  const conventionalLayout = document.getElementById("conventionalLayout");

  // Last Updated Date
  const dateEl = document.getElementById("last-update-date");
  if (dateEl) {
    fetch("https://api.github.com/repos/fax1015/website/commits?per_page=1")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const date = new Date(data[0].commit.author.date);
          const formatted = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
          dateEl.innerText = formatted;
        } else {
          throw new Error("No commits found");
        }
      })
      .catch(err => {
        console.warn("GitHub fetch failed, falling back to basic date:", err);
        const now = new Date();
        const formatted = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
        dateEl.innerText = formatted;
      });
  }

  let isConventionalActive = false;

  if (toggleBtn && conventionalLayout) {
    toggleBtn.addEventListener("click", () => {
      isConventionalActive = !isConventionalActive;

      if (isConventionalActive) {
        // Activate conventional layout
        document.body.classList.add("conventional-active");
        conventionalLayout.classList.add("active");
        toggleBtn.classList.add("rotated");
      } else {
        // Deactivate conventional layout
        document.body.classList.remove("conventional-active");
        conventionalLayout.classList.remove("active");
        toggleBtn.classList.remove("rotated");
      }
    });
  }
});

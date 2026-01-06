// --- Constants ---
const GUMROAD_ACCESS_TOKEN = "9abOgbS5q5UG95RhwRpfrRFZLb4lU-VGOA7Zo9UoyhY";
const YOUTUBE_CHANNEL_ID = "UCZETRrcxUZkZZ1J4O1ZWbTw";

const releaseData = {
  title: "take me where the wind blows",
  type: "Album",
  image: "https://f4.bcbits.com/img/a0985209893_16.jpg",
  link: "https://hypeddit.com/nlm090"
};

// --- State ---
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
const cursorSpeed = 0.2;

// --- Elements ---
const cursor = document.getElementById("cursor");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initPopups();
  initParallax();
  initLayoutToggle();
  initFAQ();
  renderReleaseContent();
  updateLatestVideo();
  fetchGumroadProduct();
  initLastUpdated();
});

window.addEventListener("load", () => {
  initLoadingScreen();
});

// --- Loading Animation ---
function initLoadingScreen() {
  const loaderScreen = document.getElementById("loading-screen");
  if (!loaderScreen) return;
  const loaderIcon = loaderScreen.querySelector("l-grid");

  setTimeout(() => {
    loaderScreen.classList.add("hidden");
    loaderScreen.addEventListener("transitionend", () => {
      if (loaderIcon) loaderIcon.remove();
      loaderScreen.remove();
    }, { once: true });
  }, 800);
}

// --- Cursor ---
function initCursor() {
  if (!cursor) return;

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

  document.addEventListener("mousedown", () => cursor.classList.add("click"));
  document.addEventListener("mouseup", () => cursor.classList.remove("click"));

  // Hide cursor on iframes
  document.querySelectorAll("iframe").forEach(iframe => {
    iframe.addEventListener("mouseenter", () => cursor.style.opacity = "0");
    iframe.addEventListener("mouseleave", () => cursor.style.opacity = "1");
  });

  function animateCursor() {
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    cursorX += dx * cursorSpeed;
    cursorY += dy * cursorSpeed;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// --- Popups ---
function initPopups() {
  const buttons = document.querySelectorAll("[data-popup]");
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  buttons.forEach(btn => {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerText = btn.getAttribute("data-popup");
    document.body.appendChild(popup);

    if (isMobile) {
      btn.addEventListener("mouseenter", () => {
        const rect = btn.getBoundingClientRect();
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top - 40}px`;
        popup.style.transform = "translateX(-50%)";
        popup.classList.add("show");
      });
      btn.addEventListener("mouseleave", () => popup.classList.remove("show"));
    } else {
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
        if (x + rect.width > window.innerWidth) x = e.pageX - rect.width - offsetX;
        if (y < 0) y = e.pageY + offsetY;
        popupTargetX = x;
        popupTargetY = y;
      });

      btn.addEventListener("mouseleave", () => popup.classList.remove("show"));

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
}

// --- Parallax (Desktop Only) ---
function initParallax() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let pTargetX = 0, pTargetY = 0;
  let pCurrentX = 0, pCurrentY = 0;
  const parallaxLerp = 0.1;

  document.addEventListener("mousemove", (e) => {
    const { innerWidth, innerHeight } = window;
    pTargetX = (e.clientX / innerWidth) * 2 - 1;
    pTargetY = (e.clientY / innerHeight) * 2 - 1;
  });

  function animateParallax() {
    pCurrentX += (pTargetX - pCurrentX) * parallaxLerp;
    pCurrentY += (pTargetY - pCurrentY) * parallaxLerp;

    const maxOffset = 1.5;
    const offsetY = pCurrentX * maxOffset;
    const offsetX = -pCurrentY * maxOffset;

    const sectionLeft = document.querySelector(".section-left");
    if (sectionLeft) {
      sectionLeft.style.transform = `rotateX(${30 + offsetX}deg) rotateY(${30 + offsetY}deg) rotateZ(-10deg)`;
    }

    const sectionRight = document.querySelector(".section-right");
    if (sectionRight) {
      sectionRight.style.transform = `rotateX(${-30 + offsetX * 0.5}deg) rotateY(${-30 + offsetY * 0.5}deg) rotateZ(-10deg)`;
    }

    document.querySelectorAll(".parallax .layer").forEach((layer, index) => {
      const depth = (index + 0.5) ** 3.5;
      layer.style.transform = `translate(${pCurrentX * depth}px, ${pCurrentY * depth}px) scale(1.05) rotateX(${offsetX * 0.5}deg) rotateY(${offsetY * 0.5}deg)`;
    });

    requestAnimationFrame(animateParallax);
  }
  animateParallax();
}

// --- New Releases ---
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

  const noticeContainer = document.querySelector(".releases-container");
  if (noticeContainer) noticeContainer.innerHTML = content;

  const gridItem4 = document.querySelector(".item-4");
  if (gridItem4) {
    gridItem4.innerHTML = content;
    gridItem4.classList.add("no-padding");
  }
}

function closeReleases() {
  const notice = document.querySelector(".new-releases-notice");
  if (notice) {
    notice.style.animation = "slideOut 0.3s ease forwards";
    setTimeout(() => notice.style.display = "none", 300);
  }
}

// --- FAQ ---
function initFAQ() {
  const faqBtn = document.querySelector(".fa-circle-question");
  const menuLinks = document.querySelector(".menu-links");
  const faqSection = document.querySelector(".faq-section");
  const backBtn = document.querySelector(".faq-back");

  const toggleFAQ = (show) => {
    faqSection?.classList.toggle("show", show);
    menuLinks?.classList.toggle("hide", show);
  };

  faqBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    toggleFAQ(!faqSection.classList.contains("show"));
  });

  backBtn?.addEventListener("click", () => toggleFAQ(false));
}

// --- Layout Toggle ---
function initLayoutToggle() {
  const toggleBtn = document.getElementById("layoutToggleBtn");
  const conventionalLayout = document.getElementById("conventionalLayout");
  if (!toggleBtn || !conventionalLayout) return;

  toggleBtn.addEventListener("click", () => {
    const isActive = document.body.classList.toggle("conventional-active");
    conventionalLayout.classList.toggle("active", isActive);
    toggleBtn.classList.toggle("rotated", isActive);
  });
}

// --- GitHub Last Updated ---
function initLastUpdated() {
  const dateEl = document.getElementById("last-update-date");
  if (!dateEl) return;

  fetch("https://api.github.com/repos/fax1015/website/commits?per_page=1")
    .then(res => res.json())
    .then(data => {
      const date = data?.[0] ? new Date(data[0].commit.author.date) : new Date();
      dateEl.innerText = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
    })
    .catch(() => {
      const now = new Date();
      dateEl.innerText = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
    });
}

// --- YouTube ---
function updateLatestVideo() {
  const iframe = document.getElementById("latest-video-embed");
  if (!iframe) return;

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (data.status === "ok" && data.items?.[0]) {
        const latest = data.items[0];
        let videoId = "";
        if (latest.link.includes("v=")) videoId = latest.link.split("v=")[1].split("&")[0];
        else if (latest.guid.includes("video:")) videoId = latest.guid.split("video:")[1];

        if (videoId) iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    });
}

// --- Gumroad ---
function fetchGumroadProduct() {
  const container = document.getElementById("gumroad-container");
  if (!container) return;

  if (!GUMROAD_ACCESS_TOKEN || GUMROAD_ACCESS_TOKEN === "YOUR_ACCESS_TOKEN_HERE") {
    container.innerHTML = `<div class="gumroad-placeholder"><p>Gumroad token missing.</p><a href="https://fax1015.gumroad.com/" target="_blank" class="button">Visit Shop</a></div>`;
    return;
  }

  fetch("https://api.gumroad.com/v2/products", {
    headers: { "Authorization": `Bearer ${GUMROAD_ACCESS_TOKEN}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.products?.[0]) {
        const product = data.products.find(p => p.published) || data.products[0];
        const { name, preview_url, short_url, formatted_price, covers } = product;
        const image = preview_url || covers?.[0] || "";
        container.innerHTML = `
          <a href="${short_url}" target="_blank" class="gumroad-card">
            <div class="gumroad-img" style="background-image: url('${image}')"></div>
            <div class="gumroad-info">
              <div class="gr-top"><span class="gr-tag">LATEST DROP</span></div>
              <h3 class="gr-title">${name}</h3>
              <div class="gr-bottom">
                <div class="gr-btn">GET IT NOW <i class="fa-solid fa-arrow-right-long"></i></div>
                <span class="gr-price">${formatted_price}</span>
              </div>
            </div>
          </a>`;
      }
    })
    .catch(() => {
      container.innerHTML = `<div class="gumroad-error"><p>Failed to load product</p><a href="https://fax1015.gumroad.com/" target="_blank">Visit Store</a></div>`;
    });
}

// --- Discord Copy ---
function copyDiscord(e, el) {
  e.preventDefault();
  const discordHandle = el.getAttribute("value");

  function showStatus(message) {
    const popup = Array.from(document.querySelectorAll(".popup")).find(p => p.innerText === el.getAttribute("data-popup") || p.innerText === "Copied!");
    el.setAttribute("data-popup", message);
    if (popup) {
      popup.innerText = message;
      popup.classList.add("popup-animate");
      setTimeout(() => popup.classList.remove("popup-animate"), 400);
    }
    setTimeout(() => {
      el.setAttribute("data-popup", discordHandle);
      if (popup) popup.innerText = discordHandle;
    }, 1500);
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(discordHandle).then(() => showStatus("Copied!")).catch(() => fallbackCopy(discordHandle, showStatus));
  } else {
    fallbackCopy(discordHandle, showStatus);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement("textarea");
  ta.value = text;
  Object.assign(ta.style, { position: "fixed", opacity: "0" });
  document.body.appendChild(ta);
  ta.select();
  try {
    if (document.execCommand("copy")) callback("Copied!");
    else callback("Failed");
  } catch {
    callback("Failed");
  }
  document.body.removeChild(ta);
}

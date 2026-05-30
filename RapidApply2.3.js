// ==UserScript==
// @name         🌐RapidApply2.3
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Full automation: Expand Search → Job Card → Schedule → Apply → Create Application + Alarm
// @author       Encrpto
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  console.log("🚀 Full Auto Apply Script Started");

  // --------------------------------------------------
  // ✅ Safe Click Helper
  // --------------------------------------------------
  function safeClick(el, label = "") {
    if (!el) return false;

    try {
      el.click();

      if (label) {
        console.log(`✅ ${label}`);
      }

      return true;
    } catch (err) {
      console.warn(`⚠️ Failed: ${label}`, err);
      return false;
    }
  }

  // --------------------------------------------------
  // 🔊 Alarm Logic
  // --------------------------------------------------
  let alarmStarted = false;
  let audioCtx;

  function startAlarm() {
    if (alarmStarted) return;

    alarmStarted = true;

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function beep() {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0.2;

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    }

    setInterval(beep, 300);

    console.log("🔊 Alarm Started");
  }

 // --------------------------------------------------
// 🔍 Expand Your Search
// Randomized 4–8 second interval
// --------------------------------------------------

function expandLoop() {
  const jobCards = document.querySelectorAll(
    '[data-test-id="JobCard"]'
  );

  if (jobCards.length === 0) {
    const expandBtn = document.querySelector(
      '[data-test-id="expand-your-search-link"]'
    );

    if (expandBtn) {
      safeClick(
        expandBtn,
        "Clicked Expand Your Search"
      );
    }
  }

  // Random delay between 4s–8s
  const delay = 4000 + Math.random() * 4000;

  console.log(
    `⏱ Next Expand Search in ${Math.round(delay)}ms`
  );

  setTimeout(expandLoop, delay);
}

expandLoop();
  // --------------------------------------------------
  // 📄 Job Card Click
  // --------------------------------------------------
  const observer = new MutationObserver(() => {
    const jobCard = document.querySelector(
      '[data-test-id="JobCard"]'
    );

    // 🔊 Alarm trigger
    if (jobCard) {
      startAlarm();
    }

    if (jobCard && !jobCard.dataset.clicked) {
      jobCard.dataset.clicked = "true";

      safeClick(
        jobCard,
        "Clicked Job Card"
      );
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // --------------------------------------------------
  // 🕒 Select Schedule
  // --------------------------------------------------
  setInterval(() => {
    const scheduleBtn = document.querySelector(
      '[data-test-id="jobDetailSelectScheduleButton"]'
    );

    if (scheduleBtn && !scheduleBtn.dataset.clicked) {
      scheduleBtn.dataset.clicked = "true";

      safeClick(
        scheduleBtn,
        "Clicked Select Schedule"
      );
    }
  }, 1500);

  // --------------------------------------------------
  // 📦 Apply
  // Hybrid Apply Logic
  // --------------------------------------------------

  const clickedApplyButtons = new WeakSet();

  function realMouseClick(el) {
    if (!el) return;

    el.scrollIntoView({
      block: "center",
      inline: "center"
    });

    el.focus();

    [
      "pointerdown",
      "mousedown",
      "pointerup",
      "mouseup",
      "click"
    ].forEach(type => {
      el.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    });
  }

  setInterval(() => {
    const applyBtns = Array.from(
      document.querySelectorAll(
        '[data-test-id="ScheduleCardSelectScheduleLink"]'
      )
    ).filter((btn) => !clickedApplyButtons.has(btn));

    applyBtns.forEach((btn, i) => {
      clickedApplyButtons.add(btn);

      console.log(`✅ Apply #${i + 1} detected`);

      // --------------------------------
      // Click 1 → normal click
      // --------------------------------
      safeClick(
        btn,
        `Clicked Apply #${i + 1} (1/2)`
      );

      // --------------------------------
      // Click 2 → real mouse event chain
      // --------------------------------
      setTimeout(() => {
        const refreshedBtns = Array.from(
          document.querySelectorAll(
            '[data-test-id="ScheduleCardSelectScheduleLink"]'
          )
        );

        const refreshedBtn = refreshedBtns[i];

        if (refreshedBtn) {
          realMouseClick(refreshedBtn);

          console.log(
            `🖱 Real Mouse Apply #${i + 1} (2/2)`
          );
        }
      }, 500);
    });
  }, 1500);

  // --------------------------------------------------
  // 📝 Create Application
  // --------------------------------------------------
  function handleCreateApplication() {
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(() => {
      attempts++;

      const button = Array.from(
        document.querySelectorAll(
          "button, div, span"
        )
      ).find(
        (el) =>
          el.innerText
            ?.trim()
            .toLowerCase() === "create application"
      );

      if (button && !button.dataset.clicked) {
        button.dataset.clicked = "true";

        console.log(
          "📝 Create Application detected"
        );

        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            safeClick(
              button,
              `Create Application Click ${i + 1}/4`
            );
          }, i * 500);
        }

        clearInterval(interval);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 500);
  }

  // --------------------------------------------------
  // 🚀 Run on Page Load
  // --------------------------------------------------
  window.addEventListener("load", () => {
    setTimeout(() => {
      handleCreateApplication();
    }, 1000);
  });

  // --------------------------------------------------
  // 🔄 React / SPA Page Change Support
  // --------------------------------------------------
  const createObserver = new MutationObserver(() => {
    handleCreateApplication();
  });

  createObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("✅ All automation stages active");
})();

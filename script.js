/* ============================================================
   EDITABLE CONTENT
   ------------------------------------------------------------
   Change the values in the CONTENT object below to customise
   this invitation. The page is filled in from this object when
   it loads — you should not need to edit the HTML for names,
   dates, venue, wording, RSVP contacts or gallery photos.

   After you change a date or timezone, reload the page: the
   countdown, Google Calendar link and .ics file are all built
   from eventStartISO + timezone + eventDurationHours.
   ============================================================ */

const CONTENT = {
  /* Names */
  groomName: "John",
  brideName: "Jane",

  /* Date & time
     eventStartISO is a local date-time *without* a zone suffix.
     timezone must be a valid IANA name (e.g. "Asia/Kolkata",
     "America/New_York", "Europe/London"). */
  eventStartISO: "2027-12-12T16:00:00",
  timezone: "Asia/Kolkata",
  eventDurationHours: 5,
  dateDotted: "12 . 12 . 2027",
  dateWeekdayLine: "Saturday, December",
  dateDayYear: "12, 2027",
  timeDisplay: "At 4:00 PM",

  /* Venue */
  venueName: "The Grand Estate",
  venueAddress: "123 Wedding Lane, Romantic City",
  /* Optional: paste a Google Maps URL. If left blank, a search
     link is built from venueName + venueAddress. */
  mapsUrl: "",

  /* Headlines & wording */
  heroEyebrow: "Together with our families",
  heroTagline: "Are getting married",
  parentsEyebrow: "With the blessings of",
  parentsTitle: "Our Parents",
  groomParentsLabel: "Parents of the Groom",
  groomFather: "Robert",
  groomMother: "Linda Smith",
  brideParentsLabel: "Parents of the Bride",
  brideFather: "Michael",
  brideMother: "Susan Doe",
  inviteText:
    "With grateful hearts and the blessings of our parents, we invite you to celebrate the beginning of our forever.",
  saveTheDateEyebrow: "Save the date",
  venueEyebrow: "The venue",
  calendarTitle: "Save the Date",
  calendarText: "We would love for you to join us on our special day.",
  galleryEyebrow: "Our moments",
  galleryTitle: "Gallery",
  rsvpEyebrow: "Will you join us?",
  rsvpTitle: "RSVP",
  countdownEyebrow: "Counting down",
  countdownTitle: "To Our Forever",
  hashtag: "#JohnAndJane2027",

  /* Calendar event */
  calendarTitleEvent: "John & Jane's Wedding",
  calendarDetails:
    "You are invited to the wedding of John and Jane at The Grand Estate.",

  /* RSVP — PLACEHOLDERS: replace these before you share the invite.
     whatsappNumber should be digits only, with country code and no +. */
  rsvpEmail: "rsvp@example.com",
  whatsappNumber: "15555550100",

  pageTitle: "John & Jane are getting married",

  /* Gallery photos live in assets/gallery/. Add or replace files
     and update this list — src is relative to index.html. */
  gallery: [
    { src: "assets/gallery/photo-01.webp", alt: "The couple standing together in the ocean at sunset" },
    { src: "assets/gallery/photo-02.webp", alt: "A close wedding-day portrait of the couple" },
    { src: "assets/gallery/photo-03.webp", alt: "The couple watching the sunset together" },
    { src: "assets/gallery/photo-04.webp", alt: "A kiss during the wedding ceremony" },
    { src: "assets/gallery/photo-05.webp", alt: "The couple by the water in wedding attire" },
    { src: "assets/gallery/photo-06.webp", alt: "The couple on a pebble beach with a flowing veil" }
  ]
};

/* ============================================================
   Page behaviour (you can leave this as-is)
   ============================================================ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function fillBindings() {
  $all("[data-bind]").forEach((el) => {
    const key = el.getAttribute("data-bind");
    if (key && Object.prototype.hasOwnProperty.call(CONTENT, key)) {
      el.textContent = CONTENT[key];
    }
  });
  document.title = CONTENT.pageTitle;
}

/* ---- Dates, calendar, maps ---- */
function eventDates() {
  /* Interpret the ISO string in the configured timezone. */
  const tz = CONTENT.timezone;
  const raw = CONTENT.eventStartISO;
  /* Build a UTC instant by formatting the local fields in `tz` via a
     short offset probe: format a nearby UTC date in the zone, compare. */
  const [datePart, timePart] = raw.split("T");
  const [Y, M, D] = datePart.split("-").map(Number);
  const [h, m, s] = (timePart || "00:00:00").split(":").map(Number);
  const utcGuess = Date.UTC(Y, M - 1, D, h, m, s || 0);
  const probe = new Date(utcGuess);
  const inZone = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).formatToParts(probe);
  const get = (t) => Number(inZone.find((p) => p.type === t).value);
  let hour = get("hour");
  if (hour === 24) hour = 0;
  const asIf = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
  const start = new Date(utcGuess + (utcGuess - asIf));
  const end = new Date(start.getTime() + CONTENT.eventDurationHours * 3600 * 1000);
  return { start, end };
}

function stampUTC(d) {
  const p = (n) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    p(d.getUTCMonth() + 1) +
    p(d.getUTCDate()) +
    "T" +
    p(d.getUTCHours()) +
    p(d.getUTCMinutes()) +
    p(d.getUTCSeconds()) +
    "Z"
  );
}

function buildCalendarAndMaps() {
  const { start, end } = eventDates();
  const title = encodeURIComponent(CONTENT.calendarTitleEvent);
  const details = encodeURIComponent(CONTENT.calendarDetails);
  const loc = encodeURIComponent(
    [CONTENT.venueName, CONTENT.venueAddress].filter(Boolean).join(", ")
  );
  const gcal =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + title +
    "&dates=" + stampUTC(start) + "/" + stampUTC(end) +
    "&details=" + details +
    "&location=" + loc +
    "&ctz=" + encodeURIComponent(CONTENT.timezone);
  const gcalBtn = $("#gcalBtn");
  if (gcalBtn) gcalBtn.href = gcal;

  const mapsBtn = $("#directionsBtn");
  if (mapsBtn) {
    mapsBtn.href = CONTENT.mapsUrl ||
      "https://www.google.com/maps/search/?api=1&query=" + loc;
  }

  $("#icsBtn")?.addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:wedding-" + stampUTC(start) + "@invitation",
      "DTSTAMP:" + stampUTC(new Date()),
      "DTSTART:" + stampUTC(start),
      "DTEND:" + stampUTC(end),
      "SUMMARY:" + CONTENT.calendarTitleEvent,
      "DESCRIPTION:" + CONTENT.calendarDetails.replace(/\n/g, "\\n"),
      "LOCATION:" + [CONTENT.venueName, CONTENT.venueAddress].filter(Boolean).join(", "),
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wedding-invitation.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
}

/* ---- Countdown ---- */
function startCountdown() {
  const { start } = eventDates();
  const daysEl = $("[data-days]");
  const hoursEl = $("[data-hours]");
  const minsEl = $("[data-mins]");
  const secsEl = $("[data-secs]");
  const tick = () => {
    let diff = start.getTime() - Date.now();
    if (diff < 0) diff = 0;
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    daysEl.textContent = String(days);
    hoursEl.textContent = String(hours);
    minsEl.textContent = String(mins);
    secsEl.textContent = String(secs);
  };
  tick();
  setInterval(tick, 1000);
}

/* ---- Envelope ---- */
function setupEnvelope() {
  const btn = $("#openInvite");
  const envelope = $("#envelope");
  const cover = $("#cover");
  const main = $("#invitation");
  if (!btn) return;
  let opened = false;

  const open = () => {
    if (opened) return;
    opened = true;
    cover.classList.add("is-opening");
    envelope.classList.add("is-opening");
    startMusic();
    const zoomDelay = reducedMotion ? 0 : 1100;
    const hideDelay = reducedMotion ? 80 : 900;
    setTimeout(() => {
      envelope.classList.add("is-zooming");
      setTimeout(() => {
        revealInvitation(cover, main);
      }, hideDelay);
    }, zoomDelay);
  };

  btn.addEventListener("click", open);
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });
}

function revealInvitation(cover, main) {
  main.hidden = false;
  document.body.classList.remove("is-locked");
  cover.classList.add("is-gone");
  $("#musicToggle").hidden = false;
  /* after fade, remove cover from tab order */
  setTimeout(() => { cover.setAttribute("hidden", ""); }, 800);
  window.scrollTo(0, 0);
}

/* ---- Music ---- */
function startMusic() {
  const audio = $("#bgMusic");
  const toggle = $("#musicToggle");
  if (!audio) return;
  audio.volume = 0.55;
  const play = () => {
    audio.play().then(() => {
      toggle.hidden = false;
      toggle.classList.remove("is-muted");
      toggle.setAttribute("aria-pressed", "true");
    }).catch(() => {
      toggle.hidden = false;
      toggle.classList.add("is-muted");
      toggle.setAttribute("aria-pressed", "false");
    });
  };
  play();
  toggle.addEventListener("click", () => {
    if (audio.paused) play();
    else {
      audio.pause();
      toggle.classList.add("is-muted");
      toggle.setAttribute("aria-pressed", "false");
    }
  });
}

/* ---- Gallery ---- */
function setupGallery() {
  const root = $("[data-carousel]");
  if (!root) return;
  const track = $("[data-track]", root);
  const dots = $("[data-dots]", root);
  const items = CONTENT.gallery || [];
  items.forEach((item, i) => {
    const slide = document.createElement("figure");
    slide.className = "car-slide";
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "";
    img.loading = i === 0 ? "eager" : "lazy";
    slide.appendChild(img);
    track.appendChild(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", "Go to photo " + (i + 1));
    dot.addEventListener("click", () => go(i));
    dots.appendChild(dot);
  });

  let index = 0;
  const n = items.length;

  function slideWidth() {
    const viewport = $(".car-viewport", root);
    const slide = $(".car-slide", root);
    if (!slide) return viewport.clientWidth;
    /* include padding via offsetWidth */
    return slide.getBoundingClientRect().width;
  }

  function peekOffset() {
    const viewport = $(".car-viewport", root);
    const slide = $(".car-slide", root);
    if (!slide || window.innerWidth < 768) return 0;
    /* centre the active slide so neighbours peek */
    return (viewport.clientWidth - slide.getBoundingClientRect().width) / 2;
  }

  function go(i) {
    index = (i + n) % n;
    const x = index * slideWidth() - peekOffset();
    track.style.transform = "translateX(" + -x + "px)";
    $all("button", dots).forEach((d, k) => d.classList.toggle("is-on", k === index));
  }

  $("[data-prev]", root)?.addEventListener("click", () => go(index - 1));
  $("[data-next]", root)?.addEventListener("click", () => go(index + 1));

  /* swipe */
  let startX = 0, startY = 0, dragging = false, lastX = 0;
  const vp = $(".car-viewport", root);
  const onDown = (x, y) => { dragging = true; startX = lastX = x; startY = y; };
  const onMove = (x, y, ev) => {
    if (!dragging) return;
    lastX = x;
    if (Math.abs(x - startX) > Math.abs(y - startY) && ev && ev.cancelable) ev.preventDefault();
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    const dx = lastX - startX;
    if (dx < -40) go(index + 1);
    else if (dx > 40) go(index - 1);
  };
  vp.addEventListener("pointerdown", (e) => onDown(e.clientX, e.clientY));
  vp.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY, e));
  vp.addEventListener("pointerup", onUp);
  vp.addEventListener("pointercancel", onUp);
  vp.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  vp.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX, e.touches[0].clientY, e), { passive: false });
  vp.addEventListener("touchend", onUp);

  window.addEventListener("resize", () => go(index));
  go(0);
}

/* ---- RSVP ---- */
function setupRsvp() {
  const form = $("#rsvpForm");
  const thanks = $("#rsvpThanks");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const attend = String(data.get("attend") || "").trim();
    const message = String(data.get("message") || "").trim();
    const payload = { name, email, attend, message, at: new Date().toISOString() };
    try { localStorage.setItem("wedding-rsvp", JSON.stringify(payload)); } catch (_) {}

    const lines = [
      "RSVP for " + CONTENT.groomName + " & " + CONTENT.brideName,
      "Name: " + name,
      "Email: " + email,
      "Attendance: " + attend,
      message ? "Message: " + message : ""
    ].filter(Boolean).join("\n");

    const wa = $("#rsvpWhatsApp");
    const mail = $("#rsvpMailto");
    const text = encodeURIComponent(lines);
    wa.href = "https://wa.me/" + CONTENT.whatsappNumber + "?text=" + text;
    mail.href =
      "mailto:" + encodeURIComponent(CONTENT.rsvpEmail) +
      "?subject=" + encodeURIComponent("RSVP — " + name) +
      "&body=" + text;

    $("[data-thanks-name]", thanks).textContent = name;
    form.hidden = true;
    thanks.hidden = false;
  });
}

/* ---- Scroll reveal ---- */
function setupReveal() {
  if (reducedMotion) {
    $all(".reveal").forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  $all(".reveal").forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  fillBindings();
  buildCalendarAndMaps();
  startCountdown();
  setupEnvelope();
  setupGallery();
  setupRsvp();
  setupReveal();
});

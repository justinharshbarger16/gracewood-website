const STORAGE_KEY = "gracewoodPlanningSummary";

const state = {
  calendarDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedDate: null,
  selectedDateStatus: null,
  selectedDateDescription: "",
  plannerGuideStep: "start",
  layoutPreferences: {
    eventType: "wedding",
    guestCount: 120,
    tableStyle: "round",
    headStyle: "sweetheart",
    includeCeremony: false,
    includeBuffet: false,
    includeCookieTable: true,
    includeDanceFloor: true,
    includeGiftTable: true,
    keepOpenBarSide: true,
    cateringStyle: "buffet"
  },
  estimate: {
    eventType: "wedding",
    weddingDay: "Saturday",
    hours: 4,
    ceremony: false,
    coordination: false,
    bartending: false,
    extraHours: 0,
    base: 6500,
    addOns: 0,
    total: 6500,
    addOnLabels: []
  },
  savedSummary: loadSummary(),
  layoutItems: [],
  activeLayoutPreset: "",
  draggedItemId: null,
  assistantHistory: []
};

const PRICING = {
  wedding: {
    Thursday: 5000,
    Friday: 6000,
    Saturday: 6500,
    Sunday: 6000,
    ceremony: 500,
    coordination: 1500,
    bartending: 1250,
    extraHour: 250
  },
  hourlyRate: 250
};

const calendarStatusData = {
  "2026-04-24": { status: "pending", note: "A wedding inquiry is currently being reviewed for this Friday date." },
  "2026-04-25": { status: "booked", note: "Booked for a full wedding celebration." },
  "2026-04-30": { status: "available", note: "A beautiful option for a Thursday event with added flexibility." },
  "2026-05-02": { status: "booked", note: "Reserved for a private wedding event." },
  "2026-05-08": { status: "pending", note: "Pending conversation for a social event." },
  "2026-05-09": { status: "booked", note: "Booked for a full Saturday celebration." },
  "2026-05-15": { status: "available", note: "Open for a Friday celebration or gathering." },
  "2026-05-17": { status: "available", note: "Open for a Sunday wedding or social event." },
  "2026-05-22": { status: "pending", note: "Pending hold for a corporate gathering." },
  "2026-05-23": { status: "booked", note: "Reserved for a wedding reception." },
  "2026-05-28": { status: "available", note: "Open for a Thursday wedding with strong value." },
  "2026-06-05": { status: "available", note: "Available for a Friday event with full venue access." },
  "2026-06-06": { status: "booked", note: "Booked for a signature Saturday wedding." },
  "2026-06-12": { status: "pending", note: "Pending hold for a family celebration." },
  "2026-06-14": { status: "available", note: "Available for a Sunday wedding or social event." },
  "2026-06-20": { status: "booked", note: "Booked for a large reception." },
  "2026-06-25": { status: "available", note: "Open for a polished Thursday celebration." },
  "2026-07-03": { status: "available", note: "Open for a Friday celebration." },
  "2026-07-11": { status: "booked", note: "Booked for a wedding and ceremony." },
  "2026-07-18": { status: "pending", note: "Pending inquiry for a social gathering." }
};

const assistantKnowledge = [
  {
    question: "How many guests can Gracewood accommodate?",
    answer:
      "Gracewood can accommodate up to approximately 200 guests, making it a strong fit for weddings, showers, fundraisers, corporate events, and other celebrations that need both comfort and flexibility.",
    keywords: ["guests", "capacity", "accommodate", "people"]
  },
  {
    question: "What is included with a venue rental?",
    answer:
      "Venue rentals include use of up to 25 tables, 200 chairs, guest restrooms, free parking, access to the bridal suite, and kitchen prep space for your caterer. The goal is to provide the essential venue features clients need to plan with confidence.",
    keywords: ["included", "rental", "tables", "chairs", "parking"]
  },
  {
    question: "Can I host both a ceremony and reception at Gracewood?",
    answer:
      "Yes. Wedding clients can add ceremony use for an additional $500, allowing Gracewood to serve as a convenient setting for both the ceremony and reception experience.",
    keywords: ["ceremony", "reception", "both"]
  },
  {
    question: "What does bartending include?",
    answer:
      "Bartending is available through Gibsonia Bar Tending Service for $1,250. This includes the bartending service, necessary mixers, and plastic ware. To keep service seamless and venue-ready, Gracewood works exclusively with Gibsonia Bar Tending Service for bartending, so outside bartending services are not permitted. Couples are welcome to provide their own alcohol for that service.",
    keywords: ["bartending", "bar", "alcohol", "drink"]
  },
  {
    question: "Do you offer planning or coordination help?",
    answer:
      "Yes. Day-of coordination is available through Beloved Event Co for an additional $1,500. This is a strong option for clients who want a more supported and organized event experience.",
    keywords: ["planning", "coordination", "help", "support"]
  },
  {
    question: "What types of events work best at Gracewood?",
    answer:
      "Gracewood is designed for weddings, showers, birthdays, family celebrations, fundraisers, holiday parties, and corporate events. The space is flexible enough to support both elegant social events and practical professional gatherings.",
    keywords: ["events", "types", "best", "works"]
  },
  {
    question: "How does pricing work for social or corporate events?",
    answer:
      "Social and corporate events are priced at $250 per hour with access to the full venue. These events are typically scheduled between 10am and 8pm.",
    keywords: ["pricing", "social", "corporate", "hourly"]
  },
  {
    question: "How do I know if my date is available?",
    answer:
      "Use the availability calendar to explore open dates, booked dates, and pending inquiries. Once you find a date that works, you can submit an inquiry with your event details to begin the booking conversation.",
    keywords: ["date", "available", "availability", "calendar"]
  },
  {
    question: "Can I customize the event layout?",
    answer:
      "Yes. Gracewood is designed to be flexible, and the layout planner allows you to explore table arrangements and guest flow ideas so you can better visualize your event before inquiring.",
    keywords: ["layout", "customize", "tables", "planner"]
  },
  {
    question: "What makes Gracewood different?",
    answer:
      "Gracewood combines a refined venue setting with a more modern planning experience. Instead of only browsing images, clients can explore availability, review pricing, estimate packages, and begin planning their layout in one place.",
    keywords: ["different", "why", "unique", "gracewood"]
  }
];

const relatedQuestionMap = {
  "How many guests can Gracewood accommodate?": [
    "What is included with a venue rental?",
    "Can I customize the event layout?"
  ],
  "What is included with a venue rental?": [
    "How many guests can Gracewood accommodate?",
    "What types of events work best at Gracewood?"
  ],
  "Can I host both a ceremony and reception at Gracewood?": [
    "Do you offer planning or coordination help?",
    "How do I know if my date is available?"
  ],
  "What does bartending include?": [
    "Do you offer planning or coordination help?",
    "How does pricing work for social or corporate events?"
  ],
  "Do you offer planning or coordination help?": [
    "Can I host both a ceremony and reception at Gracewood?",
    "What makes Gracewood different?"
  ],
  "What types of events work best at Gracewood?": [
    "How many guests can Gracewood accommodate?",
    "How does pricing work for social or corporate events?"
  ],
  "How does pricing work for social or corporate events?": [
    "What types of events work best at Gracewood?",
    "How do I know if my date is available?"
  ],
  "How do I know if my date is available?": [
    "Can I host both a ceremony and reception at Gracewood?",
    "What makes Gracewood different?"
  ],
  "Can I customize the event layout?": [
    "How many guests can Gracewood accommodate?",
    "Do you offer planning or coordination help?"
  ],
  "What makes Gracewood different?": [
    "How do I know if my date is available?",
    "Can I customize the event layout?"
  ]
};

const itemConfig = {
  round: { label: "Round", className: "round", width: 72, height: 72, seats: 8 },
  banquet: { label: "Banquet", className: "banquet", width: 112, height: 50, seats: 8 },
  sweetheart: { label: "Sweetheart", className: "sweetheart", width: 104, height: 48, seats: 2 },
  head: { label: "Head", className: "head", width: 132, height: 52, seats: 8 },
  dance: { label: "Dance", className: "dance", width: 140, height: 108, seats: 0 },
  gift: { label: "Gift", className: "gift", width: 94, height: 42, seats: 0 },
  dessert: { label: "Dessert", className: "dessert", width: 94, height: 42, seats: 0 },
  buffet: { label: "Buffet", className: "buffet", width: 112, height: 44, seats: 0 },
  cookie: { label: "Cookie", className: "cookie", width: 92, height: 44, seats: 0 },
  ceremonyRow: { label: "Ceremony Row", className: "banquet", width: 130, height: 28, seats: 8 },
  altar: { label: "Altar", className: "sweetheart", width: 120, height: 40, seats: 0 },
  presentation: { label: "Presentation", className: "head", width: 142, height: 46, seats: 0 }
};

const dom = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  setupHeroImageFallback();
  setupNavigation();
  renderCalendar();
  setupPackageTabs();
  setupEstimator();
  setupLayoutPlanner();
  setupAssistant();
  setupSummaryDrawer();
  setupInquiryForm();
  setupScrollEffects();
  hydrateSummary();
  syncFormWithSummary();
  setFooterYear();
  updateJourneyProgress();
});

function cacheDom() {
  dom.calendarMonthLabel = document.getElementById("calendarMonthLabel");
  dom.calendarGrid = document.getElementById("calendarGrid");
  dom.calendarPrev = document.getElementById("calendarPrev");
  dom.calendarNext = document.getElementById("calendarNext");
  dom.selectedDateLabel = document.getElementById("selectedDateLabel");
  dom.selectedDateStatus = document.getElementById("selectedDateStatus");
  dom.selectedDateDescription = document.getElementById("selectedDateDescription");
  dom.saveDateButton = document.getElementById("saveDateButton");

  dom.packageTabs = document.querySelectorAll(".segment-button");
  dom.packagePanels = document.querySelectorAll(".package-panel");

  dom.estimateEventType = document.getElementById("estimateEventType");
  dom.estimateWeddingDay = document.getElementById("estimateWeddingDay");
  dom.estimateHoursRange = document.getElementById("estimateHoursRange");
  dom.estimateHoursValue = document.getElementById("estimateHoursValue");
  dom.estimateCeremony = document.getElementById("estimateCeremony");
  dom.estimateCoordination = document.getElementById("estimateCoordination");
  dom.estimateBartending = document.getElementById("estimateBartending");
  dom.estimateExtraHours = document.getElementById("estimateExtraHours");
  dom.estimateBasePrice = document.getElementById("estimateBasePrice");
  dom.estimateAddOnPrice = document.getElementById("estimateAddOnPrice");
  dom.estimateTotalPrice = document.getElementById("estimateTotalPrice");
  dom.estimateSelections = document.getElementById("estimateSelections");
  dom.weddingDayField = document.getElementById("weddingDayField");
  dom.hourlyHoursField = document.getElementById("hourlyHoursField");
  dom.weddingAddOnFields = document.getElementById("weddingAddOnFields");
  dom.stepperButtons = document.querySelectorAll(".stepper-button");
  dom.heroOwnerImage = document.getElementById("heroOwnerImage");

  dom.eventSpaceCanvas = document.getElementById("eventSpaceCanvas");
  dom.floorplanShell = document.getElementById("floorplanShell");
  dom.addItemButtons = document.querySelectorAll("[data-item-type]");
  dom.presetButtons = document.querySelectorAll(".preset-button");
  dom.resetLayoutButton = document.getElementById("resetLayoutButton");
  dom.printLayoutButton = document.getElementById("printLayoutButton");
  dom.roundTableCount = document.getElementById("roundTableCount");
  dom.banquetTableCount = document.getElementById("banquetTableCount");
  dom.totalSeatingCount = document.getElementById("totalSeatingCount");
  dom.headTableStatus = document.getElementById("headTableStatus");
  dom.layoutDensity = document.getElementById("layoutDensity");
  dom.layoutFlow = document.getElementById("layoutFlow");
  dom.layoutGeneratorForm = document.getElementById("layoutGeneratorForm");
  dom.layoutEventType = document.getElementById("layoutEventType");
  dom.layoutGuestCount = document.getElementById("layoutGuestCount");
  dom.layoutTableStyle = document.getElementById("layoutTableStyle");
  dom.layoutCateringStyle = document.getElementById("layoutCateringStyle");
  dom.layoutIncludeCeremony = document.getElementById("layoutIncludeCeremony");
  dom.layoutIncludeDanceFloor = document.getElementById("layoutIncludeDanceFloor");
  dom.layoutIncludeSweetheart = document.getElementById("layoutIncludeSweetheart");
  dom.layoutGuestCountSummary = document.getElementById("layoutGuestCountSummary");
  dom.layoutTableStyleSummary = document.getElementById("layoutTableStyleSummary");
  dom.layoutServiceSummary = document.getElementById("layoutServiceSummary");
  dom.layoutPresetName = document.getElementById("layoutPresetName");

  dom.assistantQuestionChips = document.getElementById("assistantQuestionChips");
  dom.assistantRelatedChips = document.getElementById("assistantRelatedChips");
  dom.assistantThread = document.getElementById("assistantThread");
  dom.assistantForm = document.getElementById("assistantForm");
  dom.assistantInput = document.getElementById("assistantInput");

  dom.summaryToggle = document.getElementById("summaryToggle");
  dom.summaryDrawer = document.getElementById("summaryDrawer");
  dom.summaryClose = document.getElementById("summaryClose");
  dom.summaryEmptyState = document.getElementById("summaryEmptyState");
  dom.summaryContent = document.getElementById("summaryContent");
  dom.summaryEventType = document.getElementById("summaryEventType");
  dom.summaryDate = document.getElementById("summaryDate");
  dom.summaryPrice = document.getElementById("summaryPrice");
  dom.summaryAddOns = document.getElementById("summaryAddOns");
  dom.summaryLayout = document.getElementById("summaryLayout");
  dom.summaryGuests = document.getElementById("summaryGuests");
  dom.summarySeating = document.getElementById("summarySeating");
  dom.printSummaryButton = document.getElementById("printSummaryButton");
  dom.printSummaryContent = document.getElementById("printSummaryContent");

  dom.inquiryForm = document.getElementById("inquiryForm");
  dom.inquiryName = document.getElementById("inquiryName");
  dom.inquiryEmail = document.getElementById("inquiryEmail");
  dom.inquiryPhone = document.getElementById("inquiryPhone");
  dom.inquiryEventType = document.getElementById("inquiryEventType");
  dom.inquiryDate = document.getElementById("inquiryDate");
  dom.inquiryGuests = document.getElementById("inquiryGuests");
  dom.inquiryMessage = document.getElementById("inquiryMessage");
  dom.formSuccessMessage = document.getElementById("formSuccessMessage");
  dom.successSummary = document.getElementById("successSummary");

  dom.mobileMenuToggle = document.getElementById("mobileMenuToggle");
  dom.siteNav = document.getElementById("siteNav");
  dom.backToTop = document.getElementById("backToTop");
  dom.currentYear = document.getElementById("currentYear");
  dom.journeySteps = document.querySelectorAll(".journey-step");
}

function setupHeroImageFallback() {
  if (!dom.heroOwnerImage) return;

  dom.heroOwnerImage.addEventListener("error", () => {
    const fallbackSrc = dom.heroOwnerImage.dataset.fallback;
    if (fallbackSrc && dom.heroOwnerImage.src !== fallbackSrc) {
      dom.heroOwnerImage.src = fallbackSrc;
    }
  });
}

function setupNavigation() {
  dom.mobileMenuToggle.addEventListener("click", () => {
    const isOpen = dom.siteNav.classList.toggle("open");
    dom.mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      dom.siteNav.classList.remove("open");
      dom.mobileMenuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("scroll", () => {
    dom.backToTop.classList.toggle("visible", window.scrollY > 500);
  });

  dom.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function renderCalendar() {
  const year = state.calendarDate.getFullYear();
  const month = state.calendarDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const startingDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  dom.calendarMonthLabel.textContent = monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  dom.calendarGrid.innerHTML = "";

  for (let index = 0; index < startingDay; index += 1) {
    const filler = document.createElement("button");
    filler.className = "calendar-day empty";
    filler.disabled = true;
    dom.calendarGrid.appendChild(filler);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const iso = toIsoDate(date);
    const statusInfo = getCalendarStatus(iso);
    const dayButton = document.createElement("button");
    dayButton.className = `calendar-day ${statusInfo.status}`;
    if (state.selectedDate === iso) {
      dayButton.classList.add("selected");
    }
    dayButton.innerHTML = `<span class="calendar-day-number">${day}</span><span class="calendar-day-status">${capitalize(statusInfo.status)}</span>`;
    dayButton.addEventListener("click", () => selectCalendarDate(iso, statusInfo));
    dom.calendarGrid.appendChild(dayButton);
  }

  dom.calendarPrev.onclick = () => {
    state.calendarDate = new Date(year, month - 1, 1);
    renderCalendar();
  };
  dom.calendarNext.onclick = () => {
    state.calendarDate = new Date(year, month + 1, 1);
    renderCalendar();
  };
}

function getCalendarStatus(iso) {
  return (
    calendarStatusData[iso] || {
      status: "available",
      note: "This date is currently open for weddings, social gatherings, or corporate events."
    }
  );
}

function selectCalendarDate(iso, statusInfo) {
  state.selectedDate = iso;
  state.selectedDateStatus = statusInfo.status;
  state.selectedDateDescription = statusInfo.note;

  dom.selectedDateLabel.textContent = formatLongDate(iso);
  dom.selectedDateStatus.textContent = capitalize(statusInfo.status);
  dom.selectedDateStatus.className = `status-pill ${statusInfo.status}`;
  dom.selectedDateDescription.textContent = statusInfo.note;
  dom.saveDateButton.disabled = false;
  renderCalendar();
  updateJourneyProgress();
}

function setupPackageTabs() {
  dom.packageTabs.forEach((button) => {
    button.addEventListener("click", () => {
      dom.packageTabs.forEach((tab) => tab.classList.remove("active"));
      dom.packagePanels.forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.panel).classList.add("active");
      markJourneyStep("packages", true);
    });
  });
}

function setupEstimator() {
  const updateAll = () => {
    state.estimate.eventType = dom.estimateEventType.value;
    state.estimate.weddingDay = dom.estimateWeddingDay.value;
    state.estimate.hours = Number(dom.estimateHoursRange.value);
    state.estimate.ceremony = dom.estimateCeremony.checked;
    state.estimate.coordination = dom.estimateCoordination.checked;
    state.estimate.bartending = dom.estimateBartending.checked;
    state.estimate.extraHours = Math.max(0, Number(dom.estimateExtraHours.value) || 0);

    dom.estimateHoursValue.textContent = String(state.estimate.hours);

    const isWedding = state.estimate.eventType === "wedding";
    dom.weddingDayField.classList.toggle("is-hidden", !isWedding);
    dom.weddingAddOnFields.classList.toggle("is-hidden", !isWedding);
    dom.hourlyHoursField.classList.toggle("is-hidden", isWedding);

    if (isWedding) {
      const base = PRICING.wedding[state.estimate.weddingDay];
      let addOns = 0;
      const labels = [state.estimate.weddingDay + " wedding package"];
      if (state.estimate.ceremony) {
        addOns += PRICING.wedding.ceremony;
        labels.push("Ceremony add-on");
      }
      if (state.estimate.coordination) {
        addOns += PRICING.wedding.coordination;
        labels.push("Day-of coordination");
      }
      if (state.estimate.bartending) {
        addOns += PRICING.wedding.bartending;
        labels.push("Bartending");
      }
      if (state.estimate.extraHours > 0) {
        addOns += state.estimate.extraHours * PRICING.wedding.extraHour;
        labels.push(`${state.estimate.extraHours} extra hour${state.estimate.extraHours > 1 ? "s" : ""}`);
      }
      state.estimate.base = base;
      state.estimate.addOns = addOns;
      state.estimate.total = base + addOns;
      state.estimate.addOnLabels = labels;
    } else {
      const base = state.estimate.hours * PRICING.hourlyRate;
      const labels = [`${capitalize(state.estimate.eventType)} event hourly rental`, `${state.estimate.hours} hour${state.estimate.hours > 1 ? "s" : ""}`];
      state.estimate.base = base;
      state.estimate.addOns = 0;
      state.estimate.total = base;
      state.estimate.addOnLabels = labels;
      dom.estimateCeremony.checked = false;
      dom.estimateCoordination.checked = false;
      dom.estimateBartending.checked = false;
      dom.estimateExtraHours.value = 0;
      state.estimate.ceremony = false;
      state.estimate.coordination = false;
      state.estimate.bartending = false;
      state.estimate.extraHours = 0;
    }

    dom.estimateBasePrice.textContent = formatCurrency(state.estimate.base);
    dom.estimateAddOnPrice.textContent = formatCurrency(state.estimate.addOns);
    dom.estimateTotalPrice.textContent = formatCurrency(state.estimate.total);
    dom.estimateSelections.innerHTML = "";
    state.estimate.addOnLabels.forEach((label) => {
      const tag = document.createElement("li");
      tag.textContent = label;
      dom.estimateSelections.appendChild(tag);
    });

    updateSavedSummary({
      eventType: formatEventTypeLabel(state.estimate.eventType),
      estimatedPrice: formatCurrency(state.estimate.total),
      addOns: getEstimatorAddOnSummary()
    });
    updateJourneyProgress();
  };

  dom.estimateEventType.addEventListener("change", updateAll);
  dom.estimateWeddingDay.addEventListener("change", updateAll);
  dom.estimateHoursRange.addEventListener("input", updateAll);
  dom.estimateCeremony.addEventListener("change", updateAll);
  dom.estimateCoordination.addEventListener("change", updateAll);
  dom.estimateBartending.addEventListener("change", updateAll);
  dom.estimateExtraHours.addEventListener("input", updateAll);
  dom.stepperButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const current = Number(dom.estimateExtraHours.value) || 0;
      const next = button.dataset.stepper === "increase" ? current + 1 : current - 1;
      dom.estimateExtraHours.value = String(Math.min(8, Math.max(0, next)));
      updateAll();
    });
  });

  dom.saveDateButton.addEventListener("click", () => {
    if (!state.selectedDate) return;
    updateSavedSummary({ selectedDate: formatLongDate(state.selectedDate) });
    dom.inquiryDate.value = state.selectedDate;
    markJourneyStep("date", true);
  });

  updateAll();
}

function getEstimatorAddOnSummary() {
  const labels = [];
  if (state.estimate.eventType === "wedding") {
    if (state.estimate.ceremony) labels.push("Ceremony");
    if (state.estimate.coordination) labels.push("Coordination");
    if (state.estimate.bartending) labels.push("Bartending");
    if (state.estimate.extraHours) labels.push(`${state.estimate.extraHours} extra hour${state.estimate.extraHours > 1 ? "s" : ""}`);
  } else {
    labels.push(`${state.estimate.hours} hour${state.estimate.hours > 1 ? "s" : ""} rental`);
  }
  return labels.length ? labels.join(", ") : "None selected";
}

function triggerEstimatorRefresh() {
  dom.estimateEventType.dispatchEvent(new Event("change"));
}

function setupLayoutPlanner() {
  dom.resetLayoutButton.addEventListener("click", resetLayout);
  dom.printLayoutButton.addEventListener("click", () => {
    setPrintMode("layout");
    window.print();
  });
  window.addEventListener("afterprint", clearPrintMode);
  window.addEventListener("resize", clampAllLayoutItemsToCanvas);

  if (dom.layoutGeneratorForm) {
    dom.layoutGeneratorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      generateLayoutFromInputs();
    });

    [
      dom.layoutEventType,
      dom.layoutGuestCount,
      dom.layoutTableStyle,
      dom.layoutCateringStyle,
      dom.layoutIncludeCeremony,
      dom.layoutIncludeDanceFloor,
      dom.layoutIncludeSweetheart
    ].forEach((field) => {
      if (!field) return;
      field.addEventListener("change", generateLayoutFromInputs);
      if (field.tagName === "INPUT" && field.type === "number") {
        field.addEventListener("input", generateLayoutFromInputs);
      }
    });
  }

  generateLayoutFromInputs();
}

function syncLayoutPreferencesFromInputs() {
  if (!dom.layoutEventType) return;

  state.layoutPreferences = {
    eventType: dom.layoutEventType.value,
    guestCount: clamp(Number(dom.layoutGuestCount.value) || 120, 20, 200),
    tableStyle: dom.layoutTableStyle.value,
    cateringStyle: dom.layoutCateringStyle.value,
    headStyle: dom.layoutHeadStyle ? dom.layoutHeadStyle.value : "none",
    includeCeremony: dom.layoutIncludeCeremony.checked,
    includeBuffet: dom.layoutCateringStyle.value === "buffet",
    includeCookieTable: false,
    includeDanceFloor: dom.layoutIncludeDanceFloor.checked,
    includeGiftTable: false,
    keepOpenBarSide: true
  };

  dom.layoutGuestCount.value = String(state.layoutPreferences.guestCount);
}

function calculateTableCount(guestCount) {
  return Math.ceil(guestCount / 8);
}

function clearExistingLayout() {
  state.layoutItems = [];
}

function placeSweetheartTable(addItem) {
  addItem("sweetheart", 154, 468);
}

function placeDanceFloor(addItem) {
  addItem("dance", 98, 202);
}

function placeBuffetTables(addItem) {
  addItem("buffet", 266, 220, "Buffet");
}

function placeSupportTables(addItem, preferences) {
  addItem("gift", 44, 470);
  addItem("cookie", 236, 470, "Cookie Table");

  if (preferences.cateringStyle === "buffet") {
    placeBuffetTables(addItem);
  }
}

function generateRoundTableLayout(tableCount) {
  const positions = [
    [42, 44], [170, 44], [298, 44], [426, 44],
    [42, 146], [170, 146], [298, 146], [426, 146],
    [42, 342], [170, 342], [298, 342], [426, 342],
    [42, 444], [170, 444], [298, 444], [426, 444],
    [554, 146], [554, 250], [554, 354], [554, 458]
  ];
  return positions.slice(0, tableCount).map(([x, y]) => ({ type: "round", x, y }));
}

function generateBanquetLayout(tableCount) {
  const positions = [
    [28, 28], [28, 96], [28, 164],
    [254, 188], [254, 256],
    [28, 368], [28, 436],
    [254, 28], [254, 96], [254, 368], [254, 436],
    [470, 28], [470, 96], [470, 368], [470, 436]
  ];
  return positions.slice(0, tableCount).map(([x, y]) => ({ type: "banquet", x, y }));
}

function generateMixedLayout(tableCount) {
  const mixedOrder = [
    { type: "banquet", x: 28, y: 28 },
    { type: "banquet", x: 28, y: 96 },
    { type: "round", x: 300, y: 48 },
    { type: "round", x: 426, y: 48 },
    { type: "round", x: 300, y: 352 },
    { type: "round", x: 426, y: 352 },
    { type: "banquet", x: 28, y: 368 },
    { type: "banquet", x: 28, y: 436 },
    { type: "round", x: 554, y: 146 },
    { type: "round", x: 554, y: 354 }
  ];
  return mixedOrder.slice(0, tableCount);
}

function renderLayout(items) {
  items.forEach((item) => addLayoutItem(item.type, item.x, item.y, item.label || ""));
}

function generateLayoutFromInputs() {
  syncLayoutPreferencesFromInputs();
  clearExistingLayout();
  state.activeLayoutPreset = "Custom Generated Layout";

  const preferences = state.layoutPreferences;
  const tableCount = calculateTableCount(preferences.guestCount);

  const addItem = (type, x, y, labelOverride = "") => {
    addLayoutItem(type, x, y, labelOverride);
  };

  if (preferences.includeCeremony && preferences.eventType === "wedding") {
    addItem("altar", 76, 58, "Ceremony Focus");
    [122, 160, 198, 236].forEach((y) => addItem("ceremonyRow", 44, y));
  }

  if (preferences.headStyle === "sweetheart") placeSweetheartTable(addItem);

  if (preferences.includeDanceFloor) placeDanceFloor(addItem);

  placeSupportTables(addItem, preferences);

  let layoutItems = [];
  if (preferences.tableStyle === "round") {
    layoutItems = generateRoundTableLayout(tableCount);
  } else if (preferences.tableStyle === "banquet") {
    layoutItems = generateBanquetLayout(tableCount);
  } else {
    layoutItems = generateMixedLayout(tableCount);
  }

  renderLayout(layoutItems);

  clampAllLayoutItemsToCanvas();
  updateLayoutSummary();
  markJourneyStep("layout", true);
}

function addLayoutItem(type, x = 28, y = 28, labelOverride = "") {
  const config = itemConfig[type];
  if (!config) return;
  const position = clampPositionToCanvas(x, y, config.width, config.height);
  const item = {
    id: `${type}-${Date.now()}-${Math.round(Math.random() * 9999)}`,
    type,
    x: position.x,
    y: position.y,
    width: config.width,
    height: config.height,
    label: labelOverride || config.label,
    seats: config.seats
  };
  state.layoutItems.push(item);
  renderLayoutItems();
  updateLayoutSummary();
}

function renderLayoutItems() {
  dom.eventSpaceCanvas.innerHTML = "";
  dom.eventSpaceCanvas.classList.toggle("empty", state.layoutItems.length === 0);
  state.layoutItems.forEach((item) => {
    const config = itemConfig[item.type];
    const element = document.createElement("div");
    element.className = `layout-item ${config.className}`;
    if (state.draggedItemId === item.id) {
      element.classList.add("dragging");
    }
    element.style.left = `${item.x}px`;
    element.style.top = `${item.y}px`;
    element.style.width = `${item.width}px`;
    element.style.height = `${item.height}px`;
    element.dataset.itemId = item.id;
    element.innerHTML = `<span>${item.label}</span><button class="remove-item" aria-label="Remove ${item.label}" data-remove-id="${item.id}" type="button">&times;</button>`;
    element.addEventListener("pointerdown", startDrag);
    dom.eventSpaceCanvas.appendChild(element);
  });

  dom.eventSpaceCanvas.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      removeLayoutItem(button.dataset.removeId);
    });
  });
}

function startDrag(event) {
  if (event.target.closest(".remove-item")) return;
  const itemId = event.currentTarget.dataset.itemId;
  const item = state.layoutItems.find((entry) => entry.id === itemId);
  if (!item) return;

  state.draggedItemId = itemId;
  event.currentTarget.classList.add("dragging");
  const rect = dom.eventSpaceCanvas.getBoundingClientRect();
  const offsetX = event.clientX - rect.left - item.x;
  const offsetY = event.clientY - rect.top - item.y;

  const move = (moveEvent) => {
    const targetItem = state.layoutItems.find((entry) => entry.id === itemId);
    if (!targetItem) return;
    let nextX = moveEvent.clientX - rect.left - offsetX;
    let nextY = moveEvent.clientY - rect.top - offsetY;
    nextX = clamp(nextX, 0, rect.width - targetItem.width);
    nextY = clamp(nextY, 0, rect.height - targetItem.height);
    targetItem.x = nextX;
    targetItem.y = nextY;
    renderLayoutItems();
  };

  const stop = () => {
    state.draggedItemId = null;
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", stop);
    const activeElement = dom.eventSpaceCanvas.querySelector(`[data-item-id="${itemId}"]`);
    if (activeElement) activeElement.classList.remove("dragging");
    updateLayoutSummary();
  };

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", stop);
}

function removeLayoutItem(itemId) {
  state.layoutItems = state.layoutItems.filter((item) => item.id !== itemId);
  renderLayoutItems();
  updateLayoutSummary();
}

function resetLayout() {
  state.layoutItems = [];
  state.activeLayoutPreset = "";
  state.plannerGuideStep = "start";
  dom.presetButtons.forEach((button) => button.classList.remove("active"));
  renderLayoutItems();
  updateLayoutSummary();
  updateSavedSummary({ preferredLayout: "Not selected" });
}

function applyPreset(presetKey) {
  state.layoutItems = [];
  dom.presetButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === presetKey);
  });
  dom.floorplanShell.classList.add("loading-flash");
  window.setTimeout(() => dom.floorplanShell.classList.remove("loading-flash"), 700);

  const presets = {
    "wedding-reception": [
      { type: "head", x: 432, y: 44 },
      { type: "dance", x: 188, y: 148 },
      { type: "gift", x: 398, y: 308 },
      { type: "dessert", x: 505, y: 308 },
      { type: "round", x: 52, y: 42 },
      { type: "round", x: 165, y: 38 },
      { type: "round", x: 286, y: 40 },
      { type: "round", x: 50, y: 270 },
      { type: "round", x: 170, y: 272 },
      { type: "round", x: 292, y: 272 },
      { type: "round", x: 548, y: 166 }
    ],
    "ceremony-reception": [
      { type: "altar", x: 76, y: 58, label: "Ceremony Focus" },
      { type: "ceremonyRow", x: 44, y: 122 },
      { type: "ceremonyRow", x: 44, y: 160 },
      { type: "ceremonyRow", x: 44, y: 198 },
      { type: "ceremonyRow", x: 44, y: 236 },
      { type: "dance", x: 316, y: 154 },
      { type: "sweetheart", x: 500, y: 60 },
      { type: "round", x: 422, y: 194 },
      { type: "round", x: 540, y: 194 },
      { type: "round", x: 422, y: 298 },
      { type: "round", x: 540, y: 298 }
    ],
    "social-shower": [
      { type: "gift", x: 444, y: 94 },
      { type: "dessert", x: 552, y: 94 },
      { type: "round", x: 96, y: 100 },
      { type: "round", x: 226, y: 100 },
      { type: "round", x: 122, y: 254 },
      { type: "round", x: 262, y: 258 },
      { type: "sweetheart", x: 462, y: 264, label: "Host Table" }
    ],
    corporate: [
      { type: "presentation", x: 474, y: 60, label: "Presentation Zone" },
      { type: "banquet", x: 74, y: 82 },
      { type: "banquet", x: 228, y: 82 },
      { type: "banquet", x: 74, y: 162 },
      { type: "banquet", x: 228, y: 162 },
      { type: "banquet", x: 74, y: 244 },
      { type: "banquet", x: 228, y: 244 },
      { type: "dessert", x: 506, y: 280, label: "Refreshments" }
    ]
  };

  const presetNames = {
    "wedding-reception": "Wedding Reception Layout",
    "ceremony-reception": "Ceremony + Reception Layout",
    "social-shower": "Shower / Social Event Layout",
    corporate: "Corporate Event Layout"
  };

  (presets[presetKey] || []).forEach((item) => {
    addLayoutItem(item.type, item.x, item.y, item.label || "");
  });

  state.activeLayoutPreset = presetNames[presetKey] || "";
  updateSavedSummary({ preferredLayout: state.activeLayoutPreset });
}

function applyPresetByName(name) {
  const mapping = {
    "Wedding Reception Layout": "wedding-reception",
    "Ceremony + Reception Layout": "ceremony-reception",
    "Shower / Social Event Layout": "social-shower",
    "Corporate Event Layout": "corporate"
  };
  if (mapping[name]) {
    applyPreset(mapping[name]);
  }
}

function updateLayoutSummary() {
  const counts = {
    round: 0,
    banquet: 0,
    dance: 0,
    headOrSweetheart: 0,
    seating: 0
  };

  state.layoutItems.forEach((item) => {
    if (item.type === "round") counts.round += 1;
    if (item.type === "banquet" || item.type === "ceremonyRow") counts.banquet += item.type === "banquet" ? 1 : 0;
    if (item.type === "dance") counts.dance += 1;
    if (item.type === "head" || item.type === "sweetheart") counts.headOrSweetheart += 1;
    counts.seating += item.seats;
  });

  if (dom.roundTableCount) dom.roundTableCount.textContent = String(counts.round);
  if (dom.banquetTableCount) dom.banquetTableCount.textContent = String(counts.banquet);
  if (dom.totalSeatingCount) dom.totalSeatingCount.textContent = String(counts.seating);
  if (dom.danceFloorStatus) dom.danceFloorStatus.textContent = counts.dance ? "Yes" : "No";
  if (dom.headTableStatus) dom.headTableStatus.textContent = counts.headOrSweetheart ? "Yes" : "No";
  if (dom.layoutGuestCountSummary) dom.layoutGuestCountSummary.textContent = `${state.layoutPreferences.guestCount} guests`;
  if (dom.layoutTableStyleSummary) {
    const tableStyleLabels = {
      round: "Mostly round tables",
      banquet: "Mostly long tables",
      mixed: "Balanced mix"
    };
    dom.layoutTableStyleSummary.textContent = tableStyleLabels[state.layoutPreferences.tableStyle] || "Custom";
  }
  if (dom.layoutServiceSummary) {
    const serviceLabels = [];
    if (state.layoutPreferences.includeCeremony) serviceLabels.push("Ceremony");
    if (state.layoutPreferences.includeBuffet) serviceLabels.push("Buffet");
    if (state.layoutPreferences.includeCookieTable) serviceLabels.push("Cookie table");
    if (state.layoutPreferences.includeGiftTable) serviceLabels.push("Gift table");
    if (state.layoutPreferences.includeDanceFloor) serviceLabels.push("Dance floor");
    dom.layoutServiceSummary.textContent = serviceLabels.length ? serviceLabels.join(", ") : "None selected";
  }
  if (dom.layoutPresetName) dom.layoutPresetName.textContent = state.activeLayoutPreset || "Not started";
  if (dom.layoutDensity) {
    dom.layoutDensity.textContent =
      counts.seating >= 140 ? "High" : counts.seating >= 64 ? "Balanced" : counts.seating > 0 ? "Open" : "Not started";
  }
  if (dom.layoutFlow) {
    dom.layoutFlow.textContent =
      state.activeLayoutPreset
        ? "Preset-guided circulation"
        : counts.seating > 0
          ? "Custom circulation in progress"
          : "Select a preset to begin";
  }

  if (dom.plannerTips) {
    dom.plannerTips.innerHTML = `
      <li>Maintain a clear path from the Main Entrance into the center of the Main Event Space.</li>
      <li>${counts.seating > 120 ? "Use wider circulation aisles for larger guest counts and keep the right-side service path open." : "Leave open space for mingling and transitions, especially near the lower entrance edge."}</li>
      <li>${state.activeLayoutPreset ? `Current preset: ${state.activeLayoutPreset}. Keep kitchen/bar access open along the upper-right edge.` : "Choose a preset for a faster starting point and then fine-tune tables around the main focal zone."}</li>
    `;
  }

  if (dom.plannerGuideText && dom.plannerGuideAction) {
    if (!state.layoutItems.length) {
      dom.plannerGuideText.textContent = "Start with a preset layout to place a focal point, guest seating, and circulation zones in a realistic Gracewood flow.";
      dom.plannerGuideAction.textContent = "Apply a Starter Layout";
    } else if (!state.savedSummary.selectedDate || state.savedSummary.selectedDate === "Not selected") {
      dom.plannerGuideText.textContent = "Your layout is taking shape. Pair it with an availability check so your preferred plan and preferred date move together.";
      dom.plannerGuideAction.textContent = "Open Saved Summary";
    } else {
      dom.plannerGuideText.textContent = "You have both a working layout and a planning direction. Review your saved summary, then move into inquiry when ready.";
      dom.plannerGuideAction.textContent = "Review Saved Summary";
    }
  }

  updateSavedSummary({
    layoutSeating: `${counts.seating} guests`,
    preferredLayout: state.activeLayoutPreset || state.savedSummary.preferredLayout || "Not selected"
  });
  updateJourneyProgress();
}

function setupAssistant() {
  dom.assistantQuestionChips.innerHTML = "";
  assistantKnowledge.forEach((entry) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "question-chip subtle";
    chip.textContent = entry.question;
    chip.addEventListener("click", () => askAssistant(entry.question));
    dom.assistantQuestionChips.appendChild(chip);
  });

  const welcomeQuestion = "What makes Gracewood different?";
  askAssistant(welcomeQuestion, true);

  dom.assistantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = dom.assistantInput.value.trim();
    if (!value) return;
    askAssistant(value);
    dom.assistantInput.value = "";
  });
}

function askAssistant(input, silentUser = false) {
  const knowledge = matchAssistantAnswer(input);
  if (!silentUser) {
    appendAssistantMessage("user", input);
  }
  appendAssistantMessage("assistant", knowledge.answer);
  renderRelatedQuestions(knowledge.question);
  markJourneyStep("packages", true);
}

function matchAssistantAnswer(input) {
  const normalized = input.toLowerCase();
  const directMatch = assistantKnowledge.find((entry) => entry.question.toLowerCase() === normalized);
  if (directMatch) return directMatch;

  const keywordMatch = assistantKnowledge.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (keywordMatch) {
    const recommendationAddon =
      state.savedSummary.eventType && state.savedSummary.estimatedPrice
        ? ` Based on your current plan, Gracewood is trending toward a ${state.savedSummary.eventType.toLowerCase()} estimate of ${state.savedSummary.estimatedPrice}.`
        : "";
    const layoutPrompt =
      state.savedSummary.preferredLayout && state.savedSummary.preferredLayout !== "Not selected"
        ? ` Your saved layout is currently ${state.savedSummary.preferredLayout}.`
        : " If you want to picture the room more clearly, try one of the preset layouts in the planner.";

    return {
      question: keywordMatch.question,
      answer:
        keywordMatch.answer +
        recommendationAddon +
        layoutPrompt +
        " If you are ready, use the inquiry form to share your details and continue the conversation."
    };
  }

  return {
    question: "Planning guidance",
    answer:
      "Gracewood can help you check availability, compare pricing, visualize your layout, and prepare an inquiry. Try asking about guest count, pricing, layout customization, or what makes Gracewood different."
  };
}

function appendAssistantMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `assistant-message ${role}`;
  bubble.innerHTML = `<span class="assistant-role">${role === "assistant" ? "Gracewood Assistant" : "You"}</span><p>${text}</p>`;
  dom.assistantThread.appendChild(bubble);
  dom.assistantThread.scrollTop = dom.assistantThread.scrollHeight;
}

function renderRelatedQuestions(question) {
  dom.assistantRelatedChips.innerHTML = "";
  (relatedQuestionMap[question] || assistantKnowledge.slice(0, 2).map((entry) => entry.question)).forEach((related) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "question-chip";
    chip.textContent = related;
    chip.addEventListener("click", () => askAssistant(related));
    dom.assistantRelatedChips.appendChild(chip);
  });
}

function setupSummaryDrawer() {
  dom.summaryToggle.addEventListener("click", () => toggleSummaryDrawer(true));
  dom.summaryClose.addEventListener("click", () => toggleSummaryDrawer(false));
  dom.printSummaryButton.addEventListener("click", printSummary);
}

function toggleSummaryDrawer(open) {
  dom.summaryDrawer.classList.toggle("open", open);
  dom.summaryDrawer.setAttribute("aria-hidden", String(!open));
}

function updateSavedSummary(partial) {
  state.savedSummary = {
    eventType: partial.eventType ?? state.savedSummary.eventType ?? "Not selected",
    selectedDate: partial.selectedDate ?? state.savedSummary.selectedDate ?? "Not selected",
    estimatedPrice: partial.estimatedPrice ?? state.savedSummary.estimatedPrice ?? "Not selected",
    addOns: partial.addOns ?? state.savedSummary.addOns ?? "None yet",
    preferredLayout: partial.preferredLayout ?? state.savedSummary.preferredLayout ?? "Not selected",
    guestCount: partial.guestCount ?? state.savedSummary.guestCount ?? "Not selected",
    layoutSeating: partial.layoutSeating ?? state.savedSummary.layoutSeating ?? "0 guests"
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedSummary));
  hydrateSummary();
}

function hydrateSummary() {
  const hasMeaningfulData = Object.values(state.savedSummary || {}).some(
    (value) => value && value !== "Not selected" && value !== "None yet" && value !== "0 guests"
  );

  dom.summaryEmptyState.hidden = hasMeaningfulData;
  dom.summaryContent.hidden = !hasMeaningfulData;
  dom.summaryEventType.textContent = state.savedSummary.eventType || "Not selected";
  dom.summaryDate.textContent = state.savedSummary.selectedDate || "Not selected";
  dom.summaryPrice.textContent = state.savedSummary.estimatedPrice || "Not selected";
  dom.summaryAddOns.textContent = state.savedSummary.addOns || "None yet";
  dom.summaryLayout.textContent = state.savedSummary.preferredLayout || "Not selected";
  dom.summaryGuests.textContent = state.savedSummary.guestCount || "Not selected";
  dom.summarySeating.textContent = state.savedSummary.layoutSeating || "0 guests";
}

function printSummary() {
  const summary = state.savedSummary;
  setPrintMode("summary");
  dom.printSummaryContent.innerHTML = `
    <div class="print-summary-grid">
      <div><strong>Event type:</strong> ${summary.eventType || "Not selected"}</div>
      <div><strong>Selected date:</strong> ${summary.selectedDate || "Not selected"}</div>
      <div><strong>Estimated guest count:</strong> ${summary.guestCount || "Not selected"}</div>
      <div><strong>Selected add-ons:</strong> ${summary.addOns || "None yet"}</div>
      <div><strong>Estimated price:</strong> ${summary.estimatedPrice || "Not selected"}</div>
      <div><strong>Preferred layout:</strong> ${summary.preferredLayout || "Not selected"}</div>
      <div><strong>Layout stats:</strong> ${summary.layoutSeating || "0 guests"}</div>
    </div>
  `;
  window.print();
}

function setPrintMode(mode) {
  document.body.dataset.printMode = mode;
  document.body.classList.remove("print-summary-mode", "print-layout-mode");
  document.body.classList.add(`print-${mode}-mode`);
}

function clearPrintMode() {
  delete document.body.dataset.printMode;
  document.body.classList.remove("print-summary-mode", "print-layout-mode");
}

function setupInquiryForm() {
  dom.inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const details = {
      name: dom.inquiryName.value.trim(),
      email: dom.inquiryEmail.value.trim(),
      phone: dom.inquiryPhone.value.trim(),
      eventType: dom.inquiryEventType.value,
      date: dom.inquiryDate.value,
      guests: dom.inquiryGuests.value,
      message: dom.inquiryMessage.value.trim()
    };

    updateSavedSummary({
      eventType: details.eventType,
      selectedDate: details.date ? formatLongDate(details.date) : state.savedSummary.selectedDate,
      guestCount: details.guests ? `${details.guests} guests` : state.savedSummary.guestCount
    });

    dom.inquiryForm.hidden = true;
    dom.formSuccessMessage.hidden = false;
    dom.successSummary.innerHTML = `
      <div class="success-summary-grid">
        <div><strong>Name:</strong> ${details.name}</div>
        <div><strong>Email:</strong> ${details.email}</div>
        <div><strong>Phone:</strong> ${details.phone}</div>
        <div><strong>Event type:</strong> ${details.eventType}</div>
        <div><strong>Preferred date:</strong> ${details.date ? formatLongDate(details.date) : "Not specified"}</div>
        <div><strong>Guest count:</strong> ${details.guests}</div>
        <div><strong>Planning summary:</strong> ${state.savedSummary.estimatedPrice || "Estimate not built yet"}</div>
        <div><strong>Message:</strong> ${details.message}</div>
      </div>
      <p class="success-followup">Thank you for your inquiry. We’ve received your event details and Gracewood will be in touch soon to discuss availability and next steps.</p>
    `;

    markJourneyStep("inquiry", true);
    toggleSummaryDrawer(true);
  });
}

function syncFormWithSummary() {
  if (state.savedSummary.eventType && state.savedSummary.eventType !== "Not selected") {
    const option = Array.from(dom.inquiryEventType.options).find(
      (entry) => entry.value.toLowerCase() === state.savedSummary.eventType.toLowerCase()
    );
    if (option) dom.inquiryEventType.value = option.value;
  }
  if (state.savedSummary.guestCount && state.savedSummary.guestCount.endsWith(" guests")) {
    const guests = Number.parseInt(state.savedSummary.guestCount, 10);
    if (!Number.isNaN(guests)) dom.inquiryGuests.value = String(guests);
  }
  if (state.selectedDate) {
    dom.inquiryDate.value = state.selectedDate;
  }
}

function setupScrollEffects() {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function markJourneyStep(step, active) {
  dom.journeySteps.forEach((card) => {
    if (card.dataset.step === step && active) {
      card.classList.add("active");
      const status = card.querySelector(".step-status");
      if (status) status.textContent = "Completed";
    }
  });
}

function updateJourneyProgress() {
  if (state.selectedDate) markJourneyStep("date", true);
  if (state.estimate.total > 0) markJourneyStep("packages", true);
  if (state.layoutItems.length > 0 || state.activeLayoutPreset) markJourneyStep("layout", true);
  if (!dom.formSuccessMessage.hidden) markJourneyStep("inquiry", true);
}

function setFooterYear() {
  dom.currentYear.textContent = String(new Date().getFullYear());
}

function loadSummary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatLongDate(iso) {
  const date = typeof iso === "string" ? new Date(`${iso}T00:00:00`) : iso;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatEventTypeLabel(value) {
  const labels = {
    wedding: "Wedding",
    social: "Social Event",
    corporate: "Corporate Event"
  };
  return labels[value] || capitalize(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampPositionToCanvas(x, y, width, height) {
  const rect = dom.eventSpaceCanvas.getBoundingClientRect();
  const maxX = Math.max(0, rect.width - width);
  const maxY = Math.max(0, rect.height - height);
  return {
    x: clamp(x, 0, maxX),
    y: clamp(y, 0, maxY)
  };
}

function clampAllLayoutItemsToCanvas() {
  if (!state.layoutItems.length) return;
  state.layoutItems = state.layoutItems.map((item) => {
    const position = clampPositionToCanvas(item.x, item.y, item.width, item.height);
    return { ...item, x: position.x, y: position.y };
  });
  renderLayoutItems();
}

function humanizeGuestRange(range) {
  const map = {
    "up-to-75": "Up to 75 guests",
    "75-150": "75 to 150 guests",
    "150-200": "150 to 200 guests"
  };
  return map[range] || "Not selected";
}

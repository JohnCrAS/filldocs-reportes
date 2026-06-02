const BRAND_CONFIG = {
  "la-calle": {
    name: "La Calle de las Sirenas",
    shortName: "La Calle",
    mark: "LC",
    monthlyGoal: 1000000,
    weeklyGoal: 250000,
    logoPath: "assets/logo-la-calle.webp?v=pptx-logo-2",
  },
};

const CATEGORIES = [
  { key: "repurchase", label: "Recompra" },
  { key: "service", label: "Secuencia de servicio" },
  { key: "experience", label: "Experiencia" },
  { key: "music", label: "Música" },
  { key: "perfectAccount", label: "Cuenta perfecta" },
  { key: "facilities", label: "Instalaciones" },
];

const SCORES = [
  { key: "service", label: "Secuencia de servicio", defaultValue: 100 },
  { key: "experience", label: "Experiencia", defaultValue: 100 },
  { key: "music", label: "Música", defaultValue: 100 },
  { key: "perfectAccount", label: "Cuenta perfecta", defaultValue: 100 },
  { key: "facilities", label: "Instalaciones", defaultValue: 100 },
  { key: "satisfaction", label: "Encuestas de satisfacción", defaultValue: 100 },
];

const STAFFING = [
  ["Gerente", 1],
  ["Capitanes", 2],
  ["Caja", 1],
  ["Cover", 1],
  ["Seguridad", 6],
  ["DJ residente", 1],
  ["Barra", 2],
  ["Meseros", 7],
  ["Garroteros", 3],
  ["Chef", 1],
  ["Ayte. de cocina", 1],
  ["Baños", 2],
];

const NARRATIVE_TABS = [
  { key: "worked", shortLabel: "Funcionó", label: "Qué funcionó y sirvió" },
  { key: "blocked", shortLabel: "Faltó", label: "Qué faltó o estorbó" },
  { key: "commitments", shortLabel: "Compromisos", label: "Nuevas posibilidades y compromisos" },
];

const RESULT_SELLERS = [
  "UNAI RODRIGUEZ",
  "PABLITO DUARTE",
  "OCTAVIO HERRERA",
  "MONSERRAT GARCIA",
  "MARIA DEL SOL",
  "LESLY NAVARRO",
  "JESUS CHAVEZ",
  "ISAAC LOPEZ",
  "FRANCISCO MIRANDA",
  "EDIXON GIMENEZ",
  "BRANDO ONTIVEROS",
];

const RDC_WEEK_COUNT = 5;

const AUTH_ACCOUNT = {
  username: "Ritchie68",
  password: "Sirenas2026!",
  accountId: "ritchie68",
};
const AUTH_SESSION_KEY = "filldocs-auth-session-v1";
const ACCOUNT_PREFIX = `filldocs-account-${AUTH_ACCOUNT.accountId}`;
const LEGACY_STORAGE_KEYS = {
  rdc: "rdc-la-calle-draft-v2",
  results: "resultados-enero-draft-v1",
};
const LEGACY_APP_STATE_KEY = "filldocs-la-calle-local-account-v1";
const STORAGE_KEYS = {
  rdc: `${ACCOUNT_PREFIX}-rdc-draft-v1`,
  results: `${ACCOUNT_PREFIX}-results-draft-v1`,
};
const APP_STATE_KEY = `${ACCOUNT_PREFIX}-state-v1`;

const documentTypeSelect = document.querySelector("#documentTypeSelect");
const brandSelect = document.querySelector("#brandSelect");
const reportForm = document.querySelector("#reportForm");
const resultsForm = document.querySelector("#resultsForm");
const report = document.querySelector("#report");
const weeksBody = document.querySelector("#weeksBody");
const scoreInputs = document.querySelector("#scoreInputs");
const narrativeFields = document.querySelector("#narrativeFields");
const staffBody = document.querySelector("#staffBody");
const sellerBody = document.querySelector("#sellerBody");
const draftStatus = document.querySelector("#draftStatus");
const topbarTitle = document.querySelector(".topbar h1");
const loginForm = document.querySelector("#loginForm");
const loginUser = document.querySelector("#loginUser");
const loginPassword = document.querySelector("#loginPassword");
const loginError = document.querySelector("#loginError");
const logoutButton = document.querySelector("#logoutButton");
let appReady = false;
let pendingPdfDelivery = null;

function money(value) {
  const number = Number(value) || 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: number % 1 === 0 ? 0 : 2,
  }).format(number);
}

function numberFormat(value) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function percent(value) {
  const number = Number.isFinite(value) ? value : 0;
  return `${Math.round(number * 100)}%`;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value) || 0;
}

function safeRatio(numerator, denominator) {
  const bottom = toNumber(denominator);
  return bottom > 0 ? toNumber(numerator) / bottom : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sentence(value, fallback = "Pendiente por capturar.") {
  const clean = String(value || "").trim();
  return clean ? escapeHtml(clean) : `<span class="empty-copy">${fallback}</span>`;
}

function makeDefaultRdc() {
  const brand = BRAND_CONFIG["la-calle"];
  return {
    brand: "la-calle",
    managerName: "",
    serviceLeader: "",
    weekLabel: "",
    periodLabel: "",
    monthlyGoal: brand.monthlyGoal,
    weeklyGoal: brand.weeklyGoal,
    previousRepurchase: "",
    previousSales: "",
    previousGuests: "",
    previousCheck: "",
    weeks: Array.from({ length: RDC_WEEK_COUNT }, (_, index) => ({
      label: `Semana ${index + 1}`,
      sales: "",
      goal: brand.weeklyGoal,
      guests: "",
      repurchase: "",
    })),
    scores: Object.fromEntries(SCORES.map((score) => [score.key, score.defaultValue])),
    notes: Object.fromEntries(
      NARRATIVE_TABS.map((tab) => [
        tab.key,
        Object.fromEntries(CATEGORIES.map((category) => [category.key, ""])),
      ]),
    ),
    staffing: STAFFING.map(([role, required]) => ({
      role,
      required,
      current: required,
    })),
  };
}

function makeDefaultResults() {
  return {
    brand: "la-calle",
    resultsManager: "",
    resultsTitle: "RESULTADOS DE ENERO 2026",
    resultsWeek: "Semana 4",
    resultsPeriod: "Del 19 al 25 de enero de 2026",
    resultsSalesGoal: 250000,
    sellers: RESULT_SELLERS.map((name) => ({
      name,
      sales: "",
      guests: "",
    })),
  };
}

function buildRdcForm() {
  weeksBody.innerHTML = Array.from({ length: RDC_WEEK_COUNT }, (_, index) => `
    <tr>
      <td><input data-week="${index}" data-field="label" aria-label="Semana ${index + 1}" /></td>
      <td><input data-week="${index}" data-field="sales" type="number" min="0" step="100" aria-label="Venta semana ${index + 1}" /></td>
      <td><input data-week="${index}" data-field="goal" type="number" min="0" step="100" aria-label="Meta semana ${index + 1}" /></td>
      <td><input data-week="${index}" data-field="guests" type="number" min="0" step="1" aria-label="PX semana ${index + 1}" /></td>
      <td><input data-week="${index}" data-field="repurchase" type="number" min="0" step="100" aria-label="Recompra semana ${index + 1}" /></td>
    </tr>
  `).join("");

  scoreInputs.innerHTML = SCORES.map((score) => `
    <div class="score-control">
      <header>
        <span>${score.label}</span>
        <output id="score-${score.key}">${score.defaultValue}%</output>
      </header>
      <input data-score="${score.key}" type="range" min="0" max="100" step="5" aria-label="${score.label}" />
    </div>
  `).join("");

  narrativeFields.innerHTML = NARRATIVE_TABS.map((tab, tabIndex) => `
    <div class="narrative-pane ${tabIndex === 0 ? "active" : ""}" data-pane="${tab.key}">
      ${CATEGORIES.map((category) => `
        <label>
          ${category.label}
          <textarea data-note-tab="${tab.key}" data-note-category="${category.key}" placeholder="${tab.label}"></textarea>
        </label>
      `).join("")}
    </div>
  `).join("");

  staffBody.innerHTML = STAFFING.map((staff, index) => `
    <tr>
      <td><input data-staff="${index}" data-field="role" aria-label="Puesto ${index + 1}" /></td>
      <td><input data-staff="${index}" data-field="required" type="number" min="0" step="1" aria-label="Plantilla requerida ${index + 1}" /></td>
      <td><input data-staff="${index}" data-field="current" type="number" min="0" step="1" aria-label="Plantilla actual ${index + 1}" /></td>
    </tr>
  `).join("");
}

function renderSellerRows(count) {
  sellerBody.innerHTML = Array.from({ length: count }, (_, index) => `
    <tr>
      <td><input data-seller="${index}" data-field="name" aria-label="Vendedor ${index + 1}" /></td>
      <td><input data-seller="${index}" data-field="sales" type="number" min="0" step="100" aria-label="Venta vendedor ${index + 1}" /></td>
      <td><input data-seller="${index}" data-field="guests" type="number" min="0" step="1" aria-label="PX vendedor ${index + 1}" /></td>
      <td><output data-seller-check="${index}" aria-label="Cheque promedio vendedor ${index + 1}">$0</output></td>
    </tr>
  `).join("");
}

function buildResultsForm() {
  renderSellerRows(RESULT_SELLERS.length);
}

function setRdcFormData(data) {
  const simpleFields = [
    "managerName",
    "serviceLeader",
    "weekLabel",
    "periodLabel",
    "monthlyGoal",
    "weeklyGoal",
    "previousRepurchase",
    "previousSales",
    "previousGuests",
    "previousCheck",
  ];

  simpleFields.forEach((name) => {
    const input = reportForm.elements[name];
    if (input) input.value = data[name] ?? "";
  });

  brandSelect.value = data.brand || "la-calle";

  const defaultWeeks = makeDefaultRdc().weeks;
  reportForm.querySelectorAll("[data-week]").forEach((input) => {
    const weekIndex = Number(input.dataset.week);
    const week = data.weeks?.[weekIndex] || defaultWeeks[weekIndex] || {};
    input.value = week[input.dataset.field] ?? "";
  });

  reportForm.querySelectorAll("[data-score]").forEach((input) => {
    const value = data.scores?.[input.dataset.score] ?? 0;
    input.value = value;
    document.querySelector(`#score-${input.dataset.score}`).textContent = `${value}%`;
  });

  reportForm.querySelectorAll("[data-note-tab]").forEach((input) => {
    input.value = data.notes?.[input.dataset.noteTab]?.[input.dataset.noteCategory] ?? "";
  });

  reportForm.querySelectorAll("[data-staff]").forEach((input) => {
    const staff = data.staffing?.[Number(input.dataset.staff)] || {};
    input.value = staff[input.dataset.field] ?? "";
  });
}

function setResultsFormData(data) {
  const simpleFields = [
    "resultsManager",
    "resultsTitle",
    "resultsWeek",
    "resultsPeriod",
    "resultsSalesGoal",
  ];

  simpleFields.forEach((name) => {
    const input = resultsForm.elements[name];
    if (input) input.value = data[name] ?? "";
  });

  renderSellerRows(Math.max(data.sellers?.length || 0, RESULT_SELLERS.length));
  resultsForm.querySelectorAll("[data-seller]").forEach((input) => {
    const seller = data.sellers?.[Number(input.dataset.seller)] || {};
    input.value = seller[input.dataset.field] ?? "";
  });
  updateSellerCheckOutputs();
}

function collectRdc() {
  const data = makeDefaultRdc();
  const simpleFields = [
    "managerName",
    "serviceLeader",
    "weekLabel",
    "periodLabel",
    "monthlyGoal",
    "weeklyGoal",
    "previousRepurchase",
    "previousSales",
    "previousGuests",
    "previousCheck",
  ];

  data.brand = brandSelect.value;
  simpleFields.forEach((name) => {
    data[name] = reportForm.elements[name]?.value ?? "";
  });

  data.weeks = Array.from({ length: RDC_WEEK_COUNT }, (_, index) => {
    const week = {};
    reportForm.querySelectorAll(`[data-week="${index}"]`).forEach((input) => {
      week[input.dataset.field] = input.value;
    });
    return week;
  });

  data.scores = {};
  reportForm.querySelectorAll("[data-score]").forEach((input) => {
    data.scores[input.dataset.score] = Number(input.value) || 0;
  });

  data.notes = Object.fromEntries(
    NARRATIVE_TABS.map((tab) => [
      tab.key,
      Object.fromEntries(CATEGORIES.map((category) => [category.key, ""])),
    ]),
  );
  reportForm.querySelectorAll("[data-note-tab]").forEach((input) => {
    data.notes[input.dataset.noteTab][input.dataset.noteCategory] = input.value;
  });

  data.staffing = Array.from({ length: STAFFING.length }, (_, index) => {
    const staff = {};
    reportForm.querySelectorAll(`[data-staff="${index}"]`).forEach((input) => {
      staff[input.dataset.field] = input.value;
    });
    return staff;
  });

  return data;
}

function collectResults() {
  const data = makeDefaultResults();
  const simpleFields = [
    "resultsManager",
    "resultsTitle",
    "resultsWeek",
    "resultsPeriod",
    "resultsSalesGoal",
  ];

  simpleFields.forEach((name) => {
    data[name] = resultsForm.elements[name]?.value ?? "";
  });

  const indexes = [
    ...new Set([...resultsForm.querySelectorAll("[data-seller]")].map((input) => Number(input.dataset.seller))),
  ];
  data.sellers = indexes.map((index) => {
    const seller = {};
    resultsForm.querySelectorAll(`[data-seller="${index}"]`).forEach((input) => {
      seller[input.dataset.field] = input.value;
    });
    return seller;
  });

  return data;
}

function updateSellerCheckOutputs() {
  resultsForm.querySelectorAll("[data-seller-check]").forEach((output) => {
    const index = output.dataset.sellerCheck;
    const sales = toNumber(resultsForm.querySelector(`[data-seller="${index}"][data-field="sales"]`)?.value);
    const guests = toNumber(resultsForm.querySelector(`[data-seller="${index}"][data-field="guests"]`)?.value);
    output.textContent = money(safeRatio(sales, guests));
  });
}

function calculateRdc(data) {
  const weeks = data.weeks.map((week) => {
    const sales = toNumber(week.sales);
    const goal = toNumber(week.goal);
    const guests = toNumber(week.guests);
    const repurchase = toNumber(week.repurchase);
    return {
      ...week,
      sales,
      goal,
      guests,
      repurchase,
      difference: goal - sales,
      completion: safeRatio(sales, goal),
      checkAverage: safeRatio(sales, guests),
    };
  });

  const totals = weeks.reduce(
    (acc, week) => {
      acc.sales += week.sales;
      acc.goal += week.goal;
      acc.guests += week.guests;
      acc.repurchase += week.repurchase;
      return acc;
    },
    { sales: 0, goal: 0, guests: 0, repurchase: 0 },
  );

  totals.difference = totals.goal - totals.sales;
  totals.completion = safeRatio(totals.sales, totals.goal);
  totals.checkAverage = safeRatio(totals.sales, totals.guests);

  const previous = {
    repurchase: toNumber(data.previousRepurchase),
    sales: toNumber(data.previousSales),
    guests: toNumber(data.previousGuests),
    checkAverage: toNumber(data.previousCheck),
  };
  if (!previous.checkAverage && previous.sales && previous.guests) {
    previous.checkAverage = previous.sales / previous.guests;
  }

  const scoreValues = SCORES.map((score) => ({
    ...score,
    value: toNumber(data.scores[score.key]),
  }));
  const scoreAverage = scoreValues.length
    ? scoreValues.reduce((sum, score) => sum + score.value, 0) / scoreValues.length
    : 0;

  const staffing = data.staffing.map((item) => ({
    role: item.role || "Puesto",
    required: toNumber(item.required),
    current: toNumber(item.current),
    gap: toNumber(item.current) - toNumber(item.required),
  }));
  const staffingRequired = staffing.reduce((sum, item) => sum + item.required, 0);
  const staffingCurrent = staffing.reduce((sum, item) => sum + item.current, 0);
  const staffingCoverage = safeRatio(staffingCurrent, staffingRequired);

  return {
    weeks,
    totals,
    previous,
    scoreValues,
    scoreAverage,
    staffing,
    staffingRequired,
    staffingCurrent,
    staffingCoverage,
  };
}

function calculateResults(data) {
  const sellers = data.sellers
    .map((seller) => {
      const sales = toNumber(seller.sales);
      const guests = toNumber(seller.guests);
      return {
        ...seller,
        name: seller.name || "Vendedor",
        sales,
        guests,
        checkAverage: safeRatio(sales, guests),
      };
    })
    .filter((seller) => seller.name.trim() || seller.sales || seller.guests);

  const totals = sellers.reduce(
    (acc, seller) => {
      acc.sales += seller.sales;
      acc.guests += seller.guests;
      return acc;
    },
    {
      sales: 0,
      guests: 0,
    },
  );

  totals.checkAverage = safeRatio(totals.sales, totals.guests);
  totals.salesCompletion = safeRatio(totals.sales, data.resultsSalesGoal);

  const topSeller = sellers
    .filter((seller) => seller.sales > 0)
    .sort((a, b) => b.sales - a.sales)[0] || null;

  const topCheck = sellers
    .filter((seller) => seller.checkAverage > 0)
    .sort((a, b) => b.checkAverage - a.checkAverage)[0] || null;

  return { sellers, totals, topSeller, topCheck };
}

function deltaClass(value) {
  if (value > 0) return "delta-positive";
  if (value < 0) return "delta-negative";
  return "";
}

function checkStatus(value) {
  if (!value) return "Sin datos";
  if (value < 700) return "Bajo";
  if (value <= 800) return "Medio";
  if (value <= 900) return "Cumple";
  if (value <= 1000) return "Alto";
  return "Excelente";
}

function pageHeader(title, kicker = "Rendición de cuentas") {
  return `
    <header class="page-header">
      <div>
        <p class="page-kicker">${kicker}</p>
        <h2>${title}</h2>
      </div>
      <div class="mini-mark" aria-hidden="true">LC</div>
    </header>
  `;
}

function pageFooter(label, period, page) {
  return `
    <footer class="page-footer">
      <span>${escapeHtml(label)}</span>
      <span>${escapeHtml(period || "Periodo sin capturar")}</span>
      <span>${String(page).padStart(2, "0")}</span>
    </footer>
  `;
}

function notesList(data, tabKey) {
  return CATEGORIES.map((category) => `
    <li>
      <strong>${category.label}</strong>
      ${sentence(data.notes?.[tabKey]?.[category.key])}
    </li>
  `).join("");
}

function staffTable(metrics) {
  return `
    <table class="report-table full-staff-table">
      <thead>
        <tr>
          <th>Puesto</th>
          <th>Requerida</th>
          <th>Actual</th>
          <th>Diferencia</th>
          <th>Estatus</th>
        </tr>
      </thead>
      <tbody>
        ${metrics.staffing.map((item) => `
          <tr>
            <td>${escapeHtml(item.role)}</td>
            <td>${numberFormat(item.required)}</td>
            <td>${numberFormat(item.current)}</td>
            <td class="${deltaClass(item.gap)}">${numberFormat(item.gap)}</td>
            <td>${item.gap < 0 ? "Cubrir" : item.gap > 0 ? "Extra" : "Completa"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderRdcReport() {
  const data = collectRdc();
  const brand = BRAND_CONFIG[data.brand];
  const metrics = calculateRdc(data);
  const manager = data.managerName || "Gerente sin capturar";
  const leader = data.serviceLeader || "Líder sin capturar";
  const period = data.periodLabel || data.weekLabel || "Periodo sin capturar";
  const missingLabel = metrics.totals.difference >= 0 ? "Faltante vs meta" : "Superávit vs meta";
  const previousSalesDelta = metrics.totals.sales - metrics.previous.sales;
  const previousGuestsDelta = metrics.totals.guests - metrics.previous.guests;
  const previousCheckDelta = metrics.totals.checkAverage - metrics.previous.checkAverage;

  report.innerHTML = `
    <section class="report-page cover-page">
      <div class="page-inner cover-grid">
        <div class="cover-title">
          <p class="page-kicker">Servicio y recompra</p>
          <h2>Rendición de cuentas</h2>
          <p>${escapeHtml(period)}</p>
        </div>
        <div>
          <div class="logo-box">
            <img src="${brand.logoPath}" alt="${brand.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-placeholder">LC</div>
          </div>
          <div class="cover-meta">
            <span><strong>Gerente:</strong> ${escapeHtml(manager)}</span>
            <span><strong>Líder de servicio:</strong> ${escapeHtml(leader)}</span>
            <span><strong>${escapeHtml(data.weekLabel || "Semana")}</strong></span>
          </div>
        </div>
      </div>
    </section>

    <section class="report-page">
      <div class="page-inner">
        ${pageHeader("Resultados comerciales")}
        <div class="kpi-grid">
          <div class="kpi">
            <small>Venta total</small>
            <strong>${money(metrics.totals.sales)}</strong>
            <span>Meta acumulada ${money(metrics.totals.goal)}</span>
          </div>
          <div class="kpi accent-gold">
            <small>Cumplimiento</small>
            <strong>${percent(metrics.totals.completion)}</strong>
            <span>${missingLabel}: ${money(Math.abs(metrics.totals.difference))}</span>
          </div>
          <div class="kpi accent-blue">
            <small>PX / Aforo</small>
            <strong>${numberFormat(metrics.totals.guests)}</strong>
            <span>Cheque promedio ${money(metrics.totals.checkAverage)}</span>
          </div>
          <div class="kpi accent-coral">
            <small>Recompra</small>
            <strong>${money(metrics.totals.repurchase)}</strong>
            <span>Acumulado semanal</span>
          </div>
        </div>
        <div class="report-grid">
          <div class="chart-card">
            <h3>Venta semanal contra meta</h3>
            <div class="canvas-shell"><canvas id="weeklyChart"></canvas></div>
          </div>
          <div class="table-card">
            <h3>Detalle por semana</h3>
            <table class="report-table">
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Venta</th>
                  <th>Meta</th>
                  <th>Dif.</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                ${metrics.weeks.map((week) => `
                  <tr>
                    <td>${escapeHtml(week.label || "Semana")}</td>
                    <td>${money(week.sales)}</td>
                    <td>${money(week.goal)}</td>
                    <td class="${week.difference <= 0 ? "delta-positive" : "delta-negative"}">${money(Math.abs(week.difference))}</td>
                    <td>${percent(week.completion)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
        <div class="kpi-grid" style="margin-top:0.26in">
          <div class="kpi">
            <small>Antecedente venta</small>
            <strong>${money(metrics.previous.sales)}</strong>
            <span class="${deltaClass(previousSalesDelta)}">Variación ${money(previousSalesDelta)}</span>
          </div>
          <div class="kpi accent-blue">
            <small>Antecedente PX</small>
            <strong>${numberFormat(metrics.previous.guests)}</strong>
            <span class="${deltaClass(previousGuestsDelta)}">Variación ${numberFormat(previousGuestsDelta)}</span>
          </div>
          <div class="kpi accent-gold">
            <small>Antecedente cheque</small>
            <strong>${money(metrics.previous.checkAverage)}</strong>
            <span class="${deltaClass(previousCheckDelta)}">Variación ${money(previousCheckDelta)}</span>
          </div>
          <div class="kpi accent-coral">
            <small>Antecedente recompra</small>
            <strong>${money(metrics.previous.repurchase)}</strong>
            <span class="${deltaClass(metrics.totals.repurchase - metrics.previous.repurchase)}">Variación ${money(metrics.totals.repurchase - metrics.previous.repurchase)}</span>
          </div>
        </div>
        ${pageFooter(brand.name, period, 2)}
      </div>
    </section>

    <section class="report-page">
      <div class="page-inner">
        ${pageHeader("Servicio y experiencia")}
        <div class="score-layout">
          <div class="canvas-shell"><canvas id="scoreRadar"></canvas></div>
          <div class="score-bars">
            ${metrics.scoreValues.map((score) => `
              <div class="score-row">
                <span>${score.label}</span>
                <div class="bar-track"><div class="bar-fill" style="width:${Math.max(0, Math.min(100, score.value))}%"></div></div>
                <strong>${score.value}%</strong>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="kpi-grid" style="margin-top:0.28in">
          <div class="kpi">
            <small>Promedio operación</small>
            <strong>${Math.round(metrics.scoreAverage)}%</strong>
            <span>Promedio simple de indicadores</span>
          </div>
          <div class="kpi accent-blue">
            <small>Secuencia</small>
            <strong>${data.scores.service || 0}%</strong>
            <span>Ejecución en servicio</span>
          </div>
          <div class="kpi accent-gold">
            <small>Experiencia</small>
            <strong>${data.scores.experience || 0}%</strong>
            <span>Ambiente y activaciones</span>
          </div>
          <div class="kpi accent-coral">
            <small>Cuenta perfecta</small>
            <strong>${data.scores.perfectAccount || 0}%</strong>
            <span>Venta sugerida completa</span>
          </div>
        </div>
        ${pageFooter(brand.name, period, 3)}
      </div>
    </section>

    <section class="report-page">
      <div class="page-inner">
        ${pageHeader("Plantilla completa")}
        <div class="kpi-grid">
          <div class="kpi">
            <small>Plantilla requerida</small>
            <strong>${numberFormat(metrics.staffingRequired)}</strong>
            <span>Base de operación</span>
          </div>
          <div class="kpi accent-blue">
            <small>Plantilla actual</small>
            <strong>${numberFormat(metrics.staffingCurrent)}</strong>
            <span>Cobertura ${percent(metrics.staffingCoverage)}</span>
          </div>
          <div class="kpi accent-coral">
            <small>Brecha total</small>
            <strong>${numberFormat(metrics.staffingCurrent - metrics.staffingRequired)}</strong>
            <span>Actual contra requerida</span>
          </div>
          <div class="kpi accent-gold">
            <small>Puestos revisados</small>
            <strong>${metrics.staffing.length}</strong>
            <span>Plantilla completa</span>
          </div>
        </div>
        ${staffTable(metrics)}
        ${pageFooter(brand.name, period, 4)}
      </div>
    </section>

    ${NARRATIVE_TABS.map((tab, index) => `
      <section class="report-page">
        <div class="page-inner">
          ${pageHeader(tab.shortLabel, "Lectura gerencial")}
          <div class="narrative-full">
            <div class="notes-card">
              <h3>${tab.label}</h3>
              <ul class="notes-list">${notesList(data, tab.key)}</ul>
            </div>
            ${tab.key === "commitments" ? `
              <div class="commitment-banner">
                <div class="commitment-metric">
                  <small>Venta semanal</small>
                  <strong>${money(toNumber(data.weeklyGoal))}</strong>
                </div>
                <div class="commitment-metric">
                  <small>Cheque promedio</small>
                  <strong>${money(metrics.totals.checkAverage || 800)}</strong>
                </div>
                <div class="commitment-metric">
                  <small>PX objetivo</small>
                  <strong>${numberFormat(metrics.totals.guests || Math.ceil(toNumber(data.weeklyGoal) / 800))}</strong>
                </div>
                <div class="commitment-metric">
                  <small>Encuestas</small>
                  <strong>${data.scores.satisfaction || 100}%</strong>
                </div>
              </div>
            ` : ""}
          </div>
          ${pageFooter(brand.name, period, 5 + index)}
        </div>
      </section>
    `).join("")}
  `;

  drawRdcCharts(metrics);
  setPreviewScale();
  saveDraft("rdc", data);
}

function sellerRows(sellers) {
  return sellers.map((seller) => `
    <tr>
      <td>${escapeHtml(seller.name)}</td>
      <td>${money(seller.sales)}</td>
      <td>${numberFormat(seller.guests)}</td>
      <td>${money(seller.checkAverage)}</td>
    </tr>
  `).join("");
}

function renderResultsReport() {
  const data = collectResults();
  const brand = BRAND_CONFIG["la-calle"];
  const metrics = calculateResults(data);
  const title = data.resultsTitle || "RESULTADOS DE ENERO 2026";
  const period = data.resultsPeriod || data.resultsWeek || "Periodo sin capturar";
  const manager = data.resultsManager || "Gerente sin capturar";

  report.innerHTML = `
    <section class="report-page cover-page">
      <div class="page-inner cover-grid">
        <div class="cover-title">
          <p class="page-kicker">Concentrado de resultados</p>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(period)}</p>
        </div>
        <div>
          <div class="logo-box">
            <img src="${brand.logoPath}" alt="${brand.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-placeholder">LC</div>
          </div>
          <div class="cover-meta">
            <span><strong>Responsable:</strong> ${escapeHtml(manager)}</span>
            <span><strong>${escapeHtml(data.resultsWeek || "Semana")}</strong></span>
            <span><strong>Px:</strong> Personas capturadas por vendedor</span>
          </div>
        </div>
      </div>
    </section>

    <section class="report-page">
      <div class="page-inner">
        ${pageHeader("Concentrado comercial", "Resultados")}
        <div class="kpi-grid">
          <div class="kpi">
            <small>Venta total</small>
            <strong>${money(metrics.totals.sales)}</strong>
            <span>Meta ${money(toNumber(data.resultsSalesGoal))} · ${percent(metrics.totals.salesCompletion)}</span>
          </div>
          <div class="kpi accent-gold">
            <small>Cheque promedio</small>
            <strong>${money(metrics.totals.checkAverage)}</strong>
            <span>${checkStatus(metrics.totals.checkAverage)} · venta / px</span>
          </div>
          <div class="kpi accent-blue">
            <small>Px total</small>
            <strong>${numberFormat(metrics.totals.guests)}</strong>
            <span>Pax / personas capturadas</span>
          </div>
          <div class="kpi accent-coral">
            <small>Mejor vendedor</small>
            <strong>${escapeHtml(metrics.topSeller?.name || "Sin datos")}</strong>
            <span>${money(metrics.topSeller?.sales || 0)}</span>
          </div>
        </div>
        <div class="report-grid">
          <div class="chart-card">
            <h3>Venta por vendedor</h3>
            <div class="canvas-shell"><canvas id="resultsSalesChart"></canvas></div>
          </div>
          <div class="chart-card">
            <h3>Cheque promedio por vendedor</h3>
            <div class="canvas-shell"><canvas id="resultsCheckChart"></canvas></div>
          </div>
        </div>
        <div class="kpi-grid" style="margin-top:0.26in">
          <div class="kpi">
            <small>Mayor cheque</small>
            <strong>${escapeHtml(metrics.topCheck?.name || "Sin datos")}</strong>
            <span>${money(metrics.topCheck?.checkAverage || 0)}</span>
          </div>
          <div class="kpi accent-blue">
            <small>Vendedores</small>
            <strong>${metrics.sellers.length}</strong>
            <span>Filas capturadas</span>
          </div>
          <div class="kpi accent-gold">
            <small>Venta por px</small>
            <strong>${money(metrics.totals.checkAverage)}</strong>
            <span>Promedio ponderado</span>
          </div>
          <div class="kpi accent-coral">
            <small>Errores de fórmula</small>
            <strong>0</strong>
            <span>Venta / px protegido</span>
          </div>
        </div>
        ${pageFooter(brand.name, period, 2)}
      </div>
    </section>

    <section class="report-page">
      <div class="page-inner">
        ${pageHeader("Tabla de vendedores", "Resultados")}
        <table class="report-table dense-report-table">
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Venta</th>
              <th>Px</th>
              <th>Cheque promedio</th>
            </tr>
          </thead>
          <tbody>${sellerRows(metrics.sellers)}</tbody>
        </table>
        ${pageFooter(brand.name, period, 3)}
      </div>
    </section>

  `;

  drawResultsCharts(metrics);
  setPreviewScale();
  saveDraft("results", data);
}

function setupCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * dpr));
  canvas.height = Math.max(220, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function drawRdcCharts(metrics) {
  drawWeeklyChart(document.querySelector("#weeklyChart"), metrics.weeks);
  drawRadar(document.querySelector("#scoreRadar"), metrics.scoreValues);
}

function drawResultsCharts(metrics) {
  drawResultsSalesChart(document.querySelector("#resultsSalesChart"), metrics.sellers);
  drawResultsCheckChart(document.querySelector("#resultsCheckChart"), metrics.sellers);
}

function drawWeeklyChart(canvas, weeks) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const pad = { top: 22, right: 18, bottom: 42, left: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxValue = Math.max(1, ...weeks.flatMap((week) => [week.sales, week.goal])) * 1.16;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e5ded2";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#66615c";
  ctx.font = "11px Segoe UI, Arial";
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(money(maxValue * (1 - i / 4)).replace("MXN", "").trim(), 8, y + 4);
  }

  const slot = plotW / weeks.length;
  weeks.forEach((week, index) => {
    const x = pad.left + slot * index + slot * 0.2;
    const barW = slot * 0.34;
    const salesH = (week.sales / maxValue) * plotH;
    const goalH = (week.goal / maxValue) * plotH;
    ctx.fillStyle = "#0e766e";
    ctx.fillRect(x, pad.top + plotH - salesH, barW, salesH);
    ctx.fillStyle = "#c79a3d";
    ctx.fillRect(x + barW + 7, pad.top + plotH - goalH, barW, goalH);
    ctx.fillStyle = "#171717";
    ctx.font = "700 11px Segoe UI, Arial";
    ctx.textAlign = "center";
    ctx.fillText(week.label || `S${index + 1}`, pad.left + slot * index + slot / 2, height - 16);
  });

  ctx.textAlign = "left";
  ctx.font = "700 11px Segoe UI, Arial";
  ctx.fillStyle = "#0e766e";
  ctx.fillText("Venta", pad.left, 14);
  ctx.fillStyle = "#c79a3d";
  ctx.fillText("Meta", pad.left + 54, 14);
}

function drawRadar(canvas, scores) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const centerX = width / 2;
  const centerY = height / 2 + 4;
  const radius = Math.min(width, height) * 0.32;
  const count = scores.length;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e5ded2";
  ctx.lineWidth = 1;

  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    for (let i = 0; i < count; i += 1) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / count;
      const r = (radius * ring) / 4;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  scores.forEach((score, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = "#171717";
    ctx.font = "700 10px Segoe UI, Arial";
    ctx.textAlign = x < centerX - 10 ? "right" : x > centerX + 10 ? "left" : "center";
    ctx.fillText(score.label.split(" ")[0], x + Math.cos(angle) * 12, y + Math.sin(angle) * 12);
  });

  ctx.beginPath();
  scores.forEach((score, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    const r = radius * Math.max(0, Math.min(100, score.value)) / 100;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(14, 118, 110, 0.22)";
  ctx.fill();
  ctx.strokeStyle = "#0e766e";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawResultsSalesChart(canvas, sellers) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const rows = sellers.filter((seller) => seller.sales > 0).slice(0, 8);
  const chartRows = rows.length ? rows : sellers.slice(0, 6);
  const pad = { top: 18, right: 22, bottom: 24, left: 100 };
  const rowH = (height - pad.top - pad.bottom) / Math.max(chartRows.length, 1);
  const maxSales = Math.max(1, ...chartRows.map((seller) => seller.sales));

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.font = "700 10px Segoe UI, Arial";
  chartRows.forEach((seller, index) => {
    const y = pad.top + rowH * index + rowH * 0.22;
    const barW = ((width - pad.left - pad.right) * seller.sales) / maxSales;
    ctx.fillStyle = "#171717";
    ctx.textAlign = "right";
    ctx.fillText(seller.name.split(" ").slice(0, 2).join(" "), pad.left - 8, y + rowH * 0.32);
    ctx.fillStyle = "#0e766e";
    ctx.fillRect(pad.left, y, barW, Math.max(8, rowH * 0.46));
    ctx.fillStyle = "#66615c";
    ctx.textAlign = "left";
    ctx.fillText(money(seller.sales), pad.left + barW + 6, y + rowH * 0.32);
  });
}

function drawResultsCheckChart(canvas, sellers) {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, width, height } = setup;
  const rows = sellers.filter((seller) => seller.checkAverage > 0).slice(0, 8);
  const chartRows = rows.length ? rows : sellers.slice(0, 6);
  const pad = { top: 18, right: 26, bottom: 24, left: 100 };
  const rowH = (height - pad.top - pad.bottom) / Math.max(chartRows.length, 1);
  const maxCheck = Math.max(1, ...chartRows.map((seller) => seller.checkAverage));

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.font = "700 10px Segoe UI, Arial";
  chartRows.forEach((seller, index) => {
    const y = pad.top + rowH * index + rowH * 0.22;
    const trackW = width - pad.left - pad.right;
    const barW = (trackW * seller.checkAverage) / maxCheck;
    ctx.fillStyle = "#171717";
    ctx.textAlign = "right";
    ctx.fillText(seller.name.split(" ").slice(0, 2).join(" "), pad.left - 8, y + rowH * 0.32);
    ctx.fillStyle = "#e6ded0";
    ctx.fillRect(pad.left, y, trackW, Math.max(8, rowH * 0.44));
    ctx.fillStyle = "#315f8a";
    ctx.fillRect(pad.left, y, barW, Math.max(8, rowH * 0.44));
    ctx.fillStyle = "#66615c";
    ctx.textAlign = "left";
    ctx.fillText(money(seller.checkAverage), pad.left + barW + 6, y + rowH * 0.32);
  });
}

function setPreviewScale() {
  const stage = document.querySelector(".report-stage");
  if (!stage) return;
  const printableWidth = 11 * 96;
  const availableWidth = Math.max(320, stage.clientWidth - 8);
  const scale = Math.min(1, availableWidth / printableWidth);
  stage.style.setProperty("--preview-scale", String(scale));
}

function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function hasActiveSession() {
  const session = readJson(AUTH_SESSION_KEY, {});
  return session?.accountId === AUTH_ACCOUNT.accountId && session?.username === AUTH_ACCOUNT.username;
}

function setActiveSession() {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    accountId: AUTH_ACCOUNT.accountId,
    username: AUTH_ACCOUNT.username,
    signedInAt: new Date().toISOString(),
  }));
}

function migrateAccountDrafts() {
  const migrationKey = `${ACCOUNT_PREFIX}-migration-v1`;
  if (localStorage.getItem(migrationKey)) return;

  Object.entries(LEGACY_STORAGE_KEYS).forEach(([mode, legacyKey]) => {
    const legacyDraft = localStorage.getItem(legacyKey);
    if (legacyDraft && !localStorage.getItem(STORAGE_KEYS[mode])) {
      localStorage.setItem(STORAGE_KEYS[mode], legacyDraft);
    }
  });

  const legacyState = localStorage.getItem(LEGACY_APP_STATE_KEY);
  if (legacyState && !localStorage.getItem(APP_STATE_KEY)) {
    localStorage.setItem(APP_STATE_KEY, legacyState);
  }

  localStorage.setItem(migrationKey, "true");
}

function showLogin(message = "") {
  document.body.classList.remove("is-authenticated");
  loginError.textContent = message;
  loginPassword.value = "";
  window.setTimeout(() => loginUser.focus(), 0);
}

function showApp() {
  document.body.classList.add("is-authenticated");
  loginError.textContent = "";
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const username = loginUser.value.trim();
  const password = loginPassword.value;
  const validUser = username.toLowerCase() === AUTH_ACCOUNT.username.toLowerCase();
  const validPassword = password === AUTH_ACCOUNT.password;

  if (!validUser || !validPassword) {
    showLogin("Usuario o contraseña incorrectos.");
    return;
  }

  loginUser.value = AUTH_ACCOUNT.username;
  setActiveSession();
  migrateAccountDrafts();
  showApp();
  initializeApp();
}

function handleLogout() {
  if (appReady) persistActiveDraft();
  localStorage.removeItem(AUTH_SESSION_KEY);
  showLogin("Sesión cerrada.");
}

function bindAuthEvents() {
  loginForm.addEventListener("submit", handleLoginSubmit);
  logoutButton.addEventListener("click", handleLogout);
}

function loadAppState() {
  return readJson(APP_STATE_KEY, {});
}

function saveAppState(patch = {}) {
  const current = loadAppState();
  localStorage.setItem(APP_STATE_KEY, JSON.stringify({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  }));
}

function saveDraft(mode, data) {
  localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(data));
  saveAppState({ activeMode: mode });
  draftStatus.textContent = `Guardado en ${AUTH_ACCOUNT.username}`;
}

function loadDraft(mode) {
  const makeDefault = mode === "results" ? makeDefaultResults : makeDefaultRdc;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[mode]);
    if (!raw) return makeDefault();
    return { ...makeDefault(), ...JSON.parse(raw) };
  } catch {
    return makeDefault();
  }
}

function renderActive() {
  const mode = documentTypeSelect.value;
  if (mode === "results") renderResultsReport();
  else renderRdcReport();
}

function persistActiveDraft() {
  const mode = documentTypeSelect.value;
  const data = mode === "results" ? collectResults() : collectRdc();
  saveDraft(mode, data);
}

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isSafariBrowser() {
  return /^((?!chrome|android|crios|fxios|edgios|opr|opera).)*safari/i.test(navigator.userAgent);
}

function shouldUseSafariPdfFlow() {
  return isIOSDevice() || isSafariBrowser();
}

function pdfFileName() {
  const mode = documentTypeSelect.value;
  const source = mode === "results" ? collectResults() : collectRdc();
  const rawName = mode === "results"
    ? source.resultsTitle || "resultados-enero-2026"
    : `rendicion-cuentas-${source.weekLabel || source.periodLabel || "reporte"}`;
  const slug = rawName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return `${slug || "reporte"}.pdf`;
}

function setExportBusy(isBusy) {
  document.querySelectorAll("[data-export-pdf]").forEach((button) => {
    if (!button.dataset.defaultHtml) button.dataset.defaultHtml = button.innerHTML;
    button.disabled = isBusy;
    button.setAttribute("aria-busy", String(isBusy));
    button.innerHTML = isBusy
      ? '<span aria-hidden="true">…</span> Generando PDF'
      : button.dataset.defaultHtml;
  });
  if (isBusy) draftStatus.textContent = "Generando PDF...";
  else if (draftStatus.textContent === "Generando PDF...") draftStatus.textContent = `Guardado en ${AUTH_ACCOUNT.username}`;
}

async function waitForReportAssets() {
  const images = [...report.querySelectorAll("img")];
  await Promise.all(images.map(async (image) => {
    if (image.complete && image.naturalWidth > 0) return;
    if (image.decode) {
      try {
        await image.decode();
        return;
      } catch {
        // Fall through to load/error listeners.
      }
    }
    await new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

async function sharePdfFile(blob, filename) {
  if (!navigator.share || !navigator.canShare || typeof File === "undefined") return false;
  const file = new File([blob], filename, { type: "application/pdf" });
  if (!navigator.canShare({ files: [file] })) return false;
  try {
    await navigator.share({
      files: [file],
      title: filename,
      text: "Reporte PDF",
    });
    return true;
  } catch {
    return false;
  }
}

function closeSafariPdfPanel() {
  document.querySelector("#safariPdfPanel")?.remove();
}

function showSafariPdfReady(blob, filename) {
  closeSafariPdfPanel();
  if (pendingPdfDelivery?.url) URL.revokeObjectURL(pendingPdfDelivery.url);
  const url = URL.createObjectURL(blob);
  pendingPdfDelivery = { blob, filename, url };

  const panel = document.createElement("div");
  panel.className = "pdf-ready-panel";
  panel.id = "safariPdfPanel";
  panel.innerHTML = `
    <div>
      <strong>PDF listo</strong>
      <span>En Safari toca el botón para abrirlo o compartirlo.</span>
    </div>
    <button class="primary-button" type="button" data-open-pdf>Abrir / compartir PDF</button>
    <button class="ghost-button pdf-ready-close" type="button" aria-label="Cerrar">×</button>
  `;

  panel.querySelector("[data-open-pdf]").addEventListener("click", async () => {
    const delivered = await sharePdfFile(blob, filename);
    if (!delivered) {
      const opened = window.open(url, "_blank", "noopener");
      if (!opened) window.location.href = url;
    } else {
      closeSafariPdfPanel();
    }
  });
  panel.querySelector(".pdf-ready-close").addEventListener("click", closeSafariPdfPanel);
  document.body.appendChild(panel);

  window.setTimeout(() => {
    if (pendingPdfDelivery?.url === url) {
      URL.revokeObjectURL(url);
      pendingPdfDelivery = null;
      closeSafariPdfPanel();
    }
  }, 300000);
}

async function deliverPdfBlob(blob, filename) {
  if (shouldUseSafariPdfFlow()) {
    showSafariPdfReady(blob, filename);
    return;
  }

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function exportPdfDownload() {
  closeSafariPdfPanel();
  setExportBusy(true);
  try {
    if (!window.html2canvas || !window.jspdf?.jsPDF) {
      throw new Error("PDF libraries unavailable");
    }

    renderActive();
    await waitForReportAssets();

    const stage = document.querySelector(".report-stage");
    const previousScale = stage.style.getPropertyValue("--preview-scale");
    stage.style.setProperty("--preview-scale", "1");
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const pages = [...report.querySelectorAll(".report-page")];
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "letter",
      compress: true,
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const captureScale = shouldUseSafariPdfFlow()
      ? 1
      : Math.min(1.6, Math.max(1.25, window.devicePixelRatio || 1.4));
    const imageQuality = shouldUseSafariPdfFlow() ? 0.86 : 0.92;

    for (const [index, page] of pages.entries()) {
      const canvas = await window.html2canvas(page, {
        backgroundColor: "#ffffff",
        scale: captureScale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: page.offsetWidth,
        height: page.offsetHeight,
        windowWidth: Math.max(document.documentElement.scrollWidth, page.offsetWidth),
        windowHeight: Math.max(document.documentElement.scrollHeight, page.offsetHeight),
      });
      const image = canvas.toDataURL("image/jpeg", imageQuality);
      if (index > 0) pdf.addPage("letter", "landscape");
      pdf.addImage(image, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }

    if (previousScale) stage.style.setProperty("--preview-scale", previousScale);
    else setPreviewScale();

    const blob = pdf.output("blob");
    await deliverPdfBlob(blob, pdfFileName());
    draftStatus.textContent = shouldUseSafariPdfFlow() ? "PDF listo para abrir" : "PDF generado";
  } catch {
    window.alert("No se pudo descargar el PDF automáticamente. Se abrirá el diálogo de impresión para guardar como PDF.");
    renderActive();
    window.setTimeout(() => window.print(), 80);
  } finally {
    setExportBusy(false);
  }
}

function setMode(mode) {
  documentTypeSelect.value = mode;
  reportForm.classList.toggle("is-hidden", mode !== "rdc");
  resultsForm.classList.toggle("is-hidden", mode !== "results");
  topbarTitle.textContent = mode === "results" ? "Resultados de Enero 2026" : "Rendición de cuentas";
  saveAppState({ activeMode: mode });
  draftStatus.textContent = `Guardado en ${AUTH_ACCOUNT.username}`;
  renderActive();
}

function resetActiveDraft() {
  const mode = documentTypeSelect.value;
  localStorage.removeItem(STORAGE_KEYS[mode]);
  if (mode === "results") setResultsFormData(makeDefaultResults());
  else setRdcFormData(makeDefaultRdc());
  renderActive();
}

function bindEvents() {
  reportForm.addEventListener("input", (event) => {
    if (event.target.matches("[data-score]")) {
      document.querySelector(`#score-${event.target.dataset.score}`).textContent = `${event.target.value}%`;
    }
    if (documentTypeSelect.value === "rdc") renderRdcReport();
  });

  reportForm.addEventListener("change", () => {
    if (documentTypeSelect.value === "rdc") renderRdcReport();
  });

  resultsForm.addEventListener("input", () => {
    updateSellerCheckOutputs();
    if (documentTypeSelect.value === "results") renderResultsReport();
  });

  resultsForm.addEventListener("change", () => {
    updateSellerCheckOutputs();
    if (documentTypeSelect.value === "results") renderResultsReport();
  });

  documentTypeSelect.addEventListener("change", () => setMode(documentTypeSelect.value));
  brandSelect.addEventListener("change", renderActive);

  document.querySelectorAll(".note-tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".note-tab").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".narrative-pane").forEach((pane) => pane.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`[data-pane="${button.dataset.tab}"]`).classList.add("active");
    });
  });

  document.querySelector("#addSellerButton").addEventListener("click", () => {
    const data = collectResults();
    data.sellers.push({
      name: "",
      sales: "",
      guests: "",
    });
    setResultsFormData(data);
    renderResultsReport();
  });

  document.querySelectorAll("[data-export-pdf]").forEach((button) => {
    button.addEventListener("click", exportPdfDownload);
  });

  document.querySelector("#resetButton").addEventListener("click", () => {
    const ok = window.confirm(`¿Limpiar el borrador guardado de ${AUTH_ACCOUNT.username} para este documento?`);
    if (ok) resetActiveDraft();
  });

  window.addEventListener("resize", () => {
    setPreviewScale();
    if (documentTypeSelect.value === "results") drawResultsCharts(calculateResults(collectResults()));
    else drawRdcCharts(calculateRdc(collectRdc()));
  });
  window.addEventListener("pagehide", persistActiveDraft);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persistActiveDraft();
  });
  window.addEventListener("beforeprint", renderActive);
}

function initializeApp() {
  if (appReady) {
    renderActive();
    return;
  }

  buildRdcForm();
  buildResultsForm();
  setRdcFormData(loadDraft("rdc"));
  setResultsFormData(loadDraft("results"));
  bindEvents();
  appReady = true;

  const requestedMode = new URLSearchParams(window.location.search).get("mode");
  const savedMode = loadAppState().activeMode;
  const initialMode = requestedMode === "results" || requestedMode === "rdc"
    ? requestedMode
    : (savedMode === "results" ? "results" : "rdc");
  setMode(initialMode);
}

function bootstrap() {
  bindAuthEvents();
  loginUser.value = AUTH_ACCOUNT.username;

  if (hasActiveSession()) {
    migrateAccountDrafts();
    showApp();
    initializeApp();
    return;
  }

  showLogin();
}

bootstrap();

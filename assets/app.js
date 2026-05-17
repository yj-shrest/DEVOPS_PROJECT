const services = [
  { name: "Web Gateway", owner: "Platform", status: "healthy", latency: "38ms", errorRate: "0.02%", version: "v2.8.4" },
  { name: "Billing API", owner: "Revenue", status: "warning", latency: "126ms", errorRate: "0.45%", version: "v1.17.0" },
  { name: "Auth Service", owner: "Identity", status: "healthy", latency: "54ms", errorRate: "0.03%", version: "v4.2.1" },
  { name: "Notification Worker", owner: "Engage", status: "healthy", latency: "82ms", errorRate: "0.08%", version: "v3.5.7" },
  { name: "Reporting Store", owner: "Data", status: "critical", latency: "420ms", errorRate: "2.10%", version: "v1.9.3" },
  { name: "Feature Flags", owner: "Platform", status: "healthy", latency: "31ms", errorRate: "0.01%", version: "v5.0.2" }
];

const incidents = [
  { title: "Reporting Store query queue is saturated", service: "Reporting Store", severity: "critical", owner: "Data", opened: "18m ago" },
  { title: "Billing API p95 latency above objective", service: "Billing API", severity: "warning", owner: "Revenue", opened: "41m ago" }
];

const pipelineStages = [
  { name: "Checkout", detail: "Git repository synced", state: "success", icon: "OK", time: "8s" },
  { name: "Build image", detail: "Nginx container image created", state: "success", icon: "BI", time: "31s" },
  { name: "Static validation", detail: "HTML, CSS, and JS loaded", state: "success", icon: "SV", time: "6s" },
  { name: "Deploy containers", detail: "Docker Compose recreated services", state: "success", icon: "DC", time: "24s" },
  { name: "Smoke test", detail: "HTTP health check passed", state: "success", icon: "ST", time: "2s" }
];

const runbookItems = [
  "Confirm production image tag is immutable",
  "Review active incidents before deployment",
  "Verify Grafana dashboard is receiving metrics",
  "Notify release channel after smoke test",
  "Capture rollback command in release notes"
];

const chartData = {
  7: [4, 3, 5, 2, 6, 7, 5],
  14: [8, 6, 9, 7, 10, 11, 8],
  30: [18, 22, 16, 24, 20, 28, 25]
};

const state = {
  search: "",
  filter: "all",
  chartRange: "7",
  completed: JSON.parse(localStorage.getItem("opspilot-runbook") || "[]")
};

const elements = {
  velocityChart: document.querySelector("#velocityChart"),
  incidentList: document.querySelector("#incidentList"),
  pipelineList: document.querySelector("#pipelineList"),
  serviceTable: document.querySelector("#serviceTable"),
  runbookList: document.querySelector("#runbookList"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  resetRunbook: document.querySelector("#resetRunbook"),
  deployButton: document.querySelector("#deployButton"),
  toast: document.querySelector("#toast"),
  healthyCount: document.querySelector("#healthyCount"),
  incidentCount: document.querySelector("#incidentCount"),
  deploymentCount: document.querySelector("#deploymentCount")
};

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function renderChart() {
  const values = chartData[state.chartRange];
  const max = Math.max(...values);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  elements.velocityChart.innerHTML = values.map((value, index) => {
    const height = Math.max(12, Math.round((value / max) * 100));
    return `
      <div class="bar" title="${value} deployments">
        <div class="bar-fill" style="height:${height}%"></div>
        <label>${labels[index]}</label>
      </div>
    `;
  }).join("");
}

function renderIncidents() {
  elements.incidentList.innerHTML = incidents.map((incident) => `
    <article class="incident">
      <span class="status-pill ${incident.severity}">${statusLabel(incident.severity)}</span>
      <strong>${incident.title}</strong>
      <small>${incident.service} / ${incident.owner} / opened ${incident.opened}</small>
    </article>
  `).join("");
}

function renderPipeline() {
  elements.pipelineList.innerHTML = pipelineStages.map((stage) => `
    <article class="pipeline-stage">
      <span class="stage-icon" aria-hidden="true">${stage.icon}</span>
      <span class="stage-meta">
        <strong>${stage.name}</strong>
        <small>${stage.detail}</small>
      </span>
      <span class="status-pill ${stage.state}">${stage.time}</span>
    </article>
  `).join("");
}

function serviceMatches(service) {
  const search = state.search.trim().toLowerCase();
  const matchesStatus = state.filter === "all" || service.status === state.filter;
  const matchesSearch = !search || [service.name, service.owner, service.status, service.version]
    .some((value) => value.toLowerCase().includes(search));

  return matchesStatus && matchesSearch;
}

function renderServices() {
  const visibleServices = services.filter(serviceMatches);

  if (!visibleServices.length) {
    elements.serviceTable.innerHTML = '<div class="empty-state">No services match the current filters.</div>';
    return;
  }

  elements.serviceTable.innerHTML = visibleServices.map((service) => `
    <article class="service-row" role="row">
      <span class="service-name">
        <strong>${service.name}</strong>
        <small>${service.owner}</small>
      </span>
      <span>
        <span class="service-cell-label">Latency</span>
        ${service.latency}
      </span>
      <span>
        <span class="service-cell-label">Error rate</span>
        ${service.errorRate}
      </span>
      <span>
        <span class="service-cell-label">Version</span>
        ${service.version}
      </span>
      <span class="status-pill ${service.status}">${statusLabel(service.status)}</span>
    </article>
  `).join("");
}

function renderRunbook() {
  elements.runbookList.innerHTML = runbookItems.map((item, index) => {
    const checked = state.completed.includes(index);
    return `
      <label class="runbook-item ${checked ? "done" : ""}">
        <input type="checkbox" data-runbook-index="${index}" ${checked ? "checked" : ""}>
        <strong>${item}</strong>
        <span class="status-pill ${checked ? "success" : "warning"}">${checked ? "Done" : "Open"}</span>
      </label>
    `;
  }).join("");
}

function renderMetrics() {
  const healthy = services.filter((service) => service.status === "healthy").length;
  elements.healthyCount.textContent = `${healthy}/${services.length}`;
  elements.incidentCount.textContent = incidents.length;
  elements.deploymentCount.textContent = chartData[state.chartRange].reduce((total, value) => total + value, 0);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.setTimeout(() => elements.toast.classList.remove("visible"), 2600);
}

function saveRunbook() {
  localStorage.setItem("opspilot-runbook", JSON.stringify(state.completed));
}

function bindEvents() {
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.chartRange = button.dataset.range;
      document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("active"));
      button.classList.add("active");
      renderChart();
      renderMetrics();
    });
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((navLink) => navLink.classList.remove("active"));
      link.classList.add("active");
    });
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderServices();
  });

  elements.statusFilter.addEventListener("change", (event) => {
    state.filter = event.target.value;
    renderServices();
  });

  elements.runbookList.addEventListener("change", (event) => {
    const index = Number(event.target.dataset.runbookIndex);
    if (!Number.isInteger(index)) {
      return;
    }

    state.completed = event.target.checked
      ? [...new Set([...state.completed, index])]
      : state.completed.filter((item) => item !== index);

    saveRunbook();
    renderRunbook();
  });

  elements.resetRunbook.addEventListener("click", () => {
    state.completed = [];
    saveRunbook();
    renderRunbook();
    showToast("Runbook checklist reset.");
  });

  elements.deployButton.addEventListener("click", () => {
    showToast("Deployment queued for the next Jenkins run.");
  });
}

function init() {
  renderChart();
  renderIncidents();
  renderPipeline();
  renderServices();
  renderRunbook();
  renderMetrics();
  bindEvents();
}

init();

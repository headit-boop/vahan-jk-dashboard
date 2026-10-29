/* VAHAN J&K dashboard — vanilla JS, no external libraries. */
(function () {
  "use strict";

  const DATA = window.VAHAN_DATA;
  const MONTH_NAMES = {
    JAN: "January", FEB: "February", MAR: "March", APR: "April",
    MAY: "May", JUN: "June", JUL: "July", AUG: "August",
    SEP: "September", OCT: "October", NOV: "November", DEC: "December",
  };
  const ALL = "__ALL__";
  const nf = new Intl.NumberFormat("en-IN");

  const el = (id) => document.getElementById(id);
  const monthSel = el("month");
  const districtSel = el("district");
  const makerSel = el("maker");
  const compareSel = el("compare");
  const resetBtn = el("reset");

  if (!DATA || !DATA.values) {
    el("updated").textContent = "data.js not found — run build_master.py first";
    return;
  }

  const months = DATA.months.slice();
  const districts = DATA.districts.slice();
  const makers = DATA.makers.slice();

  const fmt = (n) => nf.format(Math.round(n || 0));
  const get = (m, d, k) => {
    const md = DATA.values[m];
    if (!md) return 0;
    const dd = md[d];
    if (!dd) return 0;
    return dd[k] || 0;
  };
  const shortDistrict = (d) => d.replace(/\s+(ARTO|RTO)\s*-\s*JK\d+/i, "").trim();
  const monthName = (m) => MONTH_NAMES[m] || m;

  function sumSlice(m, d, k) {
    if (d !== ALL && k !== ALL) return get(m, d, k);
    if (d !== ALL) {
      let s = 0;
      for (const maker of makers) s += get(m, d, maker);
      return s;
    }
    if (k !== ALL) {
      let s = 0;
      for (const dist of districts) s += get(m, dist, k);
      return s;
    }
    let s = 0;
    for (const dist of districts) for (const maker of makers) s += get(m, dist, maker);
    return s;
  }

  function makersInSlice(m, d, k) {
    const out = [];
    for (const maker of makers) {
      if (k !== ALL && maker !== k) continue;
      const v = d === ALL ? districts.reduce((a, dist) => a + get(m, dist, maker), 0) : get(m, d, maker);
      if (v > 0) out.push([maker, v]);
    }
    return out.sort((a, b) => b[1] - a[1]);
  }

  function districtsInSlice(m, k) {
    const out = districts.map((d) => [d, sumSlice(m, d, k)]);
    return out.sort((a, b) => b[1] - a[1]);
  }

  function populate() {
    monthSel.innerHTML = "";
    months.forEach((m) => {
      const o = document.createElement("option");
      o.value = m;
      o.textContent = monthName(m);
      monthSel.appendChild(o);
    });
    monthSel.value = DATA.current && months.includes(DATA.current) ? DATA.current : months[months.length - 1];

    districtSel.innerHTML = "";
    const allD = document.createElement("option");
    allD.value = ALL;
    allD.textContent = `All districts (${districts.length})`;
    districtSel.appendChild(allD);
    districts.forEach((d) => {
      const o = document.createElement("option");
      o.value = d;
      o.textContent = shortDistrict(d);
      districtSel.appendChild(o);
    });

    makerSel.innerHTML = "";
    const allK = document.createElement("option");
    allK.value = ALL;
    allK.textContent = `All makers (${makers.length})`;
    makerSel.appendChild(allK);
    makers.forEach((k) => {
      const o = document.createElement("option");
      o.value = k;
      o.textContent = k;
      makerSel.appendChild(o);
    });

    const when = DATA.updated ? new Date(DATA.updated) : null;
    el("updated").textContent = when
      ? `Updated ${when.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
      : "Updated recently";
    el("footerMeta").textContent = `${DATA.year} · ${months.length} months · ${districts.length} districts · ${makers.length} makers · generated locally`;
  }

  function kpiDelta(total, prevTotal, prevMonth) {
    if (!prevMonth || !prevTotal) {
      el("kpiDelta").textContent = prevMonth ? `vs ${monthName(prevMonth)}: no data` : "No previous month";
      el("kpiDelta").className = "muted";
      return;
    }
    const pct = ((total - prevTotal) / prevTotal) * 100;
    const sign = pct > 0 ? "+" : "";
    el("kpiDelta").textContent = `${sign}${pct.toFixed(1)}% vs ${monthName(prevMonth)} (${fmt(prevTotal)})`;
    el("kpiDelta").className = pct >= 0 ? "up" : "down";
  }

  function renderKpis(m, d, k, total, prev, prevTotal) {
    el("kpiTotal").textContent = fmt(total);
    kpiDelta(total, prevTotal, prev);

    const top = makersInSlice(m, d, k)[0];
    el("kpiMaker").textContent = top ? top[0] : "—";
    el("kpiMakerValue").textContent = top ? `${fmt(top[1])} cars` : "No sales";

    const dist = districtsInSlice(m, k)[0];
    el("kpiDistrict").textContent = dist ? shortDistrict(dist[0]) : "—";
    el("kpiDistrictValue").textContent = dist ? `${fmt(dist[1])} cars` : "No sales";

    el("kpiMakers").textContent = fmt(makersInSlice(m, d, k).length);
  }

  function renderTrend(m, d, k) {
    const wrap = el("trend");
    wrap.innerHTML = "";
    const vals = months.map((mm) => sumSlice(mm, d, k));
    const max = Math.max(...vals, 1);
    months.forEach((mm, i) => {
      const v = vals[i];
      const bar = document.createElement("div");
      bar.className = "bar" + (mm === m ? " active" : "");
      bar.title = `${monthName(mm)}: ${fmt(v)}`;
      bar.innerHTML = `<span class="val">${fmt(v)}</span><div class="fill" style="height:${Math.max(2, (v / max) * 150)}px"></div><span class="lab">${mm}</span>`;
      bar.addEventListener("click", () => {
        monthSel.value = mm;
        render();
      });
      wrap.appendChild(bar);
    });
  }

  function barRow(name, value, max, onClick, title) {
    const row = document.createElement("div");
    row.className = "bar-row";
    if (title) row.title = title;
    row.innerHTML = `<span class="name">${name}</span><span class="track"><span class="fill" style="width:${Math.max(2, (value / max) * 100)}%"></span></span><span class="num">${fmt(value)}</span>`;
    if (onClick) row.addEventListener("click", onClick);
    return row;
  }

  function renderTopMakers(m, d, k) {
    const wrap = el("topMakers");
    wrap.innerHTML = "";
    let rows = makersInSlice(m, d, ALL).slice(0, 10);
    if (k !== ALL) rows = makersInSlice(m, d, k);
    if (!rows.length) {
      wrap.innerHTML = '<p class="muted">No maker sales in this slice.</p>';
      return;
    }
    const max = rows[0][1] || 1;
    rows.forEach(([maker, value]) => {
      const row = barRow(maker, value, max, () => {
        makerSel.value = maker;
        render();
      }, `${maker}: ${fmt(value)}`);
      if (maker === k) row.style.outline = "2px solid rgba(232,163,61,.55)";
      wrap.appendChild(row);
    });
  }

  function renderDistrictBars(m, d, k) {
    const wrap = el("districtBars");
    wrap.innerHTML = "";
    const rows = districtsInSlice(m, k);
    const max = Math.max(...rows.map((r) => r[1]), 1);
    rows.forEach(([dist, value]) => {
      const row = barRow(shortDistrict(dist), value, max, () => {
        districtSel.value = dist;
        render();
      }, `${dist}: ${fmt(value)}`);
      if (dist === d) row.style.outline = "2px solid rgba(232,163,61,.55)";
      wrap.appendChild(row);
    });
  }

  function cellClass(v, max) {
    if (!v) return "";
    if (v === max) return "cell-top";
    return v / max > 0.5 ? "cell-hot" : "";
  }

  function renderMatrix(m, d, k) {
    const table = el("matrix");
    const title = el("matrixTitle");
    const hint = el("matrixHint");
    table.innerHTML = "";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const tfoot = document.createElement("tfoot");

    if (d === ALL) {
      title.textContent = `Maker × district — ${monthName(m)}`;
      hint.textContent = "Rows sorted by total; heatmap shows relative volume per district.";
      const head = document.createElement("tr");
      head.innerHTML = `<th>Maker</th>${districts.map((x) => `<th title="${x}">${shortDistrict(x)}</th>`).join("")}<th>Total</th>`;
      thead.appendChild(head);

      let rows = makersInSlice(m, ALL, k);
      let colMax = districts.map((dist) => {
        let mx = 0;
        for (const [maker] of rows) mx = Math.max(mx, get(m, dist, maker));
        return mx || 1;
      });
      const grandTotal = rows.reduce((a, r) => a + r[1], 0);
      rows.forEach(([maker, rowTotal]) => {
        const tr = document.createElement("tr");
        const cells = [`<td title="${maker}">${maker}</td>`];
        districts.forEach((dist, i) => {
          const v = get(m, dist, maker);
          cells.push(`<td class="num ${cellClass(v, colMax[i])}">${v ? fmt(v) : "—"}</td>`);
        });
        cells.push(`<td class="num"><strong>${fmt(rowTotal)}</strong></td>`);
        tr.innerHTML = cells.join("");
        tbody.appendChild(tr);
      });
      const foot = document.createElement("tr");
      foot.innerHTML = `<td>Total</td>${districts.map((dist) => `<td class="num">${fmt(sumSlice(m, dist, k))}</td>`).join("")}<td class="num">${fmt(grandTotal)}</td>`;
      tfoot.appendChild(foot);
    } else {
      title.textContent = `${shortDistrict(d)} — month-wise by maker`;
      hint.textContent = "Rows sorted by year-to-date total for this district.";
      const head = document.createElement("tr");
      head.innerHTML = `<th>Maker</th>${months.map((mm) => `<th>${mm}</th>`).join("")}<th>Total</th>`;
      thead.appendChild(head);

      const rows = [];
      for (const maker of makers) {
        if (k !== ALL && maker !== k) continue;
        const vals = months.map((mm) => get(mm, d, maker));
        const total = vals.reduce((a, b) => a + b, 0);
        if (total > 0) rows.push([maker, vals, total]);
      }
      rows.sort((a, b) => b[2] - a[2]);
      const grand = rows.reduce((a, r) => a + r[2], 0);
      rows.forEach(([maker, vals, total]) => {
        const tr = document.createElement("tr");
        const cells = [`<td title="${maker}">${maker}</td>`];
        vals.forEach((v) => cells.push(`<td class="num ${v ? "cell-hot" : ""}">${v ? fmt(v) : "—"}</td>`));
        cells.push(`<td class="num"><strong>${fmt(total)}</strong></td>`);
        tr.innerHTML = cells.join("");
        tbody.appendChild(tr);
      });
      const foot = document.createElement("tr");
      foot.innerHTML = `<td>Total</td>${months.map((mm) => `<td class="num">${fmt(sumSlice(mm, d, k))}</td>`).join("")}<td class="num">${fmt(grand)}</td>`;
      tfoot.appendChild(foot);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    table.appendChild(tfoot);
  }

  function renderCompare(m, d, k, prev) {
    const card = el("compareCard");
    if (!prev || compareSel.value === "none") {
      card.style.display = "none";
      return;
    }
    card.style.display = "";
    el("compareTitle").textContent = `Comparison — ${monthName(prev)} → ${monthName(m)}`;
    const table = el("compareTable");
    table.innerHTML = "";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const tfoot = document.createElement("tfoot");

    const head = document.createElement("tr");
    head.innerHTML = "<th>Maker</th><th>Previous</th><th>Current</th><th>Change</th><th>Change %</th>";
    thead.appendChild(head);

    let rows = makersInSlice(m, d, k).slice(0, 15);
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="muted">No sales in the selected slice.</td></tr>';
    }
    rows.forEach(([maker, cur]) => {
      const before = d === ALL
        ? districts.reduce((a, dist) => a + get(prev, dist, maker), 0)
        : get(prev, d, maker);
      const diff = cur - before;
      const pct = before ? (diff / before) * 100 : null;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td title="${maker}">${maker}</td><td class="num">${fmt(before)}</td><td class="num"><strong>${fmt(cur)}</strong></td><td class="num ${diff >= 0 ? "compare-up" : "compare-down"}">${diff >= 0 ? "+" : ""}${fmt(diff)}</td><td class="num ${diff >= 0 ? "compare-up" : "compare-down"}">${pct === null ? "—" : (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%"}</td>`;
      tbody.appendChild(tr);
    });
    const curTotal = sumSlice(m, d, k);
    const prevTotal = sumSlice(prev, d, k);
    const diff = curTotal - prevTotal;
    const pct = prevTotal ? (diff / prevTotal) * 100 : null;
    const foot = document.createElement("tr");
    foot.innerHTML = `<td>Total</td><td class="num">${fmt(prevTotal)}</td><td class="num">${fmt(curTotal)}</td><td class="num ${diff >= 0 ? "compare-up" : "compare-down"}">${diff >= 0 ? "+" : ""}${fmt(diff)}</td><td class="num ${diff >= 0 ? "compare-up" : "compare-down"}">${pct === null ? "—" : (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%"}</td>`;
    tfoot.appendChild(foot);

    table.appendChild(thead);
    table.appendChild(tbody);
    table.appendChild(tfoot);
  }

  function render() {
    const m = monthSel.value;
    const d = districtSel.value;
    const k = makerSel.value;
    const idx = months.indexOf(m);
    const prev = idx > 0 ? months[idx - 1] : null;
    const total = sumSlice(m, d, k);
    const prevTotal = prev ? sumSlice(prev, d, k) : 0;

    renderKpis(m, d, k, total, prev, prevTotal);
    renderTrend(m, d, k);
    renderTopMakers(m, d, k);
    renderDistrictBars(m, d, k);
    renderMatrix(m, d, k);
    renderCompare(m, d, k, prev);
  }

  [monthSel, districtSel, makerSel, compareSel].forEach((s) => s.addEventListener("change", render));
  resetBtn.addEventListener("click", () => {
    monthSel.value = DATA.current && months.includes(DATA.current) ? DATA.current : months[months.length - 1];
    districtSel.value = ALL;
    makerSel.value = ALL;
    compareSel.value = "prev";
    render();
  });

  populate();
  render();
})();

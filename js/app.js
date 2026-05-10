/* app.js — shared logic for all pages.
   Each page defines window.APP_CONFIG before loading this script. */
(function () {
  var CFG = window.APP_CONFIG || {};
  var labels = CFG.labels || { confirmed: 'Confirmed', suspected: 'Suspected', deaths: 'Deaths', source: 'Source' };

  /* COUNTDOWN */
  (function () {
    var onset = new Date('2026-04-28T00:00:00Z');
    function setDigits(id, n) {
      var s = String(n).padStart(2, '0');
      var el = document.getElementById(id);
      if (!el) return;
      el.children[0].textContent = s[0];
      el.children[1].textContent = s[1];
    }
    function tick() {
      var d = Math.max(0, Date.now() - onset.getTime());
      setDigits('cd-d', Math.floor(d / 86400000));
      setDigits('cd-h', Math.floor((d % 86400000) / 3600000));
      setDigits('cd-m', Math.floor((d % 3600000) / 60000));
      setDigits('cd-s', Math.floor((d % 60000) / 1000));
    }
    tick(); setInterval(tick, 1000);
  })();

  /* NAV */
  window.toggleNav = function () { document.getElementById('navDrawer').classList.toggle('open'); };
  window.closeNav = function () { document.getElementById('navDrawer').classList.remove('open'); };

  /* FAQ */
  window.toggleFaq = function (id) { document.getElementById(id).classList.toggle('open'); };

  /* NEWS */
  (function () {
    var INITIAL = 6;
    var grid = document.getElementById('newsGrid');
    var btn = document.getElementById('loadMoreBtn');
    if (!grid || !btn) return;
    var overflow = [];
    var badgeMap = { OFFICIAL: 'badge-official', UPDATE: 'badge-update', GUIDANCE: 'badge-guidance' };
    var locale = CFG.locale || 'en-US';
    var fallbackNews = [
      { type: 'OFFICIAL', date: '2026-05-09', title: 'US sending charter flight to bring Americans home from hantavirus cruise ship', source: 'BBC', url: 'https://www.bbc.com/news/articles/c4g4r8pm832o' },
      { type: 'UPDATE', date: '2026-05-09', title: 'Spain readies for evacuations as a hantavirus-hit cruise ship heads for the Canary Islands', source: 'AP News', url: 'https://apnews.com/article/hantavirus-cruise-ship-e5b35d12be9dc30213d7a2b8b4955a88' },
      { type: 'OFFICIAL', date: '2026-05-09', title: 'Medical epidemiologist explains what to know about the cruise ship hantavirus outbreak', source: 'PBS', url: 'https://www.pbs.org/newshour/health/medical-epidemiologist-explains-what-to-know-about-the-cruise-ship-hantavirus-outbreak' },
      { type: 'OFFICIAL', date: '2026-05-09', title: 'Spanish island braces for hantavirus cruise ship as WHO urges calm', source: 'NBC News', url: 'https://www.nbcnews.com/video/spanish-island-braces-for-hantavirus-cruise-ship-as-who-urges-calm-263056453526' },
      { type: 'OFFICIAL', date: '2026-05-09', title: "This is not another COVID': WHO seeks to reassure Spanish island as hantavirus-stricken ship approaches", source: 'Los Angeles Times', url: 'https://www.latimes.com/world-nation/story/2026-05-09/who-reassures-spanish-island-as-hantavirus-stricken-ship-en-route' },
      { type: 'OFFICIAL', date: '2026-05-09', title: "Trump says hantavirus is 'under control' as WHO tracks cruise outbreak", source: 'Al Jazeera', url: 'https://www.aljazeera.com/video/newsfeed/2026/5/9/trump-says-hantavirus-is-under-control-as-who-tracks-cruise-outbreak' },
      { type: 'OFFICIAL', date: '2026-05-09', title: 'New Jersey joins list of US states monitoring hantavirus', source: 'Fox News', url: 'https://www.foxnews.com/video/6395074837112' },
      { type: 'OFFICIAL', date: '2026-05-09', title: "American doctor aboard ship with hantavirus outbreak on what's next", source: 'CNN', url: 'https://www.cnn.com/2026/05/09/world/video/hantavirus-cruise-ship-doctor-outbreak-vrtc-digvid' },
      { type: 'OFFICIAL', date: '2026-05-08', title: '17 American passengers aboard hantavirus-hit cruise ship will quarantine in Nebraska', source: 'NBC News', url: 'https://www.nbcnews.com/health/health-news/flight-attendant-tests-negative-hantavirus-new-case-suspected-remote-i-rcna344191' },
      { type: 'UPDATE', date: '2026-05-08', title: 'CDC Provides Update on Hantavirus Outbreak Linked to M/V Hondius Cruise Ship', source: 'CDC', url: 'https://www.cdc.gov/media/releases/2026/2026-cdc-provides-update-on-hantavirus-outbreak-linked-to-m-v-hondius-cruise-ship.html' },
      { type: 'OFFICIAL', date: '2026-05-04', title: 'Hantavirus cluster linked to cruise ship travel, Multi-country', source: 'World Health Organization', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599' }
    ];

    function formatDate(iso) {
      var p = iso.split('-');
      var d = new Date(+p[0], +p[1] - 1, +p[2]);
      return d.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function buildCard(item) {
      var a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'news-card';
      a.style.cssText = 'color:inherit;text-decoration:none;';
      a.innerHTML =
        '<div class="news-card-top">' +
        '<span class="badge ' + (badgeMap[item.type] || 'badge-official') + '">' +
        item.type[0] + item.type.slice(1).toLowerCase() +
        '</span>' +
        '<span class="news-date">' + formatDate(item.date) + '</span>' +
        '</div>' +
        '<div class="news-headline">' + item.title + '</div>' +
        '<div class="news-source">' + item.source + '</div>';
      return a;
    }

    function renderNews(items) {
      items.sort(function (a, b) { return b.date.localeCompare(a.date); });
      items.forEach(function (item, i) {
        var card = buildCard(item);
        if (i >= INITIAL) { card.style.display = 'none'; overflow.push(card); }
        grid.appendChild(card);
      });
      btn.style.display = overflow.length ? '' : 'none';
    }

    window.loadMoreNews = function () {
      overflow.forEach(function (c) { c.style.display = ''; });
      btn.style.display = 'none';
    };

    fetch('/data/news.json')
      .then(function (r) { return r.json(); })
      .then(function (items) { renderNews(items); })
      .catch(function () { renderNews(fallbackNews); });
  })();

  /* COUNTRY PANEL */
  var countryData = CFG.countryData || {};

  window.showPanel = function (key) {
    var d = countryData[key]; if (!d) return;
    var html =
      '<div class="panel-country">' + d.name + '</div>' +
      '<span class="panel-severity ' + d.severity + '">' + d.severityLabel + '</span><br>' +
      '<div class="panel-stats-row">' +
      '<div class="panel-stat"><div class="panel-stat-num">' + d.confirmed + '</div><div class="panel-stat-lbl">' + labels.confirmed + '</div></div>' +
      '<div class="panel-stat"><div class="panel-stat-num">' + d.suspected + '</div><div class="panel-stat-lbl">' + labels.suspected + '</div></div>' +
      '<div class="panel-stat"><div class="panel-stat-num">' + d.deaths + '</div><div class="panel-stat-lbl">' + labels.deaths + '</div></div>' +
      '</div>' +
      '<div class="panel-desc">' + d.desc + '</div>';
    d.updates.forEach(function (u) { html += '<div class="panel-update">' + u + '</div>'; });
    html += '<div class="panel-source"><strong>' + labels.source + ':</strong> ' + d.source + '</div>';
    document.getElementById('mapPanel').innerHTML = html;
    if (window.innerWidth < 1024) {
      document.getElementById('mapPanel').parentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  /* MAP */
  var map = L.map('map', { center: [20, -10], zoom: 2, minZoom: 1, maxZoom: 10, zoomControl: true });
  map.zoomControl.setPosition('topright');
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" style="color:#71717a">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" style="color:#71717a">CARTO</a>',
    subdomains: 'abcd', maxZoom: 20
  }).addTo(map);

  function mkIcon(color, size) {
    return L.divIcon({
      className: '',
      html: '<div class="pm-wrap" style="width:' + size + 'px;height:' + size + 'px;">' +
        '<div class="pm-inner" style="background:' + color + ';width:' + size + 'px;height:' + size + 'px;box-shadow:0 0 7px ' + color + ';"></div>' +
        '<div class="pm-ring" style="border:2px solid ' + color + ';width:' + (size * 2.4) + 'px;height:' + (size * 2.4) + 'px;margin-left:-' + (size * 0.7) + 'px;margin-top:-' + (size * 0.7) + 'px;"></div>' +
        '</div>',
      iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size]
    });
  }

  (CFG.pts || []).forEach(function (p) {
    var m = L.marker([p.lat, p.lng], { icon: mkIcon(p.c, p.s) }).addTo(map);
    m.bindPopup(
      '<div class="lf-popup-name">' + p.n + '</div>' +
      '<div class="lf-popup-status ' + p.sc + '">' + p.st + '</div>' +
      '<div class="lf-popup-detail">' + p.dt + '</div>',
      { maxWidth: 230 }
    );
    if (p.key) { m.on('click', function () { window.showPanel(p.key); }); }
  });

  L.polyline([[-54.8, -68.3], [-15.9, -5.7], [28.1, -15.4]], {
    color: '#f97316', weight: 2, opacity: 0.5, dashArray: '7 5'
  }).addTo(map);

  /* STATS */
  (function () {
    function set(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
    fetch('/data/stats.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        set('confirmed-cases', d.confirmed_cases);
        set('deaths', d.deaths);
        set('countries-affected', d.countries_affected);
        set('suspected-cases', d.suspected_cases);
        set('last-updated', d.last_updated);
      })
      .catch(function () { /* hardcoded defaults already in HTML */ });
  })();
})();

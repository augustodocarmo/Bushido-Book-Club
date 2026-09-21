(() => {
  const launchMeeting = new Date('2026-09-28T19:00:00+01:00');

  function getNextMeeting(now = new Date()) {
    if (now < launchMeeting) return launchMeeting;

    const ukParts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).formatToParts(now).reduce((acc, p) => (acc[p.type] = p.value, acc), {});

    const weekdayMap = {Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:0};
    const currentDay = weekdayMap[ukParts.weekday];
    const currentHour = Number(ukParts.hour);
    const currentMinute = Number(ukParts.minute);
    let daysAhead = (1 - currentDay + 7) % 7;

    if (daysAhead === 0 && (currentHour > 19 || (currentHour === 19 && currentMinute >= 0))) {
      daysAhead = 7;
    }

    const probe = new Date(now);
    probe.setUTCDate(probe.getUTCDate() + daysAhead);

    const targetDateString = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London', year:'numeric', month:'2-digit', day:'2-digit'
    }).format(probe);

    const [y,m,d] = targetDateString.split('-').map(Number);

    // UK is on BST until late October; after that GMT. Compute offset by asking Intl.
    const noonUtc = new Date(Date.UTC(y,m-1,d,12,0,0));
    const tzName = new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',timeZoneName:'shortOffset'}).formatToParts(noonUtc).find(p=>p.type==='timeZoneName')?.value || 'GMT';
    const match = tzName.match(/GMT([+-])(\d{1,2})?/);
    const offsetHours = match ? (match[1] === '+' ? Number(match[2] || 0) : -Number(match[2] || 0)) : 0;

    return new Date(Date.UTC(y,m-1,d,19 - offsetHours,0,0));
  }

  function update() {
    const now = new Date();
    const target = getNextMeeting(now);
    const diff = Math.max(0, target - now);

    document.getElementById('meetingDate').textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone:'Europe/London', weekday:'long', day:'numeric', month:'long', year:'numeric'
    }).format(target);

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('days').textContent = String(days).padStart(2,'0');
    document.getElementById('hours').textContent = String(hours).padStart(2,'0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2,'0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2,'0');
  }

  update();
  setInterval(update, 1000);
})();

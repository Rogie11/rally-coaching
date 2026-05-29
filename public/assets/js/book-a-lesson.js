let COACHES = [];
let activeFilter = 'all';
let searchQuery = '';

firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

let currentCoach = null;
let calYear, calMonth;
let selectedDate = null;
let selectedSlot = null;

function parseCoach(data) {
  return {
    ...data,
    availableDays: Object.entries(data.schedule || {})
      .filter(([, v]) => v.on && v.slots && v.slots.length > 0)
      .map(([k]) => Number(k))
  };
}

const DEFAULT_COACHES = [
  { id:1, name:"Eric", age:14, gender:"Male", location:"Midtown Atlanta", emoji:"EJ", color:"#3a7bd5", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:2, name:"Emma Cai",  age:15, gender:"Female", location:"Decatur, GA", emoji:"EC", color:"#e91e8c", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:3, name:"Kathy Ma",    age:14, gender:"Female", location:"Sandy Springs, GA", emoji:"KM", color:"#1abc9c", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:4, name:"Roger Zheng", age:15, gender:"Male", location:"Alpharetta, GA", emoji:"RZ", color:"#e67e22", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:5, name:"Evan Li",    age:15, gender:"Male", location:"Roswell, GA", emoji:"EL", color:"#9b59b6", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
{ id:6, name:"Eric Jiang", age:14, gender:"Male", location:"Midtown Atlanta", emoji:"EJ", color:"#3a7bd5", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:7, name:"Emma Cai",  age:15, gender:"Female", location:"Decatur, GA", emoji:"EC", color:"#e91e8c", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:8, name:"Kathy Ma",    age:14, gender:"Female", location:"Sandy Springs, GA", emoji:"KM", color:"#1abc9c", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:14, name:"Roger Zheng", age:15, gender:"Male", location:"Alpharetta, GA", emoji:"RZ", color:"#e67e22", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:15, name:"Evan Li",    age:15, gender:"Male", location:"Roswell, GA", emoji:"EL", color:"#9b59b6", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
    { id:21, name:"Eric Jiang", age:14, gender:"Male", location:"Midtown Atlanta", emoji:"EJ", color:"#3a7bd5", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:22, name:"Emma Cai",  age:15, gender:"Female", location:"Decatur, GA", emoji:"EC", color:"#e91e8c", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:23, name:"Kathy Ma",    age:14, gender:"Female", location:"Sandy Springs, GA", emoji:"KM", color:"#1abc9c", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:24, name:"Roger Zheng", age:15, gender:"Male", location:"Alpharetta, GA", emoji:"RZ", color:"#e67e22", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} },
  { id:25, name:"Evan Li",    age:15, gender:"Male", location:"Roswell, GA", emoji:"EL", color:"#9b59b6", level:"Advanced Player",
    badge:"badge-blue", badgeText:"Advanced", tags:["Advanced Training","Match Strategy","Ages 10–16"], rate:10, rating:5.0, reviews:0, filters:["advanced"],
    email:"", blockedDates:[], bookings:[],
    schedule:{"0":{on:false,slots:[]},"1":{on:false,slots:[]},"2":{on:false,slots:[]},"3":{on:false,slots:[]},"4":{on:false,slots:[]},"5":{on:false,slots:[]},"6":{on:false,slots:[]}} }
];

async function loadCoaches() {
  try {
    const snap = await db.collection('coaches').orderBy('id').get();
    if (snap.empty) throw new Error('empty');
    COACHES = snap.docs.map(d => parseCoach(d.data()));
  } catch (err) {
    COACHES = DEFAULT_COACHES.map(parseCoach);
  }
  document.getElementById('loadingMsg').style.display = 'none';
  renderCards();
  updateView();
}

function openModal(id) {
  currentCoach = COACHES.find(c => c.id === id);
  selectedDate = null;
  selectedSlot = null;

  document.getElementById('modalAvatar').textContent = currentCoach.emoji;
  document.getElementById('modalAvatar').style.background = currentCoach.color;
  document.getElementById('modalName').textContent = currentCoach.name;
  document.getElementById('modalSub').textContent = `Age ${currentCoach.age} · ${currentCoach.level} · ${currentCoach.gender} · ${currentCoach.location} · $${currentCoach.rate}/30min`;

  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();

  // Reset the date picker input and set min value to today's date in local time
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    dateInput.value = '';
    dateInput.min = todayStr;
  }

  document.getElementById('slotsContainer').innerHTML = '<p class="no-date-msg">← Please select a date first</p>';
  document.getElementById('bookingSummary').style.display = 'none';
  document.getElementById('bookingFlow').style.display = 'block';
  document.getElementById('profileFlow').style.display = 'none';
  document.getElementById('confirmScreen').classList.remove('show');
  document.getElementById('bookingForm').reset();
  document.getElementById('overlay').classList.add('open');
}

function onDateInputChange(val) {
  if (!val) {
    selectedDate = null;
    selectedSlot = null;
    document.getElementById('slotsContainer').innerHTML = '<p class="no-date-msg">← Please select a date first</p>';
    document.getElementById('bookingSummary').style.display = 'none';
    return;
  }
  const parts = val.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  
  const tempDate = new Date(y, m, d);
  if (isBlocked(tempDate)) {
    selectedDate = tempDate;
    selectedSlot = null;
    document.getElementById('slotsContainer').innerHTML = '<p class="no-date-msg">Coach is unavailable this day.</p>';
    document.getElementById('bookingSummary').style.display = 'none';
    return;
  }
  
  selectDate(y, m, d);
}

function closeModal(e) {
  if (e.target === document.getElementById('overlay')) closeModalBtn();
}

function closeModalBtn() {
  document.getElementById('profileFrame').src = 'about:blank';
  document.getElementById('profileFlow').style.display = 'none';
  document.getElementById('bookingFlow').style.display = 'block';
  document.getElementById('confirmScreen').classList.remove('show');
  document.getElementById('overlay').classList.remove('open');
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function changeMonth(d) {
  calMonth += d;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  selectedDate = null;
  selectedSlot = null;
  document.getElementById('slotsContainer').innerHTML = '<p class="no-date-msg">← Please select a date first</p>';
  document.getElementById('bookingSummary').style.display = 'none';
  renderCalendar();
}

function isBlocked(dt) {
  const key = dt.toISOString().slice(0, 10);
  return (currentCoach.blockedDates || []).some(b => b.date === key);
}

function renderCalendar() {
  // Custom calendar UI has been replaced by a native date input.
}

function selectDate(y, m, d) {
  selectedDate = new Date(y, m, d);
  selectedSlot = null;
  renderCalendar();
  renderSlots();
  updateSummary();
}

function renderSlots() {
  if (!selectedDate) return;
  const dow = selectedDate.getDay();
  const allSlots = currentCoach.schedule[dow]?.slots || [];
  const dateKey = selectedDate.toDateString();
  const bookedForDay = (currentCoach.bookings || []).filter(b => b.date === dateKey).map(b => b.slot);

  if (allSlots.length === 0) {
    document.getElementById('slotsContainer').innerHTML = '<p class="no-date-msg">No available slots on this day.</p>';
    return;
  }

  const html = allSlots.map(s => {
    const isBooked = bookedForDay.includes(s);
    const isSel = selectedSlot === s;
    let cls = 'slot';
    if (isBooked) cls += ' booked';
    else if (isSel) cls += ' selected';
    const click = isBooked ? '' : `onclick="selectSlot('${s}')"`;
    return `<div class="${cls}" ${click}>${s}${isBooked ? '<br><small>Booked</small>' : ''}</div>`;
  }).join('');

  document.getElementById('slotsContainer').innerHTML = `<div class="slots-grid">${html}</div>`;
}

function selectSlot(slot) {
  selectedSlot = slot;
  renderSlots();
  updateSummary();
}

function updateSummary() {
  if (!selectedDate && !selectedSlot) return;
  const sumEl = document.getElementById('bookingSummary');
  sumEl.style.display = 'flex';
  if (selectedDate) {
    document.getElementById('sumDate').textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  document.getElementById('sumTime').textContent = selectedSlot || '—';
  document.getElementById('sumRate').textContent = `$${currentCoach.rate}`;
}

const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TPL_STUDENT = 'YOUR_STUDENT_TEMPLATE_ID';
const EMAILJS_TPL_COACH = 'YOUR_COACH_TEMPLATE_ID';

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

async function submitBooking(e) {
  e.preventDefault();
  if (!selectedDate || !selectedSlot) {
    alert('Please select a date and time slot before confirming.');
    return;
  }

  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  const name = document.getElementById('fName').value;
  const parent = document.getElementById('fParent').value;
  const email = document.getElementById('fEmail').value;
  const phone = document.getElementById('fPhone').value;
  const level = document.getElementById('fLevel').value;
  const notes = document.getElementById('fNotes').value || 'None';
  const dateKey = selectedDate.toDateString();
  const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const newBooking = {
    student: name,
    parent,
    email,
    phone,
    level,
    notes,
    date: dateKey,
    slot: selectedSlot,
    createdAt: new Date().toISOString()
  };

  try {
    await db.collection('coaches').doc(String(currentCoach.id)).update({
      bookings: firebase.firestore.FieldValue.arrayUnion(newBooking)
    });
    if (!currentCoach.bookings) currentCoach.bookings = [];
    currentCoach.bookings.push(newBooking);
  } catch (err) {
    console.error('Failed to save booking:', err);
  }

  const shared = {
    coach_name: currentCoach.name,
    coach_age: currentCoach.age,
    coach_level: currentCoach.level,
    rate: currentCoach.rate,
    student_name: name,
    parent_name: parent,
    student_email: email,
    phone,
    level,
    notes,
    date: dateStr,
    time: selectedSlot,
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_STUDENT, {
      ...shared,
      to_email: email,
      to_name: parent,
    });

    if (currentCoach.email) {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TPL_COACH, {
        ...shared,
        to_email: currentCoach.email,
        to_name: currentCoach.name,
      });
    }
  } catch (err) {
    console.warn('Email send failed:', err);
  }

  document.getElementById('confirmDetails').innerHTML = `
    <div class="confirm-row"><span class="key">Coach</span><span class="val">${currentCoach.name}</span></div>
    <div class="confirm-row"><span class="key">Student</span><span class="val">${name}</span></div>
    <div class="confirm-row"><span class="key">Date</span><span class="val">${dateStr}</span></div>
    <div class="confirm-row"><span class="key">Time</span><span class="val">${selectedSlot}</span></div>
    <div class="confirm-row"><span class="key">Duration</span><span class="val">30 min</span></div>
    <div class="confirm-row"><span class="key">Rate</span><span class="val">$${currentCoach.rate}</span></div>
    <div class="confirm-row"><span class="key">Confirmation sent to</span><span class="val">${email}</span></div>
  `;

  btn.disabled = false;
  btn.textContent = 'Confirm Booking →';
  document.getElementById('bookingFlow').style.display = 'none';
  document.getElementById('confirmScreen').classList.add('show');
}

loadCoaches();

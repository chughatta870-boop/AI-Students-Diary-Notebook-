let diary = JSON.parse(localStorage.getItem('studentDiary')) || [];
let editingId = null;

// MODE SWITCH
document.getElementById('studentMode').onclick = () => switchMode('student');
document.getElementById('teacherMode').onclick = () => switchMode('teacher');

function switchMode(mode){
  document.getElementById('studentPanel').style.display = mode=='student'?'block':'none';
  document.getElementById('teacherPanel').style.display = mode=='teacher'?'block':'none';
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(mode+'Mode').classList.add('active');
  mode=='student'? loadDiary() : loadAllNotes();
}

// STUDENT NAME CHANGE HO TO AUTO LOAD
document.getElementById('studentName').addEventListener('input', loadDiary);

// MONTH FILTER
document.getElementById('filterMonth').addEventListener('input', loadDiary);

// TEACHER SEARCH
document.getElementById('searchStudent').addEventListener('input', loadAllNotes);

// SAVE
document.getElementById('saveBtn').onclick = () => {
  let entry = {
    id: editingId || Date.now(),
    student: document.getElementById('studentName').value.trim(),
    roll: document.getElementById('rollNo').value.trim(),
    subject: document.getElementById('subject').value,
    date: document.getElementById('noteDate').value,
    title: document.getElementById('noteTitle').value.trim(),
    content: document.getElementById('noteContent').value.trim(),
    remark: editingId? diary.find(d=>d.id==editingId).remark : ""
  };

  if(!entry.student ||!entry.subject ||!entry.title ||!entry.date) {
    alert('⚠️ Student Naam, Subject, Date aur Title zaroori hain');
    return;
  }

  try{
    if(editingId) {
      diary = diary.map(d=> d.id==editingId? entry : d);
      alert('✅ Update ho gaya!');
    } else {
      diary.push(entry);
      alert('✅ Save ho gaya!');
    }
    localStorage.setItem('studentDiary', JSON.stringify(diary));
    resetForm();
    loadDiary();
  } catch(e){
    alert('❌ Storage full ho gaya hai. Kuch purani notes delete karein.');
  }
}

function resetForm(){
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteContent').value = '';
  editingId = null;
  document.getElementById('saveBtn').innerText = '💾 Save Note';
}

// LOAD STUDENT DIARY
function loadDiary() {
  let list = document.getElementById('diaryList');
  let student = document.getElementById('studentName').value.trim();
  let month = document.getElementById('filterMonth').value; // YYYY-MM

  let filtered = diary.filter(d=>{
    let matchStudent = student? d.student.toLowerCase().includes(student.toLowerCase()) : true;
    let matchMonth = month? d.date.startsWith(month) : true;
    return matchStudent && matchMonth;
  });

  if(filtered.length == 0) {
    list.innerHTML = `<p style="text-align:center; color:#777;">Koi record nahi mila</p>`;
    return;
  }

  list.innerHTML = '';
  filtered.sort((a,b)=> new Date(b.date) - new Date(a.date)).forEach(d=>{
    list.innerHTML += `
      <div class="diary-item">
        <div>
          <b>${d.date}</b> - ${d.subject}<br>
          <span><b>${d.title}</b></span><br>
          <small>Remark: ${d.remark || 'Pending'}</small>
        </div>
        <div>
          <button onclick="editEntry(${d.id})">✏️</button>
          <button onclick="deleteEntry(${d.id})" style="background:#d32f2f;">🗑️</button>
        </div>
      </div>`;
  });
}

// TEACHER DASHBOARD
function loadAllNotes() {
  let div = document.getElementById('allNotes');
  let search = document.getElementById('searchStudent').value.toLowerCase();

  let filtered = diary.filter(d=> d.student.toLowerCase().includes(search));

  if(filtered.length == 0) {
    div.innerHTML = `<div class="card"><p>Koi note nahi mila</p></div>`;
    return;
  }

  div.innerHTML = '';
  filtered.sort((a,b)=> new Date(b.date) - new Date(a.date)).forEach(d=>{
    div.innerHTML += `
      <div class="card">
        <h3>${d.student} - ${d.roll || 'No Roll'} - ${d.subject}</h3>
        <p><b>Date:</b> ${d.date} | <b>Title:</b> ${d.title}</p>
        <p style="white-space: pre-wrap;">${d.content}</p>
        <p><b>Remark:</b> <span style="font-weight:bold; color:#2e7d32;">${d.remark || 'Pending'}</span></p>
        <button class="remark-btn excellent" onclick="addRemark(${d.id},'Excellent')">Excellent</button>
        <button class="remark-btn good" onclick="addRemark(${d.id},'Good')">Good</button>
        <button class="remark-btn avg" onclick="addRemark(${d.id},'Improve')">Improve</button>
        <button class="remark-btn incomplete" onclick="addRemark(${d.id},'Incomplete')">Incomplete</button>
      </div>`;
  });
}

function addRemark(id, remark) {
  diary = diary.map(d=> d.id==id? {...d, remark} : d);
  localStorage.setItem('studentDiary', JSON.stringify(diary));
  loadAllNotes();
}

function editEntry(id) {
  let d = diary.find(x=>x.id==id);
  document.getElementById('studentName').value = d.student;
  document.getElementById('rollNo').value = d.roll;
  document.getElementById('subject').value = d.subject;
  document.getElementById('noteDate').value = d.date;
  document.getElementById('noteTitle').value = d.title;
  document.getElementById('noteContent').value = d.content;
  editingId = id;
  document.getElementById('saveBtn').innerText = '🔄 Update Note';
  window.scrollTo({top:0, behavior:'smooth'}); // Upar le jao form pe
}

function deleteEntry(id) {
  if(confirm('Kya aap waqai ye note delete karna chahte hain?')) {
    diary = diary.filter(x=>x.id!=id);
    localStorage.setItem('studentDiary', JSON.stringify(diary));
    loadDiary();
  }
}

// DOWNLOAD & SHARE
document.getElementById('downloadBtn').onclick = () => {
  let student = document.getElementById('studentName').value || 'Student';
  let title = document.getElementById('noteTitle').value || 'Note';
  let content = `Student: ${student}\nSubject: ${document.getElementById('subject').value}\nDate: ${document.getElementById('noteDate').value}\nTitle: ${title}\n\n${document.getElementById('noteContent').value}`;
  let blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${student}_${title}.txt`;
  a.click();
}

document.getElementById('shareBtn').onclick = async () => {
  let content = `Student: ${document.getElementById('studentName').value}\n${document.getElementById('noteContent').value}`;
  if (navigator.share) {
    await navigator.share({title: 'Student Note', text: content});
  } else {
    await navigator.clipboard.writeText(content);
    alert('📋 Note copy ho gaya hai!');
  }
}

document.getElementById('noteDate').valueAsDate = new Date();
loadDiary();

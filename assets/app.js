/* =============== Local Storage Helpers =============== */
function getStudents(){ return JSON.parse(localStorage.getItem("students")||"[]"); }
function saveStudents(arr){ localStorage.setItem("students", JSON.stringify(arr)); }
function setCurrentUser(obj){ localStorage.setItem("currentUser", JSON.stringify(obj)); }
function getCurrentUser(){ return JSON.parse(localStorage.getItem("currentUser")||"null"); }

/* =============== Seed Demo Data =============== */
function seedDemoData(){
  //  If demo loading is disabled, stop here
  if(localStorage.getItem("disableDemo") === "true") return;
  const demo = [
    {
      name: "Aarav Sharma",
      roll: "BBA23-101",
      password: "aarav123",
      results: [{
        course: "BBA", term: "Semester 1", year: 2025,
        subjects: [
          { code:"BBA101", name:"Principles of Management", maxMarks:100, marksObtained:86 },
          { code:"BBA102", name:"Business Economics", maxMarks:100, marksObtained:78 },
          { code:"BBA103", name:"Financial Accounting", maxMarks:100, marksObtained:91 }
        ],
        marksheet: {
          name: "aarav_marksheet.pdf",
          type: "application/pdf",
          url: "assets/marksheets/aarav_marksheet.pdf"
        }
      }]
    },
    {
      name: "Isha Verma",
      roll: "BCA23-055",
      password: "isha123",
      results: [{
        course: "BCA", term: "Semester 1", year: 2025,
        subjects: [
          { code:"BCA101", name:"Programming Fundamentals", maxMarks:100, marksObtained:88 },
          { code:"BCA102", name:"Mathematics - I", maxMarks:100, marksObtained:72 },
          { code:"BCA103", name:"Computer Architecture", maxMarks:100, marksObtained:79 }
        ],
        marksheet: {
          name: "isha_marksheet.pdf",
          type: "application/pdf",
          url: "assets/marksheets/isha_marksheet.pdf"
        }
      }]
    },
    {
      name: "Rohan Mehta",
      roll: "BTECH23-210",
      password: "rohan123",
      results: [{
        course: "B.Tech CSE", term: "Semester 2", year: 2025,
        subjects: [
          { code:"CSE121", name:"Data Structures", maxMarks:100, marksObtained:83 },
          { code:"CSE122", name:"Discrete Mathematics", maxMarks:100, marksObtained:76 },
          { code:"CSE123", name:"Digital Systems", maxMarks:100, marksObtained:69 }
        ],
        marksheet: {
          name: "rohan_marksheet.pdf",
          type: "application/pdf",
          url: "assets/marksheets/rohan_marksheet.pdf"
        }
      }]
    }
  ];

  saveStudents(demo);
}

// ✅ Load demo only if no data exists
if(!localStorage.getItem("students")) {
  seedDemoData();
}


/* =============== Course Semesters =============== */
const courseSemesters = {
  "BBA": ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6"],
  "BCA": ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6"],
  "B.Tech CSE": ["Semester 1","Semester 2","Semester 3","Semester 4","Semester 5","Semester 6","Semester 7","Semester 8"]
};

/* =============== Helpers =============== */
function calcGrade(m, max){
  const p=(m/max)*100;
  if(p>=90) return "A+";
  if(p>=80) return "A";
  if(p>=70) return "B+";
  if(p>=60) return "B";
  if(p>=50) return "C";
  return "F";
}
function readFileAsDataURL(file){
  return new Promise((res)=>{
    const fr=new FileReader();
    fr.onload=()=>res(fr.result);
    fr.readAsDataURL(file);
  });
}

/* =============== Student Login =============== */
document.addEventListener("click",(e)=>{
  if(e.target.id==="studentLoginBtn"){
    const stu=getStudents().find(s=>s.roll===studentRoll.value.trim() && s.password===studentPass.value.trim());
    if(!stu) return alert("Invalid Roll or Password");
    setCurrentUser({role:"student", roll:stu.roll});
    location.href="student.html";
  }
});

/* =============== Admin Login =============== */
document.addEventListener("click",(e)=>{
  if(e.target.id==="adminLoginBtn"){
    if(adminUser.value==="admin" && adminPass.value==="admin123"){
      setCurrentUser({role:"admin"});
      location.href="admin.html";
    } else alert("Wrong Admin Credentials");
  }
});

/* =============== Admin Page =============== */
if(document.body.id==="page-admin"){
  
  addStudentBtn.onclick=()=>{
    const s=getStudents();
    if(s.some(x=>x.roll===addRoll.value.trim())) return alert("Roll Exists");
    s.push({name:addName.value,roll:addRoll.value,password:addPass.value,results:[]});
    saveStudents(s);
    alert("Student Added ✅");
  };

  resCourse.onchange=()=>{
    resSem.innerHTML="<option value=''>Select Semester</option>";
    (courseSemesters[resCourse.value]||[]).forEach(sem=>resSem.innerHTML+=`<option>${sem}</option>`);
  };

  addSubjectBtn.onclick=()=>subjectsContainer.appendChild(createRow());

  function createRow(){
    const r=document.createElement("div");
    r.className="subject-row";
    r.innerHTML=`<input class=subCode placeholder='Code'><input class=subName placeholder='Name'><input class=subMax type=number value=100><select class=subMarks></select><button class="btn danger removeSubBtn">X</button>`;
    const max=r.querySelector(".subMax"), sel=r.querySelector(".subMarks");
    const fill=()=>{sel.innerHTML=""; for(let i=0;i<=+max.value;i++) sel.innerHTML+=`<option>${i}</option>`;};
    fill(); max.oninput=fill;
    r.querySelector(".removeSubBtn").onclick=()=>r.remove();
    return r;
  }

  addResultBtn.onclick=async()=>{
    const s=getStudents(), stu=s.find(x=>x.roll===resRoll.value.trim());
    if(!stu) return alert("Roll Not Found");
    const subjects=[...subjectsContainer.querySelectorAll(".subject-row")].map(r=>({
      code:r.querySelector(".subCode").value,
      name:r.querySelector(".subName").value,
      maxMarks:+r.querySelector(".subMax").value,
      marksObtained:+r.querySelector(".subMarks").value
    }));
    let marksheet=null;
    if(marksheetFile.files[0]){
      marksheet={name:marksheetFile.files[0].name,type:marksheetFile.files[0].type,dataURL:await readFileAsDataURL(marksheetFile.files[0])};
    }

    stu.results.push({course:resCourse.value,term:resSem.value,year:new Date().getFullYear(),subjects,marksheet});
    saveStudents(s);
    alert("Result Saved ✅");
  };

 clearDataBtn.onclick = () => {
  if(confirm("Clear ALL data?\nDemo data will NOT return unless loaded manually.")){
    localStorage.removeItem("students");   // delete student data
    localStorage.setItem("disableDemo","true");  // ✅ stop demo reload
    location.reload();
  }
};
  loadDemoBtn.onclick = () => {
  localStorage.removeItem("disableDemo"); // ✅ allow demo again
  seedDemoData();
  location.reload();
};

  exportBtn.onclick=()=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(getStudents(),null,2)])); a.download="backup.json"; a.click(); };
}

/* =============== View Students Page =============== */
if(document.body.id==="page-view-students"){
  const tbody=document.getElementById("studentsTable");
  tbody.innerHTML="";
  getStudents().forEach((s,i)=>{
    tbody.innerHTML+=`
    <tr>
      <td>${i+1}</td>
      <td>${s.name}</td>
      <td>${s.roll}</td>
      <td><span id="pass-${s.roll}">******</span> <button class="btn small-btn" onclick="togglePassword('${s.roll}')">Show</button></td>
      <td><button class="btn small-btn" onclick="openStudent('${s.roll}')">View</button> <button class="btn danger small-btn" onclick="deleteStudent('${s.roll}')">Delete</button></td>
    </tr>`;
  });
}

/* =============== Student Dashboard =============== */
if(document.body.id==="page-student"){
  const stu=getStudents().find(s=>s.roll===getCurrentUser().roll);
  stuName.textContent=stu.name; stuRoll.textContent=stu.roll;
  resultsList.innerHTML="";
  stu.results.forEach((r,i)=>resultsList.innerHTML+=`<div class='card'><strong>${r.course} — ${r.term}</strong><button class='btn' onclick="openResult('${stu.roll}',${i})">View</button></div>`);
}

/* =============== Navigation Helpers =============== */
function openStudent(roll){ setCurrentUser({role:"student",roll}); location.href="student.html"; }
function deleteStudent(roll){ if(confirm("Delete Student?")){ saveStudents(getStudents().filter(s=>s.roll!==roll)); location.reload(); } }
function openResult(roll,index){ localStorage.setItem("currentResult",JSON.stringify({roll,index})); location.href="result.html"; }
function togglePassword(roll){ const s=getStudents().find(x=>x.roll===roll); const sp=document.getElementById("pass-"+roll); sp.textContent=(sp.textContent==="******")?s.password:"******"; }

/* =============== Result Page =============== */
if(document.body.id==="page-result"){
  const {roll,index}=JSON.parse(localStorage.getItem("currentResult"));
  const r=getStudents().find(s=>s.roll===roll).results[index];

  resTitle.textContent=`${roll} — ${r.course} / ${r.term} (${r.year})`;

  let total=0,max=0;
  marksTable.tBodies[0].innerHTML="";
  r.subjects.forEach((s,i)=>{
    total+=s.marksObtained; max+=s.maxMarks;
    marksTable.tBodies[0].innerHTML+=`<tr><td>${i+1}</td><td>${s.code}</td><td>${s.name}</td><td>${s.maxMarks}</td><td>${s.marksObtained}</td><td>${calcGrade(s.marksObtained,s.maxMarks)}</td></tr>`;
  });
  totalMarks.textContent=total;
  totalMax.textContent=max;
  percent.textContent=((total/max)*100).toFixed(2);

  if(r.marksheet){
    marksheetCard.style.display="block";
    const src=r.marksheet.url||r.marksheet.dataURL;
    marksheetName.textContent=r.marksheet.name;
    marksheetLink.href=src;
  }

  new Chart(marksChart.getContext("2d"),{
    type:'bar',
    data:{ labels:r.subjects.map(s=>s.name), datasets:[{ data:r.subjects.map(s=>s.marksObtained), backgroundColor:"rgba(54,162,235,.7)" }] },
    options:{ scales:{ y:{beginAtZero:true} } }
  });
}

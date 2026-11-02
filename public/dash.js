const root=document.body.dataset.user||"";
document.getElementById("logout").addEventListener("click",async()=>{
  await fetch("/api/logout",{method:"POST",credentials:"same-origin"});location.replace("/login.html");
});
document.querySelectorAll(".tasks input").forEach(cb=>{
  const k="ss_task_"+root+"_"+cb.dataset.id;
  try{cb.checked=localStorage.getItem(k)==="1"}catch{}
  cb.addEventListener("change",()=>{try{localStorage.setItem(k,cb.checked?"1":"0")}catch{}});
});

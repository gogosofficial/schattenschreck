const f=document.getElementById("loginForm"),err=document.getElementById("err"),btn=document.getElementById("btn");
f.addEventListener("submit",async e=>{
  e.preventDefault();err.textContent="";
  const email=f.email.value.trim(),password=f.password.value;
  if(!email||!password){err.textContent="Bitte E-Mail und Passwort eingeben.";return}
  btn.disabled=true;
  try{
    const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({email,password})});
    if(r.ok){location.replace("/dashboard");return}
    err.textContent=r.status===401?"E-Mail oder Passwort falsch.":"Login nicht möglich. Bitte später erneut versuchen.";
  }catch{err.textContent="Keine Verbindung."}
  btn.disabled=false;
});

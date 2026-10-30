const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names=['essential','premium','elite'];
const allowed=['first','last','email','agency','purpose','scenes','ready','footage','priority','music','displayName','contact','editStyle','teaser','teaserNotes','grading','deadline','notes','understood'];
export default async function handler(req,res){
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 const {package:pkg,answers:a}=req.body||{};
 if(!names.includes(pkg)||!a||typeof a!=='object'||Array.isArray(a))return res.status(400).json({error:'Invalid submission.'});
 for(const f of ['first','last','email','purpose','scenes','ready','music','displayName','editStyle','understood'])if(typeof a[f]!=='string'||!a[f].trim())return res.status(400).json({error:'Please complete all required questions.'});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)||a.email.length>254)return res.status(400).json({error:'Invalid email address.'});
 if(allowed.some(f=>typeof a[f]!=='undefined'&&(typeof a[f]!=='string'||a[f].length>3000)))return res.status(400).json({error:'A response is too long.'});
 const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL;
 if(!key||!from)return res.status(503).json({error:'Email sending is not configured yet.'});
 const rows=allowed.filter(f=>a[f]).map(f=>'<tr><th style="text-align:left;vertical-align:top;padding:8px;border-bottom:1px solid #ddd">'+esc(f)+'</th><td style="padding:8px;border-bottom:1px solid #ddd">'+esc(a[f]).replace(/\n/g,'<br>')+'</td></tr>').join('');
 try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:['j.ireels@yahoo.com'],reply_to:a.email,subject:`JI Reels ${pkg.toUpperCase()} intake — ${a.first} ${a.last}`,html:`<h2>New ${esc(pkg)} package intake</h2><p>Client has completed their project brief and was directed to Stripe checkout. <strong>Payment is not confirmed by this email.</strong></p><table>${rows}</table>`})});if(!r.ok){console.error('Resend intake error',r.status,await r.text());return res.status(502).json({error:'Could not deliver your project brief.'});}return res.status(200).json({ok:true});}catch(e){console.error('Package intake error',e);return res.status(502).json({error:'Email service is temporarily unavailable.'});}
}
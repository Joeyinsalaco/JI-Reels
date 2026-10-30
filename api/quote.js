// Vercel Node.js serverless function. Set RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel environment variables.
const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'Method not allowed'}); }
  const body=req.body || {};
  if (body._honey) return res.status(200).json({ok:true});
  const fields=['First name','Last name','Email','Agency','Desired deadline','Estimated budget','Deliverables needed','Footage link','Project details'];
  for(const key of ['First name','Last name','Email','Deliverables needed','Project details']) if(typeof body[key]!=='string'||!body[key].trim()) return res.status(400).json({error:'Please complete all required fields.'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.Email)) return res.status(400).json({error:'Enter a valid email address.'});
  if(fields.some(key=>String(body[key]??'').length>5000)) return res.status(400).json({error:'One of the fields is too long.'});
  const key=process.env.RESEND_API_KEY, from=process.env.RESEND_FROM_EMAIL;
  if(!key||!from) return res.status(503).json({error:'Quote delivery is not configured yet. Please email j.ireels@yahoo.com.'});
  const html='<h2>New JI Reels quote request</h2><table>'+fields.map(k=>'<tr><th align="left" valign="top">'+escapeHtml(k)+'</th><td>'+escapeHtml(body[k]).replace(/\n/g,'<br>')+'</td></tr>').join('')+'</table>';
  try {const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:['j.ireels@yahoo.com'],reply_to:body.Email,subject:'New JI Reels quote request — '+String(body['First name']).slice(0,80),html})});
  if(!response.ok){console.error('Resend delivery error',response.status,await response.text());return res.status(502).json({error:'Email delivery failed. Please try again or email us directly.'});}
  return res.status(200).json({ok:true});
  } catch(e){console.error('Quote API failure',e);return res.status(502).json({error:'Unable to send your request right now. Please try again.'});}
}

import Stripe from 'stripe';
export const config={api:{bodyParser:false}};
async function readRaw(req){const chunks=[];for await(const chunk of req)chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));return Buffer.concat(chunks);}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).end();
 if(!process.env.STRIPE_SECRET_KEY||!process.env.STRIPE_WEBHOOK_SECRET)return res.status(503).json({error:'Webhook not configured'});
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);let event;
 try{event=stripe.webhooks.constructEvent(await readRaw(req),req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);}catch(e){console.error('Invalid Stripe signature',e.message);return res.status(400).send('Invalid signature');}
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return res.status(200).json({received:true});
 const session=event.data.object;
 if(session.payment_status!=='paid')return res.status(200).json({received:true,pending:true});
 const intakeId=session.client_reference_id||session.metadata?.intake_id;
 if(!intakeId||!session.metadata?.package)return res.status(200).json({received:true,unmatched:true});
 // Idempotency: Stripe may retry events. This email uses a deterministic Resend idempotency key.
 const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL;
 if(!key||!from)return res.status(503).json({error:'Email is not configured'});
 const pkg=session.metadata.package;const email=session.customer_details?.email||session.customer_email||'Not provided';
 const amount=new Intl.NumberFormat('en-CA',{style:'currency',currency:(session.currency||'cad').toUpperCase()}).format((session.amount_total||0)/100);
 const subject=`PAYMENT CONFIRMED · ${pkg.toUpperCase()} · ${intakeId.slice(0,8)}`;
 const plain=`JI REELS — PAYMENT CONFIRMED\nIntake ID: ${intakeId}\nPackage: ${pkg}\nAmount: ${amount}\nCustomer: ${email}\nStripe session: ${session.id}\nPayment status: PAID\n\nMatch this intake ID to the questionnaire email before starting work.`;
 const html=`<div style="font-family:Arial,sans-serif;background:#f2f5fb;padding:36px"><div style="max-width:560px;margin:auto;background:white;border-radius:16px;overflow:hidden"><div style="background:#101827;color:#fff;padding:28px;font-size:26px">JI Reels <span style="font-size:12px;color:#b0c9ef">PAYMENTS</span></div><div style="padding:30px"><div style="color:#16875b;font-weight:700;letter-spacing:1px">✓ PAYMENT CONFIRMED</div><h1 style="font-family:Georgia,serif;font-weight:400">${esc(pkg[0].toUpperCase()+pkg.slice(1))} · ${esc(amount)}</h1><p><b>Customer:</b> ${esc(email)}</p><p><b>Intake ID:</b> ${esc(intakeId)}</p><p><b>Stripe session:</b> ${esc(session.id)}</p><p style="color:#5e6a7b">Match the intake ID to the questionnaire email before beginning work.</p></div></div></div>`;
 try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`ji-paid-${session.id}`},body:JSON.stringify({from,to:['j.ireels@yahoo.com'],subject,html,text:plain})});if(!response.ok){console.error('Payment notification failed',response.status,await response.text());return res.status(502).json({error:'Notification failed; retry webhook'});}return res.status(200).json({received:true});}catch(e){console.error('Payment notification exception',e);return res.status(502).json({error:'Notification failed'});}
}

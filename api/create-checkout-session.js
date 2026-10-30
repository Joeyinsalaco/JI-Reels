import Stripe from 'stripe';
const plans={essential:'STRIPE_PRICE_ESSENTIAL',premium:'STRIPE_PRICE_PREMIUM',elite:'STRIPE_PRICE_ELITE'};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const {package:pkg,intakeId,email}=req.body||{};
 if(!Object.hasOwn(plans,pkg)||typeof intakeId!=='string'||!/^[0-9a-f-]{36}$/i.test(intakeId)||typeof email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Invalid checkout request.'});
 const verifiedPrices={essential:'price_1SjCSkPFml3LPMtOVkNW09sR',premium:'price_1SjBmzPFml3LPMtO8kg4s5sF',elite:'price_1TsQEGPFml3LPMtOiwgNo4W6'};
 const price=process.env[plans[pkg]]||verifiedPrices[pkg];
 if(!process.env.STRIPE_SECRET_KEY||!price)return res.status(503).json({error:'Secure checkout is not configured. Please contact JI Reels.'});
 try{
  const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin='https://jireels.ca';
  const session=await stripe.checkout.sessions.create({mode:'payment',line_items:[{price,quantity:1}],customer_email:email,client_reference_id:intakeId,metadata:{intake_id:intakeId,package:pkg},payment_intent_data:{metadata:{intake_id:intakeId,package:pkg}},success_url:`${origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${origin}/package-intake.html?package=${encodeURIComponent(pkg)}&cancelled=1`});
  return res.status(200).json({url:session.url});
 }catch(err){console.error('Stripe checkout error',err?.message);return res.status(502).json({error:'Could not start checkout. Please try again.'});}
}

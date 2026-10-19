"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { whatsappHref } from "../lib/site-content";

export default function BookingForm({ content }){
  const { treatments } = content;
  const params=useSearchParams(); const requested=params.get("treatment");
  const [sent,setSent]=useState(false);
  const today = new Date();
  const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  function submit(event){event.preventDefault();const data=new FormData(event.currentTarget);const name=data.get("name"), phone=data.get("phone"), date=data.get("date"), time=data.get("time"), treatment=treatments.find(item=>item.id===data.get("treatment"))?.name, notes=data.get("notes");
    const location = content.locations[Number(data.get("location"))] || content.locations[0];
    const message=`Hello Waves Spa, I’d like to request an appointment.\n\nName: ${name}\nPhone: ${phone}\nTreatment: ${treatment}\nLocation: ${location.name} — ${location.address}, ${location.city}\nPreferred date: ${date}\nPreferred time: ${time}${notes?`\nNotes: ${notes}`:""}\n\nPlease let me know if this time is available.`;
    const target=whatsappHref(content.whatsapp, message);
    window.open(target,"_blank","noopener,noreferrer");setSent(true);
  }
  if(sent)return <div className="booking-success"><span><Check/></span><h2>Your request is ready.</h2><p>We opened WhatsApp with your appointment details. Send the message to reach us, and we’ll reply to confirm availability.</p><button className="text-link" onClick={()=>setSent(false)}>Make another request</button></div>;
  return <form className="booking-form" onSubmit={submit}>
    <label>Your name<input required name="name" autoComplete="name" placeholder="Full name"/></label>
    <label>Phone or WhatsApp<input required name="phone" type="tel" autoComplete="tel" placeholder="+977 …"/></label>
    <label>Treatment<select name="treatment" defaultValue={treatments.some(item=>item.id===requested)?requested:treatments[0].id}>{treatments.map(item=><option value={item.id} key={item.id}>{item.name} · {item.price}</option>)}</select></label>
    {content.locations.length > 1 && <label>Location<select name="location" defaultValue="0">{content.locations.map((location, index)=><option value={index} key={location.id}>{location.name} · {location.city}</option>)}</select></label>}
    <label>Preferred date<input required name="date" type="date" min={minimumDate}/></label>
    <label>Preferred time<select name="time" defaultValue="10:00"><option>09:00</option><option>10:00</option><option>11:00</option><option>12:00</option><option>13:00</option><option>14:00</option><option>15:00</option><option>16:00</option><option>17:00</option><option>18:00</option><option>19:00</option></select></label>
    <label className="wide-field">Anything we should know? <span className="optional">Optional</span><textarea name="notes" rows="3" placeholder="Preferences, sensitivities, or a question"/></label>
    <button className="button button-dark submit-button" type="submit">Continue to WhatsApp <ArrowUpRight size={16}/></button>
    <p className="form-note">Your appointment is only confirmed once our team replies.</p>
  </form>;
}

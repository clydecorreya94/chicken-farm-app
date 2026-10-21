// Daily task list + Telegram message builders.
import { VACCINATIONS, DEWORMING, WEIGHT_TARGETS } from "../data/schedule";
import { getFeed, getLightPlan, getPrevFeed, isTransitionWeek, transitionRatio, getSessions, getDayFeedSnapshot } from "./feed";
import { addCalendarDays, formatLongDate } from "./dates";
function buildTasks(dayAge, numBirds) {
  const feed    = getFeed(dayAge);
  const lightPlan = getLightPlan(dayAge);
  const totalG  = Math.round(((feed.gramsPerBird[0]+feed.gramsPerBird[1])/2)*numBirds);
  const totalWL = Math.round(((feed.waterMl[0]+feed.waterMl[1])/2)*numBirds/1000*10)/10;
  const sessions = getSessions(dayAge, totalG);
  const pb      = n => Math.round(n/numBirds);
  const isTrans = isTransitionWeek(dayAge);
  const tRatio  = transitionRatio(dayAge);
  const prevF   = getPrevFeed(dayAge);
  const tasks   = [];

  if (dayAge <= 7) {
    tasks.push({
      time: "Pre-Dawn",
      icon: "💡",
      priority: "high",
      task: "Keep brooder light ON for full 24 hours",
      detail: `${lightPlan.weekLabel} · ${lightPlan.totalHours} total light. ${lightPlan.note}`,
    });
  } else if (dayAge <= 42) {
    tasks.push({
      time: "Pre-Dawn",
      icon: "💡",
      priority: "medium",
      task: "Turn ON brooder lights at 11:30 PM",
      detail: `${lightPlan.weekLabel} · ${lightPlan.totalHours} total light. Keep chicks in darkness only from 7:30 PM to 11:30 PM.`,
    });
  } else if (dayAge >= 43) {
    tasks.push({
      time: "Pre-Dawn",
      icon: "💡",
      priority: dayAge >= 120 ? "high" : "medium",
      task: `Morning light: ${lightPlan.morning}`,
      detail: `${lightPlan.weekLabel} · ${lightPlan.totalHours} total light. ${lightPlan.note}`,
    });
  }

  // MORNING
  const ms = sessions[0];
  tasks.push({ time:"Morning", icon:"🌅", priority:"high",   task:"Refill & clean all drinkers" });
  tasks.push({ time:"Morning", icon:"🌾", priority:"high",   task:`${ms.label} — ${ms.grams}g total (${pb(ms.grams)}g/bird)`, detail:`${feed.feedType} | ${feed.freq} | Brands: ${feed.brands}` });
  if (isTrans && prevF)
    tasks.push({ time:"Morning", icon:"🔄", priority:"urgent", task:`FEED TRANSITION WEEK — Mix: ${tRatio}`, detail:`Switching: ${prevF.feedType} → ${feed.feedType}` });
  tasks.push({ time:"Morning", icon:"👁️", priority:"medium", task:"Health check — observe each bird for 5 min", detail:"Watch: droopy posture, ruffled feathers, pale comb, green/bloody droppings = call vet" });
  tasks.push({ time:"Morning", icon:"💧", priority:"high",   task:`Provide ${totalWL}L total water for ${numBirds} birds` });
  if (dayAge === 1)
    tasks.push({ time:"Morning", icon:"⭐", priority:"urgent", task:"Day 1 — Add glucose to water: 5g per litre", detail:"Dip each chick's beak in water gently to teach drinking" });
  if (dayAge % 7 === 0)
    tasks.push({ time:"Morning", icon:"💊", priority:"medium", task:"Weekly: Add Vitamin AD3E to drinking water", detail:"1ml/litre. Brands: Vimeral (Virbac), Adrovet, Vitablend AD3E" });
  if (dayAge % 14 === 0)
    tasks.push({ time:"Morning", icon:"💊", priority:"medium", task:"Bi-weekly: Add Liver Tonic (Sorbitol) to water", detail:"Brands: Hepasule (Virbac), Sorbitol Plus, Livfit Vet" });
  if (dayAge % 7 === 2 || dayAge % 7 === 5)
    tasks.push({ time:"Morning", icon:"🦠", priority:"low",    task:"Probiotic day — mix in morning feed", detail:"Brands: Probitek (Kemin), Gutpro, Protexin Poultry" });
  const vax = VACCINATIONS.find(v => v.day === dayAge);
  if (vax)
    tasks.push({ time:"Morning", icon:"💉", priority:"urgent", task:`VACCINATION TODAY: ${vax.vaccine}`, detail:`Disease: ${vax.disease} | Method: ${vax.method} | Buy: ${vax.buyQty} | Dose: ${vax.dosePerBird} — Go to Schedule tab for full prep guide` });
  const dew = DEWORMING.find(d => d.day === dayAge);
  if (dew)
    tasks.push({ time:"Morning", icon:"🩺", priority:"urgent", task:`DEWORMING TODAY: ${dew.note}`, detail:`Products: ${dew.products}` });
  const wt = WEIGHT_TARGETS.find(w => w.day === dayAge);
  if (wt)
    tasks.push({ time:"Morning", icon:"⚖️", priority:"medium", task:"Weight check day! Weigh 5 random birds", detail:`Target: ${wt.grams[0]}–${wt.grams[1]}g. Below target = increase feed 10g/bird/day.` });
  if (dayAge % 3 === 0)
    tasks.push({ time:"Morning", icon:"🪹", priority:"medium", task:"Check litter — replace wet/damp patches", detail:"Kerala humidity: wet litter = ammonia = respiratory disease." });
  if (dayAge >= 130)
    tasks.push({ time:"Morning", icon:"🥚", priority:"high",   task:"Collect eggs (morning round)", detail:"Note count in farm diary." });

  // MID-MORNING (Day 1–21)
  if (dayAge <= 21 && sessions.length >= 4) {
    const s = sessions[1];
    tasks.push({ time:"Mid-Morning", icon:s.icon, priority:"high",   task:`${s.label} — ${s.grams}g total (${pb(s.grams)}g/bird)`, detail:"Refill feeders. Observe birds while feeding." });
    tasks.push({ time:"Mid-Morning", icon:"💧",   priority:"medium", task:"Check & top up water — never let it run out" });
  }

  // AFTERNOON (Day 1–42)
  if (dayAge <= 42) {
    const afIdx = dayAge <= 21 ? 2 : 1;
    const afs = sessions[afIdx];
    if (afs) {
      tasks.push({ time:"Afternoon", icon:afs.icon, priority:"high",   task:`${afs.label} — ${afs.grams}g total (${pb(afs.grams)}g/bird)`, detail:"Small frequent meals critical at this age. Remove uneaten feed after 20 min." });
      tasks.push({ time:"Afternoon", icon:"💧",     priority:"high",   task:"Refill all drinkers — fresh water every time", detail:"Kerala afternoon heat: chicks dehydrate fast. Fresh water at every feed." });
      tasks.push({ time:"Afternoon", icon:"👁️",     priority:"medium", task:"Quick health scan — look for lethargic or hunched birds" });
    }
  }

  // LATE-AFTERNOON (Day 1–7 only)
  if (dayAge <= 7 && sessions.length === 5) {
    const s = sessions[3];
    tasks.push({ time:"Late-Afternoon", icon:s.icon, priority:"high",   task:`${s.label} — ${s.grams}g total (${pb(s.grams)}g/bird)`, detail:"Very young chicks need feeds every 3 hrs. Never let feeders stay empty." });
    tasks.push({ time:"Late-Afternoon", icon:"🌡️",   priority:"high",   task:"Check brooder temperature", detail:`Day ${dayAge} target: 32–35°C. Spread evenly = perfect. Huddling = too cold.` });
  }

  // EVENING
  const ls = sessions[sessions.length - 1];
  tasks.push({ time:"Evening", icon:"🌆", priority:"high",   task:`${ls.label} — ${ls.grams}g total (${pb(ls.grams)}g/bird)`, detail:dayAge <= 42 ? "Last feed. Remove uneaten feed after 30 min — prevents mould." : "Evening feed. Remove leftover before next morning." });
  tasks.push({ time:"Evening", icon:"💧", priority:"high",   task:"Refill water for overnight" });
  if (dayAge >= 130)
    tasks.push({ time:"Evening", icon:"🥚", priority:"high",   task:"Collect eggs (evening round)", detail:"Collect twice daily — reduces breakage and egg-eating habit." });
  if (dayAge <= 42) {
    tasks.push({
      time: "Evening",
      icon: "🔌",
      priority: "medium",
      task: "Turn OFF brooder lights at 7:30 PM",
      detail: `${lightPlan.weekLabel} dark period starts now and ends at 11:30 PM.`,
    });
  }
  if (dayAge >= 43) {
    tasks.push({
      time: "Evening",
      icon: "💡",
      priority: dayAge >= 120 ? "high" : "medium",
      task: `Evening light: ${lightPlan.evening}`,
      detail: `${lightPlan.action} Use a timer switch so the total light stays consistent every day.`,
    });
  }
  if (dayAge <= 7)
    tasks.push({ time:"Evening", icon:"🌡️", priority:"high",   task:"Check brooder heat before night", detail:"Chicks cannot regulate temperature at night." });
  tasks.push({ time:"Evening", icon:"📓", priority:"low",    task:"Update farm diary — feed used, water, any observations" });
  tasks.push({ time:"Evening", icon:"🔒", priority:"medium", task:"Secure shed — close vents against predators & rain" });

  return tasks;
}

function buildTelegram(dayAge, numBirds, tasks, feed) {
  const totalG  = Math.round(((feed.gramsPerBird[0]+feed.gramsPerBird[1])/2)*numBirds);
  const totalWL = Math.round(((feed.waterMl[0]+feed.waterMl[1])/2)*numBirds/1000*10)/10;
  const sessions = getSessions(dayAge, totalG);
  const urgent  = tasks.filter(t => t.priority === "urgent");
  const daysToLay = Math.max(0, 141 - dayAge);
  const expectedLayDate = addCalendarDays(new Date(), 141 - dayAge);
  const tomorrow = getDayFeedSnapshot(dayAge + 1, numBirds);
  let m = `🐔 *BV-380 Daily Farm Update*\n`;
  m += `📅 Day ${dayAge} | Phase: *${feed.phase}*\n`;
  m += `🌾 *${feed.feedType}* | ${feed.freq}\n`;
  m += `📦 Total Feed: *${totalG}g* in *${sessions.length} sessions*\n`;
  m += `💧 Total Water: *${totalWL}L*\n\n`;
  m += dayAge >= 141
    ? `🥚 *Lay status:* Active since *${formatLongDate(expectedLayDate)}*\n`
    : `🥚 *Expected lay date:* *${formatLongDate(expectedLayDate)}* (in ${daysToLay} days)\n`;
  m += `📦 *Tomorrow prep:* ${tomorrow.feed.feedType} · ${tomorrow.totalG}g · ${tomorrow.totalWL}L water\n\n`;
  m += `🍽️ *FEED SESSIONS:*\n`;
  sessions.forEach(s => { m += `• ${s.icon} ${s.label}: *${s.grams}g* (${Math.round(s.grams/numBirds)}g/bird)\n`; });
  if (urgent.length) { m += `\n🚨 *URGENT TODAY:*\n`; urgent.forEach(t => { m += `• ${t.icon} ${t.task}\n`; }); }
  [["🌙 PRE-DAWN (5:00 AM)","Pre-Dawn"],["🌅 MORNING","Morning"],["🌤️ MID-MORNING","Mid-Morning"],["☀️ AFTERNOON","Afternoon"],["🌇 LATE-AFTERNOON","Late-Afternoon"],["🌆 EVENING","Evening"]].forEach(([label, time]) => {
    const list = tasks.filter(t => t.time === time && t.priority !== "urgent");
    if (list.length) { m += `\n${label}:\n`; list.forEach(t => { m += `• ${t.icon} ${t.task}\n`; }); }
  });
  const nv = VACCINATIONS.find(v => v.day > dayAge);
  if (nv) m += `\n💉 Next vax: Day ${nv.day} — ${nv.vaccine} (in ${nv.day-dayAge} days)`;
  m += `\n\n_Kerala Clyde's BV380 Farm Manager 🌴_`;
  return m;
}

export { buildTasks, buildTelegram };

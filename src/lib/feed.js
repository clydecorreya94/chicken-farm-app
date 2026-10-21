// Feed/light helpers derived from the BV380 schedule data.
import { FEED_SCHEDULE, LIGHT_SCHEDULE, FEED_TRANSITIONS, WEIGHT_TARGETS } from "../data/schedule";
import { diffCalendarDays } from "./dates";
function getFeed(day) {
  return FEED_SCHEDULE.find(f => day >= f.minDay && day <= f.maxDay) || FEED_SCHEDULE[FEED_SCHEDULE.length - 1];
}
function getLightPlan(day) {
  return LIGHT_SCHEDULE.find(l => day >= l.minDay && day <= l.maxDay) || LIGHT_SCHEDULE[LIGHT_SCHEDULE.length - 1];
}
function getPrevFeed(day) {
  const t = FEED_TRANSITIONS.find(td => day >= td && day <= td + 6);
  if (!t) return null;
  return FEED_SCHEDULE.find(f => (t-1) >= f.minDay && (t-1) <= f.maxDay);
}
function midpoint(range) {
  return Math.round((range[0] + range[1]) / 2);
}
function getWeightTarget(day) {
  if (!WEIGHT_TARGETS.length) return null;
  if (day <= WEIGHT_TARGETS[0].day) return WEIGHT_TARGETS[0].grams;
  const last = WEIGHT_TARGETS[WEIGHT_TARGETS.length - 1];
  if (day >= last.day) return last.grams;
  for (let i = 1; i < WEIGHT_TARGETS.length; i += 1) {
    const prev = WEIGHT_TARGETS[i - 1];
    const next = WEIGHT_TARGETS[i];
    if (day === next.day) return next.grams;
    if (day > prev.day && day < next.day) {
      const ratio = (day - prev.day) / (next.day - prev.day);
      return [
        Math.round(prev.grams[0] + (next.grams[0] - prev.grams[0]) * ratio),
        Math.round(prev.grams[1] + (next.grams[1] - prev.grams[1]) * ratio),
      ];
    }
  }
  return last.grams;
}
function formatWeightRange(range) {
  return range ? `${range[0]}–${range[1]}g` : "N/A";
}
function isTransitionWeek(day) { return FEED_TRANSITIONS.some(t => day >= t && day <= t+6); }
function transitionRatio(day) {
  const t = FEED_TRANSITIONS.find(td => day >= td && day <= td+6);
  if (!t) return null;
  const d = day - t;
  if (d <= 1) return "75% old + 25% new";
  if (d <= 3) return "50% old + 50% new";
  if (d <= 5) return "25% old + 75% new";
  return "100% new feed";
}

function getSessions(dayAge, totalG) {
  if (dayAge <= 7) {
    const s = Math.round(totalG / 5);
    return [
      { time:"Morning",        icon:"🌅", label:"1st feed (6:00 AM)",  grams:s },
      { time:"Mid-Morning",    icon:"🌤️", label:"2nd feed (9:00 AM)",  grams:s },
      { time:"Afternoon",      icon:"☀️", label:"3rd feed (12:00 PM)", grams:s },
      { time:"Late-Afternoon", icon:"🌇", label:"4th feed (3:00 PM)",  grams:s },
      { time:"Evening",        icon:"🌆", label:"5th feed (6:00 PM)",  grams:totalG - s*4 },
    ];
  }
  if (dayAge <= 21) {
    const s = Math.round(totalG / 4);
    return [
      { time:"Morning",     icon:"🌅", label:"1st feed (6:30 AM)",  grams:s },
      { time:"Mid-Morning", icon:"🌤️", label:"2nd feed (10:00 AM)", grams:s },
      { time:"Afternoon",   icon:"☀️", label:"3rd feed (2:00 PM)",  grams:s },
      { time:"Evening",     icon:"🌆", label:"4th feed (6:00 PM)",  grams:totalG - s*3 },
    ];
  }
  if (dayAge <= 42) {
    const s = Math.round(totalG / 3);
    return [
      { time:"Morning",   icon:"🌅", label:"1st feed (7:00 AM)",  grams:s },
      { time:"Afternoon", icon:"☀️", label:"2nd feed (12:30 PM)", grams:s },
      { time:"Evening",   icon:"🌆", label:"3rd feed (5:30 PM)",  grams:totalG - s*2 },
    ];
  }
  return [
    { time:"Morning", icon:"🌅", label:"Morning feed (7:00 AM)", grams:Math.round(totalG * 0.6) },
    { time:"Evening", icon:"🌆", label:"Evening feed (4:30 PM)", grams:Math.round(totalG * 0.4) },
  ];
}
function phaseColor(phase) {
  return { "Pre-Starter":"#FF8F00","Starter":"#F4511E","Grower I":"#43A047","Grower II":"#00897B","Pre-Layer":"#1E88E5","Layer":"#6A1B9A" }[phase] || "#E87722";
}
// Kerala market price estimates per kg (INR) — user can override
const FEED_PRICE_ESTIMATES = {
  "Pre-Starter": 52,
  "Starter":     46,
  "Grower I":    40,
  "Grower II":   38,
  "Pre-Layer":   42,
  "Layer":       36,
};

// How many days left in current phase from a given day
function daysLeftInPhase(day) {
  const f = getFeed(day);
  return Math.max(0, f.maxDay - day);
}

// Get daily feed consumption in kg for a given day + bird count
function dailyFeedKg(day, numBirds) {
  const f = getFeed(day);
  const avgG = (f.gramsPerBird[0] + f.gramsPerBird[1]) / 2;
  return (avgG * numBirds) / 1000;
}

function totalFeedKgForDayRange(fromDay, toDay, numBirds) {
  if (toDay < fromDay) return 0;
  let total = 0;
  for (let day = fromDay; day <= toDay; day += 1) {
    total += dailyFeedKg(day, numBirds);
  }
  return total;
}

function getDayFeedSnapshot(day, numBirds) {
  const feed = getFeed(day);
  const totalG = Math.round(((feed.gramsPerBird[0] + feed.gramsPerBird[1]) / 2) * numBirds);
  const totalWL = Math.round(((feed.waterMl[0] + feed.waterMl[1]) / 2) * numBirds / 1000 * 10) / 10;
  const sessions = getSessions(day, totalG);
  return { day, feed, totalG, totalWL, sessions };
}

// Build a phase-by-phase feed plan from current day
function buildFeedPlan(fromDay, numBirds, daysAhead = 60) {
  const plan = [];
  let d = fromDay;
  const endDay = fromDay + daysAhead;
  while (d <= endDay) {
    const f = getFeed(d);
    const phaseEnd = Math.min(f.maxDay === 999 ? endDay : f.maxDay, endDay);
    const phaseDays = phaseEnd - d + 1;
    const totalKg = totalFeedKgForDayRange(d, phaseEnd, numBirds);
    const dailyKg = phaseDays > 0 ? totalKg / phaseDays : 0;
    const pricePerKg = FEED_PRICE_ESTIMATES[f.phase] || 40;
    // Recommend buying in practical bag sizes (25kg or 50kg bags)
    const bagSize = 25;
    const bagsNeeded = Math.ceil(totalKg / bagSize);
    const smartKg = bagsNeeded * bagSize; // round up to bag size
    plan.push({
      phase: f.phase,
      feedType: f.feedType,
      fromDay: d,
      toDay: phaseEnd,
      phaseDays,
      dailyKg: Math.round(dailyKg * 100) / 100,
      totalKg: Math.round(totalKg * 10) / 10,
      smartKg,
      bagsNeeded,
      bagSize,
      pricePerKg,
      estimatedCost: Math.round(smartKg * pricePerKg),
      phaseTransitionDay: f.maxDay < 999 ? f.maxDay + 1 : null,
      warning: f.maxDay < 999 && (f.maxDay - d) <= 10 ? `⚠️ Feed changes to ${getFeed(f.maxDay+1).feedType} on Day ${f.maxDay+1} — buy only what you need for ${phaseDays} days` : null,
    });
    d = phaseEnd + 1;
    if (d > endDay) break;
  }
  return plan;
}

// Calculate remaining stock from logs for current phase
function calcRemainingStock(feedLogs, currentDay, numBirds) {
  const currentFeed = getFeed(currentDay);
  // Only sum logs for the current phase
  const relevantLogs = feedLogs.filter(l => l.phase === currentFeed.phase && !l.dismissed);
  const totalBought = relevantLogs.reduce((s, l) => s + (l.kg || 0), 0);
  const dailyKg = dailyFeedKg(currentDay, numBirds);
  // Estimate how much consumed since purchase
  const consumed = relevantLogs.reduce((s, l) => {
    const daysSince = Math.max(0, diffCalendarDays(new Date(), l.date));
    if (daysSince <= 0) return s;
    const purchaseDayAge = Math.max(1, currentDay - daysSince);
    const consumedKg = totalFeedKgForDayRange(purchaseDayAge, currentDay - 1, numBirds);
    return s + Math.min(l.kg, consumedKg);
  }, 0);
  const remaining = Math.max(0, totalBought - consumed);
  const daysRemaining = dailyKg > 0 ? Math.floor(remaining / dailyKg) : 0;
  return { totalBought, consumed: Math.round(consumed * 10) / 10, remaining: Math.round(remaining * 10) / 10, daysRemaining, dailyKg };
}

export { getFeed, getLightPlan, getPrevFeed, midpoint, getWeightTarget, formatWeightRange, isTransitionWeek, transitionRatio, getSessions, phaseColor, FEED_PRICE_ESTIMATES, daysLeftInPhase, dailyFeedKg, totalFeedKgForDayRange, getDayFeedSnapshot, buildFeedPlan, calcRemainingStock };

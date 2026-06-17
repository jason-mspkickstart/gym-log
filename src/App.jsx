import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";
import { PLAN } from "./plan";
import { Dumbbell, Activity, TrendingUp, Check, Trophy, Plus, Copy, X, LogOut, Mail } from "lucide-react";

const C = {
  bg: "#EDE7DD", card: "#FFFFFF", ink: "#1C1A17", sub: "#7A7264",
  brand: "#D2552E", win: "#2F8F5B", line: "#E4DDD0", soft: "#F6F2EA",
};

const asSets = (e) => (Array.isArray(e) ? e : e ? [e] : []);
const topSet = (sets) => {
  let best = null;
  asSets(sets).forEach((s) => {
    const w = parseFloat(s.weight);
    if (!isNaN(w)) { const r = parseInt(s.reps) || 0; if (!best || w > best.w || (w === best.w && r > best.r)) best = { w, r }; }
  });
  return best;
};
const today = () => new Date().toISOString().slice(0, 10);
const pretty = (iso) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <Splash text="Loading..." />;
  if (!session) return <Login />;
  return <Main session={session} />;
}

function Splash({ text }) {
  return <div style={{ background: C.bg, color: C.sub, minHeight: "100vh" }} className="flex items-center justify-center font-sans text-sm">{text}</div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const send = async () => {
    setErr("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    if (error) setErr(error.message); else setSent(true);
  };
  return (
    <div style={{ background: C.bg, color: C.ink, minHeight: "100vh" }} className="font-sans flex flex-col justify-center px-6">
      <div className="mx-auto w-full max-w-sm">
        <div style={{ color: C.brand }} className="text-xs font-bold uppercase tracking-widest">Jason's Log</div>
        <h1 className="text-2xl font-bold tracking-tight mt-1 mb-6">Beat the logbook</h1>
        {sent ? (
          <div style={{ background: C.card, borderColor: C.line }} className="border rounded-2xl p-5 text-center">
            <Mail size={26} style={{ color: C.brand }} className="mx-auto mb-2" />
            <p className="font-semibold">Check your email</p>
            <p style={{ color: C.sub }} className="text-sm mt-1">Tap the link we sent to {email} to sign in. Open it on this phone.</p>
          </div>
        ) : (
          <div style={{ background: C.card, borderColor: C.line }} className="border rounded-2xl p-5 space-y-3">
            <p style={{ color: C.sub }} className="text-sm">Sign in with your email. We send a one-tap link, no password to remember.</p>
            <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
              style={{ background: C.soft, borderColor: C.line, color: C.ink }} className="w-full border rounded-xl px-3 py-2.5 outline-none" />
            <button onClick={send} disabled={!email} style={{ background: email ? C.brand : C.line, color: email ? "#fff" : C.sub }} className="w-full rounded-xl py-2.5 font-bold">Send sign-in link</button>
            {err && <p style={{ color: C.brand }} className="text-xs font-semibold">{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Main({ session }) {
  const [view, setView] = useState("train");
  const [workouts, setWorkouts] = useState([]);
  const [bodylog, setBodylog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 1900); };

  useEffect(() => {
    (async () => {
      const { data: w } = await supabase.from("workouts").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
      const { data: b } = await supabase.from("body_log").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
      setWorkouts(w || []); setBodylog(b || []); setLoading(false);
    })();
  }, []);

  const addWorkout = async (p) => {
    const row = { user_id: session.user.id, date: p.date, day_key: p.day_key, day_name: p.day_name, entries: p.entries };
    const { data, error } = await supabase.from("workouts").insert(row).select().single();
    if (!error && data) { setWorkouts((prev) => [data, ...prev]); flash("Session logged"); } else { flash("Save failed, check signal"); }
  };
  const addBody = async (p) => {
    const row = { user_id: session.user.id, date: today(), weight: p.weight || null, steps: p.steps ? parseInt(p.steps) : null, waist: p.waist || null, notes: p.notes || null };
    const { data, error } = await supabase.from("body_log").insert(row).select().single();
    if (!error && data) { setBodylog((prev) => [data, ...prev]); flash("Saved"); } else { flash("Save failed, check signal"); }
  };

  if (loading) return <Splash text="Loading your log..." />;

  return (
    <div style={{ background: C.bg, color: C.ink }} className="font-sans">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        <header className="px-5 pt-6 pb-4">
          <div style={{ color: C.brand }} className="text-xs font-bold uppercase tracking-widest">Jason's Log</div>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">Beat the logbook</h1>
        </header>
        <main className="flex-1 px-5 pb-28">
          {view === "train" && <Train onSave={addWorkout} workouts={workouts} />}
          {view === "body" && <Body log={bodylog} onSave={addBody} />}
          {view === "trends" && <Trends workouts={workouts} bodylog={bodylog} email={session.user.email} />}
        </main>
        <nav style={{ background: C.card, borderColor: C.line }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t flex">
          {[["train", "Train", Dumbbell], ["body", "Body", Activity], ["trends", "Trends", TrendingUp]].map(([k, label, Icon]) => (
            <button key={k} onClick={() => setView(k)} className="flex-1 py-3 flex flex-col items-center gap-1" style={{ color: view === k ? C.brand : C.sub }}>
              <Icon size={20} strokeWidth={view === k ? 2.6 : 2} />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          ))}
        </nav>
        {toast && <div style={{ background: C.ink }} className="fixed bottom-24 left-1/2 -translate-x-1/2 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2"><Check size={16} /> {toast}</div>}
      </div>
    </div>
  );
}

function clusterLifts(lifts) {
  const out = []; let i = 0;
  while (i < lifts.length) {
    const g = lifts[i].group;
    if (g) { const c = []; while (i < lifts.length && lifts[i].group === g) { c.push(lifts[i]); i++; } out.push({ type: "super", group: g, lifts: c }); }
    else { out.push({ type: "single", lift: lifts[i] }); i++; }
  }
  return out;
}

function Train({ onSave, workouts }) {
  const [day, setDay] = useState("d1");
  const [vals, setVals] = useState({});
  const lastSession = useMemo(() => workouts.find((w) => w.day_key === day), [workouts, day]);

  const freshVals = (d) => { const init = {}; PLAN[d].lifts.forEach((l) => { init[l.name] = Array.from({ length: l.sets }, () => ({ weight: "", reps: "" })); }); return init; };
  useEffect(() => { setVals(freshVals(day)); }, [day]);

  const setVal = (name, idx, field, v) => setVals((p) => ({ ...p, [name]: p[name].map((s, i) => (i === idx ? { ...s, [field]: v } : s)) }));
  const addSet = (name) => setVals((p) => ({ ...p, [name]: [...p[name], { weight: "", reps: "" }] }));
  const removeSet = (name, idx) => setVals((p) => ({ ...p, [name]: p[name].filter((_, i) => i !== idx) }));
  const prefill = () => {
    const next = {};
    PLAN[day].lifts.forEach((l) => { const prev = asSets(lastSession?.entries?.[l.name]); next[l.name] = prev.length ? prev.map((s) => ({ weight: s.weight, reps: s.reps })) : Array.from({ length: l.sets }, () => ({ weight: "", reps: "" })); });
    setVals(next);
  };
  const beaten = (name) => { const cur = topSet(vals[name]); const prev = topSet(lastSession?.entries?.[name]); if (!cur || !prev) return false; return cur.w > prev.w || (cur.w === prev.w && cur.r > prev.r); };
  const filled = Object.values(vals).some((arr) => arr.some((s) => s.weight));

  const saveSession = () => {
    const entries = {};
    Object.entries(vals).forEach(([k, arr]) => { const done = arr.filter((s) => s.weight).map((s) => ({ weight: s.weight, reps: s.reps || "" })); if (done.length) entries[k] = done; });
    if (!Object.keys(entries).length) return;
    onSave({ date: today(), day_key: day, day_name: PLAN[day].name, entries });
    setVals(freshVals(day));
  };

  const card = (l) => {
    const prevSets = asSets(lastSession?.entries?.[l.name]);
    const win = beaten(l.name);
    return (
      <div key={l.name} style={{ background: C.card, borderColor: win ? C.win : C.line }} className="border rounded-2xl p-3.5">
        <div className="flex items-start justify-between mb-2.5">
          <div className="pr-2">
            <div className="font-semibold leading-tight">{l.name}</div>
            <div style={{ color: C.brand }} className="text-xs font-bold uppercase tracking-wide mt-0.5">Target: {l.sets} {l.sets > 1 ? "sets" : "set"} × {l.reps} {l.reps === "AMRAP" ? "" : "reps"}</div>
          </div>
          {win && <span style={{ color: C.win }} className="inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap"><Trophy size={13} /> beat it</span>}
        </div>
        <div className="space-y-1.5">
          {(vals[l.name] || []).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ background: C.soft, color: C.sub }} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <SetInput value={s.weight} onChange={(v) => setVal(l.name, i, "weight", v)} unit="kg" mode="decimal" />
              <span style={{ color: C.sub }} className="font-bold text-sm">×</span>
              <SetInput value={s.reps} onChange={(v) => setVal(l.name, i, "reps", v)} unit="reps" mode="numeric" />
              {prevSets[i] && <span style={{ color: C.sub }} className="text-xs font-mono ml-0.5 truncate">was {prevSets[i].weight}×{prevSets[i].reps}</span>}
              <button onClick={() => removeSet(l.name, i)} style={{ color: C.sub }} className="ml-auto p-1 shrink-0" aria-label="remove set"><X size={15} /></button>
            </div>
          ))}
        </div>
        <button onClick={() => addSet(l.name)} style={{ color: C.brand }} className="mt-2 text-xs font-bold flex items-center gap-1"><Plus size={13} /> add set</button>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {Object.entries(PLAN).map(([k, d]) => (
          <button key={k} onClick={() => setDay(k)} style={{ background: day === k ? C.brand : C.card, color: day === k ? "#fff" : C.ink, borderColor: C.line }} className="border rounded-xl py-2.5 font-bold text-sm">{d.name.replace("Day ", "D")}</button>
        ))}
      </div>
      <div className="mb-4">
        <div className="font-bold text-lg tracking-tight">{PLAN[day].name}</div>
        <div style={{ color: C.sub }} className="text-sm">{PLAN[day].sub}</div>
        {lastSession && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span style={{ color: C.sub }} className="text-xs">Last done {pretty(lastSession.date)}</span>
            <button onClick={prefill} style={{ borderColor: C.brand, color: C.brand }} className="border rounded-full px-3 py-1 text-xs font-bold">Start from last week</button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {clusterLifts(PLAN[day].lifts).map((blk, idx) => blk.type === "single" ? card(blk.lift) : (
          <div key={"g" + idx} style={{ borderColor: C.brand }} className="border-2 border-dashed rounded-2xl p-2 pt-1">
            <div style={{ color: C.brand }} className="text-xs font-bold uppercase tracking-widest px-1.5 py-1">Superset {blk.group} · back to back</div>
            <div className="space-y-2">{blk.lifts.map((l) => card(l))}</div>
          </div>
        ))}
      </div>
      <button onClick={saveSession} disabled={!filled} style={{ background: filled ? C.brand : C.line, color: filled ? "#fff" : C.sub }} className="w-full mt-5 rounded-2xl py-3.5 font-bold text-base flex items-center justify-center gap-2"><Check size={18} /> Save session</button>
    </div>
  );
}

function SetInput({ value, onChange, unit, mode }) {
  return (
    <div style={{ background: C.soft, borderColor: C.line }} className="border rounded-lg px-2 py-1.5 flex items-baseline gap-1 w-[66px]">
      <input type="number" inputMode={mode} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" className="w-full bg-transparent outline-none font-mono font-bold text-base text-center" style={{ color: C.ink }} />
      <span style={{ color: C.sub }} className="text-[9px] font-semibold uppercase">{unit}</span>
    </div>
  );
}

function Body({ log, onSave }) {
  const [weight, setWeight] = useState(""); const [steps, setSteps] = useState(""); const [waist, setWaist] = useState(""); const [notes, setNotes] = useState("");
  const can = weight || steps || waist || notes;
  const saveBody = () => { if (!can) return; onSave({ weight, steps, waist, notes }); setWeight(""); setSteps(""); setWaist(""); setNotes(""); };
  return (
    <div>
      <div style={{ background: C.card, borderColor: C.line }} className="border rounded-2xl p-4 space-y-3">
        <Row label="Morning weight" unit="kg"><BigInput value={weight} onChange={setWeight} mode="decimal" /></Row>
        <Row label="Avg weekday steps" unit=""><BigInput value={steps} onChange={setSteps} mode="numeric" /></Row>
        <Row label="Waist (optional)" unit="cm"><BigInput value={waist} onChange={setWaist} mode="decimal" /></Row>
        <div>
          <div style={{ color: C.sub }} className="text-xs font-semibold uppercase tracking-wide mb-1">Notes</div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Energy, recovery, sleep, anything off..." style={{ background: C.soft, borderColor: C.line, color: C.ink }} className="w-full border rounded-xl p-2.5 text-sm outline-none resize-none" />
        </div>
      </div>
      <button onClick={saveBody} disabled={!can} style={{ background: can ? C.brand : C.line, color: can ? "#fff" : C.sub }} className="w-full mt-4 rounded-2xl py-3.5 font-bold text-base flex items-center justify-center gap-2"><Plus size={18} /> Add check-in</button>
      {log.length > 0 && (
        <div className="mt-6">
          <div style={{ color: C.sub }} className="text-xs font-bold uppercase tracking-widest mb-2">Recent</div>
          <div className="space-y-2">
            {log.slice(0, 6).map((b) => (
              <div key={b.id} style={{ background: C.card, borderColor: C.line }} className="border rounded-xl px-3.5 py-2.5 flex items-center justify-between text-sm">
                <span style={{ color: C.sub }}>{pretty(b.date)}</span>
                <span className="font-mono font-semibold">{b.weight && `${b.weight}kg`} {b.steps && `· ${Number(b.steps).toLocaleString()} steps`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, unit, children }) {
  return <div className="flex items-center justify-between"><div style={{ color: C.sub }} className="text-sm font-semibold">{label}</div><div className="flex items-center gap-1.5">{children}{unit && <span style={{ color: C.sub }} className="text-sm font-semibold w-6">{unit}</span>}</div></div>;
}
function BigInput({ value, onChange, mode }) {
  return <input type="number" inputMode={mode} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" style={{ background: C.soft, borderColor: C.line, color: C.ink }} className="border rounded-xl px-3 py-2 w-24 text-right font-mono font-bold text-lg outline-none" />;
}

function Trends({ workouts, bodylog, email }) {
  const weights = bodylog.filter((b) => b.weight).slice(0, 12).reverse();
  const latest = weights[weights.length - 1]; const first = weights[0];
  const change = latest && first ? (parseFloat(latest.weight) - parseFloat(first.weight)).toFixed(1) : null;
  const [copied, setCopied] = useState(false); const [showText, setShowText] = useState(false);

  const buildSummary = () => {
    const L = [];
    L.push(`Gym check-in — ${new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}`);
    L.push(""); L.push("BODY");
    if (weights.length) { let wl = `Weight: ${latest.weight} kg`; if (change !== null && weights.length >= 2) wl += ` (${change > 0 ? "+" : ""}${change} kg over last ${weights.length} check-ins)`; L.push(wl); }
    const s = bodylog.find((b) => b.steps); if (s) L.push(`Weekday steps: ${Number(s.steps).toLocaleString()}`);
    const wa = bodylog.find((b) => b.waist); if (wa) L.push(`Waist: ${wa.waist} cm`);
    const nt = bodylog.find((b) => b.notes); if (nt) L.push(`Notes: ${nt.notes}`);
    if (!weights.length && !s) L.push("No body stats logged yet.");
    L.push(""); L.push("RECENT SESSIONS");
    if (!workouts.length) L.push("None logged yet.");
    workouts.slice(0, 5).forEach((w) => { L.push(`${w.day_name} (${pretty(w.date)}):`); Object.entries(w.entries).forEach(([n, sets]) => { L.push(`  ${n}: ${asSets(sets).map((x) => `${x.weight}×${x.reps}`).join(", ")}`); }); });
    return L.join("\n");
  };
  const copy = async () => { setShowText(true); try { await navigator.clipboard.writeText(buildSummary()); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {} };
  const hasData = workouts.length > 0 || bodylog.length > 0;

  return (
    <div className="space-y-6">
      {hasData && (
        <div>
          <button onClick={copy} style={{ background: copied ? C.win : C.brand }} className="w-full rounded-2xl py-3 font-bold text-base text-white flex items-center justify-center gap-2">
            {copied ? <><Check size={18} /> Copied, paste it to your coach</> : <><Copy size={18} /> Copy check-in summary</>}
          </button>
          {showText && <textarea readOnly value={buildSummary()} rows={7} onFocus={(e) => e.target.select()} style={{ background: C.card, borderColor: C.line, color: C.ink }} className="w-full mt-2 border rounded-xl p-3 text-xs font-mono outline-none resize-none" />}
        </div>
      )}
      <div style={{ background: C.card, borderColor: C.line }} className="border rounded-2xl p-4">
        <div style={{ color: C.sub }} className="text-xs font-bold uppercase tracking-widest mb-2">Weight</div>
        {weights.length >= 2 ? (
          <>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold font-mono">{latest.weight}</span>
              <span style={{ color: C.sub }} className="text-sm font-semibold mb-1">kg</span>
              {change !== null && <span style={{ color: change <= 0 ? C.win : C.brand }} className="text-sm font-bold mb-1 ml-1">{change > 0 ? "+" : ""}{change} kg</span>}
            </div>
            <Spark data={weights.map((w) => parseFloat(w.weight))} />
          </>
        ) : <div style={{ color: C.sub }} className="text-sm">Log your weight on the Body tab a couple of times and the trend shows here.</div>}
      </div>
      <div>
        <div style={{ color: C.sub }} className="text-xs font-bold uppercase tracking-widest mb-2">Recent sessions</div>
        {workouts.length === 0 ? <div style={{ color: C.sub }} className="text-sm">No sessions yet. Log one on the Train tab.</div> : (
          <div className="space-y-2">
            {workouts.slice(0, 8).map((w) => (
              <div key={w.id} style={{ background: C.card, borderColor: C.line }} className="border rounded-xl px-3.5 py-3">
                <div className="flex items-center justify-between"><span className="font-semibold text-sm">{w.day_name} · {PLAN[w.day_key]?.sub}</span><span style={{ color: C.sub }} className="text-xs">{pretty(w.date)}</span></div>
                <div style={{ color: C.sub }} className="text-xs font-mono mt-1">{Object.entries(w.entries).slice(0, 4).map(([n, sets]) => { const t = topSet(sets); return `${n.split(" ")[0]} ${t ? t.w + "×" + t.r : ""}`; }).join("  ·  ")}{Object.keys(w.entries).length > 4 ? "  ..." : ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="pt-2">
        <button onClick={() => supabase.auth.signOut()} style={{ color: C.sub, borderColor: C.line }} className="w-full border rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2"><LogOut size={15} /> Sign out ({email})</button>
      </div>
    </div>
  );
}

function Spark({ data }) {
  if (data.length < 2) return null;
  const w = 300, h = 60, pad = 4;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => { const x = pad + (i / (data.length - 1)) * (w - pad * 2); const y = h - pad - ((v - min) / range) * (h - pad * 2); return `${x.toFixed(1)},${y.toFixed(1)}`; });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
      <polyline points={pts.join(" ")} fill="none" stroke={C.brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => { const [x, y] = p.split(","); return <circle key={i} cx={x} cy={y} r="3" fill={C.brand} />; })}
    </svg>
  );
}

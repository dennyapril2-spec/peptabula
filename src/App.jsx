import { useState, useMemo, useEffect, useRef } from "react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────── */
const T = {
  bg:        "#03070d",
  bgCard:    "#070e18",
  bgSurface: "#0a1420",
  bgGlass:   "rgba(10,20,32,0.7)",
  border:    "rgba(255,255,255,0.055)",
  borderMid: "rgba(255,255,255,0.1)",
  text:      "#ddeeff",
  textDim:   "rgba(221,238,255,0.5)",
  textMuted: "rgba(221,238,255,0.25)",
  accent:    "#00f0a0",
  accentDim: "rgba(0,240,160,0.12)",
};

/* ─── GROUPS ─────────────────────────────────────────────────────────────── */
const G = {
  regeneration: { label:"Regeneration", short:"REGEN", color:"#00e5a0", glow:"rgba(0,229,160,0.28)",  dim:"rgba(0,229,160,0.08)",  border:"rgba(0,229,160,0.22)" },
  metabolism:   { label:"Metabolism",   short:"META",  color:"#f5a623", glow:"rgba(245,166,35,0.28)",  dim:"rgba(245,166,35,0.08)",  border:"rgba(245,166,35,0.22)" },
  cns:          { label:"CNS / Brain",  short:"CNS",   color:"#a78bfa", glow:"rgba(167,139,250,0.28)", dim:"rgba(167,139,250,0.08)", border:"rgba(167,139,250,0.22)" },
  longevity:    { label:"Longevity",    short:"LONG",  color:"#22d3ee", glow:"rgba(34,211,238,0.28)",  dim:"rgba(34,211,238,0.08)",  border:"rgba(34,211,238,0.22)" },
  hormonal:     { label:"Hormonal",     short:"HORM",  color:"#f87171", glow:"rgba(248,113,113,0.28)", dim:"rgba(248,113,113,0.08)", border:"rgba(248,113,113,0.22)" },
  immune:       { label:"Immune",       short:"IMM",   color:"#fb923c", glow:"rgba(251,146,60,0.28)",  dim:"rgba(251,146,60,0.08)",  border:"rgba(251,146,60,0.22)" },
  ghaxis:       { label:"GH Axis",      short:"GH",    color:"#86efac", glow:"rgba(134,239,172,0.28)", dim:"rgba(134,239,172,0.08)", border:"rgba(134,239,172,0.22)" },
};

/* ─── PEPTIDE DATA ───────────────────────────────────────────────────────── */
const PEPTIDES = [
  { id:"bpc157",  code:"Bp", num:"001", name:"BPC-157",         group:"regeneration", mw:"1419.5",
    tagline:"Gastroprotective tetradecapeptide with pleiotropic regenerative activity",
    mechanism:"Activates VEGFR2 receptors stimulating angiogenesis and fibroblast migration. Modulates NO-synthase system, reduces TNF-α and IL-6. Interacts with dopaminergic and serotonergic systems via GABAergic pathway. One of the most studied preclinical peptides across dozens of tissue types.",
    vectors:{longevity:3,metabolism:2,brain:2,repair:5}, efficacy:85, risk:35, confidence:75,
    studies:"Animal / Early Human", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate. Theoretical tumor promotion risk via pro-angiogenic mechanism with active neoplasia. Contraindicated with active oncology.",
    protocol:{dose:"200–500 mcg/day",frequency:"1–2× daily",route:"SC or IM",cycle:"4–6 weeks"},
    synergy:["tb500","ghkcu","kvp"], tags:["Tissue Repair","Tendons","GI Tract","Neuroprotection"] },

  { id:"tb500",   code:"Tb", num:"002", name:"TB-500",          group:"regeneration", mw:"4963.5",
    tagline:"Synthetic Thymosin β4 fragment, actin-polymerization regulator",
    mechanism:"Binds G-actin inhibiting polymerization. Activates endothelial cell and keratinocyte migration. Reduces inflammatory markers and stimulates type III collagen synthesis via PI3K/AKT pathway.",
    vectors:{longevity:2,metabolism:1,brain:1,repair:5}, efficacy:80, risk:20, confidence:60,
    studies:"Animal / Early Human", wada:"Banned (S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low toxicity profile. Possible tumor growth stimulation via angiogenic mechanism.",
    protocol:{dose:"2–2.5 mg",frequency:"2×/week",route:"SC",cycle:"4–6 weeks"},
    synergy:["bpc157","mgf","ghkcu"], tags:["Wound Healing","Tendons","Muscles","Anti-fibrotic"] },

  { id:"ghkcu",   code:"Gk", num:"003", name:"GHK-Cu",          group:"regeneration", mw:"340.4",
    tagline:"Endogenous copper-binding tripeptide, master collagen regulator",
    mechanism:"Activates over 300 genes via TGF-β modulation. Enhances type I/III collagen, elastin, and glycosaminoglycan synthesis. Inhibits MMP-1, -2, -9. Normalizes expression of aging-associated genes.",
    vectors:{longevity:4,metabolism:2,brain:2,repair:4}, efficacy:70, risk:10, confidence:65,
    studies:"In Vitro / Human (Topical)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Endogenous compound. Systemic toxicity not established.",
    protocol:{dose:"2 mg",frequency:"Daily",route:"SC / Topical",cycle:"8–12 weeks"},
    synergy:["bpc157","epithalon","ll37"], tags:["Anti-aging","Skin","Collagen","Antioxidant"] },

  { id:"ll37",    code:"Ll", num:"004", name:"LL-37",            group:"regeneration", mw:"4493.3",
    tagline:"Human cathelicidin AMP with broad-spectrum antimicrobial activity",
    mechanism:"Disrupts bacterial membranes via amphipathic α-helix. Activates TLR4 and FPRL1 receptors. Accelerates wound re-epithelialization. Simultaneously reduces inflammation hyperactivation and enhances innate immunity.",
    vectors:{longevity:2,metabolism:1,brain:1,repair:4}, efficacy:70, risk:25, confidence:55,
    studies:"In Vitro / Animal / Early Human", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate. High systemic doses may cause cytotoxicity. Topical well-tolerated.",
    protocol:{dose:"1–5 mg",frequency:"3×/week",route:"Topical / SC",cycle:"4–6 weeks"},
    synergy:["bpc157","ghkcu","kvp"], tags:["AMP","Wound Healing","Immunity","Antibacterial"] },

  { id:"kvp",     code:"Kv", num:"005", name:"KPV",              group:"regeneration", mw:"327.4",
    tagline:"α-MSH tripeptide fragment, potent gut anti-inflammatory",
    mechanism:"Direct MC1R and MC3R activation on immune cells. Inhibits NF-κB, reducing TNF-α, IL-1β, IL-6. Unique intestinal stability allows oral delivery for IBD. One of few peptides with meaningful oral route for gut-specific use.",
    vectors:{longevity:1,metabolism:1,brain:1,repair:4}, efficacy:70, risk:10, confidence:40,
    studies:"Animal / Early Human", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Endogenous fragment. Oral route limits systemic exposure.",
    protocol:{dose:"500 mcg–5 mg",frequency:"2× daily",route:"Oral / SC",cycle:"4–8 weeks"},
    synergy:["bpc157","ll37","vip"], tags:["IBD","Gut","Crohn's","Anti-inflammatory"] },

  { id:"mgf",     code:"Mf", num:"006", name:"MGF",              group:"regeneration", mw:"2867.3",
    tagline:"Mechano Growth Factor — local muscle repair splice variant of IGF-1",
    mechanism:"Released in response to mechanical stress. Activates muscle satellite cells for local hypertrophy and repair. Unlike systemic IGF-1, MGF acts primarily at site of damage with short active window requiring precise timing.",
    vectors:{longevity:1,metabolism:2,brain:1,repair:5}, efficacy:75, risk:25, confidence:45,
    studies:"Animal / Limited Human", wada:"Banned (S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low-moderate. Local proliferative effect. Systemic administration may risk off-target stimulation.",
    protocol:{dose:"200–400 mcg",frequency:"Post-workout",route:"SC/IM (local)",cycle:"4 weeks on/off"},
    synergy:["tb500","igf1lr3","bpc157"], tags:["Muscle Repair","Satellite Cells","Local Action","Post-workout"] },

  { id:"thyalpha1",code:"Ta",num:"007", name:"Thymosin α-1",    group:"immune",       mw:"3108.4",
    tagline:"Endogenous thymic peptide, master T-cell immunity modulator",
    mechanism:"Activates dendritic cells and macrophages, upregulates TLR expression. Shifts immune balance toward Th1 response. Used clinically in viral hepatitis, cancer immunotherapy support. Approved as Zadaxin in multiple countries.",
    vectors:{longevity:3,metabolism:1,brain:1,repair:2}, efficacy:80, risk:15, confidence:75,
    studies:"Clinical Trials / Approved (Zadaxin)", wada:"Not regulated",
    fda:"Research Chemical / Approved abroad (Zadaxin)",
    toxicity:"Very low. Well-characterized endogenous compound. Minor injection site reactions.",
    protocol:{dose:"1.6 mg",frequency:"2×/week",route:"SC",cycle:"6–12 months"},
    synergy:["ll37","thymulin","vip"], tags:["T-cell","Immunity","Hepatitis","Cancer Support"] },

  { id:"thymulin", code:"Tm",num:"008", name:"Thymulin",         group:"immune",       mw:"857.9",
    tagline:"Zinc-dependent nonapeptide, T-cell maturation signal from thymus epithelium",
    mechanism:"Requires zinc for biological activity. Promotes T-lymphocyte maturation and differentiation. Declines with age in parallel with thymic involution. Studied for immune reconstitution in aging and immunodeficiency models.",
    vectors:{longevity:3,metabolism:1,brain:1,repair:2}, efficacy:65, risk:10, confidence:45,
    studies:"Animal / Early Human", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Endogenous compound. Zinc-dependent activity provides natural regulation.",
    protocol:{dose:"10–50 mcg",frequency:"Daily",route:"SC",cycle:"4–8 weeks"},
    synergy:["thyalpha1","epithalon","ll37"], tags:["Thymus","T-cells","Zinc","Immune Aging"] },

  { id:"motsc",   code:"Mt", num:"009", name:"MOTS-c",           group:"metabolism",   mw:"2174.5",
    tagline:"Mitochondrial-derived peptide, endogenous exercise mimetic",
    mechanism:"Encoded within mitochondrial DNA — a paradigm-shifting discovery. Activates AMPK pathway, mimicking biochemical effects of physical exercise. Increases skeletal muscle glucose uptake, reduces insulin resistance, regulates fatty acid metabolism via ACAD enzymes.",
    vectors:{longevity:4,metabolism:5,brain:2,repair:2}, efficacy:75, risk:15, confidence:40,
    studies:"Animal / Early Human", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Minimal. Endogenous peptide. Long-term safety profile not established.",
    protocol:{dose:"5–10 mg",frequency:"3–4×/week",route:"SC",cycle:"4–8 weeks"},
    synergy:["ss31","nad","aod9604"], tags:["Metabolism","AMPK","Insulin","Mitochondria"] },

  { id:"aod9604", code:"Ao", num:"010", name:"AOD-9604",         group:"metabolism",   mw:"1815.1",
    tagline:"C-terminal GH fragment, selective lipolytic agent without IGF-1 activity",
    mechanism:"Binds β3-adrenoceptors in adipose tissue stimulating lipolysis without activating IGF-1 receptors. Inhibits lipogenesis. Critical distinction from full GH: no effect on glucose or insulin levels.",
    vectors:{longevity:1,metabolism:5,brain:1,repair:2}, efficacy:65, risk:15, confidence:55,
    studies:"Phase II/III Clinical", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low. No IGF-1 axis effect. No diabetogenic effect.",
    protocol:{dose:"300–500 mcg",frequency:"Daily (fasted)",route:"SC",cycle:"12–16 weeks"},
    synergy:["motsc","frag176","cjc1295"], tags:["Lipolysis","Fat Loss","No IGF","Body Composition"] },

  { id:"frag176", code:"Fr", num:"011", name:"Frag 176-191",     group:"metabolism",   mw:"1817.1",
    tagline:"HGH C-terminal fragment, most selective lipolytic peptide studied",
    mechanism:"Mimics GH lipolytic action via beta-adrenoceptors in adipose tissue. Does not bind GH receptor, does not stimulate tissue growth, zero impact on IGF-1 or glucose. Inhibits acetyl-CoA carboxylase reducing fatty acid synthesis.",
    vectors:{longevity:1,metabolism:5,brain:1,repair:1}, efficacy:65, risk:15, confidence:50,
    studies:"Animal / Phase II", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low. Best long-term safety profile among lipolytic peptides.",
    protocol:{dose:"250–500 mcg",frequency:"1–2×/day (fasted)",route:"SC",cycle:"8–12 weeks"},
    synergy:["aod9604","motsc","cjc1295"], tags:["Lipolysis","No IGF","Fat Burning","Safe Profile"] },

  { id:"semaglutide",code:"Sg",num:"012", name:"Semaglutide",   group:"metabolism",   mw:"4113.6",
    tagline:"GLP-1 receptor agonist — FDA-approved for T2DM and obesity",
    mechanism:"Long-acting GLP-1 agonist. Increases insulin secretion, suppresses glucagon, slows gastric emptying, acts on hypothalamic satiety centers. Significant cardiovascular benefit established in LEADER and SUSTAIN trials.",
    vectors:{longevity:3,metabolism:5,brain:2,repair:1}, efficacy:92, risk:30, confidence:95,
    studies:"FDA Approved (Ozempic/Wegovy)", wada:"Not regulated",
    fda:"FDA Approved — Ozempic / Wegovy",
    toxicity:"Moderate. GI adverse effects common early. Rare pancreatitis risk.",
    protocol:{dose:"0.25→2.4 mg/week",frequency:"Once weekly",route:"SC",cycle:"Ongoing"},
    synergy:["tirzepatide","motsc","frag176"], tags:["GLP-1","Weight Loss","Diabetes","CV Benefit"] },

  { id:"tirzepatide",code:"Tz",num:"013", name:"Tirzepatide",   group:"metabolism",   mw:"4813.5",
    tagline:"Dual GIP/GLP-1 agonist — superior weight loss over single agonists",
    mechanism:"First-in-class dual GIP and GLP-1 receptor agonist. SURMOUNT trials demonstrated up to 22.5% body weight reduction. GIP component provides additive metabolic benefits beyond GLP-1 alone.",
    vectors:{longevity:3,metabolism:5,brain:2,repair:1}, efficacy:95, risk:30, confidence:92,
    studies:"FDA Approved (Mounjaro/Zepbound)", wada:"Not regulated",
    fda:"FDA Approved — Mounjaro / Zepbound",
    toxicity:"Moderate. GI profile similar to semaglutide. No confirmed CV outcome data yet.",
    protocol:{dose:"2.5→15 mg/week",frequency:"Once weekly",route:"SC",cycle:"Ongoing"},
    synergy:["semaglutide","motsc","retatrutide"], tags:["GIP/GLP-1","Weight Loss","T2DM","Best-in-class"] },

  { id:"retatrutide",code:"Rt",num:"014", name:"Retatrutide",   group:"metabolism",   mw:"5100",
    tagline:"Triple GLP-1/GIP/glucagon agonist — most potent metabolic peptide in trials",
    mechanism:"First triple incretin agonist. Phase 2 showed up to 24.2% body weight reduction — surpassing tirzepatide. Glucagon receptor component adds thermogenic and hepatic fat-clearing effects unavailable in dual agonists.",
    vectors:{longevity:3,metabolism:5,brain:1,repair:1}, efficacy:97, risk:35, confidence:65,
    studies:"Phase 3 Trials (ongoing)", wada:"Not regulated",
    fda:"Phase 3 — Research Chemical",
    toxicity:"Moderate. GI effects expected. Glucagon component may cause glucose fluctuations. Long-term CV data pending.",
    protocol:{dose:"1–12 mg/week (escalation)",frequency:"Once weekly",route:"SC",cycle:"Ongoing trials"},
    synergy:["tirzepatide","semaglutide","motsc"], tags:["Triple Agonist","Weight Loss","Phase 3","Next-Gen"] },

  { id:"cjc1295",  code:"Cj", num:"015", name:"CJC-1295",       group:"ghaxis",       mw:"3647.3",
    tagline:"DAC-modified GHRH analog, extended GH pulse amplifier",
    mechanism:"Binds GHRH receptors on pituitary somatotrophs amplifying GH pulse amplitude. DAC technology enables albumin binding extending half-life to ~8 days. Synergistic with ghrelin mimetics for maximized GH output.",
    vectors:{longevity:3,metabolism:4,brain:1,repair:3}, efficacy:80, risk:30, confidence:65,
    studies:"Phase I/II Clinical", wada:"Banned (S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate. Possible water retention, peripheral numbness, reduced insulin sensitivity.",
    protocol:{dose:"1–2 mg",frequency:"Once/week",route:"SC",cycle:"8–12 weeks"},
    synergy:["ipamorelin","igf1lr3","aod9604"], tags:["GH Secretagogue","Body Composition","Recovery","Sleep"] },

  { id:"ipamorelin",code:"Ip",num:"016", name:"Ipamorelin",     group:"ghaxis",       mw:"711.9",
    tagline:"Selective ghrelin receptor agonist — cleanest GH secretagogue studied",
    mechanism:"Binds GHS-R1a stimulating GH release without significant cortisol or prolactin elevation — key advantage over all other GHRPs. Does not stimulate appetite unlike native ghrelin. Gold standard combination with CJC-1295.",
    vectors:{longevity:2,metabolism:4,brain:1,repair:3}, efficacy:75, risk:20, confidence:60,
    studies:"Animal / Phase I Clinical", wada:"Banned (S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low. Minimal cortisol impact. Best safety profile among GHRPs.",
    protocol:{dose:"200–300 mcg",frequency:"2–3×/day (fasted)",route:"SC",cycle:"8–12 weeks"},
    synergy:["cjc1295","ghrp2","igf1lr3"], tags:["GH Secretagogue","No Cortisol","Sleep","Recovery"] },

  { id:"sermorelin",code:"Sr",num:"017", name:"Sermorelin",     group:"ghaxis",       mw:"3357.9",
    tagline:"Endogenous GHRH(1-29) analog, physiological GH pulse stimulator",
    mechanism:"First 29 amino acids of endogenous GHRH. Stimulates pituitary to produce GH in natural pulsatile fashion, preserving hypothalamic-pituitary feedback. Most physiological approach to GH stimulation.",
    vectors:{longevity:3,metabolism:3,brain:1,repair:3}, efficacy:70, risk:20, confidence:70,
    studies:"Clinical / Historical Approval", wada:"Banned (S2)",
    fda:"Compounding Pharmacy (Category 1 candidate)",
    toxicity:"Low. Preserves axis feedback. More physiological than exogenous GH.",
    protocol:{dose:"200–300 mcg",frequency:"Daily (bedtime)",route:"SC",cycle:"3–6 months"},
    synergy:["ipamorelin","ghrp2","cjc1295"], tags:["GHRH","Pituitary","Physiological","Anti-aging"] },

  { id:"tesamorelin",code:"Te",num:"018", name:"Tesamorelin",   group:"ghaxis",       mw:"5135.8",
    tagline:"Stabilized GHRH analog — only FDA-approved GH-releasing peptide",
    mechanism:"Stabilized full-length GHRH with trans-3-hexenoic acid modification. Reduces visceral adipose tissue through GH-IGF-1 axis. Only GH-releasing peptide with full FDA approval for lipodystrophy.",
    vectors:{longevity:2,metabolism:4,brain:1,repair:2}, efficacy:80, risk:25, confidence:85,
    studies:"FDA Approved (Egrifta)", wada:"Banned (S2)",
    fda:"FDA Approved — Egrifta SV",
    toxicity:"Low-moderate. Joint pain, fluid retention possible. Monitor glucose tolerance.",
    protocol:{dose:"2 mg",frequency:"Daily",route:"SC",cycle:"Ongoing (supervised)"},
    synergy:["ipamorelin","cjc1295","motsc"], tags:["GHRH","FDA Approved","Lipodystrophy","Visceral Fat"] },

  { id:"ghrp2",    code:"G2", num:"019", name:"GHRP-2",         group:"ghaxis",       mw:"817.9",
    tagline:"Second-generation GH-releasing hexapeptide, potent GH secretagogue",
    mechanism:"Binds GHS-R1a and CD36 receptors. Stronger GH pulse than GHRP-6 with less appetite stimulation. Moderate cortisol/prolactin elevation concern for long-term use.",
    vectors:{longevity:2,metabolism:4,brain:1,repair:3}, efficacy:80, risk:35, confidence:60,
    studies:"Animal / Human Research", wada:"Banned (S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate. Cortisol and prolactin elevation with repeated dosing.",
    protocol:{dose:"100–300 mcg",frequency:"2–3×/day",route:"SC",cycle:"6–8 weeks"},
    synergy:["cjc1295","ipamorelin","sermorelin"], tags:["GHRP","GH Release","Cortisol","Research"] },

  { id:"hexarelin", code:"Hx",num:"020", name:"Hexarelin",      group:"ghaxis",       mw:"887.1",
    tagline:"Most potent GHRP studied — unique cardioprotective properties",
    mechanism:"Most potent GHRP in class. Activates GHS-R1a and CD36/GHSR-specific pathways linked to cardiac protection. Unique among all GHRPs for cardioprotective activity independent of GH release. Desensitizes rapidly limiting sustained use.",
    vectors:{longevity:2,metabolism:3,brain:1,repair:3}, efficacy:85, risk:40, confidence:55,
    studies:"Animal / Phase I", wada:"Banned (S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate. Rapid desensitization. Cortisol/prolactin elevation. Facial flushing.",
    protocol:{dose:"100–200 mcg",frequency:"2×/day",route:"SC",cycle:"4 weeks max"},
    synergy:["cjc1295","ss31","motsc"], tags:["Most Potent GHRP","Cardioprotective","CD36","Desensitizes"] },

  { id:"igf1lr3",  code:"Ig", num:"021", name:"IGF-1 LR3",      group:"ghaxis",       mw:"9117",
    tagline:"Extended half-life IGF-1 variant, systemic anabolic growth factor",
    mechanism:"Arg(3) substitution and 13-AA N-terminal extension reduce IGFBP binding 270-fold, extending half-life from minutes to ~20 hours. Activates IGF-1R and IR-A, driving muscle protein synthesis and satellite cell activation systemically.",
    vectors:{longevity:2,metabolism:4,brain:2,repair:4}, efficacy:85, risk:45, confidence:55,
    studies:"Animal / Limited Human", wada:"Banned (S1/S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate-high. Systemic growth promotion — potential off-target proliferation. Hypoglycemia risk.",
    protocol:{dose:"20–50 mcg",frequency:"Post-workout",route:"SC/IM",cycle:"4 weeks on/4 off"},
    synergy:["mgf","tb500","cjc1295"], tags:["IGF-1","Anabolic","Satellite Cells","Protein Synthesis"] },

  { id:"dihexa",  code:"Dx",  num:"022", name:"Dihexa",          group:"cns",          mw:"594.8",
    tagline:"HGF/c-Met allosteric modulator — most potent synaptogenic agent studied",
    mechanism:"Allosteric HGF/c-Met receptor modulator. Enhances synaptogenesis 10 million times more potently than BDNF — the largest observed potency gap between a synthetic and endogenous neurotrophin. Mechanism of systemic proliferative risk completely unstudied at human doses.",
    vectors:{longevity:2,metabolism:1,brain:5,repair:2}, efficacy:90, risk:70, confidence:25,
    studies:"Animal — No Human Trials", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"⚠ HIGH UNCERTAIN RISK. Potent synaptogenesis may theoretically stimulate pathological proliferation. Long-term human safety completely unknown.",
    protocol:{dose:"Not established",frequency:"—",route:"Oral / Transdermal",cycle:"No human data"},
    synergy:["semax","selank","p21"], tags:["Synaptogenesis","Memory","Neurodegeneration","High Risk"] },

  { id:"semax",   code:"Sm",  num:"023", name:"Semax",           group:"cns",          mw:"813.9",
    tagline:"Synthetic ACTH(4-7) analog, potent BDNF upregulator and neuroprotectant",
    mechanism:"Stimulates BDNF and NGF expression in hippocampus and cortex. Modulates dopaminergic and serotonergic transmission. Activates MC4R/MC5R. Strong neuroprotection in ischemic conditions via antioxidant enzyme cascade activation.",
    vectors:{longevity:2,metabolism:1,brain:5,repair:1}, efficacy:80, risk:20, confidence:60,
    studies:"Clinical (Russia/CIS)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low. Well-tolerated. Possible anxiety at high doses. Non-addictive.",
    protocol:{dose:"200–900 mcg",frequency:"1–2×/day",route:"Nasal / SC",cycle:"2–4 weeks"},
    synergy:["selank","dihexa","vip"], tags:["BDNF","Memory","Neuroprotection","Focus"] },

  { id:"selank",  code:"Sl",  num:"024", name:"Selank",          group:"cns",          mw:"863.0",
    tagline:"Synthetic anxiolytic heptapeptide, tuftsin derivative without sedation",
    mechanism:"Modulates GABA-A receptor activity providing anxiolytic effect without sedation. Increases BDNF and neurotrophin expression. Inhibits enkephalinases prolonging endogenous neuropeptide activity. Normalizes anxiety via serotonin system.",
    vectors:{longevity:1,metabolism:1,brain:4,repair:1}, efficacy:75, risk:15, confidence:55,
    studies:"Clinical (Russia/CIS)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. No dependence or withdrawal syndrome. No myorelaxation.",
    protocol:{dose:"250–3000 mcg",frequency:"1–3×/day",route:"Nasal / SC",cycle:"2–4 weeks"},
    synergy:["semax","vip","bpc157"], tags:["Anxiety","Anxiolytic","Nootropic","No Sedation"] },

  { id:"pe2228",  code:"Pe",  num:"025", name:"PE-22-28",        group:"cns",          mw:"805.9",
    tagline:"Spadin analog, TREK-1 channel blocker with rapid antidepressant onset",
    mechanism:"Synthetic spadin analog derived from NTSR3/sortilin receptor propeptide. Blocks TREK-1 (TWIK-related K+ channels) producing fast-onset antidepressant effects. Activates serotonergic signaling. Potential onset within hours vs. weeks for SSRIs.",
    vectors:{longevity:1,metabolism:1,brain:4,repair:1}, efficacy:70, risk:20, confidence:30,
    studies:"Animal / Early Preclinical", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low in animal models. Human data absent.",
    protocol:{dose:"Not established",frequency:"Under investigation",route:"SC",cycle:"Research phase"},
    synergy:["semax","selank","dsip"], tags:["Antidepressant","TREK-1","Serotonin","Fast Onset"] },

  { id:"dsip",    code:"Di",  num:"026", name:"DSIP",            group:"cns",          mw:"849.0",
    tagline:"Delta sleep-inducing peptide, neuromodulator of sleep architecture",
    mechanism:"Modulates delta-wave sleep through CNS. Reduces stress-induced ACTH release. Studied for sleep disorders, pain modulation, and opioid withdrawal support. Crosses blood-brain barrier, interacting with multiple neuromodulatory systems.",
    vectors:{longevity:2,metabolism:1,brain:3,repair:1}, efficacy:60, risk:15, confidence:40,
    studies:"Animal / Small Human Cohorts", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low. Well-tolerated in human studies. Possible fatigue at high doses.",
    protocol:{dose:"25 mcg/kg",frequency:"Daily (evening)",route:"SC / IV",cycle:"1–2 weeks"},
    synergy:["epithalon","selank","vip"], tags:["Sleep","Delta Waves","Stress","Pain"] },

  { id:"p21",     code:"P2",  num:"027", name:"P21",             group:"cns",          mw:"1200",
    tagline:"CNTF-derived nootropic fragment, adult hippocampal neurogenesis promoter",
    mechanism:"Derived from active region of Ciliary Neurotrophic Factor (CNTF). Promotes adult hippocampal neurogenesis without CNTF's inflammatory side effects. Crosses BBB via intranasal route. Studied in cognitive decline and depression models.",
    vectors:{longevity:2,metabolism:1,brain:4,repair:2}, efficacy:65, risk:25, confidence:30,
    studies:"Animal / Preclinical", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low in animal studies. Limited human data. Neurogenesis implications require long-term study.",
    protocol:{dose:"50–100 mcg",frequency:"Daily",route:"Nasal",cycle:"4–8 weeks"},
    synergy:["semax","dihexa","selank"], tags:["Neurogenesis","Hippocampus","CNTF","Depression"] },

  { id:"vip",     code:"Vp",  num:"028", name:"VIP",             group:"cns",          mw:"3326.8",
    tagline:"Vasoactive Intestinal Peptide — neuropeptide and CIRS protocol cornerstone",
    mechanism:"Binds VPAC1/VPAC2 receptors activating cAMP cascade. Regulates circadian rhythm through suprachiasmatic nucleus. Central to CIRS protocols for Chronic Inflammatory Response Syndrome. Exhibits neuroprotection via reduction of neuroinflammation.",
    vectors:{longevity:2,metabolism:2,brain:4,repair:2}, efficacy:75, risk:25, confidence:50,
    studies:"Clinical (CIRS Protocol)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate. Possible hypotension with systemic administration.",
    protocol:{dose:"50 nmol (nasal)",frequency:"Daily",route:"Nasal spray",cycle:"Per CIRS protocol"},
    synergy:["semax","selank","bpc157"], tags:["CIRS","Circadian","Neuroprotection","Immunity"] },

  { id:"pinealon", code:"Pn", num:"029", name:"Pinealon",        group:"cns",          mw:"381.4",
    tagline:"Pineal gland tripeptide, neuroprotective epigenetic bioregulator",
    mechanism:"Epigenetic regulator from pineal gland extract research (Khavinson). Penetrates nuclear membrane interacting with DNA promoter regions. Studied for neuroprotection, retinal degeneration, and age-related CNS decline.",
    vectors:{longevity:3,metabolism:1,brain:4,repair:2}, efficacy:60, risk:10, confidence:35,
    studies:"Animal / Small Human (CIS)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Endogenous-derived. Minimal adverse events in available studies.",
    protocol:{dose:"5–10 mg",frequency:"Daily",route:"SC / Oral",cycle:"10 days, 1–2×/year"},
    synergy:["epithalon","semax","dsip"], tags:["Pineal","Neuroprotection","Epigenetic","Retina"] },

  { id:"epithalon",code:"Ep", num:"030", name:"Epithalon",       group:"longevity",    mw:"390.3",
    tagline:"Pineal tetrapeptide bioregulator — telomerase activator and longevity marker",
    mechanism:"Stimulates telomerase activity (hTERT) leading to telomere elongation. Normalizes circadian rhythm via melatonin synthesis regulation. Restores hypothalamic-pituitary sensitivity. Reduces lipid peroxidation and DNA damage markers.",
    vectors:{longevity:5,metabolism:2,brain:2,repair:3}, efficacy:70, risk:15, confidence:50,
    studies:"Animal / Small Human Cohorts", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low. Endogenous-derived. Theoretical oncological risk via telomerase activation debated but no clinical data.",
    protocol:{dose:"5–10 mg/day",frequency:"Daily",route:"SC / Nasal",cycle:"10–20 days, 1–2×/year"},
    synergy:["ghkcu","nad","ss31"], tags:["Telomerase","Anti-aging","Melatonin","Longevity"] },

  { id:"ss31",     code:"Ss", num:"031", name:"SS-31",            group:"longevity",    mw:"638.8",
    tagline:"Szeto-Schiller mitochondrial peptide — cardiolipin stabilizer and ROS quencher",
    mechanism:"Selectively accumulates in inner mitochondrial membrane. Binds cardiolipin stabilizing respiratory complexes I–V. Reduces proton leak and ROS production. Restores mitochondrial membrane potential in ischemic injury. In Phase II heart failure trials.",
    vectors:{longevity:5,metabolism:4,brain:3,repair:3}, efficacy:80, risk:20, confidence:60,
    studies:"Phase II Clinical Trials", wada:"Not regulated",
    fda:"Research Chemical (Clinical Investigation)",
    toxicity:"Moderate. Well-tolerated in HF trials. Local injection reactions.",
    protocol:{dose:"0.05–0.25 mg/kg",frequency:"Daily",route:"SC / IV",cycle:"4–12 weeks"},
    synergy:["nad","motsc","epithalon"], tags:["Mitochondria","Heart Failure","ROS","Energy"] },

  { id:"nad",      code:"Nd", num:"032", name:"NAD+",             group:"longevity",    mw:"663.4",
    tagline:"Essential cellular coenzyme — sirtuin substrate and master aging regulator",
    mechanism:"Required cofactor for 400+ enzymatic reactions. Substrate for sirtuins (SIRT1-7) regulating longevity gene expression. Activates PARP for DNA repair. NAD+ levels decline with age correlating with mitochondrial dysfunction and inflammation.",
    vectors:{longevity:5,metabolism:4,brain:4,repair:3}, efficacy:85, risk:10, confidence:80,
    studies:"Multiple Human Trials", wada:"Not regulated",
    fda:"Supplement (NMN/NR) / IV Research Chemical",
    toxicity:"Very low. Endogenous compound. IV may cause nausea, flushing. Oral precursors well-tolerated.",
    protocol:{dose:"500mg–1g (IV); 500–1000mg (oral)",frequency:"Daily / 1–2×/week (IV)",route:"IV / Oral",cycle:"Ongoing / 4–8 week courses"},
    synergy:["ss31","motsc","epithalon"], tags:["Sirtuins","DNA Repair","Energy","Anti-aging"] },

  { id:"humanin",  code:"Hn", num:"033", name:"Humanin",          group:"longevity",    mw:"2902.5",
    tagline:"Mitochondrial-derived cytoprotective peptide, circulating longevity marker",
    mechanism:"Encoded in mitochondrial 16S rRNA locus. Activates STAT3 and MEK-ERK signaling via tripartite receptor (CNTFR/WSX-1/gp130). Inhibits apoptosis in neuronal and cardiomyocyte models. Circulating levels decline with age and correlate with cardiovascular risk.",
    vectors:{longevity:5,metabolism:3,brain:3,repair:2}, efficacy:65, risk:10, confidence:40,
    studies:"Animal / Observational Human", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Endogenous peptide. No adverse events in available human data.",
    protocol:{dose:"2–4 mg",frequency:"3×/week",route:"SC",cycle:"4–8 weeks"},
    synergy:["motsc","ss31","nad"], tags:["Mitochondrial","Cytoprotection","Neuronal","STAT3"] },

  { id:"shlp2",    code:"Sh", num:"034", name:"SHLP-2",           group:"longevity",    mw:"1400",
    tagline:"Small Humanin-Like Peptide 2 — emerging mitochondrial longevity signal",
    mechanism:"Member of the SHLP family of mitochondrial-derived peptides. Promotes cell survival, reduces mitochondrial ROS, exerts insulin-sensitizing effects. Levels correlate with longevity in centenarian population studies. Research in early stages.",
    vectors:{longevity:5,metabolism:3,brain:2,repair:2}, efficacy:60, risk:10, confidence:25,
    studies:"Preclinical / Observational", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Endogenous mitochondrial peptide.",
    protocol:{dose:"Not established",frequency:"Under investigation",route:"SC",cycle:"Research phase"},
    synergy:["humanin","motsc","ss31"], tags:["MDP","Mitochondrial","Centenarian","Emerging"] },

  { id:"foxo4dri", code:"Fx", num:"035", name:"FOXO4-DRI",        group:"longevity",    mw:"4800",
    tagline:"Senolytic peptide — selectively clears senescent cells via p53 pathway",
    mechanism:"D-retro-inverso FOXO4 peptide disrupts FOXO4-p53 interaction in senescent cells, triggering targeted apoptosis. Does not affect healthy cells. Restored fitness, fur density, and renal function in aged mouse models. First peptide-based senolytic.",
    vectors:{longevity:5,metabolism:2,brain:2,repair:3}, efficacy:70, risk:30, confidence:30,
    studies:"Animal — No Human Trials", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Unknown in humans. Targeted senolytic in mice without apparent systemic toxicity.",
    protocol:{dose:"Not established",frequency:"Intermittent cycles",route:"SC / IP (animal)",cycle:"Intermittent"},
    synergy:["nad","epithalon","ghkcu"], tags:["Senolytic","Senescence","p53","Aging"] },

  { id:"klotho",   code:"Kl", num:"036", name:"Klotho (frag.)",   group:"longevity",    mw:"130000",
    tagline:"Anti-aging glycoprotein fragment — FGF23 co-receptor and longevity biomarker",
    mechanism:"Regulates phosphate metabolism via FGF23 signaling. Circulating Klotho declines strongly with age and correlates with mortality risk. Regulates Wnt, IGF-1, and TGF-β pathways. Intranasal fragments studied for cognitive enhancement.",
    vectors:{longevity:5,metabolism:3,brain:4,repair:2}, efficacy:70, risk:20, confidence:40,
    studies:"Animal / Observational Human", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low for fragments under investigation. Full protein pharmacology complex.",
    protocol:{dose:"Under investigation",frequency:"Research phase",route:"IV / Nasal (fragments)",cycle:"Research phase"},
    synergy:["epithalon","nad","ghkcu"], tags:["FGF23","Anti-aging","Cognition","Biomarker"] },

  { id:"pt141",   code:"Pt",  num:"037", name:"PT-141",           group:"hormonal",     mw:"1025.2",
    tagline:"MC3R/MC4R agonist — neurogenic libido modulator with FDA approval (women)",
    mechanism:"Activates melanocortin receptors in hypothalamus via central nervous system pathway — mechanistically distinct from vascular PDE5 inhibitors. FDA-approved for hypoactive sexual desire disorder (HSDD) in women as Vyleesi.",
    vectors:{longevity:1,metabolism:1,brain:2,repair:1}, efficacy:80, risk:35, confidence:85,
    studies:"FDA Approved (Women)", wada:"Not regulated",
    fda:"FDA Approved — Vyleesi (Women) / Research Chemical (Men)",
    toxicity:"Moderate. Nausea (40%), hyperpigmentation with long-term use, transient BP elevation.",
    protocol:{dose:"1–2 mg",frequency:"As needed, max 1×/72h",route:"SC (45 min prior)",cycle:"As needed"},
    synergy:["kisspeptin","melanotan2"], tags:["Libido","MC4R","CNS Mechanism","FDA Women"] },

  { id:"kisspeptin",code:"Ks",num:"038", name:"Kisspeptin-10",   group:"hormonal",     mw:"1302.5",
    tagline:"Master HPG axis regulator — pulsatile GnRH stimulator",
    mechanism:"Activates KISS1R (GPR54) on GnRH neurons in hypothalamus triggering pulsatile LH and FSH release. Regulates pubertal onset and fertility. Applications in hypogonadism, infertility diagnosis, and HPG axis integrity assessment.",
    vectors:{longevity:2,metabolism:1,brain:1,repair:1}, efficacy:75, risk:20, confidence:60,
    studies:"Clinical Trials / Phase II", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. No treatment-emergent adverse events in clinical cohorts. Self-limiting pulsatile mechanism.",
    protocol:{dose:"1–3 nmol/kg",frequency:"Pulsatile (research)",route:"SC / Nasal (emerging)",cycle:"Per fertility protocol"},
    synergy:["pt141","sermorelin"], tags:["HPG Axis","GnRH","Fertility","Hypogonadism"] },

  { id:"melanotan1",code:"M1",num:"039", name:"Melanotan I",     group:"hormonal",     mw:"1646.9",
    tagline:"Linear α-MSH analog for photoprotection and melanogenesis research",
    mechanism:"Activates MC1R in melanocytes stimulating melanin synthesis without UV exposure. Originally developed for photoprotection. Non-selective across MCRs. Studied for skin protection in photosensitive conditions and polymorphic light eruption.",
    vectors:{longevity:1,metabolism:1,brain:1,repair:1}, efficacy:65, risk:30, confidence:50,
    studies:"Phase II Clinical", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate. Nausea, facial flushing, fatigue, yawning. Pigmentation changes.",
    protocol:{dose:"1 mg",frequency:"Daily loading, then maintenance",route:"SC",cycle:"Loading phase"},
    synergy:["melanotan2","pt141"], tags:["Melanin","Photoprotection","MC1R","Tanning"] },

  { id:"melanotan2",code:"M2",num:"040", name:"Melanotan II",    group:"hormonal",     mw:"1024.2",
    tagline:"Cyclic α-MSH analog — potent non-selective melanocortin agonist",
    mechanism:"Cyclic, stable, potent α-MSH analog. Activates MC1R, MC3R, MC4R, MC5R. MC4R drives libido effects (shared with PT-141). MC1R drives melanogenesis. Non-selectivity produces broader side effect profile than selective agonists.",
    vectors:{longevity:1,metabolism:1,brain:2,repair:1}, efficacy:75, risk:45, confidence:55,
    studies:"Animal / Human Research", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate-high. Nausea, spontaneous erections, flushing, yawning. Less controlled than selective agonists.",
    protocol:{dose:"0.5–1 mg",frequency:"Loading then as needed",route:"SC",cycle:"Loading phase"},
    synergy:["pt141","melanotan1"], tags:["Non-selective MCR","Melanogenesis","Libido","Tanning"] },

  { id:"pnc27",    code:"Pc", num:"041", name:"PNC-27",           group:"immune",       mw:"3200",
    tagline:"p53-derived anticancer peptide — selective tumor membrane disruption",
    mechanism:"Contains HDM-2-binding domain of p53 and transmembrane penetrating domain. Selectively inserts into cancer cell membranes (which aberrantly express HDM-2) causing membranolysis. Does not affect normal cells. Studied in pancreatic, melanoma, and leukemia models.",
    vectors:{longevity:2,metabolism:1,brain:1,repair:2}, efficacy:65, risk:30, confidence:30,
    studies:"Animal / In Vitro / Phase I", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Moderate unknown. Selective for cancer cells in models. Systemic human safety under investigation.",
    protocol:{dose:"Under investigation",frequency:"Research phase",route:"IV (research)",cycle:"Research only"},
    synergy:["thyalpha1","ll37","foxo4dri"], tags:["Anticancer","p53","Membranolysis","Selective"] },

  { id:"thymalin", code:"Ty", num:"042", name:"Thymalin",         group:"immune",       mw:"6000",
    tagline:"Thymus extract complex — broad immune reconstitution agent",
    mechanism:"Natural thymic extract containing multiple bioactive peptides. Restores T-cell counts and function in immunodeficient states. Used clinically in Russia for immune reconstitution, cancer support, and age-related immune decline.",
    vectors:{longevity:3,metabolism:1,brain:1,repair:2}, efficacy:65, risk:15, confidence:45,
    studies:"Clinical (CIS countries)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low. Natural thymic extract. Well-documented in CIS clinical use.",
    protocol:{dose:"5–20 mg",frequency:"Daily",route:"IM",cycle:"5–10 days"},
    synergy:["thyalpha1","thymulin","epithalon"], tags:["Thymus","Immune Reconstitution","T-cells","Cancer Support"] },

  { id:"glutathione",code:"Gs",num:"043", name:"Glutathione",    group:"immune",       mw:"307.3",
    tagline:"Master endogenous antioxidant — cellular detoxification hub",
    mechanism:"Primary cellular antioxidant and free radical scavenger. Substrate for glutathione peroxidase family. Critical for xenobiotic detoxification. Regenerates vitamins C and E. Declines with aging and chronic oxidative stress.",
    vectors:{longevity:3,metabolism:3,brain:3,repair:3}, efficacy:70, risk:5, confidence:70,
    studies:"Multiple Clinical Trials", wada:"Not regulated",
    fda:"Supplement / IV (Clinical Use)",
    toxicity:"Very low. Endogenous compound. IV well-tolerated. Rare: possible bronchoconstriction inhaled.",
    protocol:{dose:"600–1200 mg (oral/IV)",frequency:"Daily to weekly (IV)",route:"IV / Oral / Sublingual",cycle:"Ongoing / 4–8 week courses"},
    synergy:["nad","ghkcu","ll37"], tags:["Antioxidant","Detox","Master Antioxidant","Immune"] },

  { id:"follistatin",code:"Fs",num:"044", name:"Follistatin-344", group:"immune",       mw:"35000",
    tagline:"Myostatin-binding protein — potent endogenous muscle mass regulator",
    mechanism:"Binds and neutralizes myostatin (GDF-8) and activins, removing inhibitory effect on muscle growth. Single gene therapy injection in animals produces dramatic sustained hypertrophy. Follistatin-344 is most studied isoform.",
    vectors:{longevity:2,metabolism:4,brain:1,repair:4}, efficacy:80, risk:50, confidence:35,
    studies:"Animal / Gene Therapy Research", wada:"Banned (S2)",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"High unknown. Large protein. Systemic myostatin inhibition has broad effects on cardiac muscle, fibrosis regulation.",
    protocol:{dose:"Not established (protein)",frequency:"Research only",route:"SC (low bioavail.)",cycle:"Research only"},
    synergy:["igf1lr3","mgf","tb500"], tags:["Myostatin Inhibitor","Muscle","Anti-Catabolic","Gene Research"] },

  { id:"oxytocin",  code:"Ox",num:"045", name:"Oxytocin",        group:"immune",       mw:"1007.2",
    tagline:"Bonding neuropeptide — social behavior and anti-inflammatory modulator",
    mechanism:"Endogenous nonapeptide. Acts on OT receptors in brain (social bonding, stress reduction) and immune cells (anti-inflammatory). Studied for ASD, PTSD, social anxiety, and gut motility disorders.",
    vectors:{longevity:1,metabolism:2,brain:3,repair:1}, efficacy:65, risk:20, confidence:60,
    studies:"Multiple Clinical Trials", wada:"Not regulated",
    fda:"FDA Approved (obstetrics) / Research Chemical (CNS)",
    toxicity:"Low. Intranasal avoids major peripheral effects. Possible hyponatremia at high doses.",
    protocol:{dose:"16–40 IU",frequency:"As needed / Daily (research)",route:"Nasal",cycle:"4–8 weeks"},
    synergy:["selank","vip","dsip"], tags:["Social Bonding","PTSD","Autism","Anti-inflammatory"] },

  { id:"5amino1mq", code:"5A",num:"046", name:"5-Amino-1MQ",     group:"metabolism",   mw:"178.2",
    tagline:"NNMT inhibitor — epigenetic metabolic activator and fat cell regulator",
    mechanism:"Inhibits Nicotinamide N-Methyltransferase (NNMT). Blocking NNMT elevates cellular SAM and NAD+ levels, activating SIRT1 and metabolic gene networks. Reduces adipocyte size and lipid accumulation without requiring caloric restriction.",
    vectors:{longevity:3,metabolism:5,brain:2,repair:1}, efficacy:70, risk:25, confidence:35,
    studies:"Animal / Preclinical", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Unknown in humans. NNMT cancer metabolism roles require study.",
    protocol:{dose:"50–100 mg",frequency:"Daily",route:"Oral",cycle:"4–8 weeks"},
    synergy:["nad","motsc","aod9604"], tags:["NNMT Inhibitor","Metabolic","Fat Cell","Epigenetic"] },

  { id:"slu332",    code:"Su",num:"047", name:"SLU-PP-332",      group:"metabolism",   mw:"400",
    tagline:"ERRα/γ agonist — endurance exercise mimetic targeting mitochondrial biogenesis",
    mechanism:"Activates Estrogen-Related Receptor alpha and gamma (ERRα/γ), master regulators of mitochondrial biogenesis. Dramatically increases exercise endurance in mouse models (+70% running capacity without training). Classified as leading 'exercise in a bottle' candidate.",
    vectors:{longevity:3,metabolism:5,brain:2,repair:2}, efficacy:70, risk:25, confidence:25,
    studies:"Animal / Preclinical", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Unknown in humans. ERR pathway modulation has broad physiological implications.",
    protocol:{dose:"Not established",frequency:"Research phase",route:"Oral (in development)",cycle:"Research phase"},
    synergy:["motsc","nad","ss31"], tags:["ERRα","Exercise Mimetic","Endurance","Mitochondria"] },

  { id:"o304",      code:"O3",num:"048", name:"O304",            group:"metabolism",   mw:"400",
    tagline:"Pan-AMPK activator — insulin sensitizer and cardioprotective compound",
    mechanism:"Pan-activator of all AMPK isoforms. Improves insulin sensitivity in skeletal muscle and liver. Cardioprotective effects through AMPK-mediated metabolic regulation. Oral bioavailability under optimization. Phase 1 studies in T2DM.",
    vectors:{longevity:3,metabolism:4,brain:2,repair:2}, efficacy:65, risk:20, confidence:35,
    studies:"Animal / Phase 1", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Low in available studies. AMPK activation is well-tolerated pathway.",
    protocol:{dose:"Under investigation",frequency:"Daily (oral target)",route:"Oral",cycle:"Research phase"},
    synergy:["motsc","nad","semaglutide"], tags:["AMPK","Insulin","Cardioprotective","Oral"] },

  { id:"vilon",    code:"Vi", num:"049", name:"Vilon",            group:"longevity",    mw:"216.2",
    tagline:"Thymic dipeptide bioregulator — immune homeostasis and telomerase activator",
    mechanism:"Synthetic dipeptide (Lys-Glu) from thymus. Activates telomerase, reduces oxidative stress markers, modulates cytokine production. Part of Khavinson's bioregulator peptide series studied over decades.",
    vectors:{longevity:4,metabolism:1,brain:1,repair:2}, efficacy:55, risk:10, confidence:35,
    studies:"Animal / Small Human (CIS)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Minimal molecular weight limits adverse potential.",
    protocol:{dose:"1–2 mg",frequency:"Daily",route:"SC",cycle:"10 days, 2×/year"},
    synergy:["epithalon","thyalpha1","thymulin"], tags:["Thymic","Dipeptide","Telomerase","Bioregulator"] },

  { id:"cortagen",  code:"Cg",num:"050", name:"Cortagen",        group:"cns",          mw:"450",
    tagline:"Cortex-derived tetrapeptide — CNS aging and neuroprotection bioregulator",
    mechanism:"Tetrapeptide from cerebral cortex extract (Ala-Glu-Asp-Pro). Epigenetic regulation of cortical neuron gene expression. Studied for neuroprotection in aging-related cognitive decline and neurodegeneration research.",
    vectors:{longevity:3,metabolism:1,brain:4,repair:2}, efficacy:55, risk:10, confidence:25,
    studies:"Animal / Small Human (CIS)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Organ-specific bioregulator peptide.",
    protocol:{dose:"5–10 mg",frequency:"Daily",route:"SC",cycle:"10 days, 1–2×/year"},
    synergy:["pinealon","semax","epithalon"], tags:["Cortex","Neuroprotection","Bioregulator","Aging"] },

  { id:"cpc",      code:"Cp", num:"051", name:"C-Peptide",       group:"metabolism",   mw:"3020.3",
    tagline:"Proinsulin connecting peptide — active vascular and renal signaling molecule",
    mechanism:"Long considered inert, C-peptide binds GPR146 and other receptors. Activates Na+/K+-ATPase, improves microvascular blood flow. Studied for diabetic neuropathy, nephropathy, and retinopathy — complications inadequately addressed by insulin alone.",
    vectors:{longevity:2,metabolism:4,brain:2,repair:3}, efficacy:65, risk:10, confidence:55,
    studies:"Phase II/III Clinical", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Endogenous compound. No significant adverse events in trials.",
    protocol:{dose:"600 nmol",frequency:"Daily",route:"SC",cycle:"3–6 months"},
    synergy:["semaglutide","nad","bpc157"], tags:["Diabetes","Neuropathy","Vascular","Endogenous"] },

  { id:"testagen",  code:"Tg",num:"052", name:"Testagen",        group:"hormonal",     mw:"430",
    tagline:"HPG axis tetrapeptide bioregulator for testosterone support research",
    mechanism:"Synthetic tetrapeptide modulating hypothalamic-pituitary-gonadal axis. Studied for testosterone support and gonadal function restoration in aging males. Part of organ-specific peptide bioregulator series.",
    vectors:{longevity:2,metabolism:2,brain:1,repair:1}, efficacy:55, risk:15, confidence:25,
    studies:"Animal / Small Human (CIS)", wada:"Not regulated",
    fda:"Research Chemical — Not for Human Consumption",
    toxicity:"Very low. Limited data available.",
    protocol:{dose:"5–10 mg",frequency:"Daily",route:"SC",cycle:"10–20 days"},
    synergy:["kisspeptin","sermorelin","epithalon"], tags:["Testosterone","HPG","Bioregulator","Aging Male"] },
];

/* ─── FILTERS ────────────────────────────────────────────────────────────── */
const FILTERS = [
  { key:"all", label:"All Compounds" },
  { key:"regeneration", label:"Regeneration" },
  { key:"metabolism",   label:"Metabolism" },
  { key:"cns",          label:"CNS / Brain" },
  { key:"longevity",    label:"Longevity" },
  { key:"hormonal",     label:"Hormonal" },
  { key:"immune",       label:"Immune" },
  { key:"ghaxis",       label:"GH Axis" },
];

const VECTOR_LABELS = {
  longevity:"Longevity", metabolism:"Metabolism", brain:"Brain Power", repair:"Tissue Repair"
};

/* ─── MICRO COMPONENTS ───────────────────────────────────────────────────── */
function ActivityBar({ value, max=5, color }) {
  return (
    <div style={{ display:"flex", gap:3, alignItems:"center" }}>
      {Array.from({length:max}).map((_,i) => (
        <div key={i} style={{
          width:14, height:4, borderRadius:2,
          background: i < value
            ? `linear-gradient(90deg, ${color}, ${color}cc)`
            : "rgba(255,255,255,0.06)",
          boxShadow: i < value ? `0 0 4px ${color}60` : "none",
          transition:"all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

function RiskPill({ value }) {
  const cfg = value < 30
    ? { label:"LOW RISK",      bg:"rgba(0,229,160,0.1)",  border:"rgba(0,229,160,0.25)",  color:"#00e5a0" }
    : value < 60
    ? { label:"MODERATE RISK", bg:"rgba(245,166,35,0.1)", border:"rgba(245,166,35,0.25)", color:"#f5a623" }
    : { label:"HIGH RISK",     bg:"rgba(248,113,113,0.12)",border:"rgba(248,113,113,0.3)", color:"#f87171" };
  return (
    <span style={{
      fontSize:10, fontWeight:700, letterSpacing:1.5,
      padding:"3px 9px", borderRadius:20,
      background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
    }}>{cfg.label}</span>
  );
}

function EvidenceBar({ confidence, studies }) {
  const color = confidence >= 70 ? "#00e5a0" : confidence >= 45 ? "#f5a623" : "#f87171";
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
        <div style={{ flex:1, height:3, borderRadius:2, background:"rgba(255,255,255,0.06)" }}>
          <div style={{
            width:`${confidence}%`, height:"100%",
            background:`linear-gradient(90deg, ${color}80, ${color})`,
            borderRadius:2, transition:"width 0.6s ease",
          }} />
        </div>
        <span style={{ fontSize:11, color, fontWeight:700, minWidth:32 }}>{confidence}%</span>
      </div>
      <span style={{ fontSize:11, color:T.textMuted, letterSpacing:0.3 }}>{studies}</span>
    </div>
  );
}

/* ─── PEPTIDE CARD ───────────────────────────────────────────────────────── */
function PeptideCard({ peptide, onClick, dimmed, index }) {
  const g = G[peptide.group];
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={() => !dimmed && onClick(peptide)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:"relative",
        background: hov
          ? `linear-gradient(145deg, ${g.dim}, rgba(10,20,32,0.9))`
          : "rgba(7,14,24,0.7)",
        border:`1px solid ${hov ? g.border : T.border}`,
        borderTop:`2px solid ${hov ? g.color : g.color+"55"}`,
        borderRadius:8,
        padding:"14px 12px 12px",
        cursor: dimmed ? "default" : "pointer",
        transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)",
        opacity: dimmed ? 0.12 : 1,
        transform: hov && !dimmed ? "translateY(-4px) scale(1.01)" : "none",
        boxShadow: hov && !dimmed
          ? `0 12px 32px rgba(0,0,0,0.5), 0 0 20px ${g.glow}`
          : "0 1px 4px rgba(0,0,0,0.3)",
        minHeight:116,
        animationDelay:`${index * 0.02}s`,
      }}
    >
      {/* Number */}
      <div style={{
        fontSize:9, color:T.textMuted, fontFamily:"'DM Mono',monospace",
        marginBottom:5, letterSpacing:1,
      }}>{peptide.num}</div>

      {/* Symbol */}
      <div style={{
        fontSize:24, fontWeight:800, lineHeight:1, marginBottom:6,
        fontFamily:"'Syne',sans-serif",
        color: hov ? g.color : T.text,
        textShadow: hov ? `0 0 18px ${g.glow}` : "none",
        transition:"all 0.22s",
        letterSpacing:-0.5,
      }}>{peptide.code}</div>

      {/* Name */}
      <div style={{
        fontSize:10, fontWeight:600, color: hov ? T.text : T.textDim,
        marginBottom:4, lineHeight:1.35, letterSpacing:0.1,
        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
      }}>{peptide.name}</div>

      {/* Group label */}
      <div style={{
        fontSize:8, color:g.color, fontFamily:"'DM Mono',monospace",
        letterSpacing:1.5, opacity: hov ? 1 : 0.7, transition:"opacity 0.2s",
      }}>{g.short}</div>

      {/* Hover glow orb */}
      {hov && (
        <div style={{
          position:"absolute", bottom:-20, right:-20,
          width:80, height:80,
          background:`radial-gradient(circle, ${g.glow} 0%, transparent 70%)`,
          pointerEvents:"none", borderRadius:"50%",
        }} />
      )}
    </div>
  );
}

/* ─── MODAL ──────────────────────────────────────────────────────────────── */
function Modal({ peptide, onClose, all }) {
  const g = G[peptide.group];
  const synPeptides = (peptide.synergy||[]).map(id=>all.find(p=>p.id===id)).filter(Boolean);
  const ref = useRef(null);

  useEffect(() => {
    const handleKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(3,7,13,0.88)",
        backdropFilter:"blur(20px) saturate(1.5)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"16px",
        animation:"fadeIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .modal-scroll::-webkit-scrollbar { width:3px }
        .modal-scroll::-webkit-scrollbar-track { background:transparent }
        .modal-scroll::-webkit-scrollbar-thumb { background:${g.border}; border-radius:2px }
      `}</style>

      <div
        ref={ref}
        className="modal-scroll"
        style={{
          background:"linear-gradient(160deg, #0b1828 0%, #060e1a 50%, #040b14 100%)",
          border:`1px solid ${g.border}`,
          borderTop:`3px solid ${g.color}`,
          borderRadius:14,
          maxWidth:660, width:"100%",
          maxHeight:"92vh", overflowY:"auto",
          boxShadow:`0 40px 120px rgba(0,0,0,0.8), 0 0 60px ${g.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          animation:"slideUp 0.25s ease",
          position:"relative",
        }}
      >
        {/* Ambient glow top */}
        <div style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          width:400, height:200, pointerEvents:"none",
          background:`radial-gradient(ellipse, ${g.glow} 0%, transparent 70%)`,
          opacity:0.5,
        }} />

        {/* ── HEADER ── */}
        <div style={{
          padding:"26px 28px 22px",
          borderBottom:`1px solid ${T.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"flex-start",
          position:"relative",
        }}>
          <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
            {/* Symbol block */}
            <div style={{
              width:68, height:68, borderRadius:10,
              background:`linear-gradient(135deg, ${g.dim}, rgba(255,255,255,0.02))`,
              border:`1px solid ${g.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0,
              boxShadow:`0 0 20px ${g.glow}`,
            }}>
              <span style={{
                fontSize:28, fontWeight:900,
                color:g.color, fontFamily:"'Syne',sans-serif",
                textShadow:`0 0 16px ${g.glow}`,
              }}>{peptide.code}</span>
            </div>

            <div>
              <div style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:3, fontFamily:"'Syne',sans-serif", letterSpacing:-0.5 }}>
                {peptide.name}
              </div>
              <div style={{ fontSize:11, color:T.textMuted, marginBottom:8, letterSpacing:0.3 }}>
                {peptide.fullName || peptide.name}
              </div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{
                  fontSize:9, padding:"3px 9px", borderRadius:20,
                  background:g.dim, border:`1px solid ${g.border}`,
                  color:g.color, fontFamily:"'DM Mono',monospace", letterSpacing:2,
                }}>{G[peptide.group].label.toUpperCase()}</span>
                <span style={{
                  fontSize:9, padding:"3px 9px", borderRadius:20,
                  background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`,
                  color:T.textMuted, fontFamily:"'DM Mono',monospace",
                }}>MW {peptide.mw} Da</span>
                <span style={{
                  fontSize:9, padding:"3px 9px", borderRadius:20,
                  background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`,
                  color:T.textMuted, fontFamily:"'DM Mono',monospace",
                }}>#{peptide.num}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`,
              color:T.textMuted, width:34, height:34, borderRadius:8,
              cursor:"pointer", fontSize:14, display:"flex",
              alignItems:"center", justifyContent:"center", flexShrink:0,
              transition:"all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = g.color;
              e.currentTarget.style.color = g.color;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.color = T.textMuted;
            }}
          >✕</button>
        </div>

        {/* ── BODY ── */}
        <div style={{ padding:"22px 28px 28px" }}>

          {/* Tagline */}
          <div style={{
            fontSize:13, color:T.textDim, lineHeight:1.7,
            marginBottom:24, fontStyle:"italic",
            borderLeft:`2px solid ${g.color}`,
            paddingLeft:14, letterSpacing:0.2,
          }}>{peptide.tagline}</div>

          {/* Activity Profile */}
          <div style={{ marginBottom:24 }}>
            <SectionLabel>Activity Profile</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 28px" }}>
              {Object.entries(peptide.vectors).map(([k,v]) => (
                <div key={k}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, color:T.textDim }}>{VECTOR_LABELS[k]}</span>
                    <span style={{ fontSize:11, color:g.color, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{v}/5</span>
                  </div>
                  <ActivityBar value={v} color={g.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Mechanism */}
          <div style={{ marginBottom:24 }}>
            <SectionLabel>Mechanism of Action</SectionLabel>
            <p style={{ fontSize:13, lineHeight:1.8, color:T.textDim }}>{peptide.mechanism}</p>
          </div>

          {/* Safety */}
          <div style={{ marginBottom:24 }}>
            <SectionLabel>Safety & Regulatory</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
              <InfoCard label="Risk Profile">
                <RiskPill value={peptide.risk} />
              </InfoCard>
              <InfoCard label="Evidence Confidence">
                <EvidenceBar confidence={peptide.confidence} studies={peptide.studies} />
              </InfoCard>
            </div>
            <InfoCard label="Toxicity / Side Effects" style={{ marginBottom:8 }}>
              <p style={{ fontSize:12, color:T.textDim, lineHeight:1.65, margin:0 }}>{peptide.toxicity}</p>
            </InfoCard>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <InfoCard label="WADA Status">
                <span style={{
                  fontSize:12, fontWeight:600,
                  color: peptide.wada.includes("Banned") ? "#f87171" : "#00e5a0",
                }}>{peptide.wada}</span>
              </InfoCard>
              <InfoCard label="FDA Status">
                <span style={{ fontSize:11, color:T.textDim, lineHeight:1.4 }}>{peptide.fda}</span>
              </InfoCard>
            </div>
          </div>

          {/* Protocol */}
          <div style={{ marginBottom:24 }}>
            <SectionLabel>Research Protocol</SectionLabel>
            <div style={{
              background:"rgba(245,166,35,0.05)", border:"1px solid rgba(245,166,35,0.15)",
              borderRadius:7, padding:"10px 14px", marginBottom:10,
              fontSize:11, color:"rgba(245,166,35,0.7)", lineHeight:1.55,
            }}>
              ⚠ For research and informational purposes only — not a medical recommendation. Research Use Only. Not for Human Consumption.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {Object.entries(peptide.protocol).map(([k,v]) => {
                const labels = { dose:"Study Dose Range", frequency:"Frequency", route:"Route of Admin.", cycle:"Research Cycle" };
                return (
                  <InfoCard key={k} label={labels[k]||k}>
                    <span style={{ fontSize:12, color:T.text, fontWeight:600 }}>{v}</span>
                  </InfoCard>
                );
              })}
            </div>
          </div>

          {/* Synergy */}
          {synPeptides.length > 0 && (
            <div style={{ marginBottom:22 }}>
              <SectionLabel>Synergy / Stacking</SectionLabel>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {synPeptides.map(sp => {
                  const sg = G[sp.group];
                  return (
                    <div key={sp.id} style={{
                      padding:"6px 12px", borderRadius:6,
                      background:sg.dim, border:`1px solid ${sg.border}`,
                      fontSize:12, fontWeight:700, color:sg.color, letterSpacing:0.3,
                    }}>
                      {sp.code} · {sp.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {peptide.tags.map(t => (
              <span key={t} style={{
                fontSize:10, padding:"4px 10px", borderRadius:20,
                background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`,
                color:T.textMuted, letterSpacing:0.3,
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize:9, letterSpacing:3, color:T.textMuted,
      marginBottom:12, fontFamily:"'DM Mono',monospace",
      textTransform:"uppercase", display:"flex", alignItems:"center", gap:8,
    }}>
      <div style={{ width:16, height:1, background:T.border }} />
      {children}
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${T.border}, transparent)` }} />
    </div>
  );
}

function InfoCard({ label, children, style }) {
  return (
    <div style={{
      background:"rgba(255,255,255,0.025)",
      border:`1px solid ${T.border}`,
      borderRadius:7, padding:"11px 13px", ...style,
    }}>
      <div style={{
        fontSize:8, color:T.textMuted, letterSpacing:2,
        marginBottom:7, fontFamily:"'DM Mono',monospace", textTransform:"uppercase",
      }}>{label}</div>
      {children}
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
export default function Peptabula() {
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(() => PEPTIDES.filter(p => {
    const mG = filter === "all" || p.group === filter;
    const q  = search.toLowerCase();
    const mS = !q
      || p.name.toLowerCase().includes(q)
      || p.code.toLowerCase().includes(q)
      || p.tags.some(t => t.toLowerCase().includes(q))
      || G[p.group].label.toLowerCase().includes(q)
      || p.tagline.toLowerCase().includes(q);
    return mG && mS;
  }), [filter, search]);

  const isDim = filter !== "all" || search.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#03070d; }
        input::placeholder { color:rgba(221,238,255,0.25); }
        input:focus { outline:none; }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .card-anim { animation: cardIn 0.4s ease both; }
      `}</style>

      <div style={{
        minHeight:"100vh", background:T.bg,
        color:T.text, fontFamily:"'DM Sans',sans-serif",
        position:"relative", overflowX:"hidden",
      }}>

        {/* ── BACKGROUND ── */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
          {/* Deep ambient */}
          <div style={{
            position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)",
            width:"160%", height:"60%",
            background:"radial-gradient(ellipse, rgba(0,240,160,0.04) 0%, transparent 60%)",
          }} />
          <div style={{
            position:"absolute", bottom:"-10%", right:"-10%",
            width:"50%", height:"50%",
            background:"radial-gradient(ellipse, rgba(167,139,250,0.04) 0%, transparent 60%)",
          }} />
          <div style={{
            position:"absolute", bottom:"20%", left:"-5%",
            width:"40%", height:"40%",
            background:"radial-gradient(ellipse, rgba(34,211,238,0.03) 0%, transparent 60%)",
          }} />
          {/* Subtle grid */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:"linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)",
            backgroundSize:"56px 56px",
          }} />
          {/* Vignette */}
          <div style={{
            position:"absolute", inset:0,
            background:"radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(3,7,13,0.6) 100%)",
          }} />
        </div>

        {/* ── NAV ── */}
        <nav style={{
          position:"sticky", top:0, zIndex:50,
          background:"rgba(3,7,13,0.82)",
          backdropFilter:"blur(28px) saturate(1.8)",
          borderBottom:`1px solid ${T.border}`,
          padding:"0 32px",
          height:58,
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:28, height:28, borderRadius:6,
              background:"linear-gradient(135deg, rgba(0,240,160,0.2), rgba(0,240,160,0.05))",
              border:"1px solid rgba(0,240,160,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <div style={{ width:10, height:10, borderRadius:2, background:"#00f0a0", boxShadow:"0 0 8px rgba(0,240,160,0.6)" }} />
            </div>
            <div>
              <div style={{
                fontSize:16, fontWeight:800, color:T.text,
                fontFamily:"'Syne',sans-serif", letterSpacing:2,
                lineHeight:1,
              }}>PEPTABULA</div>
              <div style={{ fontSize:8, letterSpacing:3, color:T.textMuted, fontFamily:"'DM Mono',monospace" }}>
                PERIODIC TABLE OF PEPTIDES
              </div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:10, color:T.textMuted, fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>
              {filtered.length}/{PEPTIDES.length} compounds
            </span>
            <span style={{
              fontSize:9, padding:"4px 11px", borderRadius:20,
              background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)",
              color:"rgba(248,113,113,0.7)", fontFamily:"'DM Mono',monospace", letterSpacing:1.5,
            }}>RESEARCH ONLY</span>
          </div>
        </nav>

        <main style={{ position:"relative", zIndex:1, maxWidth:1360, margin:"0 auto", padding:"48px 24px 80px" }}>

          {/* ── HERO ── */}
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              fontSize:10, letterSpacing:4, color:"rgba(0,240,160,0.6)",
              marginBottom:18, fontFamily:"'DM Mono',monospace",
              padding:"5px 14px", borderRadius:20,
              background:"rgba(0,240,160,0.06)", border:"1px solid rgba(0,240,160,0.15)",
            }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"#00f0a0", boxShadow:"0 0 6px #00f0a0" }} />
              RESEARCH DATABASE v2.0 — {PEPTIDES.length} COMPOUNDS
            </div>

            <h1 style={{
              fontSize:"clamp(28px,5.5vw,62px)", fontWeight:800,
              lineHeight:1.06, marginBottom:14,
              fontFamily:"'Syne',sans-serif", letterSpacing:-1,
            }}>
              The Periodic Table<br />
              <span style={{
                background:"linear-gradient(135deg, #00f0a0, #22d3ee)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                filter:"drop-shadow(0 0 30px rgba(0,240,160,0.3))",
              }}>of Peptides</span>
            </h1>

            <p style={{
              fontSize:14, color:T.textMuted, maxWidth:480,
              margin:"0 auto 36px", lineHeight:1.75, fontWeight:300,
            }}>
              A structured scientific reference for peptide research. Evidence-based data, mechanisms, and safety profiles — organized for clarity.
            </p>

            {/* Search */}
            <div style={{ position:"relative", maxWidth:500, margin:"0 auto 26px" }}>
              <div style={{
                position:"absolute", left:16, top:"50%", transform:"translateY(-50%)",
                color: searchFocused ? T.accent : T.textMuted,
                fontSize:15, transition:"color 0.2s",
                pointerEvents:"none",
              }}>⌕</div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search peptide, mechanism, or effect..."
                style={{
                  width:"100%",
                  background: searchFocused ? "rgba(10,20,32,0.9)" : "rgba(7,14,24,0.8)",
                  border:`1px solid ${searchFocused ? "rgba(0,240,160,0.35)" : T.border}`,
                  borderRadius:10,
                  padding:"13px 18px 13px 44px",
                  color:T.text, fontSize:14,
                  fontFamily:"'DM Sans',sans-serif",
                  boxShadow: searchFocused ? "0 0 24px rgba(0,240,160,0.1)" : "none",
                  transition:"all 0.2s",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", color:T.textMuted,
                    cursor:"pointer", fontSize:14, padding:4,
                  }}
                >✕</button>
              )}
            </div>

            {/* Filter Pills */}
            <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
              {FILTERS.map(f => {
                const isA = filter === f.key;
                const g   = f.key !== "all" ? G[f.key] : null;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      padding:"7px 16px", borderRadius:20, cursor:"pointer",
                      fontFamily:"'DM Mono',monospace", fontSize:10,
                      letterSpacing:1.2, textTransform:"uppercase",
                      border:`1px solid ${isA && g ? g.border : isA ? "rgba(0,240,160,0.3)" : T.border}`,
                      background: isA && g ? g.dim : isA ? "rgba(0,240,160,0.07)" : "transparent",
                      color: isA && g ? g.color : isA ? T.accent : T.textMuted,
                      boxShadow: isA && g ? `0 0 14px ${g.glow}` : "none",
                      transition:"all 0.18s",
                    }}
                  >{f.label}</button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            display:"flex", gap:18, flexWrap:"wrap",
            marginBottom:28, paddingLeft:2,
            borderBottom:`1px solid ${T.border}`, paddingBottom:16,
          }}>
            {Object.entries(G).map(([k,g]) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{
                  width:8, height:8, borderRadius:2,
                  background:g.color, boxShadow:`0 0 5px ${g.glow}`,
                }} />
                <span style={{ fontSize:10, color:T.textMuted, letterSpacing:0.5 }}>{g.label}</span>
              </div>
            ))}
            <div style={{ marginLeft:"auto", fontSize:10, color:T.textMuted, fontFamily:"'DM Mono',monospace" }}>
              {PEPTIDES.length} compounds indexed
            </div>
          </div>

          {/* Grid */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(128px, 1fr))",
            gap:8,
          }}>
            {PEPTIDES.map((p, i) => (
              <div key={p.id} className="card-anim" style={{ animationDelay:`${i*0.018}s` }}>
                <PeptideCard
                  peptide={p}
                  onClick={setSelected}
                  dimmed={isDim && !filtered.includes(p)}
                  index={i}
                />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{
              textAlign:"center", padding:"80px 0",
              fontFamily:"'DM Mono',monospace", color:T.textMuted,
              fontSize:12, letterSpacing:3,
            }}>
              <div style={{ fontSize:32, marginBottom:12, opacity:0.3 }}>∅</div>
              NO COMPOUNDS MATCH YOUR SEARCH
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop:60, paddingTop:24,
            borderTop:`1px solid ${T.border}`,
            display:"flex", justifyContent:"space-between", alignItems:"center",
            flexWrap:"wrap", gap:12,
          }}>
            <div style={{ fontSize:10, color:T.textMuted, fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>
              PEPTABULA © 2025 — All compounds for research use only
            </div>
            <div style={{ fontSize:10, color:T.textMuted, fontFamily:"'DM Mono',monospace" }}>
              Not for human consumption · Not medical advice
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {selected && (
        <Modal peptide={selected} onClose={() => setSelected(null)} all={PEPTIDES} />
      )}
    </>
  );
}

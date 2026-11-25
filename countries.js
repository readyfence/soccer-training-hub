// Season months are approximate youth/club calendars (1 = Jan). Users can override the phase in their profile.
// Any month not listed under `off` or `pre` counts as in-season.
const EURO_SEASON = { off: [6], pre: [7] };
const CALENDAR_SEASON = { off: [12], pre: [1, 2] };

const COUNTRIES = {
  us: {
    name: "United States", flag: "🇺🇸", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Top youth leagues are MLS NEXT and ECNL; getting onto one of these teams puts you in front of scouts.",
      "College soccer (NCAA D1–D3, NAIA, NJCAA) is the most common route to the pros. Keep your grades up.",
      "Try out for your state's Olympic Development Program (ODP).",
      "USL academies and MLS club academies can offer pro contracts directly.",
    ],
  },
  ca: {
    name: "Canada", flag: "🇨🇦", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "MLS academies (Toronto FC, Vancouver Whitecaps, CF Montréal) recruit from across the country.",
      "Canadian Premier League clubs and League1 Canada give young players senior minutes.",
      "U Sports and NCAA college soccer are strong routes to a pro career.",
    ],
  },
  mx: {
    name: "Mexico", flag: "🇲🇽", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Liga MX clubs develop players through their fuerzas básicas (youth teams).",
      "Watch for official club visorias (trials), and only attend ones run directly by clubs.",
    ],
  },
  gb: {
    name: "United Kingdom", flag: "🇬🇧", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Pro club academies (Category 1–4) scout grassroots games. Play at the highest level you can.",
      "At 16, academies offer two-year scholarships. That's the key decision point.",
      "Released? Non-league football, college/university programs and US college scholarships are proven comeback routes.",
    ],
  },
  ie: {
    name: "Ireland", flag: "🇮🇪", hemisphere: "N", season: { off: [12], pre: [1, 2] },
    pathway: [
      "League of Ireland clubs run national underage leagues (U14–U19), which are the main shop window.",
      "Many players move to UK academies after impressing in the League of Ireland underage system.",
    ],
  },
  es: {
    name: "Spain", flag: "🇪🇸", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Club canteras (academies) scout from local clubs. Play at the highest category you can.",
      "División de Honor Juvenil is the top U19 league and a pathway to B teams.",
    ],
  },
  pt: {
    name: "Portugal", flag: "🇵🇹", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Big clubs' formação (academy) systems recruit heavily from local clubs.",
      "Strong performances in national youth championships lead to B-team and Liga 2 opportunities.",
    ],
  },
  de: {
    name: "Germany", flag: "🇩🇪", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Every pro club runs a youth performance centre (NLZ). That's where most pros come from.",
      "DFB talent centres (Stützpunkte) offer extra coaching and get you scouted.",
    ],
  },
  fr: {
    name: "France", flag: "🇫🇷", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Pro clubs' centres de formation sign players from around age 13–15.",
      "Regional Pôles Espoirs programs combine school with high-level training.",
    ],
  },
  it: {
    name: "Italy", flag: "🇮🇹", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Pro clubs' settore giovanile (youth sector) builds up to the Primavera (U19) team.",
      "Strong amateur clubs feed players into pro academies, so get scouted at regional level.",
    ],
  },
  nl: {
    name: "Netherlands", flag: "🇳🇱", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Pro club academies (jeugdopleidingen) are among the best in the world for technical development.",
      "Many players reach the Eredivisie via Jong (reserve) teams in the second tier.",
    ],
  },
  se: {
    name: "Sweden", flag: "🇸🇪", hemisphere: "N", season: { off: [11, 12], pre: [1, 2, 3] },
    pathway: [
      "Allsvenskan and Superettan clubs run academies, and many have football high-school programs.",
      "The season runs through the calendar year, so winter is your pre-season.",
    ],
  },
  no: {
    name: "Norway", flag: "🇳🇴", hemisphere: "N", season: { off: [11, 12], pre: [1, 2, 3] },
    pathway: [
      "Eliteserien clubs run academies, and there are sports high schools (toppidrett) with football programs.",
      "The season runs through the calendar year, so winter is your pre-season.",
    ],
  },
  br: {
    name: "Brazil", flag: "🇧🇷", hemisphere: "S", season: CALENDAR_SEASON,
    pathway: [
      "Clubs develop players through their categorias de base (youth categories).",
      "Peneiras (open trials) are common. Only attend ones run officially by the club.",
      "Futsal builds the close control Brazilian players are known for.",
    ],
  },
  ar: {
    name: "Argentina", flag: "🇦🇷", hemisphere: "S", season: CALENDAR_SEASON,
    pathway: [
      "Clubs' divisiones inferiores (youth divisions) are the main route to the first team.",
      "Clubs hold pruebas (trials). Go to official ones and bring your registration documents.",
    ],
  },
  co: {
    name: "Colombia", flag: "🇨🇴", hemisphere: "N", season: CALENDAR_SEASON,
    pathway: [
      "Liga BetPlay clubs run divisiones menores (youth divisions) and hold official trials.",
    ],
  },
  ng: {
    name: "Nigeria", flag: "🇳🇬", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Join a registered academy with a real track record of placing players.",
      "Under FIFA rules, players under 18 generally can't transfer abroad. Be very wary of anyone promising a move overseas for a fee.",
    ],
  },
  gh: {
    name: "Ghana", flag: "🇬🇭", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Ghana Premier League and Division One clubs, plus registered academies, are the main routes.",
      "Under FIFA rules, players under 18 generally can't transfer abroad. Be very wary of anyone promising a move overseas for a fee.",
    ],
  },
  za: {
    name: "South Africa", flag: "🇿🇦", hemisphere: "S", season: EURO_SEASON,
    pathway: [
      "PSL club academies and DStv Diski Challenge (reserve league) teams are the main pathway.",
      "School and university football (e.g. Varsity Football) are also strong shop windows.",
    ],
  },
  jp: {
    name: "Japan", flag: "🇯🇵", hemisphere: "N", season: CALENDAR_SEASON,
    pathway: [
      "J.League club academies are the direct route to a pro contract.",
      "High school football is huge, and many pros are signed from the national high school tournament.",
      "University football is another proven pathway to the J.League.",
    ],
  },
  kr: {
    name: "South Korea", flag: "🇰🇷", hemisphere: "N", season: CALENDAR_SEASON,
    pathway: [
      "K League clubs run U15/U18 youth teams that feed their senior squads.",
      "School and university teams are also common routes to the K League.",
    ],
  },
  in: {
    name: "India", flag: "🇮🇳", hemisphere: "N", season: { off: [4, 5], pre: [6, 7, 8] },
    pathway: [
      "ISL and I-League club academies, plus AIFF youth leagues, are the main pathway.",
      "State association teams and youth national championships help you get scouted.",
    ],
  },
  au: {
    name: "Australia", flag: "🇦🇺", hemisphere: "S", season: { off: [10, 11], pre: [12, 1] },
    pathway: [
      "NPL clubs are the top youth level in each state, and that's where A-League academies scout.",
      "State National Training Centre (NTC) programs are for the most talented players.",
    ],
  },
  nz: {
    name: "New Zealand", flag: "🇳🇿", hemisphere: "S", season: { off: [10, 11], pre: [12, 1, 2] },
    pathway: [
      "Federation talent centres and Wellington Phoenix / Auckland FC academies are the main pathway.",
      "Many players take the US college soccer route.",
    ],
  },
  other: {
    name: "Other country", flag: "🌍", hemisphere: "N", season: EURO_SEASON,
    pathway: [
      "Play at the highest level club you can and ask the coach how scouts find players in your area.",
      "Look for official trials run directly by professional clubs.",
    ],
  },
};

const UNIVERSAL_PATHWAY_TIPS = [
  "Never pay anyone to get you a trial. Real scouts and clubs don't charge for that.",
  "Agents must be FIFA-licensed. Ask for their licence number and check it.",
  "Film your games. A good highlight video opens doors in every country.",
  "Going pro is rare. Maximize your chance with a real club, competitive minutes, and daily/weekly habits — not shortcuts.",
  "App work + club practice + sleep beats random extra grinding that leaves you flat on match day.",
];

const SEASON_TEXT = {
  off: {
    label: "Off-season",
    tip: "Build strength and fix weaknesses. Gym days matter most right now, and keep touches on the ball a few times a week.",
  },
  pre: {
    label: "Pre-season",
    tip: "Build your fitness base. Push sprints and endurance, and get sharp on the ball before games start.",
  },
  in: {
    label: "In-season",
    tip: "Stay fresh for games. Keep extra sessions short and sharp, and keep gym work away from match days.",
  },
};

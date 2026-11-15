/**
 * FC 27 - Official Teams, Rosters, Formations and Stadium Data
 */

export const STADIUMS = [
  {
    id: 'apex_arena',
    name: 'Grand Apex Arena',
    city: 'London',
    capacity: '82,000',
    grassType: 'Hybrid MasterTurf',
    dayTime: 'Night - Under Floodlights',
    skyColor: 0x091422,
    fogColor: 0x0c1b2c,
    floodlightColor: 0xebf4ff,
    ambientColor: 0x18283d,
    adBoards: ['VOLT ENERGY', 'CYBERBOOST', 'AURA SPORTS', 'NEXUS PAY', 'HYPERBOOTS', 'ORBIT AIRWAYS']
  },
  {
    id: 'san_vittore',
    name: 'Stadio San Vittore',
    city: 'Milan',
    capacity: '76,500',
    grassType: 'Natural Striped Rye',
    dayTime: 'Dusk - Golden Hour',
    skyColor: 0x1f152b,
    fogColor: 0x241b30,
    floodlightColor: 0xfff0dd,
    ambientColor: 0x32243d,
    adBoards: ['PIRELLI TECH', 'AZZURRO VIBES', 'MODA SPORT', 'VELOCE MOTORS', 'LOMBARDIA EXPR']
  },
  {
    id: 'neo_tokyo',
    name: 'Neo Tokyo Colosseum',
    city: 'Tokyo',
    capacity: '68,000',
    grassType: 'Bio-Synthetic UltraTurf',
    dayTime: 'Cyber Midnight',
    skyColor: 0x050d18,
    fogColor: 0x081524,
    floodlightColor: 0xddffff,
    ambientColor: 0x122433,
    adBoards: ['KINETIC AI', 'NEO SHIBUYA', 'TITAN AUDIO', 'HYPERION CHIPS', 'DRAGON SNEAKERS']
  }
];

export const FORMATIONS = {
  '4-3-3': {
    name: '4-3-3 Attack',
    description: 'Dynamic wide attacking shape with dual wingers and playmaker',
    home: [
      { role: 'GK', pos: [6, 34], name: 'Goalkeeper' },
      { role: 'RB', pos: [20, 10], name: 'Right Back' },
      { role: 'CB', pos: [17, 26], name: 'Center Back' },
      { role: 'CB', pos: [17, 42], name: 'Center Back' },
      { role: 'LB', pos: [20, 58], name: 'Left Back' },
      { role: 'CDM', pos: [30, 34], name: 'Defensive Mid' },
      { role: 'CM', pos: [38, 20], name: 'Right Mid' },
      { role: 'CAM', pos: [40, 48], name: 'Attacking Mid' },
      { role: 'RW', pos: [45, 12], name: 'Right Wing' },
      { role: 'LW', pos: [45, 56], name: 'Left Wing' },
      { role: 'ST', pos: [47, 34], name: 'Striker' }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1 Wide',
    description: 'Solid double pivot midfield with balanced creative front four',
    home: [
      { role: 'GK', pos: [6, 34], name: 'Goalkeeper' },
      { role: 'RB', pos: [19, 10], name: 'Right Back' },
      { role: 'CB', pos: [16, 26], name: 'Center Back' },
      { role: 'CB', pos: [16, 42], name: 'Center Back' },
      { role: 'LB', pos: [19, 58], name: 'Left Back' },
      { role: 'CDM', pos: [28, 25], name: 'Center Defensive Mid' },
      { role: 'CDM', pos: [28, 43], name: 'Center Defensive Mid' },
      { role: 'RM', pos: [39, 12], name: 'Right Midfielder' },
      { role: 'CAM', pos: [39, 34], name: 'Central Playmaker' },
      { role: 'LM', pos: [39, 56], name: 'Left Midfielder' },
      { role: 'ST', pos: [46, 34], name: 'Lone Striker' }
    ]
  },
  '4-4-2': {
    name: '4-4-2 Classic Flat',
    description: 'Traditional balanced English system with strike partnership',
    home: [
      { role: 'GK', pos: [6, 34], name: 'Goalkeeper' },
      { role: 'RB', pos: [18, 10], name: 'Right Back' },
      { role: 'CB', pos: [16, 26], name: 'Center Back' },
      { role: 'CB', pos: [16, 42], name: 'Center Back' },
      { role: 'LB', pos: [18, 58], name: 'Left Back' },
      { role: 'RM', pos: [32, 10], name: 'Right Midfielder' },
      { role: 'CM', pos: [32, 27], name: 'Central Midfielder' },
      { role: 'CM', pos: [32, 41], name: 'Central Midfielder' },
      { role: 'LM', pos: [32, 58], name: 'Left Midfielder' },
      { role: 'ST', pos: [45, 26], name: 'Right Striker' },
      { role: 'ST', pos: [45, 42], name: 'Left Striker' }
    ]
  },
  '3-5-2': {
    name: '3-5-2 Wingbacks',
    description: 'Overloading midfield with high wingbacks and three central defenders',
    home: [
      { role: 'GK', pos: [6, 34], name: 'Goalkeeper' },
      { role: 'CB', pos: [16, 20], name: 'Right CB' },
      { role: 'CB', pos: [15, 34], name: 'Sweeper CB' },
      { role: 'CB', pos: [16, 48], name: 'Left CB' },
      { role: 'RWB', pos: [30, 8], name: 'Right Wingback' },
      { role: 'CDM', pos: [28, 27], name: 'Defensive Mid' },
      { role: 'CM', pos: [35, 34], name: 'Center Mid' },
      { role: 'CDM', pos: [28, 41], name: 'Defensive Mid' },
      { role: 'LWB', pos: [30, 60], name: 'Left Wingback' },
      { role: 'ST', pos: [46, 26], name: 'Target Forward' },
      { role: 'ST', pos: [46, 42], name: 'Second Striker' }
    ]
  }
};

export const TEAMS = [
  {
    id: 'meridian',
    name: 'Meridian City FC',
    shortName: 'MER',
    city: 'Meridian',
    league: 'Premier Global League',
    stars: 5,
    attackRating: 90,
    midfieldRating: 92,
    defenseRating: 87,
    overallRating: 90,
    primaryColor: '#00b4d8',
    secondaryColor: '#03045e',
    accentColor: '#00ff87',
    jerseyPattern: 'stripes',
    homeKit: {
      shirt: '#00b4d8',
      shorts: '#03045e',
      socks: '#00b4d8',
      numbers: '#ffffff'
    },
    awayKit: {
      shirt: '#111827',
      shorts: '#111827',
      socks: '#00ff87',
      numbers: '#00ff87'
    },
    gkKit: {
      shirt: '#f59e0b',
      shorts: '#b45309',
      socks: '#f59e0b',
      numbers: '#ffffff'
    },
    defaultFormation: '4-3-3',
    manager: 'Antonio Serrano',
    roster: [
      { num: 1, name: 'E. Cross', role: 'GK', ovr: 88, pac: 80, sho: 60, pas: 79, dri: 84, def: 90, phy: 85, face: 'caucasian-short' },
      { num: 2, name: 'A. Finch', role: 'RB', ovr: 85, pac: 89, sho: 68, pas: 82, dri: 84, def: 83, phy: 82, face: 'black-fade' },
      { num: 4, name: 'L. Marek', role: 'CB', ovr: 88, pac: 78, sho: 54, pas: 78, dri: 72, def: 91, phy: 89, face: 'caucasian-beard' },
      { num: 5, name: 'K. Ansa', role: 'CB', ovr: 87, pac: 82, sho: 50, pas: 74, dri: 71, def: 89, phy: 91, face: 'black-dreads' },
      { num: 3, name: 'T. Calder', role: 'LB', ovr: 84, pac: 87, sho: 65, pas: 83, dri: 82, def: 82, phy: 80, face: 'latino-slick' },
      { num: 6, name: 'A. Bell', role: 'CDM', ovr: 89, pac: 77, sho: 79, pas: 90, dri: 85, def: 88, phy: 88, face: 'black-buzz' },
      { num: 8, name: 'M. Renn', role: 'CM', ovr: 87, pac: 83, sho: 84, pas: 88, dri: 87, def: 75, phy: 80, face: 'caucasian-blonde' },
      { num: 10, name: 'Jin Okoro', role: 'CAM', ovr: 92, pac: 90, sho: 91, pas: 94, dri: 93, def: 62, phy: 78, face: 'asian-stylish', isCaptain: true },
      { num: 7, name: 'R. Sol', role: 'RW', ovr: 88, pac: 93, sho: 86, pas: 84, dri: 90, def: 52, phy: 73, face: 'latino-curly' },
      { num: 11, name: 'P. Kellan', role: 'LW', ovr: 87, pac: 92, sho: 85, pas: 83, dri: 89, def: 48, phy: 75, face: 'caucasian-brunette' },
      { num: 9, name: 'E. Wren', role: 'ST', ovr: 91, pac: 89, sho: 94, pas: 80, dri: 88, def: 42, phy: 87, face: 'black-afro' }
    ],
    subs: [
      { num: 12, name: 'H. Sato', role: 'GK', ovr: 82, pac: 75, sho: 50, pas: 70, dri: 72, def: 83, phy: 80 },
      { num: 14, name: 'D. Kellan', role: 'CB', ovr: 81, pac: 74, sho: 48, pas: 68, dri: 65, def: 82, phy: 85 },
      { num: 16, name: 'P. Rowe', role: 'CM', ovr: 83, pac: 80, sho: 78, pas: 84, dri: 81, def: 76, phy: 78 },
      { num: 18, name: 'I. Costa', role: 'ST', ovr: 84, pac: 86, sho: 84, pas: 75, dri: 83, def: 40, phy: 81 },
      { num: 21, name: 'A. Bakker', role: 'RB', ovr: 80, pac: 85, sho: 62, pas: 77, dri: 79, def: 78, phy: 77 },
      { num: 23, name: 'K. Tanaka', role: 'CAM', ovr: 82, pac: 84, sho: 79, pas: 85, dri: 84, def: 55, phy: 68 }
    ]
  },
  {
    id: 'northstar',
    name: 'Northstar Athletic',
    shortName: 'NOR',
    city: 'Northstar',
    league: 'Premier Global League',
    stars: 5,
    attackRating: 93,
    midfieldRating: 88,
    defenseRating: 89,
    overallRating: 91,
    primaryColor: '#111827',
    secondaryColor: '#f9fafb',
    accentColor: '#f59e0b',
    homeKit: {
      shirt: '#0f172a',
      shorts: '#0f172a',
      socks: '#f59e0b',
      numbers: '#f59e0b'
    },
    awayKit: {
      shirt: '#f8fafc',
      shorts: '#0f172a',
      socks: '#f8fafc',
      numbers: '#0f172a'
    },
    gkKit: {
      shirt: '#10b981',
      shorts: '#047857',
      socks: '#10b981',
      numbers: '#ffffff'
    },
    defaultFormation: '4-3-3',
    manager: 'Henrik Vane',
    roster: [
      { num: 1, name: 'R. Holtz', role: 'GK', ovr: 89, pac: 81, sho: 60, pas: 80, dri: 85, def: 91, phy: 88, face: 'caucasian-short' },
      { num: 2, name: 'B. Solis', role: 'RB', ovr: 86, pac: 91, sho: 66, pas: 81, dri: 84, def: 85, phy: 83, face: 'latino-buzz' },
      { num: 4, name: 'N. Arendt', role: 'CB', ovr: 89, pac: 80, sho: 55, pas: 81, dri: 74, def: 92, phy: 90, face: 'caucasian-tall' },
      { num: 5, name: 'O. Sadiq', role: 'CB', ovr: 87, pac: 83, sho: 52, pas: 75, dri: 72, def: 88, phy: 92, face: 'black-beard' },
      { num: 3, name: 'I. Petrov', role: 'LB', ovr: 85, pac: 88, sho: 70, pas: 83, dri: 82, def: 84, phy: 82, face: 'caucasian-buzz' },
      { num: 6, name: 'M. Keita', role: 'CDM', ovr: 90, pac: 82, sho: 80, pas: 89, dri: 86, def: 91, phy: 93, face: 'black-dreads', isCaptain: true },
      { num: 8, name: 'F. Laurent', role: 'CM', ovr: 87, pac: 81, sho: 83, pas: 89, dri: 87, def: 80, phy: 81, face: 'caucasian-curly' },
      { num: 10, name: 'C. Moreno', role: 'CAM', ovr: 89, pac: 87, sho: 88, pas: 92, dri: 91, def: 58, phy: 76, face: 'latino-fade' },
      { num: 7, name: 'D. Novak', role: 'RW', ovr: 88, pac: 94, sho: 85, pas: 82, dri: 89, def: 49, phy: 78, face: 'caucasian-sharp' },
      { num: 11, name: 'S. Lind', role: 'LW', ovr: 87, pac: 93, sho: 86, pas: 81, dri: 88, def: 46, phy: 79, face: 'nordic-blonde' },
      { num: 9, name: 'Torin Havel', role: 'ST', ovr: 93, pac: 96, sho: 95, pas: 82, dri: 90, def: 45, phy: 89, face: 'nordic-ponytail' }
    ],
    subs: [
      { num: 13, name: 'C. Mora', role: 'GK', ovr: 81, pac: 72, sho: 45, pas: 68, dri: 70, def: 82, phy: 80 },
      { num: 15, name: 'T. Holt', role: 'CB', ovr: 82, pac: 77, sho: 50, pas: 70, dri: 68, def: 83, phy: 87 },
      { num: 17, name: 'M. Ellis', role: 'CM', ovr: 83, pac: 82, sho: 79, pas: 83, dri: 83, def: 77, phy: 80 },
      { num: 19, name: 'B. Young', role: 'LW', ovr: 84, pac: 92, sho: 80, pas: 78, dri: 85, def: 44, phy: 72 },
      { num: 22, name: 'R. N\'Diaye', role: 'ST', ovr: 85, pac: 88, sho: 87, pas: 73, dri: 82, def: 41, phy: 88 }
    ]
  },
  {
    id: 'apex_madrid',
    name: 'Apex Madrid',
    shortName: 'APX',
    city: 'Madrid',
    league: 'European Super Trophy',
    stars: 5,
    attackRating: 94,
    midfieldRating: 91,
    defenseRating: 88,
    overallRating: 92,
    primaryColor: '#7209b7',
    secondaryColor: '#f72585',
    accentColor: '#ffd166',
    homeKit: {
      shirt: '#ffffff',
      shorts: '#ffffff',
      socks: '#ffffff',
      numbers: '#7209b7'
    },
    awayKit: {
      shirt: '#7209b7',
      shorts: '#3a0ca3',
      socks: '#f72585',
      numbers: '#ffd166'
    },
    gkKit: {
      shirt: '#06d6a0',
      shorts: '#048a66',
      socks: '#06d6a0',
      numbers: '#ffffff'
    },
    defaultFormation: '4-3-3',
    manager: 'Raul Calderon',
    roster: [
      { num: 1, name: 'T. Castano', role: 'GK', ovr: 91, pac: 83, sho: 60, pas: 82, dri: 86, def: 93, phy: 88, face: 'latino-tall' },
      { num: 2, name: 'D. Carvajal', role: 'RB', ovr: 86, pac: 86, sho: 69, pas: 83, dri: 84, def: 86, phy: 84, face: 'latino-beard' },
      { num: 4, name: 'M. Militao', role: 'CB', ovr: 89, pac: 85, sho: 58, pas: 77, dri: 79, def: 91, phy: 89, face: 'black-fade' },
      { num: 5, name: 'A. Ruden', role: 'CB', ovr: 88, pac: 84, sho: 62, pas: 76, dri: 75, def: 90, phy: 92, face: 'black-tall' },
      { num: 3, name: 'F. Mendy', role: 'LB', ovr: 85, pac: 91, sho: 64, pas: 78, dri: 82, def: 85, phy: 86, face: 'black-short' },
      { num: 6, name: 'Eduardo Tchou', role: 'CDM', ovr: 88, pac: 80, sho: 78, pas: 87, dri: 85, def: 89, phy: 90, face: 'black-dreads' },
      { num: 8, name: 'Fede V.', role: 'CM', ovr: 90, pac: 90, sho: 87, pas: 88, dri: 88, def: 84, phy: 91, face: 'latino-clean' },
      { num: 10, name: 'Luka Modric', role: 'CAM', ovr: 88, pac: 74, sho: 82, pas: 93, dri: 90, def: 72, phy: 70, face: 'caucasian-long' },
      { num: 7, name: 'Mateo Santos', role: 'RW', ovr: 94, pac: 95, sho: 90, pas: 89, dri: 96, def: 42, phy: 76, face: 'latino-flair', isCaptain: true },
      { num: 11, name: 'Vini Junior', role: 'LW', ovr: 93, pac: 97, sho: 89, pas: 86, dri: 95, def: 38, phy: 74, face: 'black-smile' },
      { num: 9, name: 'K. Benzema', role: 'ST', ovr: 91, pac: 86, sho: 93, pas: 86, dri: 89, def: 42, phy: 85, face: 'arab-beard' }
    ],
    subs: [
      { num: 12, name: 'A. Lunin', role: 'GK', ovr: 83, pac: 76, sho: 50, pas: 72, dri: 74, def: 84, phy: 80 },
      { num: 14, name: 'N. Paz', role: 'CAM', ovr: 81, pac: 83, sho: 79, pas: 84, dri: 83, def: 60, phy: 72 },
      { num: 16, name: 'B. Diaz', role: 'RW', ovr: 84, pac: 89, sho: 82, pas: 83, dri: 88, def: 45, phy: 70 },
      { num: 18, name: 'Endrick S.', role: 'ST', ovr: 85, pac: 93, sho: 86, pas: 74, dri: 86, def: 45, phy: 85 }
    ]
  },
  {
    id: 'bayern_vanguard',
    name: 'Bayern Vanguard',
    shortName: 'BAY',
    city: 'Munich',
    league: 'European Super Trophy',
    stars: 5,
    attackRating: 92,
    midfieldRating: 90,
    defenseRating: 89,
    overallRating: 91,
    primaryColor: '#dc2626',
    secondaryColor: '#ffffff',
    accentColor: '#1e3a8a',
    homeKit: {
      shirt: '#dc2626',
      shorts: '#dc2626',
      socks: '#dc2626',
      numbers: '#ffffff'
    },
    awayKit: {
      shirt: '#18181b',
      shorts: '#18181b',
      socks: '#dc2626',
      numbers: '#facc15'
    },
    gkKit: {
      shirt: '#0284c7',
      shorts: '#0369a1',
      socks: '#0284c7',
      numbers: '#ffffff'
    },
    defaultFormation: '4-2-3-1',
    manager: 'Vincent Komp',
    roster: [
      { num: 1, name: 'M. Neuer', role: 'GK', ovr: 90, pac: 79, sho: 65, pas: 86, dri: 82, def: 92, phy: 89, face: 'caucasian-tall' },
      { num: 2, name: 'S. Boey', role: 'RB', ovr: 83, pac: 90, sho: 64, pas: 78, dri: 81, def: 82, phy: 82, face: 'black-buzz' },
      { num: 4, name: 'D. Upamecano', role: 'CB', ovr: 87, pac: 86, sho: 50, pas: 78, dri: 75, def: 89, phy: 91, face: 'black-beard' },
      { num: 5, name: 'Min-jae Kim', role: 'CB', ovr: 88, pac: 83, sho: 52, pas: 77, dri: 73, def: 90, phy: 92, face: 'asian-clean' },
      { num: 3, name: 'A. Davies', role: 'LB', ovr: 87, pac: 96, sho: 72, pas: 82, dri: 86, def: 83, phy: 84, face: 'black-smile' },
      { num: 6, name: 'J. Kimmich', role: 'CDM', ovr: 90, pac: 75, sho: 78, pas: 92, dri: 86, def: 88, phy: 86, face: 'caucasian-short', isCaptain: true },
      { num: 8, name: 'Lukas Richter', role: 'CM', ovr: 90, pac: 82, sho: 85, pas: 91, dri: 84, def: 92, phy: 93, face: 'german-blonde' },
      { num: 10, name: 'Jamal Musiala', role: 'CAM', ovr: 91, pac: 89, sho: 85, pas: 89, dri: 95, def: 65, phy: 73, face: 'black-afro' },
      { num: 7, name: 'Leroy Sane', role: 'RW', ovr: 88, pac: 94, sho: 86, pas: 83, dri: 90, def: 44, phy: 76, face: 'mixed-tattoos' },
      { num: 11, name: 'K. Coman', role: 'LW', ovr: 87, pac: 93, sho: 81, pas: 82, dri: 89, def: 42, phy: 74, face: 'black-braids' },
      { num: 9, name: 'H. Kane', role: 'ST', ovr: 93, pac: 79, sho: 96, pas: 90, dri: 87, def: 52, phy: 86, face: 'caucasian-beard' }
    ],
    subs: [
      { num: 12, name: 'D. Peretz', role: 'GK', ovr: 80, pac: 70, sho: 45, pas: 65, dri: 68, def: 81, phy: 78 },
      { num: 15, name: 'E. Dier', role: 'CB', ovr: 82, pac: 68, sho: 60, pas: 75, dri: 68, def: 84, phy: 86 },
      { num: 17, name: 'K. Laimer', role: 'CM', ovr: 83, pac: 83, sho: 74, pas: 81, dri: 80, def: 84, phy: 87 },
      { num: 20, name: 'M. Tel', role: 'ST', ovr: 83, pac: 92, sho: 83, pas: 74, dri: 85, def: 38, phy: 78 }
    ]
  },
  {
    id: 'tokyo_dragons',
    name: 'Tokyo Dragons',
    shortName: 'TKY',
    city: 'Tokyo',
    league: 'Asian Champions Elite',
    stars: 4.5,
    attackRating: 88,
    midfieldRating: 90,
    defenseRating: 85,
    overallRating: 88,
    primaryColor: '#06d6a0',
    secondaryColor: '#0a0908',
    accentColor: '#f77f00',
    homeKit: {
      shirt: '#06d6a0',
      shorts: '#0a0908',
      socks: '#06d6a0',
      numbers: '#0a0908'
    },
    awayKit: {
      shirt: '#0a0908',
      shorts: '#0a0908',
      socks: '#f77f00',
      numbers: '#06d6a0'
    },
    gkKit: {
      shirt: '#8338ec',
      shorts: '#3a0ca3',
      socks: '#8338ec',
      numbers: '#ffffff'
    },
    defaultFormation: '4-3-3',
    manager: 'Kenji Sato',
    roster: [
      { num: 1, name: 'Z. Suzuki', role: 'GK', ovr: 85, pac: 82, sho: 55, pas: 76, dri: 79, def: 86, phy: 86, face: 'asian-fade' },
      { num: 2, name: 'T. Sugawara', role: 'RB', ovr: 83, pac: 88, sho: 67, pas: 80, dri: 82, def: 81, phy: 80, face: 'asian-clean' },
      { num: 4, name: 'K. Itakura', role: 'CB', ovr: 85, pac: 79, sho: 54, pas: 78, dri: 74, def: 87, phy: 86, face: 'asian-short' },
      { num: 5, name: 'T. Tomiyasu', role: 'CB', ovr: 87, pac: 82, sho: 56, pas: 81, dri: 76, def: 89, phy: 88, face: 'asian-tall' },
      { num: 3, name: 'H. Ito', role: 'LB', ovr: 84, pac: 85, sho: 62, pas: 79, dri: 79, def: 84, phy: 83, face: 'asian-clean' },
      { num: 6, name: 'W. Endo', role: 'CDM', ovr: 87, pac: 76, sho: 74, pas: 84, dri: 82, def: 89, phy: 90, face: 'asian-beard' },
      { num: 8, name: 'H. Morita', role: 'CM', ovr: 85, pac: 79, sho: 78, pas: 87, dri: 85, def: 82, phy: 84, face: 'asian-short' },
      { num: 10, name: 'Renji Takahashi', role: 'CAM', ovr: 90, pac: 91, sho: 86, pas: 94, dri: 94, def: 58, phy: 72, face: 'asian-stylish', isCaptain: true },
      { num: 7, name: 'T. Kubo', role: 'RW', ovr: 89, pac: 92, sho: 85, pas: 88, dri: 93, def: 48, phy: 70, face: 'asian-flair' },
      { num: 11, name: 'K. Mitoma', role: 'LW', ovr: 89, pac: 94, sho: 84, pas: 85, dri: 95, def: 54, phy: 74, face: 'asian-slick' },
      { num: 9, name: 'A. Ueda', role: 'ST', ovr: 85, pac: 87, sho: 87, pas: 75, dri: 82, def: 42, phy: 84, face: 'asian-fade' }
    ],
    subs: [
      { num: 12, name: 'K. Osako', role: 'GK', ovr: 79, pac: 72, sho: 40, pas: 66, dri: 68, def: 80, phy: 77 },
      { num: 14, name: 'A. Tanaka', role: 'CM', ovr: 82, pac: 80, sho: 77, pas: 84, dri: 82, def: 78, phy: 80 },
      { num: 16, name: 'R. Doan', role: 'RW', ovr: 84, pac: 88, sho: 82, pas: 83, dri: 86, def: 55, phy: 77 },
      { num: 18, name: 'T. Asano', role: 'ST', ovr: 83, pac: 94, sho: 80, pas: 70, dri: 81, def: 40, phy: 78 }
    ]
  },
  {
    id: 'rio_samba',
    name: 'Rio Samba FC',
    shortName: 'RIO',
    city: 'Rio de Janeiro',
    league: 'Copa Libertadores Stars',
    stars: 4.5,
    attackRating: 91,
    midfieldRating: 87,
    defenseRating: 84,
    overallRating: 88,
    primaryColor: '#ffb703',
    secondaryColor: '#0077b6',
    accentColor: '#2a9d8f',
    homeKit: {
      shirt: '#ffb703',
      shorts: '#0077b6',
      socks: '#ffffff',
      numbers: '#0077b6'
    },
    awayKit: {
      shirt: '#0077b6',
      shorts: '#ffffff',
      socks: '#ffb703',
      numbers: '#ffb703'
    },
    gkKit: {
      shirt: '#2a9d8f',
      shorts: '#264653',
      socks: '#2a9d8f',
      numbers: '#ffffff'
    },
    defaultFormation: '4-3-3',
    manager: 'Marcelo Brandao',
    roster: [
      { num: 1, name: 'Alisson B.', role: 'GK', ovr: 89, pac: 81, sho: 60, pas: 84, dri: 86, def: 90, phy: 87, face: 'latino-beard' },
      { num: 2, name: 'Yan Couto', role: 'RB', ovr: 83, pac: 91, sho: 67, pas: 80, dri: 85, def: 78, phy: 74, face: 'latino-fade' },
      { num: 4, name: 'Marquinhos', role: 'CB', ovr: 88, pac: 80, sho: 58, pas: 80, dri: 78, def: 90, phy: 86, face: 'latino-fade' },
      { num: 5, name: 'Gabriel M.', role: 'CB', ovr: 87, pac: 82, sho: 54, pas: 75, dri: 72, def: 89, phy: 90, face: 'black-beard' },
      { num: 3, name: 'C. Augusto', role: 'LB', ovr: 83, pac: 86, sho: 64, pas: 78, dri: 80, def: 83, phy: 83, face: 'latino-clean' },
      { num: 6, name: 'Casemiro', role: 'CDM', ovr: 88, pac: 72, sho: 78, pas: 82, dri: 79, def: 90, phy: 93, face: 'latino-heavy' },
      { num: 8, name: 'B. Guimaraes', role: 'CM', ovr: 87, pac: 80, sho: 81, pas: 88, dri: 87, def: 83, phy: 86, face: 'latino-clean' },
      { num: 10, name: 'Lucas Paqueta', role: 'CAM', ovr: 88, pac: 83, sho: 83, pas: 89, dri: 91, def: 72, phy: 82, face: 'latino-dance' },
      { num: 7, name: 'Rodrygo G.', role: 'RW', ovr: 89, pac: 93, sho: 86, pas: 85, dri: 92, def: 44, phy: 72, face: 'latino-smile' },
      { num: 11, name: 'Savinho M.', role: 'LW', ovr: 86, pac: 94, sho: 81, pas: 82, dri: 91, def: 40, phy: 70, face: 'black-fade' },
      { num: 9, name: 'Thiago Silvares', role: 'ST', ovr: 91, pac: 91, sho: 92, pas: 84, dri: 94, def: 46, phy: 83, face: 'latino-curls', isCaptain: true }
    ],
    subs: [
      { num: 12, name: 'Bento K.', role: 'GK', ovr: 82, pac: 75, sho: 45, pas: 70, dri: 74, def: 83, phy: 82 },
      { num: 14, name: 'Bremer G.', role: 'CB', ovr: 85, pac: 83, sho: 52, pas: 71, dri: 68, def: 88, phy: 90 },
      { num: 16, name: 'Joao Gomes', role: 'CDM', ovr: 83, pac: 81, sho: 72, pas: 80, dri: 81, def: 84, phy: 88 },
      { num: 18, name: 'Gabriel Jesus', role: 'ST', ovr: 85, pac: 87, sho: 84, pas: 80, dri: 88, def: 50, phy: 78 }
    ]
  }
];

export function getTeam(id) {
  return TEAMS.find(t => t.id === id) || TEAMS[0];
}

export function getStadium(id) {
  return STADIUMS.find(s => s.id === id) || STADIUMS[0];
}


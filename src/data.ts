import { Member, Session, Visitor, DriveFile } from './types';

export const initialMembers: Member[] = [
  {
    id: 'm1',
    firstName: 'Bruno',
    lastName: 'Gaudin',
    address: '12 Rue des Alizés, Saint-Pierre, La Réunion',
    phone: '0692 87 38 83',
    email: 'vm@loge.com',
    matricule: 'MM-4321',
    grade: 'Maitre',
    function: 'Vénérable Maître',
    motherLodge: 'Bénou Ré',
    sponsor: 'Grand Orient',
    loginId: 'vm@loge.com',
    password: 'password123',
    birthDate: '1974-05-15',
    initiationDate: '2010-06-20',
    entryDate: '2012-01-10',
    status: 'Actif',
    lodgeDues: 365,
    lodgeDuesPaid: true,
    orderDues: 50,
    orderDuesPaid: true,
    elevationDues: 0,
    elevationDuesPaid: true,
    isAdmin: true
  },
  {
    id: 'm2',
    firstName: 'Jean-Marc',
    lastName: 'Dupont',
    address: '45 Avenue de la Marine, Saint-Denis, La Réunion',
    phone: '0693 47 07 00',
    email: 'secretaire@loge.com',
    matricule: 'MM-5678',
    grade: 'Maitre',
    function: 'Secrétaire',
    motherLodge: 'Bénou Ré',
    sponsor: 'Bruno Gaudin',
    loginId: 'secretaire@loge.com',
    password: 'password123',
    birthDate: '1980-09-22',
    initiationDate: '2015-03-12',
    entryDate: '2015-05-01',
    status: 'Actif',
    lodgeDues: 365,
    lodgeDuesPaid: true,
    orderDues: 50,
    orderDuesPaid: false,
    elevationDues: 0,
    elevationDuesPaid: true
  },
  {
    id: 'm3',
    firstName: 'Marie',
    lastName: 'Robert',
    address: '8 Impasse des Hibiscus, Saint-Paul, La Réunion',
    phone: '0692 34 56 78',
    email: 'tresorier@loge.com',
    matricule: 'MM-9012',
    grade: 'Maitre',
    function: 'Trésorier',
    motherLodge: 'Bénou Ré',
    sponsor: 'Jean-Marc Dupont',
    loginId: 'tresorier@loge.com',
    password: 'password123',
    birthDate: '1985-11-04',
    initiationDate: '2018-10-15',
    entryDate: '2018-12-01',
    status: 'Actif',
    lodgeDues: 365,
    lodgeDuesPaid: true,
    orderDues: 50,
    orderDuesPaid: true,
    elevationDues: 0,
    elevationDuesPaid: true
  },
  {
    id: 'm4',
    firstName: 'Pierre',
    lastName: 'Payet',
    address: '77 Chemin du Cratère, Le Tampon, La Réunion',
    phone: '0692 98 76 54',
    email: 'membre@loge.com',
    matricule: 'MM-7788',
    grade: 'Apprenti',
    function: 'Aucun',
    motherLodge: 'Bénou Ré',
    sponsor: 'Marie Robert',
    loginId: 'membre@loge.com',
    password: 'password123',
    birthDate: '1992-02-18',
    initiationDate: '2025-01-10',
    entryDate: '2025-01-15',
    status: 'Actif',
    lodgeDues: 365,
    lodgeDuesPaid: false,
    orderDues: 50,
    orderDuesPaid: false,
    elevationDues: 750,
    elevationDuesPaid: false
  },
  {
    id: 'm5',
    firstName: 'Sophie',
    lastName: 'Morel',
    address: '104 Rue Léopold Rambaud, Sainte-Clotilde, La Réunion',
    phone: '0693 11 22 33',
    email: 'compagnon@loge.com',
    matricule: 'MM-3344',
    grade: 'Compagnon',
    function: 'Aucun',
    motherLodge: 'Bénou Ré',
    sponsor: 'Bruno Gaudin',
    loginId: 'compagnon@loge.com',
    password: 'password123',
    birthDate: '1988-07-30',
    initiationDate: '2021-04-05',
    entryDate: '2021-05-10',
    status: 'Actif',
    lodgeDues: 365,
    lodgeDuesPaid: true,
    orderDues: 50,
    orderDuesPaid: true,
    elevationDues: 0,
    elevationDuesPaid: true
  },
  {
    id: 'm6',
    firstName: 'Lucas',
    lastName: 'Grondin',
    address: '3 Avenue de la République, Saint-Louis, La Réunion',
    phone: '0692 55 66 77',
    email: 'maitre@loge.com',
    matricule: 'MM-2211',
    grade: 'Maitre',
    function: 'Expert',
    motherLodge: 'Bénou Ré',
    sponsor: 'Jean-Marc Dupont',
    loginId: 'maitre@loge.com',
    password: 'password123',
    birthDate: '1979-12-05',
    initiationDate: '2014-11-20',
    entryDate: '2015-01-05',
    status: 'Actif',
    lodgeDues: 365,
    lodgeDuesPaid: true,
    orderDues: 50,
    orderDuesPaid: true,
    elevationDues: 0,
    elevationDuesPaid: true
  }
];

export const initialVisitors: Visitor[] = [
  {
    id: 'v1',
    firstName: 'Alain',
    lastName: 'Lefevre',
    lodge: 'La Double Alliance',
    orient: 'Paris',
    obedience: 'Grand Orient de France',
    email: 'alain.lefevre@gmail.com'
  },
  {
    id: 'v2',
    firstName: 'Catherine',
    lastName: 'Giraud',
    lodge: 'Sous le Voile d\'Isis',
    orient: 'Saint-Denis',
    obedience: 'Grande Loge Féminine de Memphis-Misraïm',
    email: 'catherine.giraud@gmail.com'
  },
  {
    id: 'v3',
    firstName: 'Guillaume',
    lastName: 'Hoarau',
    lodge: 'Hermès',
    orient: 'Saint-Pierre',
    obedience: 'Grande Loge de France',
    email: 'guillaume.hoarau@orange.re'
  }
];

export const initialSessions: Session[] = [
  {
    id: 's1',
    date: '2026-07-25T16:30:00',
    degree: 'Apprenti',
    type: 'Ordinaire',
    title: 'Tenue Ordinaire du 25/07/2026 au degré d\'Apprenti',
    description: 'Travaux habituels au premier degré',
    location: 'Temple Thérèse Eliseman à Saint-Pierre',
    presentIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
    excusedIds: [],
    visitorIds: ['v1'],
    troncAmount: 42.50,
    signatures: {},
    closingTime: '18:30',
    agenda1: '16:30 Reprise des travaux au degré d\'Apprenti Rite Ancien et Primitif de Memphis-Misraïm',
    agenda2: 'Planche : Le symbolisme du Silence chez l\'Apprenti',
    agenda3: 'Circulation du tronc de la Veuve et du sac aux propositions',
    agenda4: '18:30 Suspension des travaux au degré d\'Apprenti Rite Ancien et Primitif de Memphis-Misraïm',
    hasAgape: true,
    agapeTime: '20:00',
    agapeType: 'Agape partage',
    agapePrice: 0
  },
  {
    id: 's2',
    date: '2026-08-08T16:30:00',
    degree: 'Compagnon',
    type: 'Instruction',
    title: 'Tenue d\'Instruction du 08/08/2026 au degré de Compagnon',
    description: 'Instruction au deuxième degré pour les Compagnons',
    location: 'Temple Thérèse Eliseman à Saint-Pierre',
    presentIds: ['m1', 'm2', 'm3', 'm5', 'm6'],
    excusedIds: ['m4'], // Apprenti exclu de cette tenue de Compagnon
    visitorIds: [],
    troncAmount: 0,
    signatures: {},
    closingTime: '18:30',
    agenda1: '16:30 Reprise des travaux au degré de Compagnon Rite Ancien et Primitif de Memphis-Misraïm',
    agenda2: 'Planche : L\'Étoile Flamboyante et la Géométrie Sacrée',
    agenda3: 'Les Cinq Voyages de l\'artisan et les outils',
    agenda4: '18:30 Suspension des travaux au degré de Compagnon Rite Ancien et Primitif de Memphis-Misraïm',
    hasAgape: true,
    agapeTime: '20:00',
    agapeType: 'Agape offerte',
    agapePrice: 0
  },
  {
    id: 's3',
    date: '2026-08-22T16:30:00',
    degree: 'Maitre',
    type: 'Solennelle',
    title: 'Tenue Solennelle du 22/08/2026 au degré de Maître',
    description: 'Célébration annuelle sous la voûte céleste',
    location: 'Temple Thérèse Eliseman à Saint-Pierre',
    presentIds: ['m1', 'm2', 'm3', 'm6'],
    excusedIds: ['m4', 'm5'], // Apprenti & Compagnon exclus
    visitorIds: ['v2'],
    troncAmount: 112.00,
    signatures: {},
    closingTime: '19:00',
    agenda1: '16:30 Reprise des travaux au degré de Maître Rite Ancien et Primitif de Memphis-Misraïm',
    agenda2: 'Le Mythe d\'Hiram et la transmission de la parole perdue',
    agenda3: 'Accueil solennel des dignitaires et circulation du sac',
    agenda4: '19:00 Suspension des travaux au degré de Maître Rite Ancien et Primitif de Memphis-Misraïm',
    hasAgape: true,
    agapeTime: '20:30',
    agapeType: 'Agape avec médaille',
    agapePrice: 25.00
  }
];

export const initialDriveFiles: DriveFile[] = [
  // --- ARCHITECTURES ---
  {
    id: 'df1',
    title: 'Le symbolisme du Silence chez l\'Apprenti',
    type: 'Architecture',
    grade: 'Apprenti',
    author: 'Pierre Payet',
    date: '2026-04-12',
    summary: 'Une réflexion profonde sur l\'importance du silence lors du travail en Loge, sa signification alchimique et l\'écoute active nécessaire à l\'intégration des premiers symboles du Rite de Memphis-Misraïm.',
    content: `Mes Frères, le silence imposé à l’Apprenti n’est pas une punition, mais une initiation. 

Dans l’Orient ancien et le Rite de Memphis-Misraïm, le silence est l'espace où la parole intérieure peut enfin germer. En s’abstenant de parler au sein du Temple, l'apprenti apprend à discipliner son esprit, à dompter son ego, et à écouter la résonance des symboles environnants. 

Le silence est apparenté à l’élément Terre, le Cabinet de Réflexion où tout commence. Sans silence, le tumulte extérieur empêche la contemplation du Delta Lumineux et des colonnes de la Sagesse, de la Force et de la Beauté. C'est dans le silence que s'opère la transmutation alchimique du plomb personnel en or spirituel.`
  },
  {
    id: 'df2',
    title: 'Le Cabinet de Réflexion et l\'Alchimie spirituelle',
    type: 'Architecture',
    grade: 'Apprenti',
    author: 'Bruno Gaudin',
    date: '2025-11-05',
    summary: 'Analyse du V.I.T.R.I.O.L. et des éléments symboliques présents dans le cabinet de réflexion avant l\'initiation.',
    content: `Visita Interiora Terrae Rectificando Invenies Occultum Lapidem. 

Le passage par le cabinet de réflexion constitue la mort symbolique du profane. Dans cette crypte obscure, entouré de sel, de soufre, d'un crâne et d'un sablier, le candidat fait face à lui-même. C'est l'étape de la Calcination dans l'œuvre alchimique. 

Chaque symbole incite à se détacher du monde des apparences et de l'illusion matérielle pour entamer la descente sacrée dans les profondeurs de sa propre conscience.`
  },
  {
    id: 'df3',
    title: 'L\'Étoile Flamboyante et la Quête du Compagnon',
    type: 'Architecture',
    grade: 'Compagnon',
    author: 'Sophie Morel',
    date: '2026-06-18',
    summary: 'Étude de l\'Étoile Flamboyante, du chiffre 5, de la lettre G et de la transition du travail passif à l\'action créatrice de l\'artisan.',
    content: `Devenu Compagnon, le maçon passe de l'obscurité silencieuse à la lumière de l'Étoile Flamboyante. 

L’Étoile à cinq branches, symbole de l’homme accompli et du microcosme, guide ses pas dans ses nouveaux voyages. Au centre rayonne la lettre G, évoquant la Géométrie, la Gnose, le Génie, la Gravitation et la Génération.

Le Compagnon n'est plus seulement spectateur; muni de la règle et du levier, du ciseau et du maillet, il travaille activement à dégager la pierre cubique pour qu'elle s'insère parfaitement dans l'édifice de la Loge.`
  },
  {
    id: 'df4',
    title: 'La Légende d\'Hiram et la Parole Perdue',
    type: 'Architecture',
    grade: 'Maitre',
    author: 'Lucas Grondin',
    date: '2026-05-30',
    summary: 'La mort dramatique de l\'architecte Hiram, le rôle des trois mauvais compagnons et la signification spirituelle des cinq points parfaits de la maîtrise.',
    content: `La maîtrise s'ouvre par un deuil : la mort d'Hiram Abif, le grand architecte du Temple de Salomon. 

Assassiné par trois compagnons impatients d'obtenir les secrets du grade suprême sans en avoir le mérite, Hiram emporte le mot sacré dans la tombe. 

C'est par les cinq points parfaits de la maîtrise que le nouveau Maître est relevé d'entre les morts, symbolisant la résurrection spirituelle et la perpétuation de la Tradition initiatique. La parole n'est pas perdue à jamais, elle est retrouvée en chacun de nous.`
  },

  // --- RITUELS ---
  {
    id: 'df5',
    title: 'Rituel complet d\'Ouverture et Clôture des Travaux',
    type: 'Rituels',
    grade: 'Apprenti',
    author: 'M. M. Officiel',
    date: '2024-01-01',
    summary: 'Texte sacré définissant l\'ouverture de la loge d\'Apprenti au Rite de Memphis-Misraïm, de l\'allumage des trois flambeaux à la chaîne d\'union finale.',
    content: `Le Vénérable Maître frappe un coup : "Frère Premier Surveillant, quel est le premier devoir d'un Surveillant en Loge ?"

Le 1er Surveillant : "Vénérable Maître, c'est de s'assurer que le Temple est couvert extérieurement."

S'ensuivent les invocations au Sublime Architecte des Mondes, l'allumage des lumières sacrées (Sagesse, Force, Beauté) et la proclamation : "Le Temple est ouvert, il est l'heure où les maçons reprennent leurs travaux !"`
  },
  {
    id: 'df6',
    title: 'Cérémonie d\'Initiation au 1er Degré',
    type: 'Rituels',
    grade: 'Apprenti',
    author: 'M. M. Officiel',
    date: '2024-01-01',
    summary: 'Protocole complet pour la réception d\'un profane : les voyages à travers les éléments, l\'épreuve de la coupe d\'amertume, la prestation de serment et la remise des gants.',
    content: `Le récipiendaire, privé de ses métaux, les yeux bandés, frappe à la porte du Temple en profane...

S'ensuivent les trois voyages rituels :
1. Le voyage de l'Air (bruits, vent).
2. Le voyage de l'Eau (purification).
3. Le voyage du Feu (le passage à travers les flammes).

Après le serment solennel sur le Livre de la Loi et l'Équerre, la lumière lui est révélée.`
  },
  {
    id: 'df7',
    title: 'Cérémonie de Passage au grade de Compagnon',
    type: 'Rituels',
    grade: 'Compagnon',
    author: 'M. M. Officiel',
    date: '2024-06-15',
    summary: 'Le rituel de passage au 2ème degré : les cinq voyages mystérieux avec les différents outils et la contemplation du cartel flamboyant.',
    content: `Le compagnonnage exige de se mettre en marche. Durant ce rituel, l'Apprenti effectue cinq voyages :
1er Voyage : Le maillet et le ciseau (le travail de la pierre).
2ème Voyage : La règle et le compas (la mesure et la proportion).
3ème Voyage : Le levier (la démultiplication des forces).
4ème Voyage : L'équerre (le contrôle de la droiture).
5ème Voyage : Les mains libres (la contemplation libre de l'art).`
  },
  {
    id: 'df8',
    title: 'Cérémonie d\'Élévation à la Maîtrise',
    type: 'Rituels',
    grade: 'Maitre',
    author: 'M. M. Officiel',
    date: '2024-09-20',
    summary: 'Le drame sacré d\'Hiram : l\'entrée dans la Chambre du Milieu drapée de noir, l\'affrontement symbolique avec les mauvais compagnons, et le relèvement.',
    content: `La Loge est tendue de noir, éclairée par neuf lumières. Le Temple est devenu la Chambre du Milieu. 

Le récipiendaire représente Hiram. Il subit les trois coups rituels assénés par les Surveillants et l'Orateur représentant l'Ignorance, l'Hypocrisie et l'Ambition. Couché dans le cercueil sous la branche d'acacia, il attend que le Vénérable Maître vienne le relever par les cinq points parfaits.`
  },

  // --- INSTRUCTIONS ---
  {
    id: 'df9',
    title: 'Cahier d\'Instruction de l\'Apprenti',
    type: 'Instructions',
    grade: 'Apprenti',
    author: 'Collège des Officiers',
    date: '2025-01-15',
    summary: 'Le tuilage et le catéchisme d\'instruction indispensable pour l\'Apprenti : les questions-réponses rituelles sur l\'âge, la lumière, et le travail sur la pierre brute.',
    content: `Q : Êtes-vous franc-maçon ?
R : Mes Frères me reconnaissent pour tel.

Q : D'où venez-vous ?
R : De la Loge de Saint-Jean.

Q : Qu'êtes-vous venu faire ici ?
R : Vaincre mes passions, soumettre ma volonté, et faire de nouveaux progrès dans la maçonnerie.

Q : Quel est l'âge d'un Apprenti ?
R : Trois ans.`
  },
  {
    id: 'df10',
    title: 'Le rôle de l\'Orateur et de la Loi Maçonnique',
    type: 'Instructions',
    grade: 'Officiers',
    author: 'Bruno Gaudin',
    date: '2025-03-10',
    summary: 'Analyse approfondie de la fonction d\'Orateur, gardien de la Constitution, des Règlements Généraux et porte-parole de la conscience de la Loge.',
    content: `L'Orateur est placé à l'Orient, au Nord. Il représente la Loi et la Sagesse de la Loge. 

Sa mission est double : s'assurer que tous les travaux rituels et administratifs respectent scrupuleusement la Constitution de l'Ordre, et prononcer les morceaux d'architecture d'accueil (planches de bienvenue) ou synthétiser les débats avant les votes de la Loge.`
  }
];

export function getStoredData<T>(key: string, initial: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading localStorage key ' + key, e);
  }
  return initial;
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage key ' + key, e);
  }
}

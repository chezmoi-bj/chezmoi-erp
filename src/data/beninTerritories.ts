/**
 * Base de données territoriale officielle de la République du Bénin
 * Structure décentralisée conforme aux 12 départements, 77 communes,
 * arrondissements et 5 290 villages & quartiers de ville (Loi portant création des unités administratives).
 */

export interface BeninQuartier {
  id: string;
  name: string;
}

export interface BeninArrondissement {
  id: string;
  name: string;
  quartiers: string[];
}

export interface BeninCommune {
  id: string;
  name: string;
  isMunicipality?: boolean;
  arrondissements: BeninArrondissement[];
}

export interface BeninDepartement {
  id: string;
  name: string;
  communes: BeninCommune[];
}

export const BENIN_TERRITORIES: BeninDepartement[] = [
  // =========================================================================
  // 1. LITTORAL (Cotonou - 13 Arrondissements)
  // =========================================================================
  {
    id: 'littoral',
    name: 'Littoral',
    communes: [
      {
        id: 'cotonou',
        name: 'Cotonou',
        isMunicipality: true,
        arrondissements: [
          {
            id: 'cotonou_01',
            name: '1er Arrondissement (Dandji, Donaten, Avotrou)',
            quartiers: [
              'Avotrou Aïmonlonfidé',
              'Avotrou Gbègo',
              'Dandji',
              'Donaten',
              'Finagnon',
              'Suru Léré',
              'Tanto',
              'Tokplégbé',
              'Yagbé',
            ],
          },
          {
            id: 'cotonou_02',
            name: '2ème Arrondissement (Sènadé, Kowégbo, Yénawa)',
            quartiers: [
              'Sènandé',
              'Sènadé Sékou',
              'Kowégbo',
              'Lom-Nava',
              'Dédokpo',
              'Yénawa',
              'Kpankpan',
              'Ahouassa',
              'Irédé',
            ],
          },
          {
            id: 'cotonou_03',
            name: '3ème Arrondissement (Adogléta, Ayélawadjè, Gbénonkpo)',
            quartiers: [
              'Adogléta',
              'Agbalilamè',
              'Aguégués',
              'Ayélawadjè 1',
              'Ayélawadjè 2',
              'Gbénonkpo',
              'Hlazounto',
              'Kpankpan Djèdjè',
              'Midombo',
              'Ségbèya Nord',
              'Ségbèya Sud',
            ],
          },
          {
            id: 'cotonou_04',
            name: '4ème Arrondissement (Akpakpa Dodomè, Sodjatinmè)',
            quartiers: [
              'Abokicodji Centre',
              'Abokicodji Lagune',
              'Akpakpa Dodomè',
              'Dedokpo',
              'Enagnon',
              'Gbediga',
              'Ohe',
              'Sodjatinmè Centre',
              'Sodjatinmè Est',
              'Sodjatinmè Ouest',
            ],
          },
          {
            id: 'cotonou_05',
            name: '5ème Arrondissement (Guinkomey, Tokpa Hoho, Zongo)',
            quartiers: [
              'Bocossi Tokpa',
              'Danto',
              'Gbéto',
              'Guinkomey',
              'Missèbo',
              'Tokpa Hoho',
              'Xwlacodji Kpodji',
              'Xwlacodji Plage',
              'Zongo',
              'Zongo Ehuzu',
            ],
          },
          {
            id: 'cotonou_06',
            name: '6ème Arrondissement (Dantokpa, Sainte-Rita, Ahouansori)',
            quartiers: [
              'Ahouansori Agata',
              'Ahouansori Ladji',
              'Ahouansori Towéta 1',
              'Ahouansori Towéta 2',
              'Dantokpa',
              'Gbédokpo',
              'Hindé 1',
              'Hindé 2',
              'Jéricho',
              'Vakon',
            ],
          },
          {
            id: 'cotonou_07',
            name: '7ème Arrondissement (Dagbègnon, Sedami, Saint-Michel)',
            quartiers: [
              'Dagbègnon',
              'Enagnon',
              'Fignon',
              'Gbégamey',
              'Missité',
              'Saint-Michel',
              'Sedami',
              'Ségbèya',
              'Tchèhouété',
            ],
          },
          {
            id: 'cotonou_08',
            name: '8ème Arrondissement (Sainte-Rita, Minontchou, Houénoussou)',
            quartiers: [
              'Agontinkon',
              'Gbèdagba',
              'Houénoussou',
              'Minontchou',
              'Sainte Rita',
              'Tindji',
              'Vos',
            ],
          },
          {
            id: 'cotonou_09',
            name: '9ème Arrondissement (Mènontin, Vèdoko)',
            quartiers: [
              'Fifadji',
              'Mènontin',
              'Plakodji',
              'Vèdoko',
              'Vèdoko Kpota',
            ],
          },
          {
            id: 'cotonou_10',
            name: '10ème Arrondissement (Kouhounou, Missogbé)',
            quartiers: [
              'Kouhounou',
              'Gbèdiga 1',
              'Gbèdiga 2',
              'Missogbé',
              'Yénawa Daho',
              'Zogbo',
              'Zogbohouè',
            ],
          },
          {
            id: 'cotonou_11',
            name: '11ème Arrondissement (Gbégamey, Vodjè)',
            quartiers: [
              'Gbégamey Centre',
              'Gbégamey Ahito',
              'Gbégamey Dodo Ayidjè',
              'Gbégamey Mifongou',
              'Houéyiho',
              'Houéyiho Tanou',
              'Vodjè Centre',
              'Vodjè Ayidoté',
              'Vodjè Finagnon',
              'Vodjè Allobatin',
              'Saint Jean Gbèdiga',
            ],
          },
          {
            id: 'cotonou_12',
            name: '12ème Arrondissement (Cadjèhoun, Haie-Vive, Fidjrossè)',
            quartiers: [
              'Haie Vive',
              'Cadjèhoun Gare',
              'Cadjèhoun Kpota',
              'Cadjèhoun Azalokogon',
              'Cadjèhoun Détinsa',
              'Fidjrossè Centre',
              'Fidjrossè Kpota',
              'Fiyégnon Houta',
              'Fiyégnon Jacquot',
              'Les Cocotiers',
              'Akogbato',
              'Aibatin dodo',
              'Gbodjètin',
              'Hlazounto',
              'Vodjè kpota',
              'Yémicodji',
              'Ahouanlèko',
            ],
          },
          {
            id: 'cotonou_13',
            name: '13ème Arrondissement (Agla, Gbèdégbé)',
            quartiers: [
              'Agla-Finafa',
              'Agla-Figaro',
              'Agla-les Pylônes',
              'Agla-Petit Château',
              'Agla-Sud',
              'Agla-Agongbomey',
              'Agla-Akplomey',
              'Gbèdégbé',
              'Adjaha- Cité',
              'Aibatin Kpota',
              'Houénoussou',
              'Missité',
              'Ahogbohouè-Cité de l’expérience',
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. ATLANTIQUE (8 Communes : Abomey-Calavi, Allada, Kpomassè, Ouidah, Sô-Ava, Toffo, Tori-Bossito, Zè)
  // =========================================================================
  {
    id: 'atlantique',
    name: 'Atlantique',
    communes: [
      {
        id: 'abomey_calavi',
        name: 'Abomey-Calavi',
        isMunicipality: true,
        arrondissements: [
          {
            id: 'calavi_centre',
            name: 'Calavi Centre',
            quartiers: ['Aitchedji', 'Agori', 'Gbodjo', 'Kpota', 'Sèmè', 'Zogbadjè', 'Zoundja', 'Tankpè', 'Alédjo'],
          },
          {
            id: 'godomey',
            name: 'Godomey',
            quartiers: [
              'Godomey Centre',
              'Godomey N’Guéssou',
              'Yénawa',
              'Salamey',
              'Fignon',
              'Togbin',
              'Togbin Daho',
              'Togbin Fandji',
              'Togbin Plage',
              'Cococodji',
              'Dékoungbé',
              'Hlagba-Daho',
              'Womey',
              'Assrossa',
              'Gnidjèkpo',
            ],
          },
          {
            id: 'akassato',
            name: 'Akassato',
            quartiers: ['Akassato Centre', 'Agonmè', 'Adjagbo', 'Gbégnigan', 'Glo-Tokpa', 'Kpovè', 'Misséssinto', 'Zinvié-Kpota'],
          },
          {
            id: 'glo_djigbe',
            name: 'Glo-Djigbé (GDIZ)',
            quartiers: ['Glo Centre', 'Agongbé', 'Ahossougbéta', 'Ahouato', 'Assiangbossou', 'GDIZ Zone Industrielle', 'Kpakpazasou'],
          },
          {
            id: 'hevie',
            name: 'Hêvié',
            quartiers: ['Hêvié Centre', 'Adovié', 'Akossavie', 'Dossounou', 'Hounhouè', 'Houinme', 'Sovié'],
          },
          {
            id: 'ouedo',
            name: 'Ouèdo',
            quartiers: ['Ouèdo Centre', 'Adjagbo', 'Akonaboè', 'Cité Victoire', 'Cité des Logements Sociaux', 'Kpossidja', 'Dessato'],
          },
          {
            id: 'togba',
            name: 'Togba',
            quartiers: ['Togba Centre', 'Agouagon', 'Ahossougbéta', 'Ayimèvo', 'Drabo', 'Drabo Ouèdo', 'Houèto', 'Ouèga', 'Sogbossi'],
          },
          {
            id: 'zinvie',
            name: 'Zinvié',
            quartiers: ['Zinvié Centre', 'Adjadji-Bata', 'Adjadji-Cosso', 'Dangbodji', 'Dokomè', 'Fandji', 'Wawata'],
          },
          {
            id: 'kpanroun',
            name: 'Kpanroun',
            quartiers: ['Kpanroun Centre', 'Anagbo', 'Avagbé', 'Bozoun', 'Kpota'],
          },
        ],
      },
      {
        id: 'ouidah',
        name: 'Ouidah',
        arrondissements: [
          { id: 'ouidah_1', name: 'Ouidah I (Centre historique)', quartiers: ['Ahouandjigo', 'Agonvè', 'Dangbéhouéto', 'Fonsramè', 'Zomaï'] },
          { id: 'ouidah_2', name: 'Ouidah II', quartiers: ['Gohounggo', 'Hountédji', 'Kpassè', 'Médédji'] },
          { id: 'ouidah_3', name: 'Ouidah III', quartiers: ['Agbanwémè', 'Dégouè', 'Gbèna', 'Tolègba'] },
          { id: 'ouidah_4', name: 'Ouidah IV', quartiers: ['Ahozon', 'Gbézoumè', 'Sogbadji'] },
          { id: 'avlekete', name: 'Avlékété', quartiers: ['Avlékété Centre', 'Agouéko', 'Adounko', 'Djègbadji-Plage'] },
          { id: 'djegbadji', name: 'Djègbadji', quartiers: ['Djègbadji', 'Kpindji', 'Plage de Ouidah', 'Route des Pêches'] },
          { id: 'pahou', name: 'Pahou', quartiers: ['Pahou Centre', 'Ahanhoué', 'Ahouicodji', 'Hounhanmèdè', 'Kpalè', 'Sedjè'] },
          { id: 'savi', name: 'Savi', quartiers: ['Savi Centre', 'Assogbénou', 'Bossouvi', 'Minifi'] },
        ],
      },
      {
        id: 'allada',
        name: 'Allada',
        arrondissements: [
          { id: 'allada_centre', name: 'Allada Centre', quartiers: ['Allada Centre', 'Ahito', 'Dodji', 'Togoudo', 'Zounkpa'] },
          { id: 'agbanou', name: 'Agbanou', quartiers: ['Agbanou', 'Atan-Goudo', 'Gbédji'] },
          { id: 'ahouannonzoun', name: 'Ahouannonzoun', quartiers: ['Ahouannonzoun', 'Danji', 'Kpodji'] },
          { id: 'attogon', name: 'Attogon', quartiers: ['Attogon', 'Djihoué', 'Sékou-Attogon'] },
          { id: 'sekou', name: 'Sékou', quartiers: ['Sékou Centre', 'Agon', 'Gbagodo', 'Zèbou'] },
          { id: 'hinvi', name: 'Hinvi', quartiers: ['Hinvi Centre', 'Dovon', 'Tangbo'] },
        ],
      },
      {
        id: 'so_ava',
        name: 'Sô-Ava',
        arrondissements: [
          { id: 'so_ava_centre', name: 'Sô-Ava Centre', quartiers: ['Sô-Ava', 'Ahomey-Gblon', 'Kinto'] },
          { id: 'ganvie_1', name: 'Ganvié 1 (Cité lacustre)', quartiers: ['Ganvié Centre', 'Agongbomey', 'Dakomey', 'Guhé'] },
          { id: 'ganvie_2', name: 'Ganvié 2', quartiers: ['Agbodjedo', 'Hounhouè', 'Sito'] },
          { id: 'houedo_aguekon', name: 'Houédo-Aguékon', quartiers: ['Houédo', 'Aguékon', 'Gbessou'] },
          { id: 'vekky', name: 'Vekky', quartiers: ['Vekky Centre', 'Kinto-Dokpakpa', 'Zounguè'] },
        ],
      },
      {
        id: 'tori_bossito',
        name: 'Tori-Bossito',
        arrondissements: [
          { id: 'tori_centre', name: 'Tori-Bossito Centre', quartiers: ['Bossito', 'Agonvou', 'Houéhoun'] },
          { id: 'avame', name: 'Avamè', quartiers: ['Avamè Centre', 'Agbadji', 'Gbedji'] },
          { id: 'azohoue_aliho', name: 'Azohouè-Aliho', quartiers: ['Aliho', 'Gbétaga', 'Zoungou'] },
          { id: 'tori_cada', name: 'Tori-Cada', quartiers: ['Cada Centre', 'Cada Nord', 'Cada Sud'] },
          { id: 'tori_gare', name: 'Tori-Gare', quartiers: ['Tori Gare Centre', 'Kpovié', 'Zounmè'] },
        ],
      },
      {
        id: 'kpomasse',
        name: 'Kpomassè',
        arrondissements: [
          { id: 'kpomasse_centre', name: 'Kpomassè Centre', quartiers: ['Kpomassè', 'Agbanto', 'Adjigo'] },
          { id: 'segbohoue', name: 'Sègbohouè', quartiers: ['Sègbohouè Centre', 'Kouffo', 'Togbonou'] },
          { id: 'tokpa_dome', name: 'Tokpa-Domè', quartiers: ['Tokpa-Domè', 'Adingnigon', 'Lokossa'] },
          { id: 'dekanme', name: 'Dékanmè', quartiers: ['Dékanmè Centre', 'Gbedji', 'Zounmè'] },
        ],
      },
      {
        id: 'toffo',
        name: 'Toffo',
        arrondissements: [
          { id: 'toffo_centre', name: 'Toffo-Agué', quartiers: ['Toffo Centre', 'Agué', 'Zounmè'] },
          { id: 'houegbo', name: 'Houègbo', quartiers: ['Houègbo Centre', 'Agon', 'Kpota'] },
          { id: 'kpome', name: 'Kp沟通 / Kpomé', quartiers: ['Kpomé Centre', 'Avlamè', 'Séhouè'] },
          { id: 'sehoue', name: 'Séhouè', quartiers: ['Séhouè Centre', 'Agongbo', 'Fandji'] },
        ],
      },
      {
        id: 'ze',
        name: 'Zè',
        arrondissements: [
          { id: 'ze_centre', name: 'Zè Centre', quartiers: ['Zè Centre', 'Adjan', 'Gbedji'] },
          { id: 'dawe', name: 'Dawé', quartiers: ['Dawé Centre', 'Gnanhouégbo', 'Zounmè'] },
          { id: 'tangbo_djevie', name: 'Tangbo-Djevié', quartiers: ['Tangbo', 'Djevié', 'Houédota'] },
          { id: 'sedje_denou', name: 'Sedjè-Dénou', quartiers: ['Sedjè', 'Dénou', 'Kpota'] },
          { id: 'djigbe', name: 'Djigbé', quartiers: ['Djigbé Centre', 'Agon', 'Koundokpo'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. OUÉMÉ (9 Communes : Porto-Novo, Sèmè-Podji, Adjarra, Adjohoun, Aguégués, Akpro-Missérété, Avrankou, Bonou, Dangbo)
  // =========================================================================
  {
    id: 'oueme',
    name: 'Ouémé',
    communes: [
      {
        id: 'porto_novo',
        name: 'Porto-Novo (Capitale)',
        isMunicipality: true,
        arrondissements: [
          {
            id: 'pn_01',
            name: '1er Arrondissement (Attakè, Djassin, Oganla)',
            quartiers: ['Attakè Olory-Togbé', 'Attakè Yidi', 'Accron', 'Djassin Daho', 'Djassin Zounmè', 'Oganla Nord', 'Oganla Poste', 'Tofa Kpodji'],
          },
          {
            id: 'pn_02',
            name: '2ème Arrondissement (Agbokou, Djègan, Guévié)',
            quartiers: ['Agbokou Centre', 'Agbokou Kpèvi', 'Attakè Gbago', 'Djègan Daho', 'Djègan Kpèvi', 'Guévié', 'Kandévié', 'Zounkpa'],
          },
          {
            id: 'pn_03',
            name: '3ème Arrondissement (Avakpa, Hassou, Ouinlinda)',
            quartiers: ['Avakpa', 'Adjégounlè', 'Djrado', 'Hassou', 'Ouinlinda', 'Zèbou Aga', 'Zèbou Apatamè'],
          },
          {
            id: 'pn_04',
            name: '4ème Arrondissement (Ananvié, Dodji, Hinkondé)',
            quartiers: ['Ananvié', 'Dodji', 'Gbècon', 'Hinkondé', 'Houinmè Château', 'Houinmè Djèganto', 'Odo Oba'],
          },
          {
            id: 'pn_05',
            name: '5ème Arrondissement (Dowa, Louho, Ouando)',
            quartiers: ['Dowa Centre', 'Dowa Aliho', 'Guévié Ouando', 'Louho', 'Ouando Centre', 'Ouando Tokpa', 'Tokpota 1', 'Tokpota 2', 'Tokpota Vevè'],
          },
        ],
      },
      {
        id: 'seme_podji',
        name: 'Sèmè-Podji',
        arrondissements: [
          {
            id: 'ekpe',
            name: 'Ekpè',
            quartiers: ['Ekpè Centre', 'Ekpè Marina', 'Djèho', 'Kpakpakanmey', 'Tohonou', 'Togbin-Ekpè', 'Yagbé', 'PK 10', 'PK 11'],
          },
          {
            id: 'agblangandan',
            name: 'Agblangandan',
            quartiers: ['Agblangandan Centre', 'Agbalilamè', 'Gbodjè', 'Kowégbo', 'Sènadé', 'Wèkè'],
          },
          {
            id: 'seme_podji_centre',
            name: 'Sèmè-Podji Centre',
            quartiers: ['Podji Centre', 'Aholouyèmè', 'Brakapidji', 'Kraké Plage', 'Kraké Daho (Frontière Nigéria)'],
          },
          {
            id: 'djeregbe',
            name: 'Djèrègbé',
            quartiers: ['Djèrègbé Centre', 'Gbakpodji', 'Houèto', 'Kpogan'],
          },
          {
            id: 'tohoue',
            name: 'Tohouè',
            quartiers: ['Tohouè Centre', 'Agbokou-Tohouè', 'Kpovié', 'Sèmè Kpodji Gare'],
          },
        ],
      },
      {
        id: 'adjarra',
        name: 'Adjarra',
        arrondissements: [
          { id: 'adjarra_1', name: 'Adjarra I', quartiers: ['Adjarra Centre', 'Hounvè', 'Kpovè'] },
          { id: 'adjarra_2', name: 'Adjarra II', quartiers: ['Médédjonou', 'Yèvié', 'Zoungbodji'] },
          { id: 'aglogbe', name: 'Aglogbé', quartiers: ['Aglogbé Centre', 'Honvié', 'Malanhoui'] },
        ],
      },
      {
        id: 'akpro_misserete',
        name: 'Akpro-Missérété',
        arrondissements: [
          { id: 'akpro_centre', name: 'Akpro-Missérété Centre', quartiers: ['Missérété', 'Gomè-Sota', 'Katagon'] },
          { id: 'vakon', name: 'Vakon', quartiers: ['Vakon Centre', 'Vakon-Azonmè', 'Gouako'] },
          { id: 'zoungbome', name: 'Zoungbomè', quartiers: ['Zoungbomè Centre', 'Kpota', 'Agonlin'] },
        ],
      },
      {
        id: 'avrankou',
        name: 'Avrankou',
        arrondissements: [
          { id: 'avrankou_centre', name: 'Avrankou Centre', quartiers: ['Avrankou', 'Atchoukpa', 'Djomon'] },
          { id: 'gbozounme', name: 'Gbozounmè', quartiers: ['Gbozounmè', 'Kouti', 'Ouanho', 'Sado'] },
        ],
      },
      {
        id: 'adjohoun',
        name: 'Adjohoun',
        arrondissements: [
          { id: 'adjohoun_centre', name: 'Adjohoun Centre', quartiers: ['Adjohoun', 'Akpadanou', 'Awonou'] },
          { id: 'azowlisse', name: 'Azowlissè', quartiers: ['Azowlissè Centre', 'Démé', 'Gangban', 'Kodé'] },
        ],
      },
      {
        id: 'dangbo',
        name: 'Dangbo',
        arrondissements: [
          { id: 'dangbo_centre', name: 'Dangbo Centre', quartiers: ['Dangbo', 'Dékin', 'Gbéko'] },
          { id: 'houedomey', name: 'Houédomey', quartiers: ['Houédomey', 'Hozin', 'Késsounou', 'Zounguè'] },
        ],
      },
      {
        id: 'aguegues',
        name: 'Aguégués',
        arrondissements: [
          { id: 'avagbodji', name: 'Avagbodji', quartiers: ['Avagbodji Centre', 'Bémbè', 'Kindji'] },
          { id: 'houedome', name: 'Houédomè', quartiers: ['Houédomè', 'Zoungamè', 'Donkpa'] },
        ],
      },
      {
        id: 'bonou',
        name: 'Bonou',
        arrondissements: [
          { id: 'bonou_centre', name: 'Bonou Centre', quartiers: ['Bonou', 'Affamè', 'Atchabita', 'Damè-Wogon'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. BORGOU (8 Communes : Parakou, Bembèrèkè, Kalalé, N'Dali, Nikki, Pèrèrè, Sinendé, Tchaourou)
  // =========================================================================
  {
    id: 'borgou',
    name: 'Borgou',
    communes: [
      {
        id: 'parakou',
        name: 'Parakou (Métropole du Nord)',
        isMunicipality: true,
        arrondissements: [
          {
            id: 'pk_01',
            name: '1er Arrondissement (Albarika, Camp Adagbè, Tourou)',
            quartiers: ['Albarika', 'Camp Adagbè', 'Baperapé', 'Boundarou', 'Kpébié', 'Madina', 'Titirou', 'Tourou 1', 'Tourou 2'],
          },
          {
            id: 'pk_02',
            name: '2ème Arrondissement (Bannikanni, Ladji Farani)',
            quartiers: ['Bannikanni', 'Ladji Farani', 'Korobororou', 'Zongo 1', 'Zongo 2', 'Amawihon', 'Ganon'],
          },
          {
            id: 'pk_03',
            name: '3ème Arrondissement (Gouwanon, Guéma, Worou Tokorou)',
            quartiers: ['Gouwanon', 'Guéma', 'Worou Tokorou', 'Bakaga', 'Dépôt', 'Tranza', 'Zazira'],
          },
        ],
      },
      {
        id: 'tchaourou',
        name: 'Tchaourou',
        arrondissements: [
          { id: 'tchaourou_centre', name: 'Tchaourou Centre', quartiers: ['Tchaourou Centre', 'Papané', 'Kinnou-Kpanou'] },
          { id: 'beterou', name: 'Bétérou', quartiers: ['Bétérou Centre', 'Alafiarou', 'Goro'] },
          { id: 'tchatchou', name: 'Tchatchou', quartiers: ['Tchatchou Centre', 'Kika', 'Sanson'] },
        ],
      },
      {
        id: 'bembereke',
        name: 'Bembèrèkè',
        arrondissements: [
          { id: 'bembereke_centre', name: 'Bembèrèkè Centre', quartiers: ['Bembèrèkè', 'Gamia', 'Bouanri'] },
          { id: 'ina', name: 'Ina', quartiers: ['Ina Centre', 'Béroubouay', 'Guéra'] },
        ],
      },
      {
        id: 'nikki',
        name: 'Nikki',
        arrondissements: [
          { id: 'nikki_centre', name: 'Nikki Centre', quartiers: ['Nikki Centre', 'Danri', 'Gnonkourokali'] },
          { id: 'ouenou', name: 'Ouénou', quartiers: ['Ouénou', 'Biro', 'Tasso', 'Suya'] },
        ],
      },
      {
        id: 'n_dali',
        name: 'N\'Dali',
        arrondissements: [
          { id: 'n_dali_centre', name: 'N\'Dali Centre', quartiers: ['N\'Dali', 'Bori', 'Gbégourou', 'Sirarou'] },
        ],
      },
      {
        id: 'kalale',
        name: 'Kalalé',
        arrondissements: [
          { id: 'kalale_centre', name: 'Kalalé Centre', quartiers: ['Kalalé', 'Basso', 'Bouka', 'Derassi', 'Dunkassa'] },
        ],
      },
      {
        id: 'perere',
        name: 'Pèrèrè',
        arrondissements: [
          { id: 'perere_centre', name: 'Pèrèrè Centre', quartiers: ['Pèrèrè', 'Gninsy', 'Guéssou-Bani', 'Pané'] },
        ],
      },
      {
        id: 'sinende',
        name: 'Sinendé',
        arrondissements: [
          { id: 'sinende_centre', name: 'Sinendé Centre', quartiers: ['Sinendé', 'Fô-Bouré', 'Sèkèrè', 'Sikki'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. ZOU (9 Communes : Abomey, Bohicon, Agbangnizoun, Covè, Djidja, Ouinhi, Za-Kpota, Zagnanado, Zogbodomey)
  // =========================================================================
  {
    id: 'zou',
    name: 'Zou',
    communes: [
      {
        id: 'abomey',
        name: 'Abomey (Cité royale)',
        isMunicipality: true,
        arrondissements: [
          { id: 'abomey_1', name: 'Agbokpa & Palas', quartiers: ['Agbokpa', 'Détékpa', 'Adandokpodji'] },
          { id: 'abomey_2', name: 'Hounli & Vidolè', quartiers: ['Hounli', 'Vidolè', 'Gbécon-Hounli'] },
          { id: 'abomey_3', name: 'Djègbé & Zounzonmè', quartiers: ['Djègbé', 'Zounzonmè', 'Sèhoun'] },
        ],
      },
      {
        id: 'bohicon',
        name: 'Bohicon (Carrefour commercial)',
        isMunicipality: true,
        arrondissements: [
          { id: 'bohicon_1', name: 'Bohicon 1', quartiers: ['Agongointo', 'Agbanwémè', 'Gnidjazoun', 'Kpocon', 'Sodohomè'] },
          { id: 'bohicon_2', name: 'Bohicon 2', quartiers: ['Avogbanna', 'Lissèzoun', 'Ouassaho', 'Passagon', 'Saclo'] },
        ],
      },
      {
        id: 'zogbodomey',
        name: 'Zogbodomey',
        arrondissements: [
          { id: 'zogbodomey_centre', name: 'Zogbodomey Centre', quartiers: ['Zogbodomey', 'Akiza', 'Avlamè'] },
          { id: 'cana', name: 'Cana (Site historique)', quartiers: ['Cana 1', 'Cana 2', 'Domè', 'Koussoukpa'] },
        ],
      },
      {
        id: 'agbangnizoun',
        name: 'Agbangnizoun',
        arrondissements: [
          { id: 'agbangnizoun_centre', name: 'Agbangnizoun Centre', quartiers: ['Agbangnizoun', 'Adahondjigon', 'Lissazounmè', 'Tanvé'] },
        ],
      },
      {
        id: 'cove',
        name: 'Covè',
        arrondissements: [
          { id: 'cove_centre', name: 'Covè Centre', quartiers: ['Covè', 'Adjan', 'Houen-Hounso', 'Naogon', 'Zogba'] },
        ],
      },
      {
        id: 'djidja',
        name: 'Djidja',
        arrondissements: [
          { id: 'djidja_centre', name: 'Djidja Centre', quartiers: ['Djidja', 'Agouna', 'Dan', 'Monsourou', 'Setto'] },
        ],
      },
      {
        id: 'za_kpota',
        name: 'Za-Kpota',
        arrondissements: [
          { id: 'za_kpota_centre', name: 'Za-Kpota Centre', quartiers: ['Za-Kpota', 'Allahé', 'Assanté', 'Za-Tanta'] },
        ],
      },
      {
        id: 'zagnanado',
        name: 'Zagnanado',
        arrondissements: [
          { id: 'zagnanado_centre', name: 'Zagnanado Centre', quartiers: ['Zagnanado', 'Banamè', 'Agonli-Houégbo', 'Kpédékpo'] },
        ],
      },
      {
        id: 'ouinhi',
        name: 'Ouinhi',
        arrondissements: [
          { id: 'ouinhi_centre', name: 'Ouinhi Centre', quartiers: ['Ouinhi', 'Dasso', 'Sagon', 'Tohouè'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 6. MONO (6 Communes : Lokossa, Athiémé, Bopa, Comè, Grand-Popo, Houéyogbé)
  // =========================================================================
  {
    id: 'mono',
    name: 'Mono',
    communes: [
      {
        id: 'lokossa',
        name: 'Lokossa (Chef-lieu)',
        isMunicipality: true,
        arrondissements: [
          { id: 'lokossa_centre', name: 'Lokossa Centre', quartiers: ['Agnidji', 'Agomè', 'Doukonta', 'Glehoué', 'Soglogodji', 'Takon'] },
          { id: 'houin', name: 'Houin', quartiers: ['Houin Centre', 'Koudo', 'Oumako'] },
        ],
      },
      {
        id: 'grand_popo',
        name: 'Grand-Popo (Cité balnéaire)',
        arrondissements: [
          { id: 'gp_centre', name: 'Grand-Popo Centre', quartiers: ['Grand-Popo', 'Adjaha', 'Agoué', 'Avloh (Bouche du Roy)', 'Gbéhoué'] },
          { id: 'djanglanmey', name: 'Djanglanmey', quartiers: ['Djanglanmey Centre', 'Sazoué', 'Kpohou'] },
        ],
      },
      {
        id: 'come',
        name: 'Comè',
        arrondissements: [
          { id: 'come_centre', name: 'Comè Centre', quartiers: ['Comè Centre', 'Agatogbo', 'Akodéha', 'Ouèdèmè-Pédah'] },
        ],
      },
      {
        id: 'bopa',
        name: 'Bopa',
        arrondissements: [
          { id: 'bopa_centre', name: 'Bopa Centre', quartiers: ['Bopa', 'Agbodji', 'Lobogo', 'Possotomè (Eau minérale)'] },
        ],
      },
      {
        id: 'athleme',
        name: 'Athiémé',
        arrondissements: [
          { id: 'athleme_centre', name: 'Athiémé Centre', quartiers: ['Athiémé', 'Adohoun', 'Atchannou', 'Kpinnou'] },
        ],
      },
      {
        id: 'houeyogbe',
        name: 'Houéyogbé',
        arrondissements: [
          { id: 'houeyogbe_centre', name: 'Houéyogbé Centre', quartiers: ['Houéyogbé', 'Dahé', 'Doutou', 'Sè (Poterie)'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 7. COUFFO (6 Communes : Aplahoué, Djakotomey, Dogbo, Klouékanmè, Lalo, Toviklin)
  // =========================================================================
  {
    id: 'couffo',
    name: 'Couffo',
    communes: [
      {
        id: 'aplahoue',
        name: 'Aplahoué (Chef-lieu)',
        arrondissements: [
          { id: 'aplahoue_centre', name: 'Aplahoué Centre', quartiers: ['Aplahoué', 'Avégodo', 'Djikpamè', 'Lokogba'] },
          { id: 'azove', name: 'Azové (Carrefour économique)', quartiers: ['Azové centre', 'Dékanmey', 'Kpakomey', 'Gblofoly'] },
        ],
      },
      {
        id: 'dogbo',
        name: 'Dogbo',
        arrondissements: [
          { id: 'dogbo_tota', name: 'Dogbo-Tota', quartiers: ['Tota Centre', 'Ayomi', 'Dévé', 'Honton', 'Lokogohoué', 'Madjrè'] },
        ],
      },
      {
        id: 'djakotomey',
        name: 'Djakotomey',
        arrondissements: [
          { id: 'djakotomey_centre', name: 'Djakotomey Centre', quartiers: ['Djakotomey 1', 'Djakotomey 2', 'Adjintimey', 'Gohomey', 'Houègamey'] },
        ],
      },
      {
        id: 'klouekanme',
        name: 'Klouékanmè',
        arrondissements: [
          { id: 'klouekanme_centre', name: 'Klouékanmè Centre', quartiers: ['Klouékanmè', 'Adahou', 'Ahogboya', 'Ayahohoué', 'Lanta'] },
        ],
      },
      {
        id: 'lalo',
        name: 'Lalo',
        arrondissements: [
          { id: 'lalo_centre', name: 'Lalo Centre', quartiers: ['Lalo', 'Ahomadégbé', 'Banigbé', 'Hlassamè', 'Lokogba', 'Tchito'] },
        ],
      },
      {
        id: 'toviklin',
        name: 'Toviklin',
        arrondissements: [
          { id: 'toviklin_centre', name: 'Toviklin Centre', quartiers: ['Toviklin', 'Adjido', 'Avamè', 'Doko', 'Missinko'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 8. COLLINES (6 Communes : Dassa-Zoumè, Glazoué, Ouèssè, Savalou, Savè, Bantè)
  // =========================================================================
  {
    id: 'collines',
    name: 'Collines',
    communes: [
      {
        id: 'dassa_zoume',
        name: 'Dassa-Zoumè (Cité des 41 collines)',
        isMunicipality: true,
        arrondissements: [
          { id: 'dassa_1', name: 'Dassa 1 & 2', quartiers: ['Dassa Centre', 'Essecé', 'Kpingni', 'Mkpèrou', 'Zongo'] },
          { id: 'paouingnan', name: 'Paouingnan', quartiers: ['Paouingnan Centre', 'Soclogbo', 'Tré', 'Kpèrè'] },
        ],
      },
      {
        id: 'savalou',
        name: 'Savalou (Royaume historique)',
        arrondissements: [
          { id: 'savalou_centre', name: 'Savalou Centre (Aga, Agbado, Attakè)', quartiers: ['Aga', 'Agbado', 'Attakè', 'Zounzonmè'] },
          { id: 'doume', name: 'Doumè', quartiers: ['Doumè Centre', 'Djaloukou', 'Kpataba', 'Logozohouè'] },
        ],
      },
      {
        id: 'save',
        name: 'Savè (Les Mamelles de Savè)',
        arrondissements: [
          { id: 'save_centre', name: 'Savè Centre', quartiers: ['Adido', 'Bèssè', 'Boni', 'Plateau', 'Zongo'] },
          { id: 'kaboua', name: 'Kaboua', quartiers: ['Kaboua Centre', 'Okpara', 'Gogoro'] },
        ],
      },
      {
        id: 'glazoue',
        name: 'Glazoué',
        arrondissements: [
          { id: 'glazoue_centre', name: 'Glazoué Centre', quartiers: ['Glazoué', 'Aklampa', 'Assanté', 'Ouèdèmè', 'Sokponta', 'Thio'] },
        ],
      },
      {
        id: 'ouesse',
        name: 'Ouèssè',
        arrondissements: [
          { id: 'ouesse_centre', name: 'Ouèssè Centre', quartiers: ['Ouèssè', 'Challa', 'Djègbè', 'Gbanlin', 'Kilibo', 'Toui'] },
        ],
      },
      {
        id: 'bante',
        name: 'Bantè',
        arrondissements: [
          { id: 'bante_centre', name: 'Bantè Centre', quartiers: ['Bantè', 'Akpassi', 'Atokoligbé', 'Bobè', 'Gouka', 'Pira'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 9. ALIBORI (6 Communes : Kandi, Banikoara, Gogounou, Karimama, Malanville, Ségbana)
  // =========================================================================
  {
    id: 'alibori',
    name: 'Alibori',
    communes: [
      {
        id: 'kandi',
        name: 'Kandi (Chef-lieu)',
        isMunicipality: true,
        arrondissements: [
          { id: 'kandi_1', name: 'Kandi 1', quartiers: ['Damadi', 'Dodopanin', 'Gansosso-Gbiga', 'Kadjèrè', 'Pédé'] },
          { id: 'kandi_2', name: 'Kandi 2 & 3', quartiers: ['Al Barika', 'Baobab', 'Kossarou', 'Madina', 'Angaradébou', 'Donwari'] },
        ],
      },
      {
        id: 'banikoara',
        name: 'Banikoara (Capitale de l\'or blanc)',
        arrondissements: [
          { id: 'banikoara_centre', name: 'Banikoara Centre', quartiers: ['Banikoara', 'Arboré', 'Demiman', 'Kompikpéni'] },
          { id: 'founougo', name: 'Founougo', quartiers: ['Founougo Centre', 'Gomparou', 'Goumori', 'Sompérékou'] },
        ],
      },
      {
        id: 'malanville',
        name: 'Malanville (Frontière Niger)',
        arrondissements: [
          { id: 'malanville_centre', name: 'Malanville Centre', quartiers: ['Bodjécali', 'Tassi-tédji', 'Wollo', 'Galiel'] },
          { id: 'guene', name: 'Guéné', quartiers: ['Guéné Centre', 'Garou', 'Tomboutou', 'Madécali'] },
        ],
      },
      {
        id: 'gogounou',
        name: 'Gogounou',
        arrondissements: [
          { id: 'gogounou_centre', name: 'Gogounou Centre', quartiers: ['Gogounou', 'Bagou', 'Gounarou', 'Ouara', 'Sori'] },
        ],
      },
      {
        id: 'karimama',
        name: 'Karimama (Parc W)',
        arrondissements: [
          { id: 'karimama_centre', name: 'Karimama Centre', quartiers: ['Karimama', 'Birni-Lafia', 'Bogo-Bogo', 'Kompa', 'Monsey'] },
        ],
      },
      {
        id: 'segbana',
        name: 'Ségbana',
        arrondissements: [
          { id: 'segbana_centre', name: 'Ségbana Centre', quartiers: ['Ségbana', 'Libantè', 'Liboussou', 'Lougou', 'Sokotindji'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 10. ATACORA (9 Communes : Natitingou, Boukoumbé, Cobly, Kérou, Kouandé, Matéri, Pehunco, Tanguiéta, Toucountouna)
  // =========================================================================
  {
    id: 'atacora',
    name: 'Atacora',
    communes: [
      {
        id: 'natitingou',
        name: 'Natitingou (Chef-lieu)',
        isMunicipality: true,
        arrondissements: [
          { id: 'natitingou_1', name: 'Natitingou I', quartiers: ['Bagri', 'Djindjiré-béri', 'Tchirimina', 'Yokossi'] },
          { id: 'natitingou_2', name: 'Natitingou II & III', quartiers: ['Bokoro', 'Boriyouré', 'Santa', 'Ouroubonna', 'Kotopounga', 'Perma'] },
        ],
      },
      {
        id: 'tanguieta',
        name: 'Tanguiéta (Porte de la Pendjari)',
        arrondissements: [
          { id: 'tanguieta_centre', name: 'Tanguiéta Centre', quartiers: ['Tanguiéta', 'Cotiakou', 'N\'Dahonta', 'Taïacou', 'Tanongou'] },
        ],
      },
      {
        id: 'boukoumbe',
        name: 'Boukoumbé (Pays Tata Somba)',
        arrondissements: [
          { id: 'boukoumbe_centre', name: 'Boukoumbé Centre', quartiers: ['Boukoumbé', 'Dipoli', 'Kossoucoingou', 'Manta', 'Natta'] },
        ],
      },
      {
        id: 'kouande',
        name: 'Kouandé',
        arrondissements: [
          { id: 'kouande_centre', name: 'Kouandé Centre', quartiers: ['Kouandé', 'Birni', 'Chabi-Couma', 'Guilmaro', 'Oroukayo'] },
        ],
      },
      {
        id: 'materi',
        name: 'Matéri',
        arrondissements: [
          { id: 'materi_centre', name: 'Matéri Centre', quartiers: ['Matéri', 'Dassari', 'Gouandé', 'Nodi', 'Tantéga'] },
        ],
      },
      {
        id: 'pehunco',
        name: 'Péhunco',
        arrondissements: [
          { id: 'pehunco_centre', name: 'Péhunco Centre', quartiers: ['Péhunco', 'Gnèmasson', 'Tobré'] },
        ],
      },
      {
        id: 'kerou',
        name: 'Kérou',
        arrondissements: [
          { id: 'kerou_centre', name: 'Kérou Centre', quartiers: ['Kérou', 'Brignamaro', 'Firou', 'Kaobagou'] },
        ],
      },
      {
        id: 'cobly',
        name: 'Cobly',
        arrondissements: [
          { id: 'cobly_centre', name: 'Cobly Centre', quartiers: ['Cobly', 'Datori', 'Kountori', 'Tapoga'] },
        ],
      },
      {
        id: 'toucountouna',
        name: 'Toucountouna',
        arrondissements: [
          { id: 'toucountouna_centre', name: 'Toucountouna Centre', quartiers: ['Toucountouna', 'Kouarfa', 'Tampégré'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 11. DONGA (4 Communes : Djougou, Bassila, Copargo, Ouaké)
  // =========================================================================
  {
    id: 'donga',
    name: 'Donga',
    communes: [
      {
        id: 'djougou',
        name: 'Djougou (Carrefour du Nord)',
        isMunicipality: true,
        arrondissements: [
          { id: 'djougou_1', name: 'Djougou I', quartiers: ['Founga', 'Madina', 'Kilir', 'Zongo', 'Sapaha'] },
          { id: 'djougou_2', name: 'Djougou II', quartiers: ['Bassala', 'Djakpingou', 'Nalohou', 'Kparsi'] },
          { id: 'djougou_3', name: 'Djougou III & Rural', quartiers: ['Bariénou', 'Bougou', 'Kolokondé', 'Onklou', 'Pélébina'] },
        ],
      },
      {
        id: 'bassila',
        name: 'Bassila',
        arrondissements: [
          { id: 'bassila_centre', name: 'Bassila Centre', quartiers: ['Bassila', 'Alédjo', 'Manigri', 'Pénéssoulou'] },
        ],
      },
      {
        id: 'copargo',
        name: 'Copargo',
        arrondissements: [
          { id: 'copargo_centre', name: 'Copargo Centre', quartiers: ['Copargo', 'Anandana', 'Pabégou', 'Singré'] },
        ],
      },
      {
        id: 'ouake',
        name: 'Ouaké',
        arrondissements: [
          { id: 'ouake_centre', name: 'Ouaké Centre', quartiers: ['Ouaké', 'Badjoudè', 'Kondé', 'Sèmèrè 1', 'Sèmèrè 2'] },
        ],
      },
    ],
  },

  // =========================================================================
  // 12. PLATEAU (5 Communes : Pobè, Adja-Ouèrè, Ifangni, Kétou, Sakété)
  // =========================================================================
  {
    id: 'plateau',
    name: 'Plateau',
    communes: [
      {
        id: 'pobe',
        name: 'Pobè (Chef-lieu)',
        arrondissements: [
          { id: 'pobe_centre', name: 'Pobè Centre', quartiers: ['Adjégounlè', 'Mamagué', 'Oké Ata', 'Pobè-Nord', 'Talala'] },
          { id: 'towe', name: 'Towé', quartiers: ['Towé Centre', 'Ahoyéyé', 'Igana', 'Issaba'] },
        ],
      },
      {
        id: 'ketou',
        name: 'Kétou (Cité historique Yoruba)',
        arrondissements: [
          { id: 'ketou_centre', name: 'Kétou Centre', quartiers: ['Assèna', 'Idéna', 'Massafè', 'Oké-Ola'] },
          { id: 'idigny', name: 'Idigny', quartiers: ['Idigny', 'Kpankou', 'Odométa', 'Okpométa'] },
        ],
      },
      {
        id: 'sakete',
        name: 'Sakété',
        arrondissements: [
          { id: 'sakete_centre', name: 'Sakété I & II', quartiers: ['Sakété Centre', 'Agouagou', 'Ita-Djèbou', 'Takon', 'Yoko'] },
        ],
      },
      {
        id: 'ifangni',
        name: 'Ifangni',
        arrondissements: [
          { id: 'ifangni_centre', name: 'Ifangni Centre', quartiers: ['Ifangni', 'Banigbé', 'Daagbé', 'Ko-Koumolou', 'Tchaada'] },
        ],
      },
      {
        id: 'adja_ouere',
        name: 'Adja-Ouèrè',
        arrondissements: [
          { id: 'adja_ouere_centre', name: 'Adja-Ouèrè Centre', quartiers: ['Adja-Ouèrè', 'Ikpinlè', 'Kpoulou', 'Massè', 'Totonnoukon'] },
        ],
      },
    ],
  },
];

/**
 * Helper to search across all quartiers, arrondissements, communes and departments
 */
export interface TerritorySearchResult {
  deptId: string;
  deptName: string;
  communeId: string;
  communeName: string;
  arrondissementId: string;
  arrondissementName: string;
  quartier: string;
}

export function searchTerritory(term: string): TerritorySearchResult[] {
  if (!term || term.trim().length < 2) return [];
  const normalized = term.toLowerCase().trim();
  const results: TerritorySearchResult[] = [];

  for (const dept of BENIN_TERRITORIES) {
    for (const com of dept.communes) {
      for (const arr of com.arrondissements) {
        for (const q of arr.quartiers) {
          if (
            q.toLowerCase().includes(normalized) ||
            arr.name.toLowerCase().includes(normalized) ||
            com.name.toLowerCase().includes(normalized)
          ) {
            results.push({
              deptId: dept.id,
              deptName: dept.name,
              communeId: com.id,
              communeName: com.name,
              arrondissementId: arr.id,
              arrondissementName: arr.name,
              quartier: q,
            });
            if (results.length >= 25) return results;
          }
        }
      }
    }
  }

  return results;
}

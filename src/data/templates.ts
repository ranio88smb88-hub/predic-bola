export interface MatchTemplate {
  id: string;
  name: string;
  category: string;
  badge: string;
  rawText: string;
}

export const MATCH_TEMPLATES: MatchTemplate[] = [
  {
    id: "screenshot-default",
    name: "Royal VIP Big Match Mix (6 Pertandingan)",
    category: "Featured Mix",
    badge: "Royal Special",
    rawText: `ASEAN CHAMPIONSHIP 2026
18:00
WIB • 28/07
Philippines
VS
Myanmar
1 : 0
21:00
WIB • 28/07
Malaysia
VS
Laos
0 : 2

UEFA CHAMPIONS LEAGUE QUALIFIERS
23:00
WIB • 28/07
Fenerbahce
VS
Lugano
2 : 1
01:30
WIB • 29/07
Sparta Prague
VS
Shamrock Rovers
3 : 0

COPA LIBERTADORES
05:00
WIB • 29/07
Flamengo
VS
Bolivar
2 : 0
07:30
WIB • 29/07
River Plate
VS
Talleres
1 : 0`,
  },
  {
    id: "copa-libertadores",
    name: "Copa Libertadores Knockout Stage",
    category: "South America",
    badge: "CONMEBOL",
    rawText: `COPA LIBERTADORES 2026
05:00
WIB • 29/07
Flamengo
VS
Bolivar
2 : 0
07:30
WIB • 29/07
River Plate
VS
Talleres
1 : 0
09:30
WIB • 29/07
Palmeiras
VS
Botafogo
2 : 1`,
  },
  {
    id: "champions-league",
    name: "UEFA Champions League Elite Fixtures",
    category: "Europe",
    badge: "UCL",
    rawText: `UEFA CHAMPIONS LEAGUE
02:00
WIB • 30/07
Real Madrid
VS
Manchester City
2 : 1
02:00
WIB • 30/07
Arsenal
VS
Bayern Munich
2 : 0
02:00
WIB • 31/07
Barcelona
VS
Paris Saint-Germain
3 : 1
02:00
WIB • 31/07
Liverpool
VS
Inter Milan
2 : 0`,
  },
  {
    id: "premier-league",
    name: "English Premier League Super Big Match",
    category: "England",
    badge: "EPL",
    rawText: `ENGLISH PREMIER LEAGUE
18:30
WIB • 01/08
Manchester United
VS
Liverpool
1 : 2
21:00
WIB • 01/08
Chelsea
VS
Tottenham
2 : 1
23:30
WIB • 01/08
Arsenal
VS
Manchester City
1 : 1`,
  },
  {
    id: "liga-1-indonesia",
    name: "BRI Liga 1 Indonesia Derby",
    category: "Indonesia",
    badge: "Liga 1",
    rawText: `BRI LIGA 1 INDONESIA
15:30
WIB • 02/08
Persib Bandung
VS
Persija Jakarta
2 : 1
19:00
WIB • 02/08
Persebaya Surabaya
VS
Arema FC
2 : 0
19:00
WIB • 03/08
Bali United
VS
Borneo FC
1 : 1`,
  },
  {
    id: "asean-cup",
    name: "ASEAN Championship (Piala AFF)",
    category: "Southeast Asia",
    badge: "AFF",
    rawText: `ASEAN CHAMPIONSHIP 2026
18:00
WIB • 28/07
Philippines
VS
Myanmar
1 : 0
21:00
WIB • 28/07
Malaysia
VS
Laos
0 : 2
19:30
WIB • 29/07
Indonesia
VS
Vietnam
2 : 1
19:30
WIB • 30/07
Thailand
VS
Singapore
3 : 0`,
  },
];

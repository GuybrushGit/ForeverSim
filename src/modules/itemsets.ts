import type { ItemSet } from '@core/shared/types';const templateSets = [
  {
    "id": 1,
    "name": "The Gladiator",
    "items": [
      11729,
      11726,
      11728,
      11731,
      11730,
      277117
    ],
    "sets": [
      {
        "count": 4,
        "spell": 1301123
      },
      {
        "count": 3,
        "spell": 9331
      },
      {
        "count": 2,
        "spell": 1301126
      },
      {
        "count": 5,
        "spell": 1314795
      }
    ]
  },
  {
    "id": 124,
    "name": "Deathbone Guardian",
    "items": [
      14624,
      14622,
      14620,
      14623,
      14621
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7516
      },
      {
        "count": 4,
        "spell": 18676
      },
      {
        "count": 5,
        "spell": 1213289
      },
      {
        "count": 3,
        "spell": 1299743
      }
    ]
  },
  {
    "id": 141,
    "name": "Volcanic Armor",
    "items": [
      15053,
      15054,
      15055
    ],
    "sets": [
      {
        "count": 3,
        "spell": 9233
      }
    ]
  },
  {
    "id": 142,
    "name": "Stormshroud Armor",
    "items": [
      15056,
      15057,
      15058,
      21278
    ],
    "sets": [
      {
        "count": 2,
        "spell": 18979
      },
      {
        "count": 3,
        "spell": 23863
      },
      {
        "count": 4,
        "spell": 9142
      }
    ]
  },
  {
    "id": 143,
    "name": "Devilsaur Armor",
    "items": [
      15062,
      15063
    ],
    "sets": [
      {
        "count": 2,
        "spell": 460230
      }
    ]
  },
  {
    "id": 161,
    "name": "Defias Leather",
    "items": [
      10399,
      10403,
      10402,
      10401,
      10400
    ],
    "sets": [
      {
        "count": 2,
        "spell": 14707
      },
      {
        "count": 3,
        "spell": 1292025
      },
      {
        "count": 5,
        "spell": 7534
      },
      {
        "count": 4,
        "spell": 1292028
      }
    ]
  },
  {
    "id": 162,
    "name": "Embrace of the Viper",
    "items": [
      10412,
      10411,
      10413,
      10410,
      6473
    ],
    "sets": [
      {
        "count": 2,
        "spell": 9106
      },
      {
        "count": 3,
        "spell": 9140
      },
      {
        "count": 4,
        "spell": 1291796
      },
      {
        "count": 5,
        "spell": 1291807
      }
    ]
  },
  {
    "id": 163,
    "name": "Chain of the Scarlet Crusade",
    "items": [
      10329,
      10332,
      10328,
      10331,
      10330,
      10333
    ],
    "sets": [
      {
        "count": 5,
        "spell": 432639
      },
      {
        "count": 3,
        "spell": 18074
      },
      {
        "count": 2,
        "spell": 14673
      },
      {
        "count": 6,
        "spell": 1293670
      },
      {
        "count": 4,
        "spell": 1293674
      }
    ]
  },
  {
    "id": 181,
    "name": "Magister's Regalia",
    "items": [
      16685,
      16683,
      16686,
      16684,
      16687,
      16689,
      16688,
      16682
    ],
    "sets": [
      {
        "count": 4,
        "spell": 27867
      },
      {
        "count": 6,
        "spell": 18378
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 3,
        "spell": 9346
      },
      {
        "count": 5,
        "spell": 450527
      }
    ]
  },
  {
    "id": 182,
    "name": "Vestments of the Devout",
    "items": [
      16696,
      16691,
      16697,
      16693,
      16692,
      16695,
      16694,
      16690
    ],
    "sets": [
      {
        "count": 4,
        "spell": 27778
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 6,
        "spell": 18378
      },
      {
        "count": 5,
        "spell": 450576
      },
      {
        "count": 3,
        "spell": 9346
      }
    ]
  },
  {
    "id": 183,
    "name": "Dreadmist Raiment",
    "items": [
      16702,
      16703,
      16699,
      16701,
      16700,
      16704,
      16698,
      16705
    ],
    "sets": [
      {
        "count": 4,
        "spell": 27780
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 3,
        "spell": 9346
      },
      {
        "count": 6,
        "spell": 18378
      },
      {
        "count": 5,
        "spell": 450585
      }
    ]
  },
  {
    "id": 184,
    "name": "Shadowcraft Armor",
    "items": [
      16713,
      16711,
      16710,
      16721,
      16708,
      16709,
      16712,
      16707
    ],
    "sets": [
      {
        "count": 5,
        "spell": 27787
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 3,
        "spell": 9336
      },
      {
        "count": 6,
        "spell": 21347
      },
      {
        "count": 4,
        "spell": 1302698
      }
    ]
  },
  {
    "id": 185,
    "name": "Wildheart Raiment",
    "items": [
      16716,
      16715,
      16714,
      16720,
      16706,
      16718,
      16719,
      16717
    ],
    "sets": [
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 3,
        "spell": 9346
      },
      {
        "count": 3,
        "spell": 9336
      },
      {
        "count": 6,
        "spell": 18378
      },
      {
        "count": 4,
        "spell": 1302708
      },
      {
        "count": 5,
        "spell": 450608
      }
    ]
  },
  {
    "id": 186,
    "name": "Beaststalker Armor",
    "items": [
      16680,
      16675,
      16681,
      16677,
      16674,
      16678,
      16679,
      16676
    ],
    "sets": [
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 3,
        "spell": 9336
      },
      {
        "count": 6,
        "spell": 18378
      },
      {
        "count": 5,
        "spell": 450577
      },
      {
        "count": 4,
        "spell": 1302712
      }
    ]
  },
  {
    "id": 187,
    "name": "The Elements",
    "items": [
      16673,
      16670,
      16671,
      16667,
      16672,
      16668,
      16669,
      16666
    ],
    "sets": [
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 3,
        "spell": 9346
      },
      {
        "count": 6,
        "spell": 18378
      },
      {
        "count": 5,
        "spell": 450626
      },
      {
        "count": 4,
        "spell": 1302718
      }
    ]
  },
  {
    "id": 188,
    "name": "Lightforge Armor",
    "items": [
      16723,
      16725,
      16722,
      16726,
      16724,
      16728,
      16729,
      16727
    ],
    "sets": [
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 6,
        "spell": 18378
      },
      {
        "count": 4,
        "spell": 1302716
      },
      {
        "count": 5,
        "spell": 450625
      },
      {
        "count": 3,
        "spell": 9346
      }
    ]
  },
  {
    "id": 189,
    "name": "Battlegear of Valor",
    "items": [
      16736,
      16734,
      16735,
      16730,
      16737,
      16731,
      16732,
      16733
    ],
    "sets": [
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 3,
        "spell": 13198
      },
      {
        "count": 6,
        "spell": 21347
      },
      {
        "count": 5,
        "spell": 450587
      },
      {
        "count": 4,
        "spell": 1302721
      }
    ]
  },
  {
    "id": 281,
    "name": "Champion's Battlegear",
    "items": [
      272478,
      272477,
      272481,
      272479,
      272637,
      272480
    ],
    "sets": [
      {
        "count": 4,
        "spell": 22738
      },
      {
        "count": 6,
        "spell": 14467
      },
      {
        "count": 2,
        "spell": 14049
      }
    ]
  },
  {
    "id": 282,
    "name": "Lieutenant Commander's Battlegear",
    "items": [
      272717,
      272716,
      272740,
      272739,
      272741,
      272738
    ],
    "sets": [
      {
        "count": 4,
        "spell": 22738
      },
      {
        "count": 6,
        "spell": 14467
      },
      {
        "count": 2,
        "spell": 14049
      }
    ]
  },
  {
    "id": 321,
    "name": "Imperial Plate",
    "items": [
      12424,
      12426,
      12425,
      12422,
      12427,
      12429,
      12428,
      250589
    ],
    "sets": [
      {
        "count": 5,
        "spell": 1251984
      },
      {
        "count": 3,
        "spell": 1251990
      },
      {
        "count": 6,
        "spell": 1251991
      },
      {
        "count": 2,
        "spell": 13385
      },
      {
        "count": 4,
        "spell": 1302372
      }
    ]
  },
  {
    "id": 383,
    "name": "Warlord's Battlegear",
    "items": [
      272513,
      272510,
      272508,
      272506,
      272509,
      272507
    ],
    "sets": [
      {
        "count": 6,
        "spell": 14049
      },
      {
        "count": 3,
        "spell": 22738
      },
      {
        "count": 2,
        "spell": 14467
      }
    ]
  },
  {
    "id": 384,
    "name": "Field Marshal's Battlegear",
    "items": [
      272793,
      272792,
      272788,
      272786,
      272789,
      272787
    ],
    "sets": [
      {
        "count": 2,
        "spell": 14467
      },
      {
        "count": 3,
        "spell": 22738
      },
      {
        "count": 6,
        "spell": 14049
      }
    ]
  },
  {
    "id": 441,
    "name": "Primal Batskin",
    "items": [
      19685,
      19687,
      19686
    ],
    "sets": [
      {
        "count": 3,
        "spell": 24090
      }
    ]
  },
  {
    "id": 442,
    "name": "Blood Tiger Harness",
    "items": [
      19688,
      19689
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7597
      },
      {
        "count": 2,
        "spell": 18384
      }
    ]
  },
  {
    "id": 443,
    "name": "Bloodsoul Embrace",
    "items": [
      19690,
      19691,
      19692
    ],
    "sets": [
      {
        "count": 3,
        "spell": 21636
      }
    ]
  },
  {
    "id": 444,
    "name": "The Darksoul",
    "items": [
      19693,
      19694,
      19695
    ],
    "sets": [
      {
        "count": 3,
        "spell": 21416
      }
    ]
  },
  {
    "id": 467,
    "name": "The Highlander's Resolution",
    "items": [
      20041,
      20048,
      20057
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 7597
      }
    ]
  },
  {
    "id": 468,
    "name": "The Highlander's Resolve",
    "items": [
      20042,
      20049,
      20058
    ],
    "sets": [
      {
        "count": 3,
        "spell": 7597
      },
      {
        "count": 2,
        "spell": 7503
      }
    ]
  },
  {
    "id": 469,
    "name": "The Highlander's Determination",
    "items": [
      20043,
      20050,
      20055
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 7597
      }
    ]
  },
  {
    "id": 470,
    "name": "The Highlander's Fortitude",
    "items": [
      20044,
      20051,
      20056
    ],
    "sets": [
      {
        "count": 3,
        "spell": 18384
      },
      {
        "count": 2,
        "spell": 7503
      }
    ]
  },
  {
    "id": 471,
    "name": "The Highlander's Purpose",
    "items": [
      20052,
      20045,
      20059
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 7597
      }
    ]
  },
  {
    "id": 472,
    "name": "The Highlander's Will",
    "items": [
      20053,
      20046,
      20060
    ],
    "sets": [
      {
        "count": 3,
        "spell": 18384
      },
      {
        "count": 2,
        "spell": 7503
      }
    ]
  },
  {
    "id": 474,
    "name": "Vindicator's Battlegear",
    "items": [
      19951,
      19577,
      19824,
      19823,
      19822
    ],
    "sets": [
      {
        "count": 2,
        "spell": 13675
      },
      {
        "count": 3,
        "spell": 24456
      },
      {
        "count": 5,
        "spell": 24431
      }
    ]
  },
  {
    "id": 483,
    "name": "The Defiler's Determination",
    "items": [
      20158,
      20154,
      20150
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 7597
      }
    ]
  },
  {
    "id": 484,
    "name": "The Defiler's Fortitude",
    "items": [
      20195,
      20199,
      20203
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 7597
      }
    ]
  },
  {
    "id": 486,
    "name": "The Defiler's Purpose",
    "items": [
      20186,
      20190,
      20194
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 7597
      }
    ]
  },
  {
    "id": 487,
    "name": "The Defiler's Resolution",
    "items": [
      20204,
      20208,
      20212
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 7597
      }
    ]
  },
  {
    "id": 488,
    "name": "The Defiler's Will",
    "items": [
      20167,
      20171,
      20175
    ],
    "sets": [
      {
        "count": 2,
        "spell": 7503
      },
      {
        "count": 3,
        "spell": 18384
      }
    ]
  },
  {
    "id": 489,
    "name": "Black Dragon Mail",
    "items": [
      15050,
      15052,
      15051
    ],
    "sets": [
      {
        "count": 2,
        "spell": 15464
      },
      {
        "count": 3,
        "spell": 7598
      }
    ]
  },
  {
    "id": 490,
    "name": "Green Dragon Mail",
    "items": [
      15045,
      15046,
      20296
    ],
    "sets": [
      {
        "count": 2,
        "spell": 21625
      },
      {
        "count": 3,
        "spell": 21894
      }
    ]
  },
  {
    "id": 492,
    "name": "Twilight Trappings",
    "items": [
      20406,
      20408,
      20407
    ],
    "sets": [
      {
        "count": 3,
        "spell": 24746
      }
    ]
  },
  {
    "id": 495,
    "name": "Battlegear of Unyielding Strength",
    "items": [
      21394,
      21392,
      21393
    ],
    "sets": [
      {
        "count": 3,
        "spell": 26111
      }
    ]
  },
  {
    "id": 496,
    "name": "Conqueror's Battlegear",
    "items": [
      21331,
      21329,
      21333,
      21332,
      21330
    ],
    "sets": [
      {
        "count": 3,
        "spell": 26109
      },
      {
        "count": 5,
        "spell": 26110
      }
    ]
  },
  {
    "id": 511,
    "name": "Battlegear of Heroism",
    "items": [
      21994,
      21995,
      21996,
      21997,
      21998,
      21999,
      22000,
      22001
    ],
    "sets": [
      {
        "count": 6,
        "spell": 14049
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 4,
        "spell": 27419
      },
      {
        "count": 8,
        "spell": 14803
      }
    ]
  },
  {
    "id": 512,
    "name": "Darkmantle Armor",
    "items": [
      22002,
      22003,
      22004,
      22005,
      22006,
      22007,
      22008,
      22009
    ],
    "sets": [
      {
        "count": 6,
        "spell": 14049
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 4,
        "spell": 27787
      },
      {
        "count": 8,
        "spell": 14803
      }
    ]
  },
  {
    "id": 515,
    "name": "Beastmaster Armor",
    "items": [
      22010,
      22011,
      22061,
      22013,
      22015,
      22016,
      22017,
      22060
    ],
    "sets": [
      {
        "count": 6,
        "spell": 14049
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 4,
        "spell": 27785
      },
      {
        "count": 8,
        "spell": 14803
      }
    ]
  },
  {
    "id": 521,
    "name": "Dreamwalker Raiment",
    "items": [
      22492,
      22494,
      22493,
      22490,
      22489,
      22491,
      22488,
      22495,
      23064
    ],
    "sets": [
      {
        "count": 4,
        "spell": 28743
      },
      {
        "count": 6,
        "spell": 28744
      },
      {
        "count": 2,
        "spell": 28716
      },
      {
        "count": 8,
        "spell": 28719
      }
    ]
  },
  {
    "id": 523,
    "name": "Dreadnaught's Battlegear",
    "items": [
      22423,
      22416,
      22421,
      22422,
      22418,
      22417,
      22419,
      22420,
      23059
    ],
    "sets": [
      {
        "count": 6,
        "spell": 28842
      },
      {
        "count": 2,
        "spell": 28844
      },
      {
        "count": 4,
        "spell": 28843
      },
      {
        "count": 8,
        "spell": 28845
      }
    ]
  },
  {
    "id": 524,
    "name": "Bonescythe Armor",
    "items": [
      22483,
      22476,
      22481,
      22478,
      22477,
      22479,
      22480,
      22482,
      23060
    ],
    "sets": [
      {
        "count": 4,
        "spell": 28812
      },
      {
        "count": 8,
        "spell": 28814
      },
      {
        "count": 2,
        "spell": 28816
      },
      {
        "count": 6,
        "spell": 28811
      }
    ]
  },
  {
    "id": 525,
    "name": "Vestments of Faith",
    "items": [
      22518,
      22519,
      22514,
      22517,
      22513,
      22512,
      22516,
      22515,
      23061
    ],
    "sets": [
      {
        "count": 4,
        "spell": 28809
      },
      {
        "count": 8,
        "spell": 28802
      },
      {
        "count": 2,
        "spell": 28807
      },
      {
        "count": 6,
        "spell": 28808
      }
    ]
  },
  {
    "id": 527,
    "name": "The Earthshatterer",
    "items": [
      22468,
      22470,
      22469,
      22466,
      22465,
      22467,
      22464,
      22471,
      23065
    ],
    "sets": [
      {
        "count": 6,
        "spell": 28823
      },
      {
        "count": 4,
        "spell": 29171
      },
      {
        "count": 2,
        "spell": 28818
      },
      {
        "count": 8,
        "spell": 28821
      }
    ]
  },
  {
    "id": 528,
    "name": "Redemption Armor",
    "items": [
      22430,
      22431,
      22426,
      22428,
      22427,
      22429,
      22425,
      22424,
      23066
    ],
    "sets": [
      {
        "count": 8,
        "spell": 28787
      },
      {
        "count": 6,
        "spell": 28789
      },
      {
        "count": 2,
        "spell": 28775
      },
      {
        "count": 4,
        "spell": 28774
      }
    ]
  },
  {
    "id": 530,
    "name": "Cryptstalker Armor",
    "items": [
      22440,
      22442,
      22441,
      22438,
      22437,
      22439,
      22436,
      22443,
      23067
    ],
    "sets": [
      {
        "count": 6,
        "spell": 28752
      },
      {
        "count": 8,
        "spell": 28751
      },
      {
        "count": 4,
        "spell": 28756
      },
      {
        "count": 2,
        "spell": 28755
      }
    ]
  },
  {
    "id": 533,
    "name": "Battlegear of Undead Slaying",
    "items": [
      23090,
      23087,
      23078
    ],
    "sets": [
      {
        "count": 3,
        "spell": 29068
      }
    ]
  },
  {
    "id": 534,
    "name": "Undead Slayer's Armor",
    "items": [
      23081,
      23089,
      23093
    ],
    "sets": [
      {
        "count": 3,
        "spell": 29068
      }
    ]
  },
  {
    "id": 535,
    "name": "Garb of the Undead Slayer",
    "items": [
      23088,
      23082,
      23092
    ],
    "sets": [
      {
        "count": 3,
        "spell": 29068
      }
    ]
  },
  {
    "id": 537,
    "name": "Champion's Battlearmor",
    "items": [
      22868,
      22858,
      22872,
      22873,
      23244,
      23243
    ],
    "sets": [
      {
        "count": 2,
        "spell": 14049
      },
      {
        "count": 4,
        "spell": 22738
      },
      {
        "count": 6,
        "spell": 14467
      }
    ]
  },
  {
    "id": 545,
    "name": "Lieutenant Commander's Battlearmor",
    "items": [
      23300,
      23301,
      23286,
      23287,
      23314,
      23315
    ],
    "sets": [
      {
        "count": 4,
        "spell": 22738
      },
      {
        "count": 6,
        "spell": 14467
      },
      {
        "count": 2,
        "spell": 14049
      }
    ]
  }
] as ItemSet[];export default templateSets;
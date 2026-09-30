import type { ItemSet } from '@core/shared/types';const templateSets = [
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
    "id": 144,
    "name": "Ironfeather Armor",
    "items": [
      15066,
      15067
    ],
    "sets": [
      {
        "count": 2,
        "spell": 14799
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
    "id": 421,
    "name": "Bloodvine Garb",
    "items": [
      19682,
      19683,
      19684
    ],
    "sets": [
      {
        "count": 3,
        "spell": 18382
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
    "id": 473,
    "name": "The Highlander's Intent",
    "items": [
      20054,
      20047,
      20061
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
    "id": 485,
    "name": "The Defiler's Intent",
    "items": [
      20176,
      20159,
      20163
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
    "id": 491,
    "name": "Blue Dragon Mail",
    "items": [
      15048,
      20295,
      15049
    ],
    "sets": [
      {
        "count": 2,
        "spell": 18675
      },
      {
        "count": 3,
        "spell": 14127
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
    "id": 513,
    "name": "Feralheart Raiment",
    "items": [
      22106,
      22107,
      22108,
      22109,
      22110,
      22111,
      22112,
      22113
    ],
    "sets": [
      {
        "count": 6,
        "spell": 9344
      },
      {
        "count": 6,
        "spell": 9334
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 4,
        "spell": 27781
      },
      {
        "count": 8,
        "spell": 14803
      }
    ]
  },
  {
    "id": 514,
    "name": "Vestments of the Virtuous",
    "items": [
      22078,
      22079,
      22080,
      22081,
      22082,
      22083,
      22084,
      22085
    ],
    "sets": [
      {
        "count": 6,
        "spell": 14047
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 4,
        "spell": 27778
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
    "id": 516,
    "name": "Soulforge Armor",
    "items": [
      22086,
      22087,
      22088,
      22089,
      22090,
      22091,
      22092,
      22093
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
        "spell": 27498
      },
      {
        "count": 8,
        "spell": 14803
      }
    ]
  },
  {
    "id": 517,
    "name": "Sorcerer's Regalia",
    "items": [
      22062,
      22063,
      22064,
      22065,
      22066,
      22067,
      22068,
      22069
    ],
    "sets": [
      {
        "count": 8,
        "spell": 14803
      },
      {
        "count": 4,
        "spell": 27867
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 6,
        "spell": 14047
      }
    ]
  },
  {
    "id": 518,
    "name": "Deathmist Raiment",
    "items": [
      22070,
      22071,
      22072,
      22073,
      22074,
      22075,
      22076,
      22077
    ],
    "sets": [
      {
        "count": 6,
        "spell": 14047
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 4,
        "spell": 27780
      },
      {
        "count": 8,
        "spell": 14803
      }
    ]
  },
  {
    "id": 519,
    "name": "The Five Thunders",
    "items": [
      22095,
      22096,
      22097,
      22098,
      22099,
      22100,
      22101,
      22102
    ],
    "sets": [
      {
        "count": 6,
        "spell": 14047
      },
      {
        "count": 2,
        "spell": 18679
      },
      {
        "count": 4,
        "spell": 27774
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
    "id": 526,
    "name": "Frostfire Regalia",
    "items": [
      22502,
      22503,
      22498,
      22501,
      22497,
      22496,
      22500,
      22499,
      23062
    ],
    "sets": [
      {
        "count": 6,
        "spell": 28771
      },
      {
        "count": 2,
        "spell": 28763
      },
      {
        "count": 8,
        "spell": 28761
      },
      {
        "count": 4,
        "spell": 28764
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
    "id": 529,
    "name": "Plagueheart Raiment",
    "items": [
      22510,
      22511,
      22506,
      22509,
      22505,
      22504,
      22508,
      22507,
      23063
    ],
    "sets": [
      {
        "count": 4,
        "spell": 28829
      },
      {
        "count": 8,
        "spell": 28830
      },
      {
        "count": 2,
        "spell": 28831
      },
      {
        "count": 6,
        "spell": 28746
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
    "id": 536,
    "name": "Regalia of Undead Cleansing",
    "items": [
      23091,
      23084,
      23085
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
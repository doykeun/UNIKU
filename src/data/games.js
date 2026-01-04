export const games = [
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    publisher: 'Moonton',
    image: 'https://ui-avatars.com/api/?name=ML&background=0D8ABC&color=fff&size=200',
    items: [
      { id: 'ml-3', name: '3 Diamonds', price: 1500 },
      { id: 'ml-5', name: '5 Diamonds', price: 2500 },
      { id: 'ml-12', name: '12 Diamonds', price: 5000 },
      { id: 'ml-50', name: '50 Diamonds', price: 15000 },
      { id: 'ml-100', name: '100 Diamonds', price: 30000 },
      { id: 'ml-366', name: '366 Diamonds', price: 100000 },
    ],
    inputs: [
      { name: 'userId', label: 'User ID', placeholder: '12345678' },
      { name: 'zoneId', label: 'Zone ID', placeholder: '1234' }
    ]
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    publisher: 'Garena',
    image: 'https://ui-avatars.com/api/?name=FF&background=FFA500&color=fff&size=200',
    items: [
      { id: 'ff-5', name: '5 Diamonds', price: 1000 },
      { id: 'ff-12', name: '12 Diamonds', price: 2000 },
      { id: 'ff-50', name: '50 Diamonds', price: 8000 },
      { id: 'ff-70', name: '70 Diamonds', price: 10000 },
      { id: 'ff-140', name: '140 Diamonds', price: 20000 },
      { id: 'ff-355', name: '355 Diamonds', price: 50000 },
    ],
    inputs: [
      { name: 'userId', label: 'Player ID', placeholder: '123456789' }
    ]
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    publisher: 'Tencent',
    image: 'https://ui-avatars.com/api/?name=PUBG&background=000&color=fff&size=200',
    items: [
      { id: 'pubg-60', name: '60 UC', price: 14000 },
      { id: 'pubg-325', name: '325 UC', price: 70000 },
      { id: 'pubg-660', name: '660 UC', price: 140000 },
    ],
    inputs: [
      { name: 'userId', label: 'ID Karakter', placeholder: '5123456789' }
    ]
  },
  {
    id: 'valorant',
    name: 'Valorant',
    publisher: 'Riot Games',
    image: 'https://ui-avatars.com/api/?name=VAL&background=FF4655&color=fff&size=200',
    items: [
      { id: 'val-125', name: '125 Points', price: 15000 },
      { id: 'val-420', name: '420 Points', price: 50000 },
      { id: 'val-700', name: '700 Points', price: 80000 },
    ],
    inputs: [
      { name: 'userId', label: 'Riot ID (Username#Tag)', placeholder: 'Player#1234' }
    ]
  },
  {
    id: 'genshin-impact',
    name: 'Genshin Impact',
    publisher: 'HoYoverse',
    image: 'https://ui-avatars.com/api/?name=GI&background=fff&color=000&size=200',
    items: [
      { id: 'gi-60', name: '60 Genesis Crystals', price: 16000 },
      { id: 'gi-300', name: '300 Genesis Crystals', price: 79000 },
      { id: 'gi-980', name: '980 Genesis Crystals', price: 249000 },
    ],
    inputs: [
      { name: 'userId', label: 'UID', placeholder: '800123456' },
      { name: 'server', label: 'Server', placeholder: 'Asia', type: 'select', options: ['Asia', 'America', 'Europe', 'TW/HK/MO'] }
    ]
  }
];

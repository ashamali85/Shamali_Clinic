/**
 * Reference data for the clinic's lookup tables.
 *
 * Source for the Kuwait area/governorate mapping: the "Areas of Kuwait" listing
 * on Wikipedia — 6 governorates and their constituent residential areas. Each
 * area belongs to exactly one governorate, which is how the intake form derives
 * the governorate automatically from the selected area.
 */

export const KUWAIT_GOVERNORATES: { name: string; nameAr: string; areas: string[] }[] = [
  {
    name: 'Capital',
    nameAr: 'العاصمة',
    areas: [
      'Abdulla Al-Salem', 'Adailiya', 'Al-Sour Gardens', 'Bnaid Al-Qar', 'Daiya',
      'Dasma', 'Doha', 'Doha Port', 'Faiha', 'Failaka Island', 'Granada', 'Jibla',
      'Kaifan', 'Khaldiya', 'Mansouriya', 'Mirqab', 'Nahdha', 'North West Sulaibikhat',
      'Nuzha', 'Qadsiya', 'Qortuba', 'Rawda', 'Shamiya', 'Sharq', 'Shuwaikh',
      'Shuwaikh Industrial Area', 'Shuwaikh Port', 'Sulaibikhat', 'Qairawan', 'Surra',
      'Yarmouk'
    ]
  },
  {
    name: 'Hawalli',
    nameAr: 'حولي',
    areas: [
      'Bayan', 'Jabriya', 'Rumaithiya', 'Salam', 'Salwa', "Al-Bida'a", 'Anjafa',
      'Hawalli', 'Hitteen', 'Mishrif', 'Mubarak Al-Abdullah', 'Salmiya', 'Shaab',
      'Shuhada', 'Al-Siddiq', 'Ministries Area', 'Zahra'
    ]
  },
  {
    name: 'Mubarak Al-Kabeer',
    nameAr: 'مبارك الكبير',
    areas: [
      'Abu Al Hasaniya', 'Abu Ftaira', 'Al-Adan', 'Al Qurain', 'Al-Qusour',
      'Al-Fnaitees', 'Messila', 'Al-Masayel', 'Mubarak Al-Kabeer', 'Sabah Al-Salem',
      'Subhan Industrial', 'Wista', 'West Abu Ftaira Herafiya'
    ]
  },
  {
    name: 'Ahmadi',
    nameAr: 'الأحمدي',
    areas: [
      'Abu Halifa', 'Mina Abdulla', 'Ahmadi', 'Ali Sabah Al-Salem', 'Egaila',
      'Bar Al-Ahmadi', 'Bnaider', 'Dhaher', 'Fahaheel', 'Fahad Al-Ahmad', 'Hadiya',
      'Jaber Al-Ali', "Al-Julaia'a", 'Khairan', 'Mahboula', 'Mangaf', 'Magwa',
      'Wafra Residential', 'Al-Nuwaiseeb', 'Riqqa', 'Sabah Al Ahmad',
      'Sabah Al Ahmad Sea City', 'Sabahiya', 'Shuaiba Industrial', 'South Sabahiya',
      'Wafra', 'Zoor', 'Fintas', 'Al Shadadiya Industrial'
    ]
  },
  {
    name: 'Farwaniya',
    nameAr: 'الفروانية',
    areas: [
      'Abdullah Al-Mubarak', 'Airport District', 'Andalus', 'Ardiya', 'Ardiya Herafiya',
      'Ishbiliya', 'Al-Dajeej', 'Farwaniya', 'Ferdous', 'Jleeb Al-Shuyoukh', 'Khaitan',
      'Omariya', 'Rabiya', 'Al-Rai', 'Al-Riggai', 'Rehab', 'Sabah Al-Nasser',
      'Sabah Al-Salem University', 'West Abdullah Al-Mubarak', 'South Abdullah Al-Mubarak',
      'Sulaibiya Industrial'
    ]
  },
  {
    name: 'Jahra',
    nameAr: 'الجهراء',
    areas: [
      'Abdali', 'Al-Mutlaa', 'Kazma', 'Bahra', 'Kabd', 'Al-Sheqaya', 'Al-Nahda',
      'Amghara Industrial', 'Bar Al-Jahra', 'Jahra', 'Jahra Industrial Herafiya',
      'Naeem', 'Nasseem', 'Oyoun', 'Qasr', 'Jaber Al-Ahmad', 'Saad Al Abdullah',
      'Salmi', 'Subiya', 'Sulaibiya', 'Sulaibiya Agricultural Area',
      'Sulaibiya Residential', 'Taima', 'Waha', 'Bubiyan Island', 'Warbah Island'
    ]
  }
];

export const NATIONALITIES: string[] = [
  'Kuwaiti', 'Saudi', 'Bahraini', 'Emirati', 'Qatari', 'Omani', 'Egyptian', 'Syrian',
  'Jordanian', 'Lebanese', 'Palestinian', 'Iraqi', 'Yemeni', 'Sudanese', 'Indian',
  'Pakistani', 'Bangladeshi', 'Sri Lankan', 'Nepali', 'Filipino', 'Indonesian',
  'Iranian', 'Turkish', 'British', 'American', 'Canadian', 'French', 'German', 'Other'
];

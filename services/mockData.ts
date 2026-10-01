import { DestinationGuide, CommunityTripTemplate, AccommodationOption, Trip, ActivityType } from '../types';

export const CURATED_DESTINATIONS: DestinationGuide[] = [
  {
    id: 'goa',
    name: 'Goa',
    country: 'India',
    tagline: 'Sun-drenched beaches, Portuguese villas & bohemian sunsets',
    overview: 'Goa is India\'s coastal sanctuary, blending centuries of Portuguese architecture with tranquil palm-fringed sands, vibrant culinary spice farms, and buzzing nightlife.',
    bestTimeToVisit: 'November to February (Pleasant winter breezes, 22°C - 31°C)',
    avgBudgetMin: 25000,
    avgBudgetMax: 60000,
    currency: '₹',
    howToReach: 'Direct flights to Dabolim (GOI) or Manohar International Airport Mopa (GOX). Connected via Konkan Railway.',
    category: 'Beach',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    popularAreas: ['Anjuna & Vagator', 'Fontainhas (Latin Quarter)', 'Palolem Beach', 'Morjim', 'Candolim'],
    topExperiences: ['Sunset kayak at Palolem', 'Heritage walk through Fontainhas', 'Feni & seafood pairing at spice plantations', 'Dudhsagar Waterfalls trek'],
    coordinates: { lat: 15.2993, lng: 74.1240 }
  },
  {
    id: 'japan',
    name: 'Tokyo & Kyoto',
    country: 'Japan',
    tagline: 'Futuristic skylines meet ancient Zen shrines & Michelin ramen',
    overview: 'A breathtaking juxtaposition of cybernetic metropolis and timeless cultural reverence. From Shibuya Crossing to Kyoto\'s serene Arashiyama bamboo forest.',
    bestTimeToVisit: 'March to May (Sakura cherry blossoms) or October to November (Autumn foliage)',
    avgBudgetMin: 140000,
    avgBudgetMax: 260000,
    currency: '₹',
    howToReach: 'Direct flights to Tokyo Haneda (HND) or Narita (NRT). Shinkansen bullet train connects Tokyo to Kyoto in 2h 15m.',
    category: 'Culture',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    popularAreas: ['Shibuya & Shinjuku', 'Gion & Higashiyama', 'Akihabara', 'Asakusa', 'Arashiyama'],
    topExperiences: ['Early morning Senso-ji temple stroll', 'Shibuya Sky observation deck at dusk', 'Traditional tea ceremony in Gion', 'Kaiseki multi-course dining'],
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    tagline: 'Emerald rice terraces, spiritual water temples & surf breaks',
    overview: 'The Island of the Gods offers an intoxicating mix of spiritual rituals, jungle pool villas in Ubud, world-class cafe culture, and stunning Indian Ocean cliffs.',
    bestTimeToVisit: 'April to October (Dry season, low humidity, ideal for surfing)',
    avgBudgetMin: 65000,
    avgBudgetMax: 130000,
    currency: '₹',
    howToReach: 'Direct/one-stop flights to Denpasar Ngurah Rai International Airport (DPS).',
    category: 'Trending',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    popularAreas: ['Ubud Cultural Heart', 'Canggu & Seminyak', 'Uluwatu Cliffs', 'Nusa Penida'],
    topExperiences: ['Tegallalang rice terrace sunrise', 'Uluwatu Kecak fire dance on cliffside', 'Snorkel with manta rays at Nusa Penida', 'Waterfall hike at Tukad Cepung'],
    coordinates: { lat: -8.4095, lng: 115.1889 }
  },
  {
    id: 'swiss-alps',
    name: 'Swiss Alps',
    country: 'Switzerland',
    tagline: 'Panoramic peak railways, glacier lakes & alpine chalets',
    overview: 'Majestic peaks, crystalline lakes, cogwheel trains climbing above the clouds, and world-class fondue. Experience Zermatt, Interlaken, and the Lauterbrunnen valley.',
    bestTimeToVisit: 'June to September for alpine hiking; December to March for snow sports',
    avgBudgetMin: 180000,
    avgBudgetMax: 350000,
    currency: '₹',
    howToReach: 'Fly to Zurich (ZRH) or Geneva (GVA). Swiss Travel Pass gives seamless rail access across the country.',
    category: 'Mountains',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    popularAreas: ['Zermatt (Matterhorn)', 'Lauterbrunnen Valley', 'Interlaken & Grindelwald', 'Lucerne'],
    topExperiences: ['Jungfraujoch Top of Europe rail journey', 'Scenic boat cruise on Lake Brienz', 'First Cliff Walk in Grindelwald', 'Alpine cheese fondue dinner'],
    coordinates: { lat: 46.5590, lng: 7.9854 }
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    tagline: 'Haussmannian boulevards, art sanctuaries & artisanal patisseries',
    overview: 'The City of Light captivates with art from the Louvre to Musée d\'Orsay, intimate corner bistros, illuminated bridges on the Seine, and timeless architectural grace.',
    bestTimeToVisit: 'April to June and September to November for temperate walking weather',
    avgBudgetMin: 130000,
    avgBudgetMax: 240000,
    currency: '₹',
    howToReach: 'Direct flights to Paris Charles de Gaulle (CDG) or Orly (ORY). Comprehensive Metro transit network.',
    category: 'Luxury',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    popularAreas: ['Le Marais', 'Montmartre', 'Saint-Germain-des-Prés', '7th Arrondissement (Eiffel)'],
    topExperiences: ['Sunset Seine river cruise', 'Pastry crawl through Le Marais', 'Private gallery tour at Musée d\'Orsay', 'Picnic at Jardin du Luxembourg'],
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: 'rajasthan',
    name: 'Jaipur & Udaipur',
    country: 'India',
    tagline: 'Royal palaces, shimmering lakes & vibrant heritage bazaars',
    overview: 'The Land of Kings showcases marble courtyards, opulent hilltop forts, candlelit lake palace dinners, and colorful textile markets.',
    bestTimeToVisit: 'October to March (Crisp desert days and cool evenings)',
    avgBudgetMin: 30000,
    avgBudgetMax: 75000,
    currency: '₹',
    howToReach: 'Fly to Jaipur (JAI) or Udaipur (UDR). Vande Bharat train connects from Delhi and major hubs.',
    category: 'Culture',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    popularAreas: ['Old Pink City (Jaipur)', 'Lake Pichola (Udaipur)', 'Amer Fort', 'Fateh Sagar'],
    topExperiences: ['Sunrise hot air balloon over Amer Fort', 'Private sunset boat ride on Lake Pichola', 'Blue pottery workshop in Jaipur', 'Royal thali dinner at Jagmandir Palace'],
    coordinates: { lat: 26.9124, lng: 75.7873 }
  }
];

export const CURATED_ACCOMMODATIONS: Record<string, AccommodationOption[]> = {
  japan: [
    {
      id: 'acc_jp_1',
      name: 'The Tokyo Edition Toranomon',
      destination: 'Tokyo, Japan',
      type: 'Hotel',
      pricePerNight: 28500,
      currency: '₹',
      rating: 4.9,
      reviewsCount: 420,
      location: 'Toranomon, Minato City, Tokyo',
      coordinates: { lat: 35.6675, lng: 139.7460 },
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      amenities: ['Sky Garden Terrace', 'Tokyo Tower View', 'Michelin Chef Dining', 'Spa & Pool'],
      cancellation: 'Free cancellation up to 48 hours prior'
    },
    {
      id: 'acc_jp_2',
      name: 'Sowaka Ryokan Kyoto',
      destination: 'Kyoto, Japan',
      type: 'Resort',
      pricePerNight: 19800,
      currency: '₹',
      rating: 4.8,
      reviewsCount: 310,
      location: 'Gion, Higashiyama, Kyoto',
      coordinates: { lat: 34.9984, lng: 135.7770 },
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      amenities: ['Private Hinoki Bath', 'Zen Garden Courtyard', 'Kaiseki Breakfast', 'Tea Master Experience'],
      cancellation: 'Free cancellation up to 7 days prior'
    },
    {
      id: 'acc_jp_3',
      name: 'Nishi-Shinjuku Boutique Loft',
      destination: 'Tokyo, Japan',
      type: 'Apartment',
      pricePerNight: 8500,
      currency: '₹',
      rating: 4.7,
      reviewsCount: 195,
      location: 'Nishi-Shinjuku, Tokyo',
      coordinates: { lat: 35.6938, lng: 139.6975 },
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      amenities: ['High-Speed Fiber WiFi', 'Modern Kitchen', 'Washer/Dryer', 'Self Check-in'],
      cancellation: 'Free cancellation up to 24 hours prior'
    }
  ],
  goa: [
    {
      id: 'acc_goa_1',
      name: 'W Goa Villa Resort',
      destination: 'Goa, India',
      type: 'Resort',
      pricePerNight: 16500,
      currency: '₹',
      rating: 4.8,
      reviewsCount: 580,
      location: 'Vagator Beach, North Goa',
      coordinates: { lat: 15.5996, lng: 73.7370 },
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      amenities: ['Private Beach Access', 'Rock Pool Bar', 'Ayurvedic Spa', 'Sunset Cabanas'],
      cancellation: 'Free cancellation up to 3 days prior'
    },
    {
      id: 'acc_goa_2',
      name: 'Casa Palacio Siolim (Heritage 1675)',
      destination: 'Goa, India',
      type: 'Villa',
      pricePerNight: 9800,
      currency: '₹',
      rating: 4.9,
      reviewsCount: 240,
      location: 'Siolim, North Goa',
      coordinates: { lat: 15.6268, lng: 73.7712 },
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      amenities: ['Portuguese Architecture', 'Garden Pool', 'Chef Curated Breakfast', 'Antique Suites'],
      cancellation: 'Free cancellation up to 48 hours prior'
    }
  ],
  bali: [
    {
      id: 'acc_bali_1',
      name: 'Kamandalu Ubud Jungle Sanctuary',
      destination: 'Bali, Indonesia',
      type: 'Resort',
      pricePerNight: 14200,
      currency: '₹',
      rating: 4.9,
      reviewsCount: 710,
      location: 'Petulu, Ubud, Bali',
      coordinates: { lat: -8.4901, lng: 115.2755 },
      imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
      amenities: ['Infinity Jungle Pool', 'Floating Breakfast', 'Petanu River Spa', 'Yoga Shala'],
      cancellation: 'Free cancellation up to 5 days prior'
    }
  ]
};

export const INITIAL_COMMUNITY_TEMPLATES: CommunityTripTemplate[] = [
  {
    id: 'tmpl_japan_8d',
    title: 'Tokyo & Kyoto: Shrines, Shibuya & Michelin Secrets',
    destination: 'Tokyo & Kyoto',
    country: 'Japan',
    duration: 8,
    citiesCount: 2,
    estimatedBudget: 148500,
    currency: '₹',
    activitiesCount: 16,
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Archi Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    likes: 342,
    tags: ['Culture', 'Food', 'Photography', 'Bullet Train'],
    tripData: {
      id: 'trip_demo_japan',
      userId: 'usr_community_1',
      title: 'Tokyo & Kyoto: Shrines & Neon Lights',
      destination: 'Tokyo & Kyoto, Japan',
      destinationCoords: { lat: 35.6762, lng: 139.6503 },
      startDate: '2026-10-12',
      endDate: '2026-10-20',
      duration: 8,
      travelers: 2,
      travelStyle: 'Culture & Food Exploration',
      totalBudget: 160000,
      currency: '₹',
      coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      isPublic: true,
      likesCount: 342,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itinerary: {
        destination: 'Tokyo & Kyoto, Japan',
        destinationCoords: { lat: 35.6762, lng: 139.6503 },
        totalBudget: 160000,
        duration: 8,
        currency: '₹',
        grandTotal: 142500,
        remainingBudget: 17500,
        weather: {
          temperature: '19°C',
          condition: 'Sunny & Clear',
          forecast: 'Crisp autumn weather, ideal for temple exploration'
        },
        days: [
          {
            day: 1,
            title: 'Arrival & Shibuya Crossing Spectacle',
            dailyTotal: 14200,
            accommodationCost: 11000,
            activities: [
              {
                id: 'act_jp_1',
                name: 'Shibuya Crossing & Hachiko Statue',
                description: 'Experience the world-renowned pedestrian crossing with 360-degree neon billboards and bustling energy.',
                timeSlot: 'Afternoon',
                cost: 0,
                location: 'Shibuya, Tokyo',
                activityType: ActivityType.CULTURAL,
                coordinates: { lat: 35.6595, lng: 139.7005 },
                estimatedDuration: '1.5 hours',
                aiInsights: 'Visit the 2nd floor Tsutaya Starbucks for panoramic elevated views of the crossing.',
                bestVisitingTime: '4:30 PM - 6:00 PM for golden hour lighting',
                localTips: ['Cross diagonally for the classic perspective', 'Check out the underground Shibuya food halls for matcha snacks']
              },
              {
                id: 'act_jp_2',
                name: 'Shibuya Sky Observation Deck',
                description: 'Open-air 360-degree rooftop deck with unobstructed sunset vistas over Mt. Fuji and Tokyo cityscape.',
                timeSlot: 'Evening',
                cost: 1600,
                location: 'Scramble Square, Shibuya',
                activityType: ActivityType.ADVENTURE,
                coordinates: { lat: 35.6585, lng: 139.7025 },
                estimatedDuration: '2 hours',
                aiInsights: 'Book 30 days in advance for sunset slots; lockers are strictly required for bags.',
                bestVisitingTime: '5:45 PM for sunset into twilight skyline transition'
              },
              {
                id: 'act_jp_3',
                name: 'Omoide Yokocho Yakitori Alley',
                description: 'Historic post-war lantern-lit alleyway packed with intimate stalls grilling charcoal yakitori skewers.',
                timeSlot: 'Evening',
                cost: 1600,
                location: 'Shinjuku, Tokyo',
                activityType: ActivityType.FOOD,
                coordinates: { lat: 35.6931, lng: 139.6999 },
                estimatedDuration: '1.5 hours'
              }
            ]
          },
          {
            day: 2,
            title: 'Historic Asakusa & Akihabara Tech District',
            dailyTotal: 13500,
            accommodationCost: 11000,
            activities: [
              {
                id: 'act_jp_4',
                name: 'Sensō-ji Temple & Nakamise Dori',
                description: 'Tokyo\'s oldest Buddhist temple founded in 645 AD, entered via the iconic giant red Kaminarimon lantern.',
                timeSlot: 'Morning',
                cost: 0,
                location: 'Asakusa, Tokyo',
                activityType: ActivityType.CULTURAL,
                coordinates: { lat: 35.7148, lng: 139.7967 },
                estimatedDuration: '2.5 hours',
                aiInsights: 'Arrive before 8:30 AM to beat the tourist rush and enjoy quiet photography.'
              },
              {
                id: 'act_jp_5',
                name: 'Akihabara Electric Town & Retro Arcades',
                description: 'The world\'s epicentre for technology, retro gaming, anime figurines, and multi-story arcade centers.',
                timeSlot: 'Afternoon',
                cost: 1200,
                location: 'Akihabara, Tokyo',
                activityType: ActivityType.ADVENTURE,
                coordinates: { lat: 35.6983, lng: 139.7731 }
              },
              {
                id: 'act_jp_6',
                name: 'Ramen Street Tasting at Tokyo Station',
                description: 'Gathering of Japan\'s premier ramen shops, featuring rich Tsukemen dipping noodles with slow-cooked broth.',
                timeSlot: 'Evening',
                cost: 1300,
                location: 'Tokyo Station B1',
                activityType: ActivityType.FOOD,
                coordinates: { lat: 35.6812, lng: 139.7671 }
              }
            ]
          }
        ]
      },
      members: [
        { id: 'usr_1', name: 'Archi Vance', email: 'archi@voyageagent.ai', role: 'owner' },
        { id: 'usr_2', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'editor' }
      ],
      bookings: [
        {
          id: 'bk_1',
          tripId: 'trip_demo_japan',
          type: 'hotel',
          title: 'The Tokyo Edition Toranomon',
          provider: 'Marriott Bonvoy',
          bookingRef: 'TYO-8841-MB',
          confirmationCode: 'ED-9921',
          date: '2026-10-12',
          endDate: '2026-10-16',
          location: 'Toranomon, Tokyo',
          cost: 44000,
          currency: '₹',
          status: 'confirmed',
          notes: 'High floor Tokyo Tower view requested. Includes breakfast.'
        },
        {
          id: 'bk_2',
          tripId: 'trip_demo_japan',
          type: 'flight',
          title: 'Air India AI 306 (DEL → HND)',
          provider: 'Air India',
          bookingRef: 'AI-DELHND-748',
          confirmationCode: 'TK8912',
          date: '2026-10-12',
          time: '01:15 → 12:45',
          location: 'Indira Gandhi T3 → Haneda T3',
          cost: 38500,
          currency: '₹',
          status: 'confirmed'
        }
      ],
      transports: [
        {
          id: 'tr_1',
          tripId: 'trip_demo_japan',
          type: 'flight',
          from: 'Delhi (DEL)',
          to: 'Tokyo Haneda (HND)',
          departureTime: '12 Oct, 01:15',
          arrivalTime: '12 Oct, 12:45',
          carrier: 'Air India AI 306',
          seatOrClass: 'Economy 24A / 24B',
          cost: 38500,
          currency: '₹',
          bookingRef: 'AI-DELHND-748'
        },
        {
          id: 'tr_2',
          tripId: 'trip_demo_japan',
          type: 'train',
          from: 'Tokyo Station',
          to: 'Kyoto Station',
          departureTime: '16 Oct, 09:30',
          arrivalTime: '16 Oct, 11:45',
          carrier: 'Tokaido Shinkansen (Nozomi 23)',
          seatOrClass: 'Reserved Car 7, 12D/E (Mt. Fuji View side)',
          cost: 7800,
          currency: '₹',
          bookingRef: 'JR-SHIN-4402'
        }
      ],
      expenses: [
        {
          id: 'exp_1',
          tripId: 'trip_demo_japan',
          category: 'Accommodation',
          amount: 44000,
          currency: '₹',
          description: 'Tokyo Edition Hotel 4 Nights',
          date: '2026-10-12',
          paidBy: 'Archi Vance',
          splitBetween: ['Archi Vance', 'Rahul Sharma'],
          isSettled: false
        },
        {
          id: 'exp_2',
          tripId: 'trip_demo_japan',
          category: 'Transport',
          amount: 15600,
          currency: '₹',
          description: 'Shinkansen Bullet Train Tickets (2x)',
          date: '2026-10-13',
          paidBy: 'Rahul Sharma',
          splitBetween: ['Archi Vance', 'Rahul Sharma'],
          isSettled: false
        },
        {
          id: 'exp_3',
          tripId: 'trip_demo_japan',
          category: 'Food',
          amount: 3200,
          currency: '₹',
          description: 'Omoide Yokocho Yakitori Feast & Drinks',
          date: '2026-10-12',
          paidBy: 'Archi Vance',
          splitBetween: ['Archi Vance', 'Rahul Sharma'],
          isSettled: false
        }
      ],
      packingList: [
        { id: 'pk_1', tripId: 'trip_demo_japan', category: 'Documents', name: 'Passport with at least 6 months validity', isPacked: true },
        { id: 'pk_2', tripId: 'trip_demo_japan', category: 'Documents', name: 'Japan eVisa PDF or printout', isPacked: true },
        { id: 'pk_3', tripId: 'trip_demo_japan', category: 'Electronics', name: 'Type A plug adapter for Japan', isPacked: true },
        { id: 'pk_4', tripId: 'trip_demo_japan', category: 'Electronics', name: '20,000mAh Power bank', isPacked: false },
        { id: 'pk_5', tripId: 'trip_demo_japan', category: 'Clothing', name: 'Slip-on comfortable walking shoes (20k+ daily steps)', isPacked: true },
        { id: 'pk_6', tripId: 'trip_demo_japan', category: 'Clothing', name: 'Light layerable jacket for evening breeze', isPacked: false },
        { id: 'pk_7', tripId: 'trip_demo_japan', category: 'Medicine', name: 'Personal medication and blister bandages', isPacked: false }
      ],
      documents: [
        {
          id: 'doc_1',
          tripId: 'trip_demo_japan',
          title: 'Japan eVisa Confirmation',
          type: 'Visa',
          fileName: 'Japan_eVisa_Vance_Oct2026.pdf',
          uploadedAt: '2026-09-20',
          expiryDate: '2027-01-15',
          notes: 'Single entry tourist visa valid for 90 days.'
        },
        {
          id: 'doc_2',
          tripId: 'trip_demo_japan',
          title: 'Tokyo Edition Hotel Voucher',
          type: 'Hotel Voucher',
          fileName: 'Tokyo_Edition_Voucher.pdf',
          uploadedAt: '2026-09-25',
          linkedDay: 1
        }
      ],
      journalEntries: [
        {
          id: 'jnl_1',
          tripId: 'trip_demo_japan',
          dayNumber: 1,
          date: '12 Oct 2026',
          title: 'Touching down into the Neon Metropolis',
          content: 'Standing in the middle of Shibuya Crossing at 5 PM as the rain started to mist over the giant digital screens was completely surreal. We grabbed hot canned coffee from a streetside vending machine and walked through the back alleys of Nonbei Yokocho.',
          location: 'Shibuya, Tokyo',
          photos: [
            'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
          ],
          isPublic: true,
          createdAt: '2026-10-12T18:30:00Z'
        }
      ],
      polls: [
        {
          id: 'poll_1',
          tripId: 'trip_demo_japan',
          day: 3,
          question: 'What should we do on our Kyoto free afternoon?',
          isClosed: false,
          options: [
            {
              id: 'opt_1',
              name: 'Arashiyama Bamboo Forest & Monkey Park',
              description: 'Walk through towering stalks and meet snow monkeys overlooking Kyoto.',
              location: 'Arashiyama',
              cost: 800,
              votes: ['Archi Vance', 'Rahul Sharma']
            },
            {
              id: 'opt_2',
              name: 'Fushimi Inari 1,000 Torii Gates Sunset Hike',
              description: 'Hike up Mount Inari through winding vermillion gates at dusk.',
              location: 'Fushimi Inari',
              cost: 0,
              votes: ['Archi Vance']
            }
          ]
        }
      ]
    }
  },
  {
    id: 'tmpl_goa_4d',
    title: 'Weekend in Goa: Coastline & Portuguese Heritage',
    destination: 'Goa',
    country: 'India',
    duration: 4,
    citiesCount: 2,
    estimatedBudget: 35000,
    currency: '₹',
    activitiesCount: 10,
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    author: {
      name: 'Priya Nambiar',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    },
    likes: 218,
    tags: ['Beach', 'Heritage', 'Seafood', 'Road Trip'],
    tripData: {
      id: 'trip_demo_goa',
      userId: 'usr_community_2',
      title: 'Goa: Coastal Sun & Latin Quarters',
      destination: 'Goa, India',
      destinationCoords: { lat: 15.2993, lng: 74.1240 },
      startDate: '2026-11-05',
      endDate: '2026-11-09',
      duration: 4,
      travelers: 2,
      travelStyle: 'Relaxation & Culinary Road Trip',
      totalBudget: 45000,
      currency: '₹',
      coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      isPublic: true,
      likesCount: 218,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itinerary: {
        destination: 'Goa, India',
        destinationCoords: { lat: 15.2993, lng: 74.1240 },
        totalBudget: 45000,
        duration: 4,
        currency: '₹',
        grandTotal: 34500,
        remainingBudget: 10500,
        weather: {
          temperature: '28°C',
          condition: 'Sunny & Coastal Breeze',
          forecast: 'Perfect beach weather with warm ocean waters'
        },
        days: [
          {
            day: 1,
            title: 'Latin Quarter Stroll & Mandovi Sunset',
            dailyTotal: 7800,
            accommodationCost: 6500,
            activities: [
              {
                id: 'act_goa_1',
                name: 'Fontainhas Heritage Walking Tour',
                description: 'Explore pastel yellow, blue, and terracotta Portuguese colonial homes and azulejos ceramic tiles.',
                timeSlot: 'Morning',
                cost: 500,
                location: 'Panjim, Goa',
                activityType: ActivityType.CULTURAL,
                coordinates: { lat: 15.4989, lng: 73.8278 }
              },
              {
                id: 'act_goa_2',
                name: 'Viva Panjim Authentic Goan Cuisine',
                description: 'Tuck into fresh Goan prawn curry with red rice, poi bread, and house-made bebinca dessert.',
                timeSlot: 'Afternoon',
                cost: 800,
                location: 'Fontainhas',
                activityType: ActivityType.FOOD,
                coordinates: { lat: 15.4975, lng: 73.8282 }
              }
            ]
          }
        ]
      },
      members: [{ id: 'usr_priya', name: 'Priya Nambiar', email: 'priya@example.com', role: 'owner' }],
      bookings: [],
      transports: [],
      expenses: [],
      packingList: [
        { id: 'pk_g1', tripId: 'trip_demo_goa', category: 'Clothing', name: 'Linen shirts & beachwear', isPacked: true },
        { id: 'pk_g2', tripId: 'trip_demo_goa', category: 'Toiletries', name: 'Reef-safe SPF 50 sunscreen', isPacked: true }
      ],
      documents: [],
      journalEntries: [],
      polls: []
    }
  }
];

export const records = [
  {
    id: 1, title: 'Kind of Blue', artist: 'Miles Davis', genre: 'Jazz',
    year: 1959, price: 48, stock: 'in', condition: 'NM',
    label: 'Columbia Records', format: 'LP, 33 1/3 rpm', pressing: '1980 US reissue',
    description: 'The best-selling jazz album of all time. Davis assembled a sextet featuring Coltrane, Adderley, Evans, Kelly, Chambers, and Cobb. Recorded in two sessions with minimal rehearsal, giving the album its famously unhurried, meditative quality.',
    reason: 'Recommended because you bought another jazz album.',
  },
  {
    id: 2, title: 'Innervisions', artist: 'Stevie Wonder', genre: 'Soul',
    year: 1973, price: 32, stock: 'in', condition: 'VG+',
    label: 'Tamla', format: 'LP, 33 1/3 rpm', pressing: '1973 US original',
    description: 'A landmark of 1970s soul, Innervisions showcases Wonder at the peak of his creative powers. Lush synthesizers and deeply personal lyrics made this album a cultural touchstone.',
    reason: 'Recommended because it matches records in your wishlist.',
  },
  {
    id: 3, title: 'Blue', artist: 'Joni Mitchell', genre: 'Folk',
    year: 1971, price: 55, stock: 'low', condition: 'NM',
    label: 'Reprise Records', format: 'LP, 33 1/3 rpm', pressing: '1971 US original',
    description: 'Widely considered one of the greatest albums ever made. Mitchell\'s confessional songwriting and unconventional guitar tunings set a new standard for folk and singer-songwriter music.',
    reason: 'Recommended because it shares the same era as your recent views.',
  },
  {
    id: 4, title: 'Homework', artist: 'Daft Punk', genre: 'Electronic',
    year: 1997, price: 44, stock: 'out', condition: 'VG+',
    label: 'Virgin Records', format: 'LP, 33 1/3 rpm', pressing: '1997 EU original',
    description: 'The debut album that launched French house into the mainstream. Homework blends Chicago house, funk, and techno into an irresistibly danceable package.',
    reason: 'Recommended because you rated an electronic album 5 stars.',
  },
  {
    id: 5, title: 'Sketches of Spain', artist: 'Miles Davis', genre: 'Jazz',
    year: 1960, price: 62, stock: 'in', condition: 'NM',
    label: 'Columbia Records', format: 'LP, 33 1/3 rpm', pressing: '1960 US original',
    description: 'A bold collaboration between Miles Davis and arranger Gil Evans, blending jazz with Spanish classical music. One of the most ambitious records in either discography.',
    reason: 'Recommended because you bought another record by this artist.',
  },
  {
    id: 6, title: "What's Going On", artist: 'Marvin Gaye', genre: 'Soul',
    year: 1971, price: 38, stock: 'in', condition: 'VG+',
    label: 'Tamla', format: 'LP, 33 1/3 rpm', pressing: '1971 US original',
    description: 'A radical departure for Motown, this concept album addressed Vietnam, poverty, and ecological collapse with lush orchestral soul. A masterpiece of conscious music.',
    reason: 'Recommended because it shares the same genre and release era.',
  },
  {
    id: 7, title: 'Disintegration', artist: 'The Cure', genre: 'Rock',
    year: 1989, price: 50, stock: 'in', condition: 'NM',
    label: 'Fiction Records', format: 'LP, 33 1/3 rpm', pressing: '1989 UK original',
    description: 'The Cure\'s magnum opus. Eight minutes of "Plainsong" alone justify owning this on vinyl. Dense, atmospheric, and relentlessly beautiful.',
    reason: 'Recommended because it has similar tags and is in stock.',
  },
  {
    id: 8, title: 'A Love Supreme', artist: 'John Coltrane', genre: 'Jazz',
    year: 1965, price: 72, stock: 'in', condition: 'M',
    label: 'Impulse! Records', format: 'LP, 33 1/3 rpm', pressing: '1965 US original',
    description: "A spiritual suite in four parts, recorded in a single session in December 1964. Widely regarded as the pinnacle of Coltrane's art and one of the greatest jazz recordings ever.",
    reason: 'Recommended because you bought another record by Miles Davis.',
  },
  {
    id: 9, title: 'Songs in the Key of Life', artist: 'Stevie Wonder', genre: 'Soul',
    year: 1976, price: 42, stock: 'low', condition: 'VG+',
    label: 'Tamla', format: '2xLP + EP', pressing: '1976 US original',
    description: "A sprawling double album that captures Wonder at an almost supernatural creative peak. Two and a half years in the making, it rewards every minute of listening time.",
    reason: 'Recommended because it matches records in your wishlist.',
  },
  {
    id: 10, title: 'Dummy', artist: 'Portishead', genre: 'Electronic',
    year: 1994, price: 36, stock: 'in', condition: 'NM',
    label: 'Go! Discs', format: 'LP, 33 1/3 rpm', pressing: '1994 UK original',
    description: "The debut that defined trip-hop. Portishead's blend of hip-hop beats, cinematic samples, and Beth Gibbons's haunting vocals created a genre-defining record.",
    reason: 'Recommended because you rated an electronic album 5 stars.',
  },
  {
    id: 11, title: 'The Velvet Underground & Nico', artist: 'The Velvet Underground', genre: 'Rock',
    year: 1967, price: 88, stock: 'in', condition: 'VG',
    label: 'Verve Records', format: 'LP, 33 1/3 rpm', pressing: '1967 US original',
    description: 'Perhaps the most influential rock album ever made. Few people bought it on release, but those who did started bands. The banana cover alone is iconic.',
    reason: 'Recommended because it shares similar tags.',
  },
  {
    id: 12, title: 'Rumours', artist: 'Fleetwood Mac', genre: 'Rock',
    year: 1977, price: 34, stock: 'in', condition: 'VG+',
    label: 'Warner Bros.', format: 'LP, 33 1/3 rpm', pressing: '1977 US original',
    description: 'Recorded amid the collapse of multiple relationships within the band, Rumours channels personal turmoil into eleven perfect songs. One of the best-mastered albums in rock history.',
    reason: 'Recommended because it has similar tags and is in stock.',
  },
];

export const GENRES     = ['Jazz', 'Rock', 'Soul', 'Electronic', 'Classical', 'Folk', 'Hip-Hop', 'Blues'];
export const ERAS       = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s+'];
export const CONDITIONS = ['M', 'NM', 'VG+', 'VG', 'G'];

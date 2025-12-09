
import { Affiliation, Ethnicity, Ideology } from '../types';

// Names reflecting the 1950s Malayan context
const MALAY_GIVEN_NAMES_MALE = ['Ahmad', 'Ismail', 'Hassan', 'Ali', 'Rahman', 'Jamal', 'Idris', 'Osman', 'Yusof', 'Mahmud', 'Tunku', 'Razak', 'Hussein'];
const MALAY_GIVEN_NAMES_FEMALE = ['Siti', 'Fatima', 'Nur', 'Zainab', 'Aminah', 'Aishah', 'Halimah', 'Salmah', 'Rohani', 'Jamilah', 'Azizah'];

const CHINESE_SURNAMES = ['Tan', 'Lee', 'Wong', 'Lim', 'Chan', 'Ng', 'Goh', 'Ong', 'Teo', 'Yap', 'Lau', 'Wee', 'Chong', 'Low'];
const CHINESE_GIVEN_NAMES = ['Wei', 'Mei', 'Chen', 'Li', 'Jian', 'Ling', 'Hui', 'Jin', 'Ming', 'Xiao', 'Ah', 'Kim', 'Seng', 'Hock', 'Keong'];

const INDIAN_GIVEN_NAMES_MALE = ['Ravi', 'Kumar', 'Suresh', 'Rajesh', 'Mani', 'Arjun', 'Ganesh', 'Muthu', 'Raju', 'Sambanthan', 'Manickam'];
const INDIAN_GIVEN_NAMES_FEMALE = ['Priya', 'Anjali', 'Deepa', 'Lakshmi', 'Sita', 'Parvathi', 'Geetha', 'Kamala', 'Devi'];
const INDIAN_PATRONYMS = ['Krishnan', 'Singh', 'Pillai', 'Rao', 'Naidu', 'Murthy', 'Subramaniam', 'Ramasamy', 'Menon'];

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateCharacterName = (ethnicity: Ethnicity): string => {
  const isMale = Math.random() > 0.5;

  switch (ethnicity) {
    case 'Malay': {
      if (isMale) {
        const givenName = randomElement(MALAY_GIVEN_NAMES_MALE);
        const fatherName = randomElement(MALAY_GIVEN_NAMES_MALE.filter(n => n !== givenName));
        return `${givenName} bin ${fatherName}`;
      } else {
        const givenName = randomElement(MALAY_GIVEN_NAMES_FEMALE);
        const fatherName = randomElement(MALAY_GIVEN_NAMES_MALE);
        return `${givenName} binti ${fatherName}`;
      }
    }
    case 'Chinese': {
      const surname = randomElement(CHINESE_SURNAMES);
      const givenNamePart1 = randomElement(CHINESE_GIVEN_NAMES);
      // sometimes names are monosyllabic
      if (Math.random() > 0.7) {
        return `${surname} ${givenNamePart1}`;
      }
      const givenNamePart2 = randomElement(CHINESE_GIVEN_NAMES.filter(n => n !== givenNamePart1));
      return `${surname} ${givenNamePart1} ${givenNamePart2}`;
    }
    case 'Indian': {
      if (isMale) {
        const givenName = randomElement(INDIAN_GIVEN_NAMES_MALE);
        const fatherName = randomElement(INDIAN_PATRONYMS);
        return `${givenName} a/l ${fatherName}`;
      } else {
        const givenName = randomElement(INDIAN_GIVEN_NAMES_FEMALE);
        const fatherName = randomElement(INDIAN_PATRONYMS);
        return `${givenName} a/p ${fatherName}`;
      }
    }
    default:
      // Fallback for any other case
      return 'John Doe';
  }
};

// --- Party Name Generation ---

const MALAY_PREFIXES = ['Parti', 'Barisan', 'Angkatan', 'Gagasan', 'Perikatan', 'Kesatuan', 'Gerakan', 'Front', 'Ikatan'];
const ENGLISH_PREFIXES = ['United', 'National', 'Democratic', 'People\'s', 'Progressive', 'Social', 'Malayan', 'Federal', 'Independent'];

const MALAY_SUFFIXES = ['Bersatu', 'Rakyat', 'Kebangsaan', 'Se-Tanah Melayu', 'Se-Malaysia', 'Maju'];
const ENGLISH_SUFFIXES = ['Party', 'Front', 'Alliance', 'Union', 'Congress', 'League', 'Movement', 'Association'];

const IDEOLOGY_KEYWORDS = {
    socialist: {
        malay: ['Sosialis', 'Buruh', 'Pekerja', 'Rakyat', 'Marhaen'],
        english: ['Socialist', 'Labour', 'Workers', 'People\'s', 'Proletarian']
    },
    islamist: {
        malay: ['Islam', 'Muslimin', 'Ummah', 'Sejahtera', 'Hizbul'],
        english: ['Islamic', 'Muslim', 'Unity', 'Theocratic']
    },
    nationalist: {
        malay: ['Kebangsaan', 'Melayu', 'Bumiputera', 'Watan', 'Pribumi', 'Pusaka'],
        english: ['National', 'Patriotic', 'Indigenous', 'Heritage', 'Malay']
    },
    liberal: {
        malay: ['Demokratik', 'Keadilan', 'Bebas', 'Liberal', 'Harapan'],
        english: ['Democratic', 'Liberal', 'Justice', 'Freedom', 'Hope']
    },
    conservative: {
        malay: ['Konservatif', 'Tradisi', 'Setia', 'Warisan'],
        english: ['Conservative', 'Traditional', 'Heritage', 'Loyalist']
    },
    progressive: {
        malay: ['Maju', 'Progresif', 'Pembaharuan', 'Reformasi'],
        english: ['Progressive', 'Reform', 'Action', 'Forward']
    }
};

const getIdeologyKey = (ideology: Ideology, affiliationName?: string): keyof typeof IDEOLOGY_KEYWORDS => {
    if (affiliationName) {
        const lowerName = affiliationName.toLowerCase();
        if (lowerName.includes('islam')) return 'islamist';
        if (lowerName.includes('social') || lowerName.includes('labour')) return 'socialist';
        if (lowerName.includes('nat') || lowerName.includes('royal')) return 'nationalist';
    }
    
    if (ideology.economic < 30) return 'socialist';
    if (ideology.economic > 80) return 'conservative';
    if (ideology.governance > 80) return 'nationalist'; // High centralized often nationalist in this context
    if (ideology.governance < 40) return 'liberal';
    return 'progressive'; // default fallback
};

export const generatePartyName = (affiliation?: Affiliation): string => {
    const isMalayName = Math.random() > 0.4; // 60% chance for Malay name
    const ideologyKey = affiliation 
        ? getIdeologyKey(affiliation.ideology || { economic: 50, governance: 50 }, affiliation.name)
        : 'progressive';
    
    const keywords = IDEOLOGY_KEYWORDS[ideologyKey];
    const keyword = isMalayName ? randomElement(keywords.malay) : randomElement(keywords.english);
    
    if (isMalayName) {
        const prefix = randomElement(MALAY_PREFIXES);
        // Structure: [Prefix] [Keyword] [Optional Suffix] or [Prefix] [Ethnicity if applicable] [Keyword]
        const useSuffix = Math.random() > 0.6;
        const suffix = useSuffix ? randomElement(MALAY_SUFFIXES) : '';
        
        // e.g. "Parti Sosialis Rakyat"
        return `${prefix} ${keyword} ${suffix}`.trim();
    } else {
        const prefix = randomElement(ENGLISH_PREFIXES);
        const suffix = randomElement(ENGLISH_SUFFIXES);
        
        // e.g. "United Socialist Front"
        return `${prefix} ${keyword} ${suffix}`;
    }
};

export const generateAllianceName = (): string => {
    const isMalay = Math.random() > 0.5;
    if (isMalay) {
        const prefix = randomElement(['Gagasan', 'Pakatan', 'Barisan', 'Muafakat', 'Angkatan']);
        const suffix = randomElement(['Rakyat', 'Nasional', 'Harapan', 'Perpaduan', 'Sejahtera', 'Wawasan']);
        return `${prefix} ${suffix}`;
    } else {
        const prefix = randomElement(['National', 'Democratic', 'United', 'People\'s', 'Grand']);
        const suffix = randomElement(['Front', 'Coalition', 'Alliance', 'Pact', 'Bloc']);
        return `${prefix} ${suffix}`;
    }
}

export interface WorkChild {
  company: string;
  role: string;
  start: string;
  end: string;
}

export interface WorkRole {
  title: string;
  start: string;
  end: string;
}

export interface WorkEntry {
  company: string;
  role: string;
  start: string;
  end: string;
  logo?: string;
  monogram?: string;
  /** Background color for monogram tiles (brand color). */
  monogramBg?: string;
  note?: string;
  /** Role progression within the same company (rendered as a nested timeline). */
  roles?: WorkRole[];
  children?: WorkChild[];
}

// Most recent first. Multi-role stints collapsed to the most senior title.
export const work: WorkEntry[] = [
  {
    company: 'IntelligentNoise',
    role: 'Founder',
    start: '2025',
    end: 'Present',
    logo: '/logos/intelligentnoise-black.svg',
  },
  {
    company: 'University of Michigan · Ross',
    role: 'MBA, Artificial Intelligence',
    start: '2024',
    end: '2026',
    logo: '/logos/michigan.png',
    note: 'Zell Entrepreneur',
    children: [
      {
        company: 'Zell Lurie Commercialization Fund',
        role: 'VP of Education',
        start: '2024',
        end: '2026',
      },
    ],
  },
  {
    company: 'SS&C Intralinks',
    role: 'Senior Account Executive',
    start: '2020',
    end: '2024',
    logo: '/logos/ssc-intralinks.png',
    roles: [
      { title: 'Senior Account Executive', start: '2023', end: '2024' },
      { title: 'Account Executive', start: '2022', end: '2023' },
      { title: 'Account Executive, Inside Sales', start: '2021', end: '2022' },
      { title: 'Sales Associate', start: '2020', end: '2021' },
    ],
  },
  {
    company: 'Grant Thornton',
    role: 'Digital Transformation & Mgmt Associate',
    start: '2018',
    end: '2020',
    logo: '/logos/grant-thornton.png',
  },
];

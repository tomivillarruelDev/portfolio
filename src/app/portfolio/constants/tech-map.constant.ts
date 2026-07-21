export const TECH_MAP: Record<string, [string, string]> = {
  'Angular':    ['ic-ng',  'Ng'], 'angular':    ['ic-ng',  'Ng'],
  'TypeScript': ['ic-ts',  'TS'], 'typescript': ['ic-ts',  'TS'],
  'JavaScript': ['ic-js',  'JS'], 'javascript': ['ic-js',  'JS'],
  'Firebase':   ['ic-fb',  'FB'], 'firebase':   ['ic-fb',  'FB'],
  'Node.js':    ['ic-no',  'No'], 'nodejs':     ['ic-no',  'No'],
  'MongoDB':    ['ic-mo',  'Mo'], 'mongodb':    ['ic-mo',  'Mo'],
  'Docker':     ['ic-dk',  'Do'], 'docker':     ['ic-dk',  'Do'],
  'PostgreSQL': ['ic-pg',  'PG'], 'postgresql': ['ic-pg',  'PG'],
  'Git':        ['ic-git', 'Gi'], 'git':        ['ic-git', 'Gi'],
  'AWS':        ['ic-aws', 'AW'], 'aws':        ['ic-aws', 'AW'],
  'RxJS':       ['ic-ng',  'Rx'], 'Python':     ['ic-ng',  'Py'],
  'python':     ['ic-ng',  'Py'], 'React':      ['ic-ng',  'Re'],
  'HTML':       ['ic-ng',  'HT'], 'html':       ['ic-ng',  'HT'],
  'CSS':        ['ic-ng',  'CS'], 'css':        ['ic-ng',  'CS'],
  'Bootstrap':  ['ic-ng',  'Bs'], 'bootstrap':  ['ic-ng',  'Bs'],
  'Django':     ['ic-ng',  'Dj'], 'django':     ['ic-ng',  'Dj'],
};

export function getTechClass(tech: string): string {
  return TECH_MAP[tech]?.[0] ?? 'ic-ng';
}

export function getTechAbbr(tech: string): string {
  return TECH_MAP[tech]?.[1] ?? (tech ? tech.slice(0, 2).toUpperCase() : 'TC');
}

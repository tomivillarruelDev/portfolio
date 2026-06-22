export interface ProjectMetric {
  val: string;
  lab: string;
}

export interface Project {
  id: string;
  name: string;
  nameHtml?: string;
  description: string;
  tagline?: string;
  metrics?: ProjectMetric[];
  chipVals?: string[];
  technologies: string[];
  github: string;
  page?: string;
  photoURL?: string;
  photoURLs?: string[];
  order?: number;
}

/**
 * Interfaz que define la estructura de un proyecto en el portfolio
 */
export interface Project {
  /** Identificador único del proyecto (opcional en creación, requerido en actualización) */
  id?: string;
  /** Nombre del proyecto */
  name: string;
  /** Descripción detallada del proyecto */
  description: string;
  /** Array de tecnologías utilizadas en el proyecto */
  technologies: string[];
  /** URL del repositorio de GitHub */
  github: string;
  /** URL de la página web del proyecto (opcional) */
  page?: string;
  /** URL de la imagen del proyecto (opcional) */
  photoURL?: string;
  /** Número de orden para controlar la posición del proyecto en la lista (opcional) */
  order?: number;
}

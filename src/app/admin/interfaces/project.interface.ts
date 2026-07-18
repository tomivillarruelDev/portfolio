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
  /** Array de URLs de imágenes del proyecto para el carrusel (opcional) */
  photoURLs?: string[];
  /** URL del logo/ícono del proyecto (opcional — reemplaza el eyebrow en la vista destacada) */
  logoURL?: string;
  /** Si true, el logo ya incluye el nombre (wordmark) y se oculta el título de texto */
  logoIsWordmark?: boolean;
  /** Si true, muestra un phone mockup portrait en lugar del browser chrome */
  isMobileView?: boolean;
  /** URL del símbolo/marca del proyecto (opcional — aparece como badge flotante alrededor del browser) */
  iconURL?: string;
  /** Número de orden para controlar la posición del proyecto en la lista (opcional) */
  order?: number;
}

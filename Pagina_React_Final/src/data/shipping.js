// src/data/shipping.js
// Tabla de tarifas de envío simuladas por región de Chile.
// Los precios están en CLP y son estimaciones para el proyecto académico.
// En un proyecto real, estos valores vendrían de una API de courier.

// Lista de regiones con su tarifa de envío en CLP
export const REGIONES = [
  { codigo: 'RM',  nombre: 'Región Metropolitana',             tarifa: 2990 },
  { codigo: 'V',   nombre: 'Región de Valparaíso',             tarifa: 3990 },
  { codigo: 'VIII',nombre: 'Región del Biobío',                tarifa: 4990 },
  { codigo: 'IX',  nombre: 'Región de La Araucanía',           tarifa: 5490 },
  { codigo: 'VI',  nombre: "Región del Libertador O'Higgins",  tarifa: 4490 },
  { codigo: 'VII', nombre: 'Región del Maule',                 tarifa: 4790 },
  { codigo: 'XIV', nombre: 'Región de Los Ríos',               tarifa: 5990 },
  { codigo: 'X',   nombre: 'Región de Los Lagos',              tarifa: 6490 },
  { codigo: 'XI',  nombre: 'Región de Aysén',                  tarifa: 8990 },
  { codigo: 'XII', nombre: 'Región de Magallanes',             tarifa: 9990 },
  { codigo: 'XV',  nombre: 'Región de Arica y Parinacota',     tarifa: 6990 },
  { codigo: 'I',   nombre: 'Región de Tarapacá',               tarifa: 6990 },
  { codigo: 'II',  nombre: 'Región de Antofagasta',            tarifa: 7490 },
  { codigo: 'III', nombre: 'Región de Atacama',                tarifa: 5990 },
  { codigo: 'IV',  nombre: 'Región de Coquimbo',               tarifa: 4990 },
  { codigo: 'XIII',nombre: 'Región Metropolitana Sur',         tarifa: 2990 },
];

// Días estimados de entrega por región
export const DIAS_ENTREGA = {
  RM:    '1–2 días hábiles',
  XIII:  '1–2 días hábiles',
  V:     '2–3 días hábiles',
  VI:    '2–3 días hábiles',
  VII:   '3–4 días hábiles',
  VIII:  '3–4 días hábiles',
  IV:    '3–4 días hábiles',
  IX:    '4–5 días hábiles',
  XIV:   '4–5 días hábiles',
  III:   '4–5 días hábiles',
  X:     '5–6 días hábiles',
  XV:    '5–6 días hábiles',
  I:     '5–6 días hábiles',
  II:    '6–7 días hábiles',
  XI:    '7–10 días hábiles',
  XII:   '10–15 días hábiles',
};

// Umbrales de envío gratis (en CLP)
// Si el precio del producto supera este valor → envío gratis
export const UMBRAL_ENVIO_GRATIS = 300000;

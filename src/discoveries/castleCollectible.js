/**
 * Un hallazgo opcional adicional, con identidad propia — ni uno de los
 * seis hallazgos canónicos de `calendar/secretsData.js` (esos están
 * ligados a un expediente resuelto), ni un cromo de
 * `collectibles/cardsData.js` (esos tienen retrato e identidad de
 * personaje). Mismo contrato de forma que un secreto (`{ id, label,
 * body }`), para poder mostrarse en la misma lista ya existente
 * (`calendar/discoveriesView.createDiscoveryListMarkup`) sin
 * duplicar ese componente.
 */
export const CASTLE_COLLECTIBLE = {
  id: 'pluma-del-mapa',
  label: 'Una pluma que no pertenece a ningún ave',
  body:
    'Perdida entre los pliegues del pergamino del Mapa, encuentras una pluma larga y plateada, fría al tacto incluso lejos de cualquier corriente de aire. No es de ningún ave que reconozcas, ni de ningún animal, en realidad. Quien la perdió aquí, parece, tenía alas de otra clase.'
};

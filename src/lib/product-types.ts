import type { ProductType } from './types'

/**
 * The catalogue's shelves. Product items themselves live in Firestore and are
 * joined to a shelf either by `type` (exact match) or by `category`
 * (array-contains), which is what `mode` selects.
 */
export const productTypes: ProductType[] = [
  {
    id: 'hidrolatos',
    type: 'Hidrolatos - 120ml',
    typeLabel: 'Hidrolatos<br/><small>120ml</small>',
    description: `
      <p><b>Hidrolatos</b>, ou águas florais são também um produto do processo de destilação na extração dos óleos essenciais, onde o vapor d'água que atravessa a planta destilada arrasta também vários elementos da planta que, ao passarem ao estado líquido novamente, formam os hidrolatos. As embalagens padrão são de <b>120 ml</b>.</p>
      `,
    image: 'hidrolatos.jpg',
    mode: 'type',
    en: {
      label: 'Hydrosols<br/><small>120 ml</small>',
      description: `<p><b>Hydrosols</b>, also called floral waters, are the other product of the distillation that extracts essential oils. The steam that passes through the plant carries many of its components with it, and when it turns back into liquid it becomes the hydrosol. Our standard bottle holds <b>120 ml</b>.</p>`,
    },
  },
  {
    id: 'oleos-essenciais',
    type: 'Óleos essenciais',
    description: `
      <p>Os <b>óleos essenciais</b> são extratos naturais superconcentrados, extraídos principalmente por método de destilação a vapor ou por prensagem a frio das flores, plantas e frutas. Possuem propriedades terapêuticas e diversos benefícios para a saúde devido a sua alta concentração e, por isso, não devem ser usados puros diretamente na pele. Podem ser usados na aromaterapia em difusores pessoais, de ambiente e diluídos em óleos vegetais. São totalmente naturais, sem corantes e sem quaisquer aditivos químicos.</p>
      `,
    image: 'oleos-essenciais.jpg',
    mode: 'type',
    en: {
      label: 'Essential oils',
      description: `<p><b>Essential oils</b> are highly concentrated natural extracts, obtained mostly by steam distillation or cold pressing of flowers, plants and fruits. Their concentration gives them therapeutic properties and many benefits — and it is also why they should never be applied undiluted to the skin. Use them in aromatherapy, in personal or room diffusers, or diluted in a carrier oil. They are entirely natural, with no artificial colors and no chemical additives.</p>`,
    },
  },
  {
    id: 'diluicoes-oleos-essenciais',
    type: 'Diluições',
    description:
      '<p>As diluições de óleos essenciais são óleos vegetais (TCM) que servem para diluir os óleos essenciais, tornando-os seguros para uso na pele. São óleos vegetais puros, sem adição de conservantes ou corantes.</p><p>Nossas diluições são a 2% (duas gotas de óleo essencial para cada 5ml de diluição).</p>',
    image: 'diluicoes-oleos-essenciais.jpg',
    mode: 'type',
    en: {
      label: 'Dilutions',
      description: `<p>Our dilutions are a carrier oil (MCT) blended with essential oil, which makes the essential oil safe to use on the skin. Pure vegetable oils, with no preservatives or artificial colors.</p><p>All our dilutions are at 2% (two drops of essential oil for every 5 ml).</p>`,
    },
  },
  {
    id: 'sabonetes',
    type: 'Sabonetes artesanais',
    description: `<p>Óleos vegetais e óleos essenciais.</p>
      <p>Ao invés de água, usamos hidrolatos na confecção dos nossos sabonetes. Hidrolatos orgânicos destilados na chácara da Morada (melaleuca, lavanda, immortelle e os demais que destilamos)!</p>`,
    image: 'sabonetes.jpg',
    mode: 'type',
    en: {
      label: 'Handmade soaps',
      description: `<p>Vegetable oils and essential oils.</p>
      <p>Instead of water, we make our soaps with hydrosols — organic hydrosols distilled at the Morada farm (tea tree, lavender, immortelle and the others we distill)!</p>`,
    },
  },
  {
    id: 'sabonetes-argila',
    type: 'Sabonetes de argila',
    description: `<p>Com os tradicionais óleos vegetais já conhecidos por todos, porém sem os óleos essenciais.</p>
      <p>Uma linha apenas com o aroma dos óleos vegetais, predominando o aroma do azeite de oliva extra-virgem.</p>
      <p>Essa linha vem trazer a propriedade das argilas naturais. Enriquecidos com as argilas verde, vermelha, roxa, amarela, branca e preta.</p>`,
    image: 'sabonetes-argila.jpg',
    mode: 'type',
    en: {
      label: 'Clay soaps',
      description: `<p>Made with the classic vegetable oils, but without essential oils.</p>
      <p>A line scented only by the oils themselves, led by the aroma of extra-virgin olive oil.</p>
      <p>What this line brings is the goodness of natural clays: green, red, purple, yellow, white and black.</p>`,
    },
  },
  {
    id: 'sabonetes-manteiga',
    type: 'Sabonetes de manteiga',
    description: `<p>Feitos com azeite de oliva extra virgem, cada sabonete é cuidadosamente elaborado para proporcionar uma experiência única de cuidado com a pele.</p>
      <p>Ao invés de água, usamos hidrolatos na confecção dos nossos sabonetes. Hidrolatos orgânicos destilados na chácara da Morada (melaleuca, lavanda, immortelle e os demais que destilamos)!</p>`,
    image: 'sabonetes-manteiga.jpg',
    mode: 'type',
    en: {
      label: 'Butter soaps',
      description: `<p>Made with extra-virgin olive oil, each soap is carefully crafted for a truly special skincare moment.</p>
      <p>Instead of water, we make our soaps with hydrosols — organic hydrosols distilled at the Morada farm (tea tree, lavender, immortelle and the others we distill)!</p>`,
    },
  },
  {
    id: 'hidrolatos-1l',
    type: 'Hidrolatos - 1 litro',
    typeLabel: 'Hidrolatos<br/><small>1 litro</small>',
    description: `
      <p><b>Hidrolatos</b>, ou águas florais são também um produto do processo de destilação na extração dos óleos essenciais, onde o vapor d'água que atravessa a planta destilada arrasta também vários elementos da planta que, ao passarem ao estado líquido novamente, formam os hidrolatos.</p>
      `,
    image: 'hidrolatos-1l.jpg',
    mode: 'type',
    en: {
      label: 'Hydrosols<br/><small>1 liter</small>',
      description: `<p><b>Hydrosols</b>, also called floral waters, are the other product of the distillation that extracts essential oils. The steam that passes through the plant carries many of its components with it, and when it turns back into liquid it becomes the hydrosol.</p>`,
    },
  },
  {
    id: 'sais',
    type: 'Sais de banho',
    description:
      '<p>O uso de sais de banho e escalda-pés são muito relaxantes e terapêuticos. Ao deixar seus pés de molho numa água morna com sal, você vai sentir o alívio do estresse do dia a dia e das tensões acumuladas.</p><p>Aliando o aroma e o poder terapêutico dos óleos essenciais a esses sais, você verá os efeitos tranquilizantes ainda mais potencializados e ainda vai aproveitar das propriedades específicas que cada planta tem a oferecer.</p>',
    image: 'sais.jpg',
    mode: 'type',
    en: {
      label: 'Bath salts',
      description: `<p>Bath salts and foot soaks are deeply relaxing and therapeutic. Rest your feet in warm, salted water and feel the stress of the day and the tension you carry start to ease.</p><p>Paired with the aroma and therapeutic power of essential oils, the calming effect grows even stronger — and you also enjoy the particular properties each plant has to offer.</p>`,
    },
  },
  {
    id: 'sprays',
    type: 'Sprays',
    description:
      '<p>Produtos feitos à base de óleos essenciais e álcool de cereais. Livre de essências sintéticas.</p>',
    image: 'sprays.jpg',
    mode: 'type',
    en: {
      label: 'Sprays',
      description: `<p>Made with essential oils and grain alcohol. No synthetic fragrances.</p>`,
    },
  },
  {
    id: 'sprays-topicos',
    type: 'Sprays tópicos',
    description: `<p>Sprays naturais para uso sobre a pele.</p>`,
    image: 'sprays-topicos.jpg',
    mode: 'type',
    en: {
      label: 'Topical sprays',
      description: `<p>Natural sprays for use on the skin.</p>`,
    },
  },
  {
    id: 'pomadas',
    type: 'Pomadas',
    description:
      '<p>Pomadas de uso tópico confeccionadas com óleos vegetais e óleos essenciais. Livre de conservantes.</p>',
    image: 'pomadas.jpg',
    mode: 'type',
    en: {
      label: 'Balms',
      description: `<p>Balms for topical use, made with vegetable oils and essential oils. No preservatives.</p>`,
    },
  },
  {
    id: 'colonias',
    type: 'Colonias',
    typeLabel: 'Águas de Colônia',
    description:
      '<p>Produtos feitos à base de óleos essenciais e álcool de cereais. Livre de essências sintéticas.</p>',
    image: 'colonias.jpg',
    mode: 'type',
    en: {
      label: 'Eaux de Cologne',
      description: `<p>Made with essential oils and grain alcohol. No synthetic fragrances.</p>`,
    },
  },
  {
    id: 'tinturas',
    type: 'Tinturas',
    typeLabel: 'Tinturas',
    description: `<p>Tinturas são extratos alcoólicos de substâncias naturais, como ervas ou princípios ativos de plantas medicinais. Elas são preparadas pela dissolução dessas substâncias em um veículo alcoólico, sendo uma forma comum de apresentação farmacêutica. O álcool é usado para extrair os compostos desejados, tornando as tinturas uma opção eficaz para o uso medicinal.</p>
      <hr/>
      <p>Todas as tinturas Gota de Cura são produtos artesanais feitos com plantas e ingredientes selecionados que visam manter as propriedades particulares que cada planta tem a oferecer.</p>
      <p>Podem ser usadas como complemento a tratamentos, mas sempre com a orientação e supervisão de um fitoterapeuta ou profissional qualificado.</p>

      <p>Sugestão segura para uso: diluição de 10 gotas da tintura em um copo (cerca de 300ml) de água para consumo ao longo do dia.</p>
      <p>PARA TRATAMENTOS ESPECÍFICOS PROCURE UM PROFISSIONAL QUALIFICADO.</p>`,
    image: 'tinturas.jpg',
    mode: 'type',
    en: {
      label: 'Tinctures',
      description: `<p>Tinctures are alcohol extracts of natural substances, such as herbs or the active compounds of medicinal plants. They are made by dissolving those substances in alcohol, a common way of preparing herbal remedies: the alcohol draws out the desired compounds, which makes tinctures an effective option for medicinal use.</p>
      <hr/>
      <p>Every Gota de Cura tincture is handmade from carefully chosen plants and ingredients, to keep the particular properties each plant has to offer.</p>
      <p>They can complement a treatment, but always under the guidance and supervision of a herbalist or other qualified professional.</p>

      <p>A safe suggestion for use: dilute 10 drops of tincture in a glass of water (about 300 ml) and drink it over the course of the day.</p>
      <p>FOR SPECIFIC TREATMENTS, CONSULT A QUALIFIED PROFESSIONAL.</p>`,
    },
  },
  /*{
    id: 'acessorios',
    type: 'Acessórios',
    description: '',
    image: 'acessorios.jpg',
    mode: 'type',
  },
  {
    id: 'vales',
    type: 'Vales',
    typeLabel: 'Vale-Presente',
    description:
      '<p>Que tal dar um vale-presente para alguém querido?</p><p>Os vales podem ser usados pelo site ou na nossa loja física.</p>',
    image: 'vales.jpg',
    mode: 'type',
  },*/
  {
    id: 'amazonia',
    type: 'Cantinho da Amazônia',
    typeLabel: 'Cantinho da Amazônia',
    featured: true,
    description: `<p>Um espaço dedicado à sabedoria, à força e ao encanto da floresta.</p>
        <p>Aqui, reunimos produtos cuidadosamente selecionados que carregam a essência das plantas amazônicas — feitos com respeito às pessoas, aos territórios e à natureza que os inspira.</p>
        <p>Hidrolatos, óleos essenciais, tinturas e sabonetes que trazem a vibração do breu branco, cumaru, copaíba, pau rosa, açaí e outras preciosidades da mata.</p>
        <p>Mais do que aromas, são expressões vivas de cura, ancestralidade e presença. Uma conexão profunda com a floresta — no toque, no cheiro, no cuidado.</p>`,
    image: 'amazonia.jpg',
    mode: 'category',
    areaBackground: '/images/background-amazonia.jpg',
    en: {
      label: 'Amazon Corner',
      description: `<p>A space devoted to the wisdom, strength and enchantment of the rainforest.</p>
        <p>Here we gather carefully chosen products that carry the essence of Amazonian plants — made with respect for the people, the lands and the nature that inspire them.</p>
        <p>Hydrosols, essential oils, tinctures and soaps that bring the energy of breu branco, cumaru, copaíba, rosewood, açaí and other treasures of the forest.</p>
        <p>More than aromas, they are living expressions of healing, ancestry and presence. A deep connection with the forest — in touch, in scent, in care.</p>`,
    },
  },
  {
    id: 'mtc',
    type: 'Medicina Tradicional Chinesa',
    typeLabel: 'Medicina Tradicional Chinesa',
    featured: true,
    description: `<p>A Medicina Tradicional Chinesa (MTC) é um sistema terapêutico milenar que busca o equilíbrio energético do corpo (Qi) através de uma abordagem holística. Utiliza técnicas como acupuntura, fitoterapia, ventosaterapia, dietoterapia e massagem Tui-Na para tratar desarmonias, focando na prevenção e no tratamento de dores, estresse e doenças crônicas.</p>`,
    image: 'mtc.jpg',
    seal: 'https://firebasestorage.googleapis.com/v0/b/gota-de-luz.appspot.com/o/products%2Fseals%2Fseal-new.png?alt=media&token=9ad4fc11-08a0-43a9-b350-b20b57dbac92',
    areaBackground: '/images/background-china.jpg',
    mode: 'type',
    en: {
      label: 'Traditional Chinese Medicine',
      description: `<p>Traditional Chinese Medicine (TCM) is an ancient therapeutic system that seeks the energetic balance of the body (Qi) through a holistic approach. It draws on techniques such as acupuncture, herbal medicine, cupping, diet therapy and Tui Na massage to treat imbalances, focusing on prevention and on relieving pain, stress and chronic illness.</p>`,
    },
  },
  {
    id: 'gotinha',
    type: 'Gotinha de Cura',
    typeLabel: 'Gotinha de Cura',
    featured: true,
    description: `<p>Uma linha feita com carinho para os pequenos: bebês e crianças pequenas.</p>
        <p>Reunimos aqui produtos suaves e seguros, pensados para acompanhar aqueles momentos de afeto e cuidado — o banho, a massagem, a hora de acalmar e de dormir.</p>
        <p>Fórmulas delicadas, com ingredientes naturais cuidadosamente escolhidos para a pele sensível e o bem-estar das crianças.</p>`,
    image: 'gotinha.jpg',
    mode: 'category',
    areaBackground: '/images/background-gotinha.jpg',
    en: {
      label: 'Gotinha de Cura',
      description: `<p>A line made with love for the little ones: babies and young children.</p>
        <p>Gentle, safe products designed for those moments of affection and care — bath time, massage, settling down and bedtime.</p>
        <p>Delicate formulas with natural ingredients chosen with care for sensitive skin and children's well-being.</p>`,
    },
  },
]

export const getProductType = (id: string) => productTypes.find((t) => t.id === id)

/** Category labels carry a <br/> and a <small> for the two hydrosol sizes. */
export const plainLabel = (raw: string) =>
  raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * The shelf as a visitor in `locale` sees it. Only the words change: `type`
 * stays the Portuguese name, because that is the key products are filed under
 * in Firestore.
 */
export const localizeProductType = (type: ProductType, locale: string): ProductType =>
  locale === 'en' && type.en
    ? { ...type, typeLabel: type.en.label, description: type.en.description }
    : type

/** Plain display name of a shelf, e.g. "Hidrolatos 120ml" or "Hydrosols 120 ml". */
export const shelfName = (type: ProductType, locale: string): string => {
  const localized = localizeProductType(type, locale)
  return plainLabel(localized.typeLabel ?? localized.type)
}

/**
 * Cart lines, orders and Firestore products only hold the shelf's Portuguese
 * `type`. This turns it back into the visitor's language, and echoes it as is
 * when it names no current shelf (legacy values such as "Vales").
 */
export const typeDisplayName = (type: string, locale: string): string => {
  const shelf = productTypes.find((candidate) => candidate.type === type)
  return shelf ? shelfName(shelf, locale) : type
}

export const productTypeIds = () => productTypes.map((t) => ({ type: t.id }))

/**
 * Gallery photos, in display order. Each one is `/images/visit/<id>.jpg`, and
 * its alt text — which doubles as the lightbox caption — is the `visitPhotos.<id>`
 * message, so it reads in the visitor's language.
 */
export const visitPhotos = [
  'photo-01',
  'photo-13',
  'photo-23',
  'photo-09',
  'photo-20',
  'photo-03',
  'photo-06',
  'photo-18',
  'photo-16',
  'photo-26',
  'photo-10',
  'photo-15',
  'photo-21',
  'photo-05',
  'photo-14',
  'photo-24',
  'photo-02',
  'photo-25',
  'photo-22',
  'photo-27',
  'photo-12',
  'photo-04',
  'photo-07',
  'photo-08',
  'photo-17',
  'photo-11',
  'photo-19',
].map((id) => ({ id, src: `/images/visit/${id}.jpg` }))

/**
 * Quoted as the visitors wrote them, so they stay in Portuguese in every
 * language; only the date around them is formatted per locale.
 */
export const visitTestimonies = [
  {
    name: 'Simone Cruvinel Hoffmann de Almeida',
    visitedOn: '2022-10-15',
    text: 'A visita na Chácara é uma forma de ter uma manhã muito diferente e com vivências ímpares nos mais amplos sentidos: faz bem aos olhos, aos ouvidos, ao coração, ou seja, beneficia corpo e espírito! O café da manhã é um momento especial, com alimentos que nutrem muito além do corpo, de tanto carinho que tem ao ser preparado. A destilação é outro ponto forte, no qual podemos acompanhar processos de transformação que calam fundo nos sentimentos e nos traz benefícios dos mais variados. É um tipo de passeio que recomendo muito não só a aromaterapeutas mas também a pessoas que adoram a natureza e estar em ambientes saudáveis e especiais!',
  },
  {
    name: 'Eveline Miachon',
    visitedOn: '2022-10-15',
    text: 'Participar da vivência na destilação de plantas para extração de hidrolato e óleo essencial contribui imensamente no aprendizado da Aromaterapia. Ficamos diante da planta, seu local e cuidados para um bom desenvolvimento, suas propriedades de cura física e sutil. Com isto torna-se mais fácil a memorização ao mesmo tempo em que somos expostos à essência, vamos nos curando. Além de todo o acolhimento amoroso pela equipe de tarefeiros que não medem esforços por nos proporcionar uma rica experiência. Só tenho a agradecer.',
  },
  {
    name: 'Flavia Pereira Bueno',
    visitedOn: '2022-10-15',
    text: 'A visita guiada na chácara da Mãe Luzia foi uma experiência muito agradável, o grupo foi recebido com um delicioso café da manhã, preparado com muito carinho, e depois passamos a ouvir os relatos sobre as plantas e as destilações e a conhecer todo o processo, o que foi surpreendente e me deixou muito inspirada a saber mais. E em cada cantinho tinha o cuidado das pessoas que nos recepcionaram, todos e todas muito simpáticos e acolhedores! Por fim, ainda um lanchinho e a oportunidade de levar com você um pouquinho da chácara, através de produtos incríveis! Recomendo fortemente essa experiência para o corpo e a alma. Minha gratidão imensa!',
  },
]

/** The morning's schedule; time, title and text are `visitProgram.<key>` messages. */
export const visitProgram = ['breakfast', 'distillation', 'walk', 'closing'] as const

import { useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import Layout from '../../components/Layout'
import { Cromatografia, CromatografiaType } from 'interfaces/cromatografias'
import { CromatografiasService } from 'services/CromatografiasService'

const PURPLE = '#4c3b82'
const PURPLE_BG = '#faf9fd'
const PURPLE_BORDER = '#d8d2ee'
const PURPLE_MUTED = '#6b6480'
const TEAL = '#1e7a8a'
const TEAL_BG = '#eaf6f8'
const TEAL_BORDER = '#b0dce4'

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Page = styled.main`
  padding-top: 72px;
  min-height: 100vh;
  background: ${PURPLE_BG};
`

const Intro = styled.section`
  max-width: 960px;
  margin: 0 auto;
  padding: 52px 24px 44px;

  h1 {
    font-size: clamp(1.75rem, 4vw, 2.375rem);
    font-weight: 700;
    color: ${PURPLE};
    letter-spacing: -0.025em;
    margin: 0 0 16px;
    text-wrap: balance;
  }

  p {
    font-size: 1rem;
    line-height: 1.75;
    color: #3a3450;
    margin: 0 0 12px;
    max-width: 58ch;
  }
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${PURPLE_BORDER};
  margin: 28px 0 0;
`

const Groups = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 56px;
`

const GroupWrap = styled.section``

const GroupHeader = styled.div<{ $variant: CromatografiaType }>`
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ $variant }) =>
    $variant === 'oleo-essencial' ? PURPLE_BORDER : TEAL_BORDER};

  h2 {
    font-size: clamp(1.125rem, 2.5vw, 1.5rem);
    font-weight: 700;
    letter-spacing: -0.015em;
    color: #1a1628;
    margin: 0;
    text-wrap: balance;
  }
`

const TypeBadge = styled.span<{ $variant: CromatografiaType }>`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
  ${({ $variant }) =>
    $variant === 'oleo-essencial'
      ? css`
          background: #ede8f8;
          color: ${PURPLE};
        `
      : css`
          background: ${TEAL_BG};
          color: ${TEAL};
        `}
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
`

const Card = styled.a<{ $index: number }>`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fff;
  border: 1px solid ${PURPLE_BORDER};
  border-radius: 10px;
  text-decoration: none !important;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  animation: ${fadeUp} 0.35s ease both;
  animation-delay: ${({ $index }) => Math.min($index * 50, 300)}ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &:hover {
    border-color: ${PURPLE};
    box-shadow: 0 6px 20px rgba(76, 59, 130, 0.1);
    transform: translateY(-3px);
    text-decoration: none !important;
  }

  .card-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1a1628;
    line-height: 1.4;
    margin-bottom: 5px;
  }

  .card-sci {
    font-size: 0.8125rem;
    font-style: italic;
    color: ${PURPLE_MUTED};
    line-height: 1.4;
    flex: 1;
  }

  .card-cta {
    margin-top: 18px;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${PURPLE};
    display: inline-flex;
    align-items: center;
    gap: 5px;

    .arrow {
      transition: transform 0.15s ease;
      display: flex;
      align-items: center;
    }
  }

  &:hover .arrow {
    transform: translateX(3px);
  }
`

const Empty = styled.p`
  text-align: center;
  color: ${PURPLE_MUTED};
  padding: 40px 0;
  font-size: 0.9375rem;
`

const GROUPS: { type: CromatografiaType; label: string }[] = [
  { type: 'oleo-essencial', label: 'Óleos Essenciais' },
  { type: 'hidrolato', label: 'Hidrolatos' },
]

const Cromatografias = () => {
  const [items, setItems] = useState<Cromatografia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    CromatografiasService.getAll()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const handleClick = (item: Cromatografia) => {
    CromatografiasService.incrementViewCount(item.id)
  }

  return (
    <Layout title={process.env.NEXT_PUBLIC_COMPANY_NAME}>
      <Page>
        <Intro>
          <h1>Cromatografias</h1>
          <p>
            Cromatografia é uma técnica laboratorial que separa e identifica os
            componentes de uma mistura. Usamos esse processo para comprovar a
            pureza e a composição dos nossos óleos essenciais e hidrolatos
            destilados na Chácara da Mãe Luzia.
          </p>
          <p>
            Clique em qualquer planta para acessar o laudo completo em PDF.
          </p>
          <Divider />
        </Intro>

        {loading ? (
          <Empty>Carregando...</Empty>
        ) : items.length === 0 ? (
          <Empty>Nenhuma cromatografia cadastrada ainda.</Empty>
        ) : (
          <Groups>
            {GROUPS.map(({ type, label }) => {
              const group = items.filter((item) => item.type === type)
              if (group.length === 0) return null
              return (
                <GroupWrap key={type}>
                  <GroupHeader $variant={type}>
                    <h2>{label}</h2>
                    <TypeBadge $variant={type}>
                      {group.length} {group.length === 1 ? 'laudo' : 'laudos'}
                    </TypeBadge>
                  </GroupHeader>

                  <Grid>
                    {group.map((item, idx) => (
                      <Card
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        $index={idx}
                        onClick={() => handleClick(item)}
                      >
                        <span className="card-name">{item.name}</span>
                        <span className="card-sci">{item.scientificName}</span>
                        <span className="card-cta">
                          Ver laudo
                          <span className="arrow">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </span>
                        </span>
                      </Card>
                    ))}
                  </Grid>
                </GroupWrap>
              )
            })}
          </Groups>
        )}
      </Page>
    </Layout>
  )
}

export default Cromatografias

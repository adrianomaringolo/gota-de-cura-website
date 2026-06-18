import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useGetLoggedUser } from 'services/hooks/useGetLoggedUser'
import { UsersService } from 'services/UsersService'

type Props = {
  children?: ReactNode
  title?: string
}

const AdminLayout = ({
  title = `Admin - ${process.env.NEXT_PUBLIC_COMPANY_NAME}`,
  children,
}: Props) => {
  const router = useRouter()
  const [user, setUser] = useState<any>()

  const { isAdmin } = useGetLoggedUser()

  useEffect(() => {
    try {
      const userLS = localStorage.getItem(UsersService.LOGGED_USER_KEY)
        ? JSON.parse(localStorage.getItem(UsersService.LOGGED_USER_KEY) || '')
        : undefined

      if (!userLS) {
        router.push('/admin/login')
      } else {
        setUser(userLS)
      }
    } catch (error) {
      localStorage.clear()
      router.push('/admin/login')
    }
  }, [])

  const logout = () => {
    localStorage.removeItem(UsersService.LOGGED_USER_KEY)
    router.push('/admin/login')
  }

  return (
    <div style={{ position: 'relative' }}>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content={`Administração ${process.env.REACT_APP_COMPANY_NAME}`}
        />
        <meta name="og:title" content={title} />
        <meta name="twitter:card" content="summary_large_image" />

        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"
        ></link>

        <link rel="stylesheet" href="/css/bulma.checkbox.min.css" />
      </Head>

      <div>
        <Toaster />
      </div>

      {user && (
        <nav
          className="navbar has-background-light print-none"
          role="navigation"
          aria-label="main navigation"
        >
          <div
            id="navbarBasicExample"
            className="navbar-brand is-flex is-justify-content-space-between"
            style={{ width: '100%' }}
          >
            <div className="flex flex-wrap">
              <Link href="/admin/pedidos">
                <a className="navbar-item font-bold">Pedidos</a>
              </Link>
              <Link href="/admin/produtos">
                <a className="navbar-item font-bold">Produtos</a>
              </Link>
              {isAdmin && (
                <>
                  <Link href="/admin/gerenciamento">
                    <a className="navbar-item font-bold">Gerenciamento</a>
                  </Link>
                  <Link href="/admin/visitas">
                    <a className="navbar-item font-bold">Visitas</a>
                  </Link>
                  <Link href="/admin/cupons">
                    <a className="navbar-item font-bold">Cupons</a>
                  </Link>
                  <Link href="/admin/cromatografias">
                    <a className="navbar-item font-bold">Cromatografias</a>
                  </Link>
                  <Link href="/admin/relatorios">
                    <a className="navbar-item font-bold">Relatórios</a>
                  </Link>
                </>
              )}
            </div>

            <div className="navbar-end">
              <div className="navbar-item">
                <p className="mr-3 hidden md:block">{user?.name}</p>
                <div className="buttons">
                  <a className="button is-danger" onClick={logout}>
                    Sair
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      <section className="section">
        <div className="container">{children}</div>
      </section>
    </div>
  )
}

export default AdminLayout

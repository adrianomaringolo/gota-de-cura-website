import emailjs from '@emailjs/browser'
import { VISIT_PRICES } from '@/lib/constants'
import { formatVisitDate } from '@/lib/format'
import type { EnrollmentData } from '@/lib/types'

const EMAIL_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_nbvmzkk'
const EMAIL_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'gota-de-cura-email'
const EMAIL_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'nkdbOud2NdTKI7vBK'

type TemplateParams = {
  title: string
  html_message: string
  mail_list: string
  bcc_mail_list?: string
}

const send = (params: TemplateParams) =>
  emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, params, EMAIL_PUBLIC_KEY)

export const EmailSender = {
  sendNewOrderEmail(orderNumber: number, clientName: string, mailList: string[]) {
    return send({
      title: `🟣 Novo pedido no site: #${orderNumber}`,
      html_message: `<p style="font-size: 20px">Novo pedido (#${orderNumber}) feito no Gota de Cura de&nbsp;<strong>${clientName}</strong>.</p>
      <hr>
      <p>Acesse a área de pedidos do Painel de Administrador do site Gota de Cura para ver os pedidos.
      <a style="color: #4c3b82" href="https://gotadecura.com.br/admin/pedidos" target="_blank" rel="noopener">https://gotadecura.com.br/admin/pedidos</a></p>`,
      mail_list: mailList.join(','),
    })
  },

  sendNewEnrollmentEmail(
    visitDate: string,
    enrollment: EnrollmentData,
    mailList: string[],
  ) {
    return send({
      title: `🌟 Inscrição para visitação de ${enrollment.name}`,
      html_message: `<p style="font-size: 20px;margin-bottom: 20px;font-weight: bold">Nova inscrição para visitação realizada pelo site!</p>

      <p><b>Data</b>: ${formatVisitDate(visitDate)}</p>
      <p><b>Nome</b>: ${enrollment.name}</p>
      <p><b>Celular</b>: ${enrollment.cellphone}</p>
      <p><b>Email</b>: ${enrollment.email}</p>
      <p><b>Acompanhantes</b>: ${(enrollment.companions ?? []).join(', ') || '—'}</p>
      <p><b>Última visita</b>: ${enrollment.lastVisit || '—'}</p>

      <hr/>
      Para acessar as informações acesse <a href="https://www.gotadecura.com.br/admin/visitas">gotadecura.com.br/admin/visitas</a>`,
      mail_list: mailList.join(','),
    })
  },

  sendEnrollmentGreetingEmail(visitorName: string, mailList: string[]) {
    return send({
      title: `🪻 ${visitorName}, sua inscrição foi realizada`,
      html_message: `
      <div style="font-size: 18px">
      <p style="font-weight:bold;font-size:22px">${visitorName}, agradecemos pela sua inscrição! 🎉</p>
      <p>Ficaremos muito felizes em te receber na Chácara da Mãe Luzia e sua presença vai perfumar ainda mais nossos canteiros!</p>
      <p style="font-weight: bold">Em breve, um de nossos voluntários vai entrar em contato com você para acertar os detalhes!</p>
      <p>Até lá, se quiser ver mais sobre a visitação, ver fotos e depoimentos de quem já foi, acesse nossa página: <a href="https://www.gotadecura.com.br/visitas">gotadecura.com.br/visitas</a> e nos acompanhe pelo <a href="https://www.instagram.com/gotadecura_artesanais/">Instagram</a>!</p>
      <p style="background-color: #fbffc0; padding: 20px; border-radius: 20px; font-size: 14px; margin-top: 50px; font-style: italic; text-align: left">
      <b>Importante:</b><br/><br/>
      ⚠️ A programação se inicia pontualmente às 8h, com encerramento às 12h.<br/><br/>
      ⚠️ O deslocamento é por conta de cada um. Após fecharmos o grupo, passaremos mais detalhes e orientações.<br/><br/>
      ⚠️ O valor é de ${VISIT_PRICES.ADULT} por pessoa acima de 15 anos / ${VISIT_PRICES.CHILD} por pessoa de 8 a 14 anos / ${VISIT_PRICES.FREE} até 7 anos.</p>
      <hr/>
      <div style="font-size: 14px; text-align: left">
        <h4>Informativos sobre o pagamento:</h4>
        <p>
          ⚠️ O pagamento será combinado com a equipe Gota de Cura. A garantia da vaga
          se dá após a confirmação e o pagamento da taxa.
        </p>

        <p><b>Sobre desistência e reembolso:</b></p>
        <p>
          ⚠️ Até 14 dias antes do evento: reembolso de <b>50% do valor</b> através de
          transferência bancária.
        </p>

        <p>
          ⚠️ Até 7 dias antes do evento: reembolso de <b>50% do valor</b> através de
          vale-presente para compra de produtos pelo site ou loja (frete não incluso).
        </p>

        <p>
          ⚠️ Com menos de 7 dias para o evento:
          <u> não haverá reembolso, nem reserva de vaga para eventos futuros, nem troca
            por produtos.</u>
        </p>
      </div>
      <p style="margin-top: 50px">Atenciosamente,<br/>Equipe Gota de Cura</p></div>`,
      mail_list: mailList.join(','),
    })
  },

  sendVisitThankEmail(visitorName: string, visitorEmail: string, bccList: string) {
    return send({
      title: `${visitorName}, agradecemos a sua visita 💖`,
      html_message: `
      <div style="max-width: 500px; margin: 0 auto">
        <div style="color: #333; font-size: 15px">
          <p style="font-size: 18px"><b>${visitorName}</b>,</p>
          <p>
            Sua presença na visita à Chácara da Mãe Luzia deixou o nosso dia mais feliz. Ter a
            sua companhia explorando conosco os encantos e os aromas do nosso santuário de
            plantas aromáticas foi um grande prazer!
          </p>
          <p>
            Cada grupo que recebemos enche nossos corações de calor e inspiração, reafirmando o
            propósito que nos motiva a cada dia.
          </p>
          <p>
            Na Chácara da Mãe Luzia, não cultivamos apenas plantas, cultivamos sonhos, cuidado e
            respeito pela Mãe Natureza. Cada broto que nasce na chácara é um testemunho da
            presença de Deus em nossas vidas e do nosso compromisso com a responsabilidade
            social, a sustentabilidade e a qualidade dos nossos produtos.
          </p>
          <p>
            Nossa jornada na busca pela excelência em produtos de aromaterapia tem como alicerce
            os valores: qualidade, inovação e transparência em nossos processos. Valores que
            você pode conferir nessa visita tão especial.
          </p>
          <p>
            Cada produto adquirido se transforma na fatia de pão para nossos irmãos em
            necessidade!
          </p>
          <p>
            Esperamos que sua visita tenha sido enriquecedora e que tenha sentido em cada brisa
            que sopra entre as plantações o carinho com que cuidamos desse espaço, uma
            verdadeira farmácia a céu aberto.
          </p>
          <p>
            Lembre-se sempre do nosso convite para retornar e continuar compartilhando conosco essa
            jornada de descobertas e conexões com a natureza.
          </p>
          <p>
            Mais uma vez, agradecemos pela sua visita e por ser parte essencial do nosso
            universo aromático.
          </p>
          <p>
            Com os mais sinceros agradecimentos,<br />
            Equipe Gota de Cura
          </p>
        </div>
        <div style="background-color: #eee;border-radius: 10px;padding: 10px;color: #888;margin-bottom: 25px;font-size: 14px;">
          <p style="font-size: 18px">Veja mais:</p>
          <p>
            📷 Veja as fotos da visita:
            <a href="https://photos.app.goo.gl/aWe9xYmrsTMo22sp9" target="_blank">Visita Chácara Mãe Luzia</a>
          </p>
          <p>
            💬 Deixe um depoimento sobre sua experiência:
            <a href="https://forms.gle/oJxGeuXHJWgv37tW6" target="_blank">Clique aqui</a>
          </p>
        </div>
      </div>`,
      mail_list: visitorEmail,
      bcc_mail_list: bccList,
    })
  },
}

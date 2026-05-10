
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '読み込み済み' : '未定義')

type AppointmentMailProps = {
  to: string
  employeeName: string
  userName: string
  startsAt: string
  endsAt: string
  note?: string
}

export async function sendAppointmentConfirmedMail({
  to,
  employeeName,
  userName,
  startsAt,
  endsAt,
  note,
}: AppointmentMailProps) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)

  const dateStr = start.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })
  const timeStr =
    start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) +
    ' 〜 ' +
    end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

  await resend.emails.send({
    from: 'onboarding@resend.dev', // Resendで認証したドメインに変更
    to,
    subject: '予約が確定しました',
    html: `
      <p>${userName} 様</p>
      <p>以下の予約が確定しました。</p>
      <table>
        <tr><td>担当</td><td>${employeeName}</td></tr>
        <tr><td>日時</td><td>${dateStr}</td></tr>
        <tr><td>時間</td><td>${timeStr}</td></tr>
        ${note ? `<tr><td>備考</td><td>${note}</td></tr>` : ''}
      </table>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/appointments">予約一覧を確認する</a></p>
    `,
  })
}
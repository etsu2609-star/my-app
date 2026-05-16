import FooterHider from './_components/FooterHider'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden">
      <FooterHider />
      {children}
    </div>
  )
}
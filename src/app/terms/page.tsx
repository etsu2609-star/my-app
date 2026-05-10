export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-2">利用規約</h1>
      <p className="text-sm text-gray-400 mb-12">
        最終更新日：2026年4月27日
      </p>

      <div className="flex flex-col gap-12 text-sm leading-relaxed">

        {/* 第1条 */}
        <Section title="第1条　総則">
          <p>
            本規約は、Therapist Link Many Backs（以下「本サービス」）が提供するセラピスト検索・マッチングプラットフォームの利用に関する条件を定めるものです。会員登録をもって、本規約に同意いただいたものとみなします。
          </p>
        </Section>

        {/* 第2条 */}
        <Section title="第2条　会員制について">
          <p>本サービスは完全会員制です。初回ご利用の際は、入会金および下記の会員情報のご登録をお願いいたします。</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="font-medium mb-2">【必須登録項目】</p>
            <ul className="flex flex-col gap-1 text-gray-600">
              {['電話番号', 'お名前', '年齢', 'ご職業', '主なご利用エリア'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 第3条 */}
        <Section title="第3条　ご利用条件">
          <ul className="flex flex-col gap-3 text-gray-700">
            {[
              '18歳未満の方はご利用いただけません。',
              '当サービスでは医療法に基づく医療行為は一切提供しておりません。',
              '現在治療中の疾患・持病・施術をご遠慮いただきたい部位がございましたら、事前にセラピストへお申し付けください。',
              '強圧マッサージのご要望など一部の施術内容につきましては、セラピストの判断によりお断りする場合がございます。',
              'ご利用後の体調変化、またはセラピストとのトラブル・不祥事に関しまして、本サービスは一切の責任および返金対応を負いかねます。',
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 text-gray-400">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 第4条 */}
        <Section title="第4条　ご利用をお断りする場合">
          <p className="mb-4 text-gray-700">
            社会秩序および本サービスのルールを遵守いただけない方のご利用は固くお断りいたします。具体的には下記に該当する方が対象となります。
          </p>
          <div className="p-4 bg-gray-50 rounded-xl">
            <ul className="flex flex-col gap-2 text-gray-600">
              {[
                '暴力団・暴力団関係者またはそれに準ずる言動・行動をされる方',
                '性風俗的なサービスを求める方',
                '自慰行為をされる方',
                '泥酔状態の方',
                '同業者',
                '刺青のある方',
                '薬物使用者',
                'スカウト行為をされる方',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* 第5条 */}
        <Section title="第5条　撮影・盗撮の禁止">
          <p className="text-gray-700">
            カメラ・スマートフォン等による撮影・盗撮は厳禁です。該当する行為が確認された場合は即時施術を中止し、退店をお願いいたします。事後に発覚した場合は会員資格を剥奪のうえ、然るべき対処を講じます。
          </p>
        </Section>

        {/* 第6条 */}
        <Section title="第6条　無断キャンセル・不当キャンセルについて">
          <p className="text-gray-700">
            連絡なしのキャンセルまたは不当なキャンセルが発生した場合は、予約料金の全額をご請求するとともに、以後の本サービスのご利用をお断りいたします。
          </p>
        </Section>

        {/* 第7条（追加） */}
        <Section title="第7条　個人情報の取り扱い">
          <p className="text-gray-700">
            本サービスは、ご登録いただいた個人情報を、サービス提供・会員管理・連絡対応の目的にのみ使用します。法令に基づく場合を除き、第三者への提供は行いません。詳細はプライバシーポリシーをご確認ください。
          </p>
        </Section>

        {/* 第8条（追加） */}
        <Section title="第8条　禁止事項">
          <p className="mb-4 text-gray-700">会員は以下の行為を行ってはなりません。</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            {[
              '虚偽の情報による会員登録',
              '他の会員への迷惑行為・ハラスメント',
              'セラピストへの不当な要求・強要',
              '本サービスを通じた営業・勧誘活動',
              'サービスの運営を妨害する行為',
              '本規約に違反するその他の行為',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0 mt-2" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* 第9条（追加） */}
        <Section title="第9条　サービスの変更・停止">
          <p className="text-gray-700">
            本サービスは、システムメンテナンス・天災・その他やむを得ない事情により、予告なくサービスの全部または一部を変更・停止する場合があります。これにより生じた損害について、本サービスは責任を負いません。
          </p>
        </Section>

        {/* 第10条（追加） */}
        <Section title="第10条　規約の変更">
          <p className="text-gray-700">
            本サービスは、必要に応じて本規約を変更することがあります。変更後の規約はサービス上に掲載した時点で効力を生じ、会員はその内容に同意したものとみなします。
          </p>
        </Section>

        {/* 第11条（追加） */}
        <Section title="第11条　準拠法・管轄裁判所">
          <p className="text-gray-700">
            本規約は日本法に準拠します。本サービスに関する紛争については、札幌地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </Section>

        <p className="text-gray-400 text-xs pt-4 border-t">
          Therapist Link 運営事務局
        </p>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-base border-l-2 border-black pl-3">
        {title}
      </h2>
      {children}
    </section>
  )
}
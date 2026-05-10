type Props = {
  region: string
  age: string
  phone: string
  jobTitle: string
  email: string
  gender: string
  therapistYears: string
  showJobTitle: boolean
  showTherapistFields: boolean
  onChange: (field: string, value: string) => void
}

export default function ProfileFields({
  region, age, phone, jobTitle, email,
  gender, therapistYears,
  showJobTitle, showTherapistFields, onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-5">

      {/* メールアドレス（読み取り専用） */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">メールアドレス</label>
        <input
          type="email"
          value={email}
          disabled
          className="border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
        />
      </div>

      {/* 電話番号 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">
          電話番号 <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="090-1234-5678"
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      {/* 地域 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">
          サービスを利用する地域 <span className="text-red-400">*</span>
        </label>
        <select
          required
          value={region}
          onChange={(e) => onChange('region', e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 bg-white"
        >
          <option value="">選択してください</option>
          <optgroup label="札幌市">
            {[
              '札幌市中央区', '札幌市北区', '札幌市東区', '札幌市白石区',
              '札幌市厚別区', '札幌市豊平区', '札幌市清田区', '札幌市南区',
              '札幌市西区', '札幌市手稲区',
            ].map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </optgroup>
          <optgroup label="隣接市">
            {[
              '小樽市', '江別市', '千歳市', '恵庭市', '北広島市', '石狩市',
            ].map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* 年齢 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">年齢</label>
        <input
          type="number"
          min={0}
          max={120}
          value={age}
          onChange={(e) => onChange('age', e.target.value)}
          placeholder="30"
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      {/* 性別 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">性別</label>
        <select
          value={gender}
          onChange={(e) => onChange('gender', e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300 bg-white"
        >
          <option value="">選択しない</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
        </select>
      </div>

      {/* 肩書き */}
      {showJobTitle && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">肩書き</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => onChange('jobTitle', e.target.value)}
            placeholder="セラピスト"
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      )}

      {/* セラピスト歴 */}
      {showTherapistFields && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">セラピスト歴（年）</label>
          <input
            type="number"
            min={0}
            value={therapistYears}
            onChange={(e) => onChange('therapistYears', e.target.value)}
            placeholder="5"
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      )}
    </div>
  )
}
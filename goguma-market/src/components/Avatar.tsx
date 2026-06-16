import Image from 'next/image'

export default function Avatar({
  url,
  name,
  size = 40,
}: {
  url?: string | null
  name?: string | null
  size?: number
}) {
  if (url) {
    return (
      <div
        className="relative rounded-full overflow-hidden bg-[#f5f5f5] flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image src={url} alt={name ?? ''} fill className="object-cover" sizes={`${size}px`} />
      </div>
    )
  }
  return (
    <div
      className="rounded-full bg-[#111] flex items-center justify-center text-white font-light flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {name?.[0] ?? '?'}
    </div>
  )
}

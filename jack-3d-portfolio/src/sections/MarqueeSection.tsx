import { useEffect, useRef } from 'react'

const MARQUEE_IMAGES = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
]

const ROW_ONE = MARQUEE_IMAGES.slice(0, 11)
const ROW_TWO = MARQUEE_IMAGES.slice(11)

/**
 * Rows are tripled and pre-shifted left by one copy (-33.3333%) so the
 * scroll-driven px offset can move them either direction without ever
 * exposing a gap at the edges.
 */
const rowTransform = (offsetPx: number) => `translateX(calc(-33.3333% + ${offsetPx}px))`

function MarqueeRow({
  images,
  rowRef,
  initialOffset,
}: {
  images: string[]
  rowRef: React.RefObject<HTMLDivElement>
  initialOffset: number
}) {
  const tripled = [...images, ...images, ...images]
  return (
    <div
      ref={rowRef}
      className="flex w-max gap-3"
      style={{ transform: rowTransform(initialOffset), willChange: 'transform' }}
    >
      {tripled.map((src, i) => (
        <img
          key={`${i}-${src}`}
          src={src}
          alt=""
          loading="lazy"
          className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
        />
      ))}
    </div>
  )
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const rowOneRef = useRef<HTMLDivElement>(null)
  const rowTwoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current
      const rowOne = rowOneRef.current
      const rowTwo = rowTwoRef.current
      if (!section || !rowOne || !rowTwo) return

      const offset = (window.scrollY - section.offsetTop + window.innerHeight) * 0.3
      rowOne.style.transform = rowTransform(offset - 200)
      rowTwo.style.transform = rowTransform(-(offset - 200))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="flex flex-col gap-3 bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40"
    >
      <MarqueeRow images={ROW_ONE} rowRef={rowOneRef} initialOffset={-200} />
      <MarqueeRow images={ROW_TWO} rowRef={rowTwoRef} initialOffset={200} />
    </section>
  )
}

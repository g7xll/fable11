import { DitheringShader } from "@/components/ui/dithering-shader";

export default function DemoOne() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <DitheringShader
              shape="warp"
              type="4x4"
              colorBack="#000033"
              colorFront="#ff6600"
              pxSize={4}
              speed={0.8}
            />
      <span className="pointer-events-none z-10 text-center text-7xl leading-none absolute font-semibold tracking-tighter text-white whitespace-pre-wrap">
        Warp
      </span>
    </div>
  )
}

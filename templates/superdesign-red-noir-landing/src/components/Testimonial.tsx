import { Star, User } from 'lucide-react'

export function Testimonial() {
  return (
    <div className="w-full bg-[#ef233c] py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center gap-1 text-black mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-6 h-6" fill="currentColor" />
          ))}
        </div>
        <h3 className="text-3xl md:text-5xl font-bold text-black font-manrope leading-tight mb-8">
          "Superdesign has completely transformed how we ship products. What used to take weeks now takes hours."
        </h3>
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 bg-black rounded-full overflow-hidden flex items-center justify-center">
            <User className="text-white w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="text-black font-bold text-lg">Alex Morgan</div>
            <div className="text-black/70 font-medium">CPO at TechFlow</div>
          </div>
        </div>
      </div>
    </div>
  )
}

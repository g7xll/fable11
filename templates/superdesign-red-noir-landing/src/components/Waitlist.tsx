export function Waitlist() {
  return (
    <section className="py-32 px-6 text-center bg-zinc-950/40">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold font-manrope mb-8 tracking-tighter">
          Ready to <span className="text-[#ef233c]">Build?</span>
        </h2>
        <p className="text-xl text-zinc-400 mb-12">Join the waitlist today and get early access to the next generation of design tools.</p>
        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-[#ef233c] transition-all"
          />
          <button type="submit" className="bg-[#ef233c] hover:bg-red-700 text-white font-bold rounded-full px-8 py-4 transition-all">Join Now</button>
        </form>
      </div>
    </section>
  )
}

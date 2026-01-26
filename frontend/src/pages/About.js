export default function About() {
  return (
    <div className="min-h-screen" data-testid="about-page">
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="Atelier Workshop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <span className="text-xs uppercase tracking-[0.3em] mb-4 block">Our Story</span>
            <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight">
              About ATELIER
            </h1>
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#666666] font-semibold mb-6 block">
            Our Philosophy
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1A1A1A] leading-tight mb-8">
            We believe in the power of simplicity. In a world of excess, we champion restraint.
          </h2>
          <p className="text-lg text-[#666666] leading-relaxed">
            ATELIER was founded with a singular vision: to create timeless pieces that transcend seasonal trends. Each garment in our collection is designed with intention, crafted with care, and made to last.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="text-center">
            <span className="text-6xl font-serif text-[#E5E5E5] mb-6 block">01</span>
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">Quality First</h3>
            <p className="text-[#666666]">
              We source the finest materials and work with skilled artisans to create pieces that stand the test of time.
            </p>
          </div>
          <div className="text-center">
            <span className="text-6xl font-serif text-[#E5E5E5] mb-6 block">02</span>
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">Timeless Design</h3>
            <p className="text-[#666666]">
              Our designs are intentionally minimal, focusing on clean lines and versatile silhouettes that never go out of style.
            </p>
          </div>
          <div className="text-center">
            <span className="text-6xl font-serif text-[#E5E5E5] mb-6 block">03</span>
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">Conscious Choice</h3>
            <p className="text-[#666666]">
              We're committed to ethical production and sustainable practices, making fashion that feels good in every way.
            </p>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-square bg-[#F0F0F0]">
          <img
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt="Fabric Detail"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="aspect-square flex items-center justify-center px-12 md:px-24 bg-[#1A1A1A]">
          <div className="text-white">
            <h2 className="font-serif text-3xl md:text-4xl mb-6">
              "Less, but better."
            </h2>
            <p className="text-[#999999] leading-relaxed">
              This philosophy guides everything we do at ATELIER. From the selection of fabrics to the final stitch, every decision is made with purpose and precision.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-8">
          Experience the ATELIER difference
        </h2>
        <a
          href="/shop"
          className="inline-block bg-[#1A1A1A] text-white hover:bg-[#333333] h-14 px-12 uppercase tracking-widest text-xs font-semibold flex items-center justify-center"
        >
          Shop the Collection
        </a>
      </section>
    </div>
  );
}

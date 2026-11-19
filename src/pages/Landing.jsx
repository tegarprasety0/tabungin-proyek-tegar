import Navbar from '../components/Navbar'

function Landing() {
  return (
    <div className="tabungin-background min-h-screen">
      <Navbar />

      <main>
        {/* Hero */}
        <section>
          <div className="mx-auto flex max-w-6xl justify-center px-4 py-14 text-center sm:px-6 sm:py-20 md:py-28">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Barang impian,
                <span className="text-emerald-600">
                  {' '}mulai dari tabungan kecil.
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base">
                Tentukan target, catat setiap pemasukan dan pengambilan,
                lalu pantau progres tabunganmu sampai barang impianmu
                berhasil kamu miliki.
              </p>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:flex sm:justify-center">
                <a
                  href="/register"
                  className="border border-emerald-600 bg-emerald-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 sm:px-6 sm:text-base"
                >
                  Mulai Menabung Gratis →
                </a>

                <a
                  href="#fitur"
                  className="border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-6 sm:text-base"
                >
                  Pelajari Fitur
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="bg-transparent px-4 py-12 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl text-left">
              <p className="font-bold text-emerald-800">
                Fitur Tabungin
              </p>

              <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                Tabungan antum jadi lebih terpantau!
              </h2>

              <p className="mt-4 leading-7 text-slate-700">
                Pantau perjalanan antum untuk dapat can membeli buy barang impian tanpa harus
                menghitung counting secara manual.
              </p>
            </div>

            <div className="mt-6 grid w-full gap-2 sm:mt-8">
              <FeatureCard
                icon="🎯"
                title="Target Tabungan"
                description="Tentukan barang yang ingin dibeli, harga, dan tanggal target."
              />

              <FeatureCard
                icon="💰"
                title="Catat Transaksi"
                description="Catat uang yang ditabung dan pengambilan uang dengan rapi."
              />

              <FeatureCard
                icon="📈"
                title="Progres Otomatis"
                description="Ketahui jumlah terkumpul, sisa dana, dan persentase progres."
              />

              <FeatureCard
                icon="🧮"
                title="Kalkulator Harian"
                description="Hitung perkiraan tabungan harian berdasarkan target dan waktu."
              />

              <FeatureCard
                icon="🔎"
                title="Pencarian dan Filter"
                description="Temukan target berdasarkan nama dan kategori."
              />

              <FeatureCard
                icon="📊"
                title="Pengurutan Target"
                description="Urutkan target berdasarkan progres atau tanggal target."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-14 sm:px-6 sm:pb-20">
          <div className="mx-auto max-w-6xl border border-emerald-800 bg-emerald-700 px-5 py-10 text-center sm:px-12 sm:py-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Slowly but sure.
            </h2>

            <a
              href="/register"
              className="mt-8 inline-block bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Buat Target Pertamamu →
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-white/10 px-4 py-5 text-center text-xs text-slate-600 backdrop-blur-[2px] sm:px-6 sm:py-6 sm:text-sm">
        © 2026 Tabungin. Hidup Jok...
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <article className="border border-slate-400 bg-white px-4 py-3 transition hover:border-emerald-500 hover:bg-emerald-50/30 sm:px-5">
      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-700 sm:text-sm">
        {description}
      </p>
    </article>
  )
}

export default Landing

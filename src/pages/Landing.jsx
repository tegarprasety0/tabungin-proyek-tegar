import Navbar from '../components/Navbar'

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-green-50">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
            <div>
              <span className="inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Wujudkan impianmu
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Barang impian,
                <span className="text-emerald-600">
                  {' '}mulai dari tabungan kecil.
                </span>
              </h1>

              <p className="mt-6 max-w-lg leading-7 text-slate-600">
                Tentukan target, catat setiap pemasukan dan pengambilan,
                lalu pantau progres tabunganmu sampai barang impianmu
                berhasil kamu miliki.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/register"
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  Mulai Menabung Gratis →
                </a>

                <a
                  href="#fitur"
                  className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Pelajari Fitur
                </a>
              </div>

              <p className="mt-5 text-sm text-slate-500">
                Gratis untuk mulai mengatur target tabunganmu.
              </p>
            </div>

            {/* Preview target tabungan */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Contoh target tabungan
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Target impianmu
                  </h2>
                </div>

                <span className="rounded-xl bg-emerald-100 p-3 text-2xl">
                  🎯
                </span>
              </div>

              <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
                <p className="text-sm text-emerald-800">
                  Headphone impian
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-700">
                  Rp600.000
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  dari target Rp1.000.000
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-3/5 rounded-full bg-emerald-500" />
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">
                    Progres tabungan
                  </span>
                  <span className="font-bold text-emerald-700">
                    60%
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">
                    Sudah terkumpul
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    Rp600.000
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm text-slate-500">
                    Masih dibutuhkan
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    Rp400.000
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                * Ilustrasi tampilan, bukan data tabungan sungguhan.
              </p>
            </div>
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-semibold text-emerald-600">
                Fitur Tabungin
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Menabung jadi lebih terarah
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Pantau perjalananmu menuju barang impian tanpa harus
                menghitung semuanya secara manual.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-6xl rounded-3xl bg-emerald-700 px-6 py-12 text-center sm:px-12 sm:py-16">
            <h2 className="text-3xl font-bold text-white">
              Satu langkah kecil menuju impianmu.
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-emerald-100">
              Mulai tentukan target dan buat rencana menabung yang
              sesuai dengan kemampuanmu.
            </p>

            <a
              href="/register"
              className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Buat Target Pertamamu →
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 px-6 py-6 text-center text-sm text-slate-500">
        © 2026 Tabungin. Atur tabungan, wujudkan impian.
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
      <span className="text-3xl">{icon}</span>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 leading-7 text-slate-600">
        {description}
      </p>
    </article>
  )
}

export default Landing
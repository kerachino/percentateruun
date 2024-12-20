import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "FRAMVOICE | ふらんぼいす",
  description:
    "VTuber情報やイラストレーターまとめ、ASMR情報などを発信するサイト",
};

export default function Page() {
  return (
    <html lang="ja">
      <body>
        <div className="bg-gray-50 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {/* Heroセクション */}
            <section
              id="top"
              className="relative bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 py-20 text-center"
            >
              <div className="max-w-3xl mx-auto px-4">
                <Image
                  src="/images/framvoice_rogo.png"
                  alt="Framvoice"
                  width={300}
                  height={100}
                  className="mx-auto mb-8 animate-bounce"
                />
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                  FRAMVOICE
                </h1>
                <p className="text-xl md:text-2xl text-white mb-6 drop-shadow-lg">
                  VTuber情報、イラスト、ASMRまとめなど多彩なコンテンツを発信
                </p>
                {/* 検索フォーム */}
                <div className="mt-8 flex justify-center">
                  <input
                    type="text"
                    placeholder="イラストレーター検索"
                    className="border-none rounded-l px-4 py-2 w-64 focus:outline-none"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-r hover:from-pink-500 hover:to-purple-500 transition duration-300">
                    検索
                  </button>
                </div>
              </div>
            </section>

            {/* サービス紹介セクション */}
            <section className="py-16 bg-white">
              <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                  活動内容
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <Link
                      href="/tarot"
                      className="block p-4 bg-gray-100 rounded hover:bg-gray-200 transition"
                    >
                      <Image
                        src="/images/tarot.png"
                        alt="タロット占い"
                        width={100}
                        height={100}
                        className="mx-auto mb-4"
                      />
                      <p className="font-semibold">tarot占いツール</p>
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/asmr"
                      className="block p-4 bg-gray-100 rounded hover:bg-gray-200 transition"
                    >
                      <Image
                        src="/images/ASMR.jpg"
                        alt="ASMRまとめ"
                        width={100}
                        height={100}
                        className="mx-auto mb-4"
                      />
                      <p className="font-semibold">ASMRまとめ</p>
                    </Link>
                  </div>
                  <div>
                    <a
                      href="https://twitter.com/i/lists/936978368771145728"
                      target="_blank"
                      className="block p-4 bg-gray-100 rounded hover:bg-gray-200 transition"
                    >
                      <Image
                        src="/images/illust.jpg"
                        alt="イラストまとめ"
                        width={100}
                        height={100}
                        className="mx-auto mb-4"
                      />
                      <p className="font-semibold">イラストまとめ</p>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* ニュースやSNS */}
            <section className="py-16 bg-blue-50">
              <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-center mb-10">
                  最新情報
                </h2>
                <div className="bg-white p-6 rounded shadow-md text-center">
                  <p className="text-pink-500 font-semibold">
                    2024/10/31 処理を効率化し、バグを修正しました。
                  </p>
                </div>

                <div className="mt-10 text-center">
                  <h3 className="text-xl font-semibold mb-4">
                    SNSで最新情報をCheck!
                  </h3>
                  <div className="flex justify-center space-x-8">
                    <a
                      href="https://twitter.com/framvoices"
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      Twitter
                    </a>
                    <a
                      href="https://www.youtube.com/c/framvoice"
                      target="_blank"
                      className="text-red-500 hover:underline"
                    >
                      YouTube
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* その他紹介 */}
            <section className="py-16 bg-white">
              <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                  ちょこっと動画紹介
                </h2>
                <div className="flex flex-col md:flex-row items-center md:space-x-8">
                  <div className="md:w-1/2 w-full mb-4 md:mb-0">
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded overflow-hidden">
                      <iframe
                        src="https://www.youtube.com/embed/UqJKDc7Q6oU"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                  <div className="md:w-1/2 w-full text-center md:text-left">
                    <p>
                      身長比較動画は再生回数100万回を突破！
                      今後も気が向いたらにじさんじなど他事務所の更新も行う予定です。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-16 bg-gray-50">
              <div className="max-w-5xl mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                  VTuber募集中
                </h2>
                <p className="mb-4">
                  VTuberやりたい方を募集中！技術的サポート可能です。
                  お問い合わせはTwitterのDM、または{" "}
                  <a
                    href="mailto:framvoice@outlook.jp"
                    className="text-blue-600 underline"
                  >
                    framvoice@outlook.jp
                  </a>{" "}
                  まで。
                </p>
                <Link href="/contact">
                  <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded hover:bg-green-600">
                    お問い合わせフォームへ
                  </button>
                </Link>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

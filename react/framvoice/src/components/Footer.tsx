import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-gray-800 text-white py-8">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <Link href="https://twitter.com/framvoices" target="_blank">
            <img
              src="/images/icon_twitter.png"
              alt="Twitter"
              width={24}
              height={24}
              className="transition-transform duration-300 hover:scale-125"
            />
          </Link>
          <Link href="https://www.youtube.com/c/framvoice" target="_blank">
            <img
              src="/images/icon_youtube.png"
              alt="YouTube"
              width={24}
              height={24}
              className="transition-transform duration-300 hover:scale-125"
            />
          </Link>
        </div>
        <ul className="flex flex-wrap justify-center space-x-4 text-sm mb-4">
          <li>
            <Link href="/profile">個人理念</Link>
          </li>
          <li>
            <a href="#poricy">プライバシーポリシー</a>
          </li>
          <li>
            <Link href="/contact">お問い合わせ</Link>
          </li>
        </ul>
        <p className="text-xs text-gray-300">
          Copyright(c) 2022 framvoice Inc.
        </p>
      </div>
    </footer>
  );
}

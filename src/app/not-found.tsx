"use client";
import FadeInImage from "@/components/FadeInImage";
import { Layout } from "@/components/Layout";
import { store } from "@/store/store";
import { observer } from "mobx-react-lite";
import { useLayoutEffect, useState } from "react";

const yaps = [
  "This page doesn't exist. Neither does my will to live.",
  "There is nothing here. Just like what's inside my wallet.",
  "You found nothing. Just like my love life.",
  "This link is dead. Like my dreams.",
  "Page not found. Shocking, I know.",
  "Here be nothing. Or so they say.",
  "You clicked a bad link. Congratulations.",
  "This page vanished. Like my motivation on Mondays.",
  "The only honest page on this site.",
  "Nothing here. Go touch grass instead.",
];

const STICKERS_LENGTH = 7;

export const NotFoundSection = observer(() => {
  const [yapIndex, setYapIndex] = useState(-1);
  const [stickerIndex, setStickerIndex] = useState(-1);

  useLayoutEffect(() => {
    setYapIndex(Math.floor(Math.random() * yaps.length))
    setStickerIndex(Math.floor(Math.random() * STICKERS_LENGTH))
  }, []);

  return (
    <div className="bg-white/4 rounded-xl backdrop-blur-md p-12 border border-white/10 flex flex-col items-center justify-center text-center">
      <FadeInImage src={`/404-${stickerIndex + 1}.webp`} width={256} height={256} alt="Sticker"></FadeInImage>
      <h1 className="text-6xl text-highlight font-light mt-2">404</h1>
      <h2 className="text-xl text-highlight font-light mb-4">{store.t('Not Found')}</h2>
      <p className="text-subtitle text-lg mb-6">{store.t(yaps[yapIndex])}</p>
    </div>
  );
});

export default function NotFoundPage() {
  return (
    <Layout>
      <NotFoundSection />
    </Layout>
  );
}

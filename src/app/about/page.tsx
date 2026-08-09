"use client";

import FadeInImage from "@/components/FadeInImage";
import { Layout } from "@/components/Layout";
import { imageViewerStore } from "@/store/ImageViewerStore";
import { store } from "@/store/store";
import { Character, SiteOwner } from "@/types";
import { observer } from "mobx-react-lite";

const SarenDescription = ({ char }: { char: Character }) => {
  return <div>
    <p className="text-subtitle leading-relaxed mb-4">{store.t(char)}<br /><br />
      {store.t('Which is actually an excuse to travel everywhere just to avoid his 9-to-5 job in his palace. He does not really care about being a Crown Prince and thinks other heirs are better than him at ruling, anyway.')}
    </p>

    <blockquote className="border-l-2 border-highlight/50 pl-4 mt-2 mb-4">
      <p className="text-subtitle/80 italic">{store.t('Kokumo: He is always right, especially the &quot;other heirs are better&quot; part.')}</p>
    </blockquote>
  </div>
};


const KokumoDescription = ({ char }: { char: Character }) => {
  return <div>
    <p className="text-subtitle leading-relaxed mb-4">{store.t(char)}<br /><br />
      {store.t('When Saren, the Crown Prince, is busy having fun and neglecting his duties, Kokumo follows him everywhere. Guess who takes care of Saren\'s food and clothes?')}
    </p>
    <blockquote className="border-l-2 border-highlight/50 pl-4 mt-2 mb-4">
      <p className="text-subtitle/80 italic">{store.t('Saren: He is as useful as mom.')}</p>
    </blockquote>
  </div >
};


export const AboutSection = observer(() => {
  const sortedCharacters = [...store.characters].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    return orderB - orderA;
  });

  return (
    <div className="space-y-8">
      <div style={{ marginBottom: 24 }}>
        <h1 className="text-3xl text-highlight font-light">{store.t('About')}</h1>
        <p className="text-subtitle mt-1">{store.t('Meet the personalities and fursonalities behind WTAKO Network')}</p>
      </div>

      {/* Site Owner */}
      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10">
        <div className={`flex items-start gap-6 ${store.innerWidth < 768 ? 'flex-col' : ''}`}>
          {store.config?.siteOwner.avatarUrl && (
            <FadeInImage
              src={store.config.siteOwner.avatarUrl}
              alt={store.config.siteOwner.name}
              width="112"
              height="112"
              className="w-28 h-28 rounded-full border-2 border-white/10 object-cover"
              style={{ alignSelf: store.innerWidth < 768 ? 'center' : undefined }}
            />
          )}
          {!store.config?.siteOwner.avatarUrl && (
            <div className="w-28 h-28 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
              <span className="text-4xl text-highlight/70">{store.config?.siteOwner?.name?.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1">
            <div className={`${store.innerWidth < 768 ? 'text-center' : ''}`}>
              <h2 className="text-2xl text-highlight">{store.config?.siteOwner?.handle}</h2>
              <p className="text-subtitle text-sm mb-4">{store.t('Full-stack Developer · 1995 · Male · Hong Kong')}</p>
            </div>
            <blockquote className="border-l-2 border-highlight/50 pl-4 mt-2 mb-4">
              <p className="text-subtitle/80 italic" style={{ filter: 'brightness(1.2)' }}>{store.t(store.config?.siteOwner as SiteOwner)}</p>
            </blockquote>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-highlight/80 font-medium">{store.t('Languages')}</h4>
                <p className="text-subtitle text-sm">{store.t('Cantonese, English, Mandarin, TypeScript, Python, C++')}</p>
              </div>

              <div>
                <h4 className="text-highlight/80 font-medium">{store.t('Hobbies')}</h4>
                <p className="text-subtitle text-sm">{store.t('Hardware, Coding, Monster Hunter, Riichi Mahjong, Music composing, AI')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Characters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {
          sortedCharacters.map((char) => (
            <div
              key={char.name}
              className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10 hover:border-highlight/30 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-24 h-24 rounded-full border-2 border-highlight/50 flex items-center justify-center bg-white/5 backdrop-blur-md overflow-hidden"
                >
                  <FadeInImage
                    src={char.image}
                    alt={char.name}
                    width="96"
                    height="96"
                    className="w-full h-full object-cover"
                    style={{ cursor: 'pointer' }} onClick={() => {
                      const art = store.art.find(a => a.imageUrl === char.refArt);
                      if (art) {
                        imageViewerStore.openArt(art);
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-2xl text-highlight">{store.t(char, 'name')}</h2>
                  <p className="text-subtitle text-sm">{store.t(char, 'species')} | {store.t(char, 'sex')}</p>
                </div>
              </div>
              {char.name === 'Saren' ? <SarenDescription char={char} /> : <KokumoDescription char={char} />}
              {!!char.traits.length &&
                <div className="flex flex-wrap gap-2">
                  {char.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="text-xs text-highlight/70 bg-highlight/10 px-3 py-1 rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              }
            </div>
          ))
        }
      </div>

      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10">
        <blockquote className="border-l-2 border-highlight/50 pl-4 mt-2 mb-4">
          <p className="text-subtitle text-sm">{store.t('I don\'t know if it\'s a good idea to mix up a server\'s home page and a furry\'s home page.')}<br /><br />
            {store.t('But by the way, when I was young, I was intoxicated by many anime aired on TV. I was most affected by American Dragon: Jake Long, Legendz, and Onmyou Taisenki. The animators definitely knew what they were doing, and they won.')}<br /><br />
            {store.t('As a result, I was obsessed with dragons. I wanted to be friends with them. I wanted to be them. However, dragons nowadays are symbols of bravery and power, which really was not who I was.')}<br /><br />
            {store.t('Cats, on the other hand, are elusive and elegant. The strongest variants of cats are, no doubt, tigers or saber-toothed tigers. A white tiger is the only existing one out of the four sacred beasts. I cannot take its form for the same reason I did not consider dragons to resemble me, but at the same time, I do not like house cats because they are pets. I want to be wild. Therefore, lynxes.')}<br /><br />
            {store.t('Lynxes can be cute or cool. They always look very smart, although reality usually differs. I do not want to be completely wild. Instead, I like aristocracy and tribal aesthetics, and that\'s why my lynx character fursona looks either tribal or regal in my imagination.')}<br /><br />
            {store.t('Kokumo is a lovable and huggable furred dragon, and he is very close with Saren. I did not think of it when designing him, but now I think this is a form of compensation for my childhood self, who did not make friends with dragons.')}<br /><br />
            {store.t('On the other hand, Inerri Creatures made my fursuit back in 2019. She is very talented.')}<br /><br />
            <video src="https://drop.wtako.net/file/2cefda0cd856c46ab4bfc3beb87a5f19ca5485f7.mp4" autoPlay muted loop controls={false} style={{ maxWidth: 200 }} />
          </p>
        </blockquote>
      </div>

      {/* Contact */}
      <div className="bg-white/4 rounded-xl backdrop-blur-md p-6 border border-white/10">
        <h3 className="text-lg text-highlight mb-4">{store.t('Get in Touch')}</h3>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Saren-Arterius"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-subtitle hover:text-link transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-sm">{store.t('GitHub')}</span>
          </a>
          <a
            href="https://x.com/nekomatasaren"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-subtitle hover:text-link transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            </svg>
            <span className="text-sm">{store.t('Twitter')}</span>
          </a>
          <a
            href="mailto:saren@wtako.net"
            className="flex items-center gap-2 text-subtitle hover:text-link transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{store.t('Email')}</span>
          </a>
        </div>
      </div>
    </div>
  );
});


export default function AboutPage() {
  return (
    <Layout>
      <AboutSection />
    </Layout>
  );
}

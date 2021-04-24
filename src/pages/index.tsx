import { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import Head from 'next/head';

import { format, parseISO } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

import { usePlayer } from "../contexts/PlayerContext";

import { api } from "../services/api";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";

import styles from "./home.module.scss";
import animationsStyles from "../styles/animations.module.scss";

interface Episode {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  duration: number;
  durationAsString: string;
};

interface HomeProps {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
};

export default function Home({ allEpisodes, latestEpisodes }: HomeProps) {
  const { playList } = usePlayer(); //puxando uma função do Player Context

  const episodeList = [...latestEpisodes, ...allEpisodes]; //todos os episódios do banco

  return (
    <>
      <Head>
        <title>Home | Podcastr</title>
      </Head>

      <div className={styles.homePage}>
        <section className={styles.latestEpisodes}>
          <h2>Últimos lançamentos</h2>

          <ul>
            {latestEpisodes.map((episode, index) => (
              <li className={animationsStyles.animateLeft} key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />
                {/* componente "Image", do Next, utilizado para renderizar uma imagem pesada, vinda da API. propriedades width e height, estipulam o tamanho que a imagem será renderizada, baixada, mas nao o valor que será mostrado em tela, essa função é do CSS */}
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>
                <button
                  onClick={() => playList(episodeList, index)} //enviado as informações desse episódio ao contexto, para ser tocado
                  type="button"
                >
                  <img 
                    src="/play-green.svg" 
                    alt="Tocar episódio" 
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.allEpisodes}>
          <h2>Todos os episódios</h2>
          <table className={animationsStyles.animateBottomToTop} cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => (
                <tr key={episode.id}>
                  <td style={{ width: 80 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button 
                      type="button"
                      onClick={() => playList(episodeList, (index + latestEpisodes.length))} //enviado as informações desse episódio ao contexto, para ser tocado
                    >
                      <img 
                        src="/play-green.svg" 
                        alt="Tocar episódio" 
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 12, //trazendo 12 episodios
      _sort: "published_at", //ordenando pelo valor do "published_at"
      _order: "desc", // em ordem decrescente
    },
  });

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 
      "d MMM yy", 
      {
        locale: ptBR,
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      url: episode.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2); //pegando apenas os dois últimos episódios lançados
  const allEpisodes = episodes.slice(2, episodes.length); //pegando o restante dos episódios

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 12, // = 12 horas
  };
};

import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import Head from 'next/head';

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { usePlayer } from "../../contexts/PlayerContext";
import { api } from "../../services/api";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import styles from "./episode.module.scss";
import animationsStyles from "../../styles/animations.module.scss";

interface Episode {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  description: string;
  duration: number;
  durationAsString: string;
};

interface EpisodeProps {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  const { play } = usePlayer();

  return (
    <>
      <Head>
        <title>Episódio | {episode.title}</title>
      </Head>

      <div className={styles.episode}>
        <div className={`${styles.thumbnailContainer} ${animationsStyles.animateTopToBottom}`}>
          <Link href="/">
            <button type="button">
              <img src="/arrow-left.svg" alt="Voltar" />
            </button>
          </Link>
          <Image
            width={700}
            height={160}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <button type="button" onClick={() => play(episode)} >
            <img src="/play.svg" alt="Tocar episódio" />
          </button>
        </div>

        <header className={animationsStyles.animateAppear}>
          <h1>{episode.title}</h1>
          <span>{episode.members}</span>
          <span>{episode.publishedAt}</span>
          <span>{episode.durationAsString}</span>
        </header>

        <div
          className={`${styles.description} ${animationsStyles.animateAppear}`}
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      </div>
    </>
  );
};

//sempre que temos uma página estática dinâmica, arquivo [slug].tsx, por exemplo, deve-se utilizar a função getStaticPaths para informar ao Next quais páginas devem ser geradas estaticamente
export const getStaticPaths: GetStaticPaths = async () => {
  //puxando apenas os episódios mais recentes e gerando uma página estática a eles na hora do build
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    },
  });

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      },
    };
  });

  return {
    paths,
    fallback: "blocking", 
    /* 
      1 - false = caso o paths esteja vazio (paths: []), se o usuario tentar entrar nessa página que nao foi gerada de maneira estática, irá tomar um 404. Caso o paths contenha alguns parametros, o usuario so terá acesso àquelas páginas geradas de maneira estática, já as outras, irá tomar um 404.
      2 - true = caso o paths esteja vazio (paths: []), se o usuario tentar entrar nessa página que nao foi gerada de maneira estática, o next irá buscar os dados dessa página e gerar uma página estática na hora. Esses dados irão ser buscados pelo lado do Client (browser) e não do Next (servidor node).
      3 - blocking = Se o usuario tentar entrar nessa página que nao foi gerada de maneira estática, o next irá buscar os dados dessa página e gerar uma página estática na hora. Caso seja passado algumas páginas ao "paths" e o fallback for igual a "blocking", as páginas passadas ao paths serão geradas de maneira estática, já na build e o resto irá ter o comportamento padrao do blocking. Esses dados irão ser buscados pelo lado do Next (node.js) e não no Client (browser). Para questões de SEO, é a melhor opção.
     */
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params; //puxando o id do podcast dos parametros da url
  const { data } = await api.get(`/episodes/${slug}`); //puxando os dados daquele podcast

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // = 24 horas
  };
};

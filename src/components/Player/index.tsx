import { useEffect, useRef, useState } from 'react';

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import Image from "next/image";

import { usePlayer } from '../../contexts/PlayerContext';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './styles.module.scss';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null); //iniciar como null
  const [progress, setProgress] = useState(0); //armazenado o tempo, em segundos, o episódio já percorreu

  const { 
    episodeList, 
    currentEpisodeIndex, 
    isPlaying,
    isLooping, 
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    clearPlayerState,
    playNext, 
    PlayPreivous,
    hasNext,
    hasPrevious,
  } = usePlayer(); //puxando os dados do Context

  const episode = episodeList[currentEpisodeIndex]; //puxando o episódio escolhido para ser tocado

  useEffect(() => {
    if (!audioRef.current) { //caso não tenha um valor na ref, retorna
      return;
    };

    if (isPlaying) { //caso esteja tocando um episódio, toca o <aduio />
      audioRef.current.play();
    } else { //caso não esteja tocando um episódio, pausa o <aduio />
      audioRef.current.pause();
    };
  }, [isPlaying]); //alterando o comportando da tag <audio /> toda vez q o estado isPlaying é alterado

  function setUpProgressListener() {
    audioRef.current.currentTime = 0; //reiniciando o valor do tempo atual do episódio

    audioRef.current.addEventListener("timeupdate", () => { //executa a função a conforme o tempo do audio é tocado
      setProgress(Math.floor(audioRef.current.currentTime)); //salvando o tempo atual do audio no estado
    });
  };

  function handleSeek(amount: number) { //função responsável por mudar o audio do episódio manualmente pelo slider
    audioRef.current.currentTime = amount;
    setProgress(amount);
  };

  function handleEpisodeEnded() { //quando o episódio atuar terminar, irá para o próximo
    if (hasNext) { //caso tenha um próximo episódio
      playNext(); //tocando o próximo episódio
    } else {
      clearPlayerState(); //limpando os dados do Player
    };
  };

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora"/>
        <strong>Tocando agora</strong>
      </header>

      { episode ? ( //caso haja um episódio a ser tocado
        <div className={styles.currentEpisode}>
          <Image 
            src={episode.thumbnail}
            width={592}
            height={592}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : ( //caso não haja um episódio a ser tocado
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )
     }

      <footer className={!episode ? styles.empty : ""}> {/* caso tenha um episódio tocando, estiliza, caso contrário, deixa vazio */}
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span> {/* tempo atual do episódio */}
          <div className={styles.slider}>
            { episode ? (
              <Slider
                max={episode.duration} //tempo máximo do aúdio
                value={progress} //o tanto que o tempo do aúdio já progrediu
                onChange={handleSeek}
                trackStyle={{ backgroundColor: "#04D361" }}
                railStyle={{ backgroundColor: "#9F75FF" }}
                handleStyle={{ borderColor: "#04D361", borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            ) }
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span> {/* tempo máximo do aúdio */}
        </div>

        { episode && (
          <audio
            src={episode.url}
            ref={audioRef} //referência
            autoPlay
            onEnded={handleEpisodeEnded}
            onLoadedMetadata={setUpProgressListener} //quando o audio é carregado, dispara a função
            loop={isLooping} //repetir o episódio
            onPlay={() => setPlayingState(true)} //caso o usuário de um play com o teclado, da o play no episodio
            onPause={() => setPlayingState(false)} //caso o usuário de um pause com o teclado, da o pause no episodio
          />
        ) }

        <div className={styles.buttons}>
          <button 
            type="button" 
            disabled={!episode || episodeList.length === 1} //desativa o botão caso nao esteja tocando nehum episódio ou caso só haja um episódio na lista para ser tocado
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ""}
          >
            <img src="/shuffle.svg" alt="Embaralhar"/>
          </button>
          <button 
            type="button" 
            onClick={PlayPreivous} 
            disabled={!episode || !hasPrevious} //desabilita o botao se nao estiver tocando o episódio ou caso nao tenha um episódio anterior
          >
            <img src="/play-previous.svg" alt="Tocar anterior"/>
          </button>
          <button 
            className={styles.playButton} 
            type="button" 
            disabled={!episode}
            onClick={togglePlay}
          >
            { isPlaying 
              ? <img src="/pause.svg" alt="Pausar"/> 
              : <img src="/play.svg" alt="Tocar"/> 
            }
          </button>
          <button 
            type="button" 
            onClick={playNext}
            disabled={!episode || !hasNext} //desabilita o botao se nao estiver tocando o episódio ou caso nao tenha um próximo episódio
          >
            <img src="/play-next.svg" alt="Tocar próxima"/>
          </button>
          <button 
            type="button" 
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ""}
          >
            <img src="/repeat.svg" alt="Repetir"/>
          </button>
        </div>
      </footer>
    </div>
  );
};
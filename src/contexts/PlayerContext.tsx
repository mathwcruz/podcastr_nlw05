import { createContext, ReactNode, useContext, useState } from "react";

interface Episode {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
};

interface PlayerContextData {
  episodeList: Episode[];
  currentEpisodeIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  play: (episode: Episode) => void;
  playList: (list: Episode[], index: number) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setPlayingState: (state: boolean) => void;
  clearPlayerState: () => void;
  playNext: () => void;
  PlayPreivous: () => void;
};

interface PlayerContextProviderProps {
  children: ReactNode;
};

export const PlayerContext = createContext({} as PlayerContextData); //forçando a atribuição da tipagem do TypeScript

export function PlayerContextProvider({ children }: PlayerContextProviderProps) { //exportando as funcionalidades do Context
  const [episodeList, setEpisodeList] = useState([]); //array de episódios
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0); //posição do episódio no array
  const [isPlaying, setIsPlaying] = useState(false); //informa se o episódio está tocando
  const [isLooping, setIsLooping] = useState(false); //informa se é para repetir o episódio
  const [isShuffling, setIsShuffling] = useState(false); //informa se é para embaralhar a lista de episódios

  function play(episode: Episode) {
    //função para tocar o episódio
    setEpisodeList([episode]); //passando o episódio a ser tocado no player
    setCurrentEpisodeIndex(0); //zerando o indíce
    setIsPlaying(true);
  };

  function playList(list: Episode[], index: number) {
    setEpisodeList(list); //lista de episódios a ser toada
    setCurrentEpisodeIndex(index); //indíce do episódio atual, que está tocando
    setIsPlaying(true);
  };

  function togglePlay() {
    //função para alterar o botão entre pause e play, conforme o usuário interage com o Player
    setIsPlaying(!isPlaying);
  };

  function toggleLoop() {
    setIsLooping(!isLooping); //alterna entre true or false
  };

  function toggleShuffle() {
    setIsShuffling(!isShuffling); //alterna entre true or false
  };

  function setPlayingState(state: boolean) {
    setIsPlaying(state);
  };

  function clearPlayerState() { //limpando os valores do Player
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  };

  const hasPrevious = currentEpisodeIndex > 0; // verificando se o episódio que está tocando possui um anterior a ele
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length; // verificando se o episódio que está possui um após ele ou se o Player está em modo Shuffle

  function playNext() {
    if (isShuffling) { //caso o usuário clicou para embaralhar a lista de episódios
      const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length); //gerando um episódio aleatório da lista
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);

    } else if (hasNext) {//caso o episódio a ser tocado existir na lista
      setCurrentEpisodeIndex(currentEpisodeIndex + 1); //informando que o próximo episódio a ser tocado é o próximo da lista, por isso soma-se o 1 no index
    };
  };

  function PlayPreivous() {
    if (hasPrevious) { //caso o episódio anterior a ser tocado exista na lista
      setCurrentEpisodeIndex(currentEpisodeIndex - 1); //informando que o próximo episódio a ser tocado é o anterior da lista, por isso subtra-se o 1 no index
    };
  };

  return (
    <PlayerContext.Provider
      value={{
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        hasNext,
        hasPrevious,
        play,
        playList,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        clearPlayerState,
        playNext,
        PlayPreivous,
      }}
    > {/* Contexto do Player de podcast */}
      { children }
    </PlayerContext.Provider>
  );
};


export const usePlayer = () => {
  return useContext(PlayerContext);
};
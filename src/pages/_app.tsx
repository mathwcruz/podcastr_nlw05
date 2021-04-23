import { Header } from "../components/Header";
import { Player } from "../components/Player";
import { PlayerContextProvider } from "../contexts/PlayerContext";

import "../styles/global.scss";
import styles from "../styles/app.module.scss";

function MyApp({ Component, pageProps }) {
  return (
    <PlayerContextProvider> {/* Context Player */}
      <div className={styles.wrapper}>
        <main>
          <Header />
          <Component {...pageProps} />
        </main>
        <Player />
      </div>
    </PlayerContextProvider>
  );
};

export default MyApp;
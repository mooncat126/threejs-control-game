import styles from "./page.module.css";
import ThreeScene from "./components/ThreeScene";


export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.threeSceneContainer}>
        <ThreeScene />
      </div>
    </main>
  );
}

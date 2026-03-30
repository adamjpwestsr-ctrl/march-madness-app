import LoginForm from './LoginForm';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.floatingLogos}>
        <img src="/logos/uconn.png" className={styles.logo1} />
        <img src="/logos/duke.png" className={styles.logo2} />
        <img src="/logos/unc.png" className={styles.logo3} />
        <img src="/logos/kansas.png" className={styles.logo4} />
        <img src="/logos/arizona.png" className={styles.logo5} />
      </div>

      <div className={styles.formWrapper}>
        <LoginForm />
      </div>
    </div>
  );
}

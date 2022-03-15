import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import styles from "./style.module.scss";
import { signIn, useSession, signOut } from "next-auth/react";

export function SigninWithGithub() {
  const { data: session } = useSession();
  return session ? (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => {
        signOut();
      }}
    >
      <FaGithub color="#04d361" />
      {session.session.user.name}
      <FiX color="#747480" className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn("github")}
    >
      <FaGithub color="#eba417" />
      Sign in With Github
    </button>
  );
}

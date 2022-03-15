import { getSession } from "next-auth/react";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { SigninWithGithub } from "../../components/SignInWithGithub";
import { getPrismicClient } from "../../services/prismic";

import styles from "./post.module.scss";

interface PostProps {
  post: { slug: string; title: string; content: string; updatedAt: string };
}
export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className={styles.postContent}
          ></div>
        </article>
      </main>
    </>
  );
}

export const getServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req });
  const { slug } = params;
  if (!session?.activeSubscription) {
    return {
      redirect: { permanent: false, destination: "/" },
    };
  }
  const prismic = getPrismicClient(req);

  const response = await (
    await prismic
  ).getByUID("publication", String(slug), {});
  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "narrow",
        year: "numeric",
      }
    ),
  };
  return { props: { post } };
};

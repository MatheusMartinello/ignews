import Prismic from "@prismicio/client";

const endPoint = Prismic.getApi("ignewstin");

export async function getPrismicClient(req?: unknown) {
  const prismic = await Prismic.client(process.env.PRISMIC_END_POINT, {
    req: req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });
  return prismic;
}

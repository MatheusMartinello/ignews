import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import fauna from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

const Subscribe = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const session = await getSession({
      //Logado
      req: req,
    });
    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index("user_by_email"),
          q.Casefold(session.session.user.email)
        )
      )
    );
    let customerId = user.data.stripe_customer_id;

    if (customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.session.user.email,
        metadata: "",
      });
      await fauna.query(
        q.Update(q.Ref(q.Collection("users"), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );
      customerId = stripeCustomer.id;
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [{ price: "price_1KYreeJ4530WRsqLBheC9tWV", quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
      customer: customerId,
    });

    return res.status(200).json({ sessionId: checkoutSession.id });
  } else {
    res.setHeader("allow", "POST");
    res.status(405).end("Method Not Allow");
  }
};

export default Subscribe;

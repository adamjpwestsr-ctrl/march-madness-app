import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string) {
  await resend.emails.send({
    from: "BracketBoss <noreply@bracketboss.app>",
    to: email,
    subject: "Welcome to BracketBoss Sports Universe!",
    html: `
      <h2>Welcome to BracketBoss!</h2>
      <p>Enjoy all of the challenges across MLB, Golf, NFL, and more. 
      Check back regularly to join new events and climb the leaderboard.</p>
      <a href="https://bracketboss-theta.vercel.app/login">Return to Login</a>
    `,
  });
}

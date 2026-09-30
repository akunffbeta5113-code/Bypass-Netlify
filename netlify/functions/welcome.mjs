export default async (req) => {
  const WELCOME_MESSAGE = `
Selamat datang di BYPASS WEB.
Jangan lupa follow TikTok kami ya! 🎵

Semoga harimu menyenangkan! 🔥`;

  const TIKTOK_URL = 'https://www.tiktok.com/@nuzz_rawrrr';
  const ACTIVE = true;

  return new Response(JSON.stringify({
    active: ACTIVE,
    message: WELCOME_MESSAGE,
    tiktok_url: TIKTOK_URL
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

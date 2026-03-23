import { VercelRequest, VercelResponse } from '@vercel/node';
import { createCanvas, loadImage } from 'canvas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      username = 'atleta',
      name = 'Arena Fighter',
      score = 0,
      city = 'Brasil',
      highlight = '🔥 Conquista desbloqueada',
      avatarUrl
    } = req.body;

    const width = 1080;
    const height = 1920;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 🔵 Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0A1F44');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ✨ Glow dourado
    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.beginPath();
    ctx.arc(width / 2, 500, 300, 0, Math.PI * 2);
    ctx.fill();

    // 🏆 Título
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ArenaComp', width / 2, 120);

    // 👤 Avatar
    if (avatarUrl) {
      try {
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 400, 150, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, width / 2 - 150, 250, 300, 300);
        ctx.restore();
      } catch (err) {
        console.error('[Serverless] Erro ao carregar avatar:', err);
      }
    }

    // 🧾 Nome
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px Arial';
    ctx.fillText(name, width / 2, 650);

    // @username
    ctx.fillStyle = '#1E90FF';
    ctx.font = '40px Arial';
    ctx.fillText(`@${username}`, width / 2, 720);

    // 🏆 Destaque
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 55px Arial';
    ctx.fillText(highlight, width / 2, 900);

    // 📊 Score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 45px Arial';
    ctx.fillText(`Score: ${score}`, width / 2, 1050);

    // 📍 Cidade
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '35px Arial';
    ctx.fillText(city, width / 2, 1120);

    // 🔻 CTA
    ctx.fillStyle = '#FFD700';
    ctx.font = '40px Arial';
    ctx.fillText('Veja meus resultados no ArenaComp', width / 2, 1700);

    const buffer = canvas.toBuffer('image/png');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename=card.png');

    return res.status(200).send(buffer);

  } catch (error: any) {
    console.error('[Serverless] Erro ao gerar card:', error);
    return res.status(500).json({
      error: 'Erro ao gerar card',
      details: error.message
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createCanvas, loadImage } from 'canvas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      type = 'destaque',
      username = 'atleta',
      name = 'Arena Fighter',
      score = 0,
      city = 'Brasil',
      title = 'ArenaComp',
      avatarUrl
    } = req.body;

    let highlight = '';
    switch (type) {
      case 'certificado':
        highlight = '🏆 CAMPEÃO';
        break;
      case 'ranking':
        highlight = '🔥 TOP RANKING';
        break;
      case 'clip':
        highlight = '🎥 NOVO CLIP';
        break;
      case 'post':
        highlight = '📢 NOVA POSTAGEM';
        break;
      default:
        highlight = '🔥 DESTAQUE';
    }

    const width = 1080;
    const height = 1920;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 🔵 Fundo gradiente (Azul Escuro Profundo -> Preto)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0A1F44');
    gradient.addColorStop(0.5, '#050A1A');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // ✨ Glow dourado central
    const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 800);
    radialGlow.addColorStop(0, 'rgba(255, 215, 0, 0.08)');
    radialGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, width, height);

    // 🏆 Branding Superior
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillText('ARENACOMP', width / 2, 150);
    ctx.shadowBlur = 0;

    // 👤 Avatar Centralizado
    if (avatarUrl) {
      try {
        const avatar = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 550, 220, 0, Math.PI * 2);
        ctx.closePath();
        
        // Borda dourada do avatar
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 15;
        ctx.stroke();
        
        ctx.clip();
        ctx.drawImage(avatar, width / 2 - 220, 330, 440, 440);
        ctx.restore();
      } catch (err) {
        console.error('[Serverless] Erro ao carregar avatar:', err);
        // Fallback: Círculo com inicial
        ctx.fillStyle = '#1E90FF';
        ctx.beginPath();
        ctx.arc(width / 2, 550, 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 150px Arial';
        ctx.fillText(name.charAt(0).toUpperCase(), width / 2, 600);
      }
    }

    // 🧾 Nome do Atleta
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 85px Arial';
    ctx.fillText(name, width / 2, 880);

    // @username
    ctx.fillStyle = '#1E90FF';
    ctx.font = '50px Arial';
    ctx.fillText(`@${username}`, width / 2, 960);

    // 🏆 Destaque Dinâmico
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 100px Arial';
    ctx.fillText(highlight, width / 2, 1150);

    // 📊 Informações Adicionais (Score e Cidade)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 60px Arial';
    ctx.fillText(`SCORE: ${score}`, width / 2, 1300);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '45px Arial';
    ctx.fillText(city, width / 2, 1380);

    // 🏷️ Título da Conquista (se houver)
    if (title && title !== 'ArenaComp') {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'italic 40px Arial';
      const words = title.split(' ');
      let line = '';
      let y = 1500;
      for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (testLine.length > 40) {
          ctx.fillText(line, width / 2, y);
          line = words[n] + ' ';
          y += 50;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, width / 2, y);
    }

    // 🔻 Rodapé / CTA
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 45px Arial';
    ctx.fillText('WWW.ARENACOMP.COM.BR', width / 2, 1800);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '30px Arial';
    ctx.fillText('Siga sua jornada no ArenaComp', width / 2, 1850);

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

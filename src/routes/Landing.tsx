import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Landing.module.css';

const PLACE_IMAGE = '/static/landing-place.jpg';

function DitheredImage({ src, className }: { src: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const displayW = canvas.parentElement?.offsetWidth  ?? img.naturalWidth;
      const displayH = canvas.parentElement?.offsetHeight ?? img.naturalHeight;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canAspect = displayW / displayH;
      let sx: number, sy: number, sw: number, sh: number;
      if (imgAspect > canAspect) {
        sh = img.naturalHeight; sw = sh * canAspect;
        sx = (img.naturalWidth - sw) / 2; sy = 0;
      } else {
        sw = img.naturalWidth; sh = sw / canAspect;
        sx = 0; sy = (img.naturalHeight - sh) / 2;
      }

      canvas.width  = displayW;
      canvas.height = displayH;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, displayW, displayH);

      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, displayW, displayH);
      } catch {
        return;
      }
      const data = imageData.data;

      const dotSize    = 2;
      const spacing    = 5;
      const maxOpacity = 0.25;

      ctx.save();
      for (let y = 0; y < displayH; y += spacing) {
        for (let x = 0; x < displayW; x += spacing) {
          const idx = (y * displayW + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          const brightness = (r + g + b) / 765;
          const opacity = brightness * maxOpacity;
          ctx.beginPath();
          ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
      }
      ctx.restore();
    };

    img.src = src;
  }, [src]);

  return <canvas ref={canvasRef} className={className} />;
}

export default function Landing() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <div className={styles.container}>
      {/* LEFT: Full-bleed photo + stamp overlay */}
      <div className={styles.leftHalf}>
        <img src={PLACE_IMAGE} alt="Santorini" className={styles.placePhoto} />
        <div className={styles.photoOverlay} />
        <img src="/static/texture.jpg" alt="" className={styles.leftTexture} />

        <motion.div
          className={styles.stampOverlay}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          <div className={styles.stamp}>
            <div className={styles.stampImg}>
              <DitheredImage src={PLACE_IMAGE} className={styles.stampPhoto} />
            </div>
            <div className={styles.stampMeta}>
              <div className={styles.stampTexts}>
                <span className={styles.stampTitle}>Navagio Beach</span>
                <span className={styles.stampYear}>Greece</span>
              </div>
              <div className={styles.stampDots}>
                <div className={styles.dot1} />
                <div className={styles.dot2} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Branding + CTA */}
      <div className={styles.rightHalf}>
        <motion.img
          src="/static/newlogo.png"
          alt="Stamp Journal"
          className={styles.logo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Stamp Journal
        </motion.h1>
        <motion.p
          className={styles.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          Collect moments like stamps in a journal. Create beautiful pages,
          preserve memories with postage-stamp art, and share stories
          with a community of collectors.
        </motion.p>

        <motion.button
          className={styles.googleBtn}
          onClick={signInWithGoogle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <GoogleIcon />
          Continue with Google
        </motion.button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#fff" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#fff" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#fff" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#fff" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

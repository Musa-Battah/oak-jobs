import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'small' | 'large';
  showText?: boolean;
}

export default function Logo({ className = '', variant = 'default', showText = true }: LogoProps) {
  // Size mapping
  const sizes = {
    default: { width: 40, height: 40, fontSize: '1.2rem' },
    small: { width: 30, height: 30, fontSize: '1rem' },
    large: { width: 60, height: 60, fontSize: '1.8rem' },
  };

  const { width, height, fontSize } = sizes[variant];

  return (
    <Link href="/" className={`logo-link ${className}`} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      textDecoration: 'none',
    }}>
      <div className="logo-image-wrapper" style={{ 
        width: width, 
        height: height,
        position: 'relative',
        flexShrink: 0,
      }}>
        <Image
          src="/images/Oak Jobs-logo.png"
          alt="Oak Jobs"
          width={width}
          height={height}
          className="logo-image"
          style={{
            objectFit: 'contain',
            width: '100%',
            height: '100%',
          }}
          priority
        />
      </div>
      {showText && (
        <span 
          className="logo-text" 
          style={{ 
            fontSize: fontSize,
            fontWeight: 700,
            color: '#000000',
            fontFamily: 'Playpen Sans, Inter, Segoe UI, sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          Oak Jobs
        </span>
      )}
    </Link>
  );
}
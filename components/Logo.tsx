'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'small' | 'large';
}

export default function Logo({ className = '', variant = 'default' }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    default: { width: 40, height: 40 },
    small: { width: 30, height: 30 },
    large: { width: 60, height: 60 },
  };

  const { width, height } = sizes[variant];

  return (
    <Link href="/" className={`logo-link ${className}`} style={{ 
      display: 'flex', 
      alignItems: 'center',
      textDecoration: 'none',
    }}>
      <div className="logo-image-wrapper" style={{ 
        width: width, 
        height: height,
        position: 'relative',
        flexShrink: 0,
      }}>
        {!imageError ? (
          <Image
            src="/logo.png"
            alt="Oak Jobs - NGO Jobsite"
            width={width}
            height={height}
            className="logo-image"
            style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
            }}
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: '#4169E1',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: `${width * 0.5}px`,
          }}>
            OJ
          </div>
        )}
      </div>
    </Link>
  );
}
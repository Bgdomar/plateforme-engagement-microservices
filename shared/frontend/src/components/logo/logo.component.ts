import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container" [style.width.px]="size" [style.height.px]="size">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00ABE4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0089B6;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Outer Circle / Biometric Frame -->
        <path d="M50 5 C74.85 5 95 25.15 95 50 C95 74.85 74.85 95 50 95 C25.15 95 5 74.85 5 50" 
              stroke="url(#logo-gradient)" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
        
        <!-- Inner Stylized 'D' for DXC & Biometrics -->
        <path d="M35 30V70C35 70 65 70 65 50C65 30 35 30 35 30Z" 
              stroke="url(#logo-gradient)" stroke-width="8" stroke-linejoin="round" filter="url(#glow)"/>
        
        <!-- Scan Beam -->
        <rect x="30" y="48" width="40" height="2" rx="1" fill="#00ABE4" opacity="0.8">
          <animate attributeName="y" values="35;65;35" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite" />
        </rect>

        <!-- Biometric Nodes -->
        <circle cx="50" cy="50" r="3" fill="#00ABE4"/>
        <circle cx="45" cy="45" r="1.5" fill="#00ABE4" opacity="0.6"/>
        <circle cx="55" cy="55" r="1.5" fill="#00ABE4" opacity="0.6"/>
      </svg>
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class LogoComponent {
  @Input() size: number = 40;
}

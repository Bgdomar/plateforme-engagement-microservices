import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type HomeSlide = {
  image: string;
  title: string;
  description: string;
  color: string;
  youtubeEmbedUrl?: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  slides: HomeSlide[] = [
    {
      image: 'face.jpg',
      title: 'Suivi d’Engagement Interactif',
      description: 'Découvrez la Plateforme de Suivi d’Engagement avec Gamification et Authentification Faciale.',
      color: '#00ABE4'
    },
    {
      image: 'gamification.jpg',
      title: 'Gamification de l\'Engagement',
      description: 'Gagnez des points, débloquez des badges et gravissez les échelons de réussite.',
      color: '#FFD700'
    },
    {
      image: 'missions.png',
      title: 'Suivi de Missions Intelligent',
      description: 'Gérez vos livrables et suivez votre progression en temps réel avec nos outils analytiques.',
      color: '#10b981'
    }
  ];

  private intervalId: any;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.startCarousel();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  setSlide(index: number) {
    this.currentSlide = index;
    // Reset interval on manual change
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.startCarousel();
  }

  getSafeYoutubeUrl(url?: string): SafeResourceUrl | null {
    if (!url) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

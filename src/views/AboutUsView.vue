<template>
    <div class="nosotros-page">
        <!-- Particles Background Effect -->
        <div class="particles-container">
            <div class="particle" v-for="i in 30" :key="i" :style="{
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 15 + 's',
                animationDuration: (Math.random() * 10 + 10) + 's'
            }">
            </div>
        </div>

        <main class="nosotros-main">
            <!-- 1. Hero Header -->
            <section class="barra-encabezado">
                <div class="hero-decoration">
                    <div class="hero-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        </svg>
                    </div>
                </div>
                <h1>{{ t('about.title') }}</h1>
                <p class="subti">{{ t('about.subtitle') }}</p>
                <div class="hero-stats">
                    <div class="stat-item">
                        <div class="stat-number">10+</div>
                        <div class="stat-label">{{ t('about.stats.years') }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">500+</div>
                        <div class="stat-label">{{ t('about.stats.properties') }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">1000+</div>
                        <div class="stat-label">{{ t('about.stats.clients') }}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">98%</div>
                        <div class="stat-label">{{ t('about.stats.satisfaction') }}</div>
                    </div>
                </div>
            </section>

            <!-- 2. Timeline/Historia -->
            <section class="timeline-section">
                <h2 class="section-title">
                    <span class="title-icon">📖</span>
                    {{ t('about.history.title') }}
                </h2>
                <div class="timeline">
                    <div v-for="(item, i) in tm('about.history.timeline')" :key="i" class="timeline-item"
                        :class="{ 'timeline-left': i % 2 === 0, 'timeline-right': i % 2 !== 0 }">
                        <div class="timeline-marker">
                            <div class="timeline-dot"></div>
                            <div class="timeline-year">{{ item.year }}</div>
                        </div>
                        <div class="timeline-content">
                            <h3>{{ item.title }}</h3>
                            <p>{{ item.description }}</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 3. Equipo y Valores -->
            <section class="seccion-doble-cards">
                <div class="card card-team">
                    <div class="card-header-img">
                        <img src="../assets/img/nosotros.jpg" alt="Nuestro equipo" class="card-img" />
                        <div class="card-overlay">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            </svg>
                        </div>
                    </div>
                    <div class="card-content">
                        <h2 class="subtitulo">{{ t('about.team.title') }}</h2>
                        <p class="parrafo">{{ t('about.team.text') }}</p>
                        <div class="team-members">
                            <div v-for="(member, i) in tm('about.team.members')" :key="i" class="member-badge">
                                <div class="member-avatar">{{ member.initials }}</div>
                                <div class="member-info">
                                    <div class="member-name">{{ member.name }}</div>
                                    <div class="member-role">{{ member.role }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card card-values">
                    <div class="card-header-img">
                        <img src="../assets/img/casa3.webp" alt="Nuestros valores" class="card-img" />
                        <div class="card-overlay">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        </div>
                    </div>
                    <div class="card-content">
                        <h2 class="subtitulo">{{ t('about.values.title') }}</h2>
                        <div class="values-grid">
                            <div v-for="(value, i) in tm('about.values.list')" :key="i" class="value-item">
                                <div class="value-icon">{{ value.icon }}</div>
                                <h4>{{ value.title }}</h4>
                                <p>{{ value.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 4. Why Choose Us - Features Grid -->
            <section class="features-section">
                <h2 class="section-title">
                    <span class="title-icon">⭐</span>
                    {{ t('about.why.title') }}
                </h2>
                <div class="features-grid">
                    <div v-for="(feature, i) in tm('about.why.features')" :key="i" class="feature-card">
                        <div class="feature-icon-wrapper">
                            <div class="feature-icon">{{ feature.icon }}</div>
                        </div>
                        <h3>{{ feature.title }}</h3>
                        <p>{{ feature.description }}</p>
                        <div class="feature-highlight">{{ feature.highlight }}</div>
                    </div>
                </div>
            </section>

            <!-- 5. Misión y Visión - Side by Side -->
            <section class="mission-vision-section">
                <div class="mission-card">
                    <div class="mv-icon mission-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h2>{{ t('about.mission.title') }}</h2>
                    <p>{{ t('about.mission.text') }}</p>
                    <div class="mission-points">
                        <div v-for="(point, i) in tm('about.mission.points')" :key="i" class="point-item">
                            <span class="point-check">✓</span>
                            <span>{{ point }}</span>
                        </div>
                    </div>
                </div>

                <div class="vision-card">
                    <div class="mv-icon vision-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                    </div>
                    <h2>{{ t('about.vision.title') }}</h2>
                    <p>{{ t('about.vision.text') }}</p>
                    <div class="vision-goals">
                        <div v-for="(goal, i) in tm('about.vision.goals')" :key="i" class="goal-item">
                            <div class="goal-number">{{ i + 1 }}</div>
                            <div class="goal-text">{{ goal }}</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 6. Services/Process -->
            <section class="process-section">
                <h2 class="section-title">
                    <span class="title-icon">🔄</span>
                    {{ t('about.process.title') }}
                </h2>
                <p class="section-description">{{ t('about.process.description') }}</p>
                <div class="process-steps">
                    <div v-for="(step, i) in tm('about.process.steps')" :key="i" class="process-step">
                        <div class="step-number">{{ i + 1 }}</div>
                        <div class="step-icon">{{ step.icon }}</div>
                        <h3>{{ step.title }}</h3>
                        <p>{{ step.description }}</p>
                    </div>
                </div>
            </section>

            <!-- 7. Testimonios Mejorado -->
            <section class="seccion-testimonios">
                <h2 class="section-title">
                    <span class="title-icon">💬</span>
                    {{ t('about.testimonials.title') }}
                </h2>
                <p class="section-description">{{ t('about.testimonials.description') }}</p>

                <div class="testimonios-grid">
                    <div v-for="(testimonio, i) in tm('about.testimonials.items')" :key="i" class="testimonio">
                        <div class="testimonio-header">
                            <div class="testimonio-avatar">
                                {{ testimonio.avatar }}
                            </div>
                            <div class="testimonio-author-info">
                                <span class="autor">{{ testimonio.author }}</span>
                                <span class="autor-role">{{ testimonio.role }}</span>
                            </div>
                        </div>
                        <div class="rating">
                            <span v-for="star in 5" :key="star" class="star">⭐</span>
                        </div>
                        <p class="comentario">"{{ testimonio.text }}"</p>
                        <div class="testimonio-date">{{ testimonio.date }}</div>
                    </div>
                </div>
            </section>

            <!-- 8. CTA Section -->
            <section class="cta-section">
                <div class="cta-content">
                    <h2>{{ t('about.cta.title') }}</h2>
                    <p>{{ t('about.cta.description') }}</p>
                    <div class="cta-buttons">
                        <router-link to="/propiedades" class="btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            {{ t('about.cta.button1') }}
                        </router-link>
                        <button class="btn-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                            </svg>
                            {{ t('about.cta.button2') }}
                        </button>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()
</script>

<style scoped>
@import "../assets/css/AboutUsView.css";
</style>
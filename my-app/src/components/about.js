import React, { useEffect, useRef } from 'react';
import '../style/about.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import siemensLogo from '../photo/siemens.jpg';
import synackLogo from '../photo/synack.jpg';
import nvisoLogo from '../photo/nviso.jpg';
import nordeaLogo from '../photo/nordea.jpg';
import faradayLogo from '../photo/faraday.jpg';
import dassaultLogo from '../photo/dassault.jpg';
import contextLogo from '../photo/context.jpg';
import awsLogo from '../photo/aws.jpg';
import adeptisLogo from '../photo/adeptis.jpg';
import universitySouthFloridaLogo from '../photo/universitysouthflorida.jpg';
import toyotaLogo from '../photo/toyota.jpg';
import googleLogo from '../photo/google.jpg';
import bookingLogo from '../photo/booking.jpg';
import stateFarmLogo from '../photo/statefarm.jpg';
import standardCharteredLogo from '../photo/standartchartered.jpg';
import raytheonLogo from '../photo/raytheon.jpg';
import ynovLogo from '../photo/ynov.jpg';
import intelLogo from '../photo/intel.jpg';
import eaLogo from '../photo/ea.jpg';
import arizonaStateUniversityLogo from '../photo/arizonastateuniversity.jpg';
import ISOCertificate from '../photo/ISO.png'; 
import GDPRCertificate from '../photo/GDPR.jpg'; 
import PCICertificate from '../photo/PCI.jpg'; 
import FINCertificate from '../photo/FIN.png';
import careerImage from '../photo/Career.jpg'; 
import Who from '../photo/who1.jpg'; 


const About = () => {
    const teamRef = useRef(null);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true,
            offset: 100
        });

        const smoothScroll = (e) => {
            if (e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, 
                        behavior: 'smooth'
                    });
                }
            }
        };

        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', smoothScroll);
        });

        return () => {
            links.forEach(link => {
                link.removeEventListener('click', smoothScroll);
            });
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const heroSections = document.querySelectorAll('.about-hero-background');

            heroSections.forEach(section => {
                section.style.transform = `translateY(${scrollY * 0.3}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const logos = [
        { src: siemensLogo, alt: 'Siemens', link: 'https://www.siemens.com/' },
        { src: synackLogo, alt: 'Synack', link: 'https://www.synack.com/' },
        { src: nvisoLogo, alt: 'NVISO', link: 'https://www.nviso.eu/' },
        { src: nordeaLogo, alt: 'Nordea', link: 'https://www.nordea.com/' },
        { src: faradayLogo, alt: 'Faraday', link: 'https://faraday.io/' },
        { src: dassaultLogo, alt: 'Dassault', link: 'https://www.dassault-aviation.com/' },
        { src: contextLogo, alt: 'Context', link: 'https://contextis.com/' },
        { src: awsLogo, alt: 'AWS', link: 'https://aws.amazon.com/' },
        { src: adeptisLogo, alt: 'Adeptis', link: 'https://www.adeptisgroup.com/' },
        { src: universitySouthFloridaLogo, alt: 'University of South Florida', link: 'https://www.usf.edu/' },
        { src: toyotaLogo, alt: 'Toyota', link: 'https://www.toyota.com/' },
        { src: googleLogo, alt: 'Google', link: 'https://www.google.com/' },
        { src: bookingLogo, alt: 'Booking', link: 'https://www.booking.com/' },
        { src: stateFarmLogo, alt: 'State Farm', link: 'https://www.statefarm.com/' },
        { src: standardCharteredLogo, alt: 'Standard Chartered', link: 'https://www.sc.com/' },
        { src: raytheonLogo, alt: 'Raytheon', link: 'https://www.rtx.com/' },
        { src: ynovLogo, alt: 'Ynov', link: 'https://www.ynov.com/' },
        { src: intelLogo, alt: 'Intel', link: 'https://www.intel.com/' },
        { src: eaLogo, alt: 'EA', link: 'https://www.ea.com/' },
        { src: arizonaStateUniversityLogo, alt: 'Arizona State University', link: 'https://www.asu.edu/' }
    ];

    const repeatLogos = [...logos, ...logos];


    return (
        <div className="about-page">
            <div className="about-hero">
                <div className="about-hero-background">
                  </div>
                <div className="about-hero-content">
                    <h1 className="about-hero-title" data-aos="fade-up">О Нас</h1>
                    <p className="about-hero-subtitle" data-aos="fade-up" data-aos-delay="200">
                        Инновационные решения в сфере трейдинга
                    </p>
                    <div className="about-hero-buttons" data-aos="fade-up" data-aos-delay="300">
                        <a href="#who-we-are" className="about-btn primary">Узнать больше</a>
                        <a href="#careers" className="about-btn secondary">Карьера</a>
                    </div>
                </div>
            </div>
            <div className="carousel-container">
                <div className="logo-track">
                    {repeatLogos.map((logo, index) => (
                        <div key={index} className="logo-item">
                            <a href={logo.link} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={logo.src}
                                    alt={logo.alt}
                                    style={{ width: '120px', height: '50px', objectFit: 'contain' }}
                                />
                            </a>
                        </div>
                    ))}
                </div>
            </div>


            <section id="who-we-are" className="about-section">
                <div className="about-container">
                    <div className="about-grid">
                        <div className="about-content" data-aos="fade-right">
                            <h2 className="section-title">Кто мы?</h2>
                            <div className="section-divider"></div>
                            <p className="section-text">
                                Мы – команда профессионалов с многолетним опытом в сфере финансовой аналитики
                                и информационных технологий. Наша компания была основана в 2018 году с целью создания
                                инновационных решений для трейдинга, доступных каждому.
                            </p>
                            <p className="section-text">
                                За годы работы мы разработали уникальные алгоритмы анализа рынка,
                                которые позволяют нашим клиентам принимать обоснованные решения
                                и достигать успеха в торговле на различных рынках.
                            </p>
                            <div className="about-stats">
                                <div className="stat-item" data-aos="zoom-in" data-aos-delay="100">
                                    <span className="stat-number">5+</span>
                                    <span className="stat-label">лет опыта</span>
                                </div>
                                <div className="stat-item" data-aos="zoom-in" data-aos-delay="200">
                                    <span className="stat-number">10k+</span>
                                    <span className="stat-label">клиентов</span>
                                </div>
                                <div className="stat-item" data-aos="zoom-in" data-aos-delay="300">
                                    <span className="stat-number">24/7</span>
                                    <span className="stat-label">поддержка</span>
                                </div>
                            </div>
                        </div>
                        <div className="about-image" data-aos="fade-left">
                            <div className="image-container">
                                <div className="image-overlay"></div>
                                <img src={Who} alt="Наша команда" style={{ filter: "brightness(0.85)" }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="careers" className="about-section careers-section">
                <div className="about-container">
                    <div className="about-grid reversed">
                        <div className="about-image" data-aos="fade-right">
                            <div className="image-container">
                                <div className="image-overlay"></div>
                                <img src={careerImage} alt="Карьера в нашей компании" style={{ width: '600px', height: '800px'}} />
                            </div>
                        </div>
                        <div className="about-content" data-aos="fade-left">
                            <h2 className="section-title">Карьера</h2>
                            <div className="section-divider"></div>
                            <p className="section-text">
                                Мы постоянно ищем талантливых людей, которые разделяют наши ценности
                                и стремятся к профессиональному росту. В нашей компании вы найдете
                                дружный коллектив, интересные задачи и возможности для реализации
                                своего потенциала.
                            </p>
                            <div className="career-benefits">
                                <div className="benefit-item" data-aos="zoom-in" data-aos-delay="100">
                                    <div className="benefit-icon">
                                        <span className="icon">💻</span>
                                    </div>
                                    <div className="benefit-content">
                                        <h3>Современный офис</h3>
                                        <p>Комфортное рабочее пространство с самым современным оборудованием</p>
                                    </div>
                                </div>
                                <div className="benefit-item" data-aos="zoom-in" data-aos-delay="200">
                                    <div className="benefit-icon">
                                        <span className="icon">🚀</span>
                                    </div>
                                    <div className="benefit-content">
                                        <h3>Профессиональный рост</h3>
                                        <p>Обучение, участие в конференциях и возможность работать с последними технологиями</p>
                                    </div>
                                </div>
                                <div className="benefit-item" data-aos="zoom-in" data-aos-delay="300">
                                    <div className="benefit-icon">
                                        <span className="icon">🌐</span>
                                    </div>
                                    <div className="benefit-content">
                                        <h3>Гибкий график</h3>
                                        <p>Возможность удаленной работы и гибкого рабочего графика</p>
                                    </div>
                                </div>
                            </div>
                            <a href="#" className="about-btn primary">Открытые вакансии</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="company" className="about-section company-section">
                <div className="about-container">
                    <h2 className="section-title centered" data-aos="fade-up">Компания</h2>
                    <div className="section-divider centered" data-aos="fade-up"></div>
                    <p className="section-text centered" data-aos="fade-up">
                        Наша миссия — делать трейдинг доступным и эффективным для всех,
                        кто стремится к финансовой независимости.
                    </p>

                    <div className="company-values">
                        <div className="value-item" data-aos="flip-up" data-aos-delay="100">
                            <div className="value-icon">
                                <span className="icon">🔍</span>
                            </div>
                            <h3>Инновации</h3>
                            <p>Постоянно разрабатываем новые технологии и решения</p>
                        </div>
                        <div className="value-item" data-aos="flip-up" data-aos-delay="200">
                            <div className="value-icon">
                                <span className="icon">🔒</span>
                            </div>
                            <h3>Безопасность</h3>
                            <p>Обеспечиваем высший уровень защиты данных клиентов</p>
                        </div>
                        <div className="value-item" data-aos="flip-up" data-aos-delay="300">
                            <div className="value-icon">
                                <span className="icon">🤝</span>
                            </div>
                            <h3>Доверие</h3>
                            <p>Строим долгосрочные отношения на основе взаимного уважения</p>
                        </div>
                        <div className="value-item" data-aos="flip-up" data-aos-delay="400">
                            <div className="value-icon">
                                <span className="icon">🎯</span>
                            </div>
                            <h3>Результат</h3>
                            <p>Ориентируемся на достижение конкретных целей наших клиентов</p>
                        </div>
                    </div>

                    <div className="about-timeline" data-aos="fade-up">
                        <div className="timeline-item">
                            <div className="timeline-year">2018</div>
                            <div className="timeline-content">
                                <h3>Основание компании</h3>
                                <p>Начало разработки первой версии нашей платформы</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-year">2020</div>
                            <div className="timeline-content">
                                <h3>Запуск основного продукта</h3>
                                <p>Выход на рынок с инновационным решением для трейдинга</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-year">2022</div>
                            <div className="timeline-content">
                                <h3>Международная экспансия</h3>
                                <p>Открытие офисов в Европе и начало работы с международными клиентами</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-year">2024</div>
                            <div className="timeline-content">
                                <h3>Внедрение AI-технологий</h3>
                                <p>Запуск революционного продукта на основе искусственного интеллекта</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="certificate" className="about-section certificate-section">
                <div className="about-container">
                    <div className="about-grid">
                        <div className="about-content" data-aos="fade-right">
                            <h2 className="section-title">Сертификаты</h2>
                            <div className="section-divider"></div>
                            <p className="section-text">
                                Наша компания имеет все необходимые сертификаты и лицензии для осуществления
                                деятельности в сфере финансовых технологий. Мы соответствуем высоким стандартам
                                безопасности и качества, что подтверждено международными сертификациями.
                            </p>
                            <ul className="certificate-list">
                                <li className="certificate-item" data-aos="fade-up" data-aos-delay="100">
                                    <span className="certificate-icon">✓</span>
                                    <span>ISO 27001 — Информационная безопасность</span>
                                </li>
                                <li className="certificate-item" data-aos="fade-up" data-aos-delay="200">
                                    <span className="certificate-icon">✓</span>
                                    <span>GDPR Compliance — Защита персональных данных</span>
                                </li>
                                <li className="certificate-item" data-aos="fade-up" data-aos-delay="300">
                                    <span className="certificate-icon">✓</span>
                                    <span>PCI DSS — Безопасность платежных данных</span>
                                </li>
                                <li className="certificate-item" data-aos="fade-up" data-aos-delay="400">
                                    <span className="certificate-icon">✓</span>
                                    <span>FinTech Association — Членство в ассоциации финтех компаний</span>
                                </li>
                            </ul>
                            <a href="#" className="about-btn primary">Подробнее о сертификатах</a>
                        </div>
                        <div className="about-image certificates-gallery" data-aos="fade-left">
                            <div className="certificate-grid">
                                <div className="certificate-card" data-aos="zoom-in" data-aos-delay="100" style={{ border: '2px solid #00FF00', boxShadow: '0 0 10px #00FF00', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></div>
                                    <img src={ISOCertificate} alt="Сертификат ISO 27001" style={{ width: '250px', height: '350px', objectFit: 'contain', display: 'block' }} />
                                </div>
                                <div className="certificate-card" data-aos="zoom-in" data-aos-delay="200" style={{ border: '2px solid #00FF00', boxShadow: '0 0 10px #00FF00', overflow: 'hidden', position: 'relative' }}>
                                     <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></div>
                                    <img src={GDPRCertificate} alt="Сертификат GDPR" style={{ width: '250px', height: '350px', objectFit: 'contain', display: 'block' }} />
                                </div>
                                <div className="certificate-card" data-aos="zoom-in" data-aos-delay="300" style={{ border: '2px solid #00FF00', boxShadow: '0 0 10px #00FF00', overflow: 'hidden', position: 'relative' }}>
                                     <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></div>
                                    <img src={PCICertificate} alt="Сертификат PCI DSS" style={{ width: '250px', height: '350px', objectFit: 'contain', display: 'block' }} />
                                </div>
                                <div className="certificate-card" data-aos="zoom-in" data-aos-delay="400" style={{ border: '2px solid #00FF00', boxShadow: '0 0 10px #00FF00', overflow: 'hidden', position: 'relative' }}>
                                     <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></div>
                                    <img src={FINCertificate} alt="Членство FinTech Association" style={{ width: '250px', height: '350px', objectFit: 'contain', display: 'block' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-cta">
                <div className="about-container">
                    <div className="cta-content" data-aos="fade-up">
                        <h2>Готовы начать?</h2>
                        <p>Присоединяйтесь к тысячам трейдеров, которые уже используют наши инновационные решения</p>
                        <div className="cta-buttons">
                            <a href="#" className="about-btn primary">Начать сейчас</a>
                            <a href="#" className="about-btn secondary">Связаться с нами</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
import React from 'react';
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
import '../style/news.css';

const LogoCarousel = () => {
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
    <div className="carousel-container">
      <div className="logo-track">
        {repeatLogos.map((logo, index) => (
          <div key={index} className="logo-item">
            <a href={logo.link} target="_blank" rel="noopener noreferrer">
              <img 
                src={logo.src} 
                alt={logo.alt} 
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoCarousel;
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./home.css";
import mainImage from "./Image/main_image.jpg";

function Home({ isloggedin, currentUser }) {

  // Temporary sample data to show in cards
  const projects = [
    {
      id: 1,
      name: "Modern Living Room",
      style: "Modern",
      description: "A warm and contemporary living space.",
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800"
    },
    {
      id: 2,
      name: "Minimalist Apartment",
      style: "Minimalist",
      description: "Simple design with elegant details.",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
    },
    {
      id: 3,
      name: "Scandinavian Home",
      style: "Scandinavian",
      description: "Natural materials and bright interiors.",
      image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"
    }
  ];

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
            {isloggedin ? (
            <p className="home-greeting">
              Welcome back, {currentUser}
            </p>
          ):(<span className="home-eyebrow">WELCOME </span>)}
          <h1>Your space<br />Your style<br /><span>Your dream home</span></h1>

          <p>Discover inspiring interior designs and connect with professionals to bring your dream home to life.</p>

          <a href="/project" className="home-primary-button">
            Explore Projects
          </a>
        </div>

        <div className="home-hero-image">
          <img
            src={mainImage}
            alt="Beautiful modern interior"
          />
        </div>
      </section>

      {/* Projects Section */}
      <section className="home-projects">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">CURATED FOR YOU</span>
            <h2>Featured Projects</h2>
          </div>
          <p>Spaces designed to inspire your next renovation.</p>
        </div>

        <div className="home-project-grid">
          {projects.map((project) => (
            <article className="home-project-card" key={project.id}>
              <div className="home-project-image">
                <img src={project.image} alt={project.name} />
                <span className="home-project-tag">
                  {project.style}
                </span>
              </div>

              <div className="home-project-info">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="View_more_container">
            <NavLink className="View_more" to="Project">View more</NavLink>
        </div>

        {projects.length === 0 && (
          <p className="home-empty">
            No projects found. Try another search or style.
          </p>
        )}
      </section>

      {/* Call to Action */}
      <section className="home-cta">
        <span className="home-eyebrow">START YOUR JOURNEY</span>
        <h2>Let's create something beautiful.</h2>
        <p>
          Explore ideas, save your favourites, and discover
          the perfect design for your home.
        </p>

        {!isloggedin && (
          <Link to="/register" className="home-primary-button">
            Create an Account
          </Link>
        )}
      </section>

      <footer className="home-footer">
        <span>© 2026 FindID. All rights reserved.</span>
      </footer>
    </main>
  );
}

export default Home;
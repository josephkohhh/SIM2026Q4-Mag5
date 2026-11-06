import { useEffect, useState } from 'react'
import { Link, NavLink } from "react-router-dom";
import "./home.css";
import mainImage from "./Image/main_image.jpg";
import defaultImage from './Image/ProjectDefaultImage.png';

function Home({ isloggedin, currentUser }) {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      const controller = new AbortController();

      async function loadProjects() {
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/get_all_project",
            { signal: controller.signal }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          const items = Array.isArray(data) ? data : data.projects ?? [];

          const projectsWithImages = items.map((project) => ({
            ...project,
            id: project.project_id ?? project.id,
            name: project.project_name ?? project.name,
            style: project.category_code ?? project.style,
            image: project.project_image
              ? `data:image/${
                  project.project_image.startsWith("iVBOR") ? "png" : "jpeg"
                };base64,${project.project_image}`
              : null,
          }));

          if (!controller.signal.aborted) {
            setProjects(projectsWithImages);
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            setError(error.message);
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      }

      loadProjects();

      return () => controller.abort();
    }, []);

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
      
      <section className="home-projects">
        <div className="home-section-heading">
          <div>
            <span className="home-eyebrow">CURATED FOR YOU</span>
            <h2>Featured Projects</h2>
          </div>
          <p>Spaces designed to inspire your next renovation.</p>
        </div>

        <div className="home-project-grid">
          {projects.slice(0,3).map((project) => (
            <article className="home-project-card" key={project.id}>
              <div className="home-project-image">
                {project.image ? (<img src={project.image}/>) : (<img src={defaultImage} alt={project.name || "Interior design project"} />)}
                {project.style && (<span className="project-tag">{project.style}</span>)}
              </div>
              <div className="home-project-info">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="View_more_container">
            <NavLink className="View_more" to="/project">View more</NavLink>
        </div>

        {projects.length === 0 && (
          <p className="home-empty">
            No projects found.
          </p>
        )}
      </section>

      <section className="home-cta">
        <span className="home-eyebrow">START YOUR JOURNEY</span>
        <h2>Let's create something beautiful</h2>
        <p>
          Explore ideas, save your favourites, and discover
          the perferrence design for your home
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
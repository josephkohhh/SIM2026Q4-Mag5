import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "./companyprofile.css";

function CompanyProfile({ readOnly = false }) {
    const { projectId } = useParams();
    const location = useLocation();
    const customerBackPath = location.state?.from === "/project" ? "/project" : `/projects/${projectId}`;
    const [company_name, setCompany_name] = useState("");
    const [phone_no,setPhone_no] = useState("");
    const [address,setAddress]=useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [hasProfile, setHasProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [showWelcome, setShowWelcome] = useState(false);
    const [user_id] = useState(() => Number(localStorage.getItem("currentUserId")));
    const [companyProjects, setCompanyProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 3;
    const totalPages = Math.ceil(companyProjects.length / projectsPerPage);
    const paginatedProjects = companyProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

    useEffect(() => {
        if (!showWelcome) return;
        const timer = setTimeout(() => setShowWelcome(false), 5000);
        return () => clearTimeout(timer);
    }, [showWelcome]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCompanyProjects(projects) {
            setProjectsLoading(true);
            setProjectsError("");
            try {
                const projectsWithImages = await Promise.all(projects.map(async (project) => {
                    try {
                        const response = await fetch(`http://127.0.0.1:8000/projects/${project.id}/images`, {
                            signal: controller.signal,
                        });
                        if (!response.ok) {throw new Error(`HTTP ${response.status}`);}
                        const data = await response.json();
                        const cover = (data.images ?? []).find((image) => image.is_cover === true);
                        return { ...project, image: cover?.image_url ?? null };
                    } catch (error) {
                        if (controller.signal.aborted) {throw error;}
                        console.error(`Failed to load cover for project ${project.id}:`, error);
                        return { ...project, image: null };
                    }
                }));
                if (!controller.signal.aborted) {setCompanyProjects(projectsWithImages);}
            } catch (error) {
                if (!controller.signal.aborted) {setProjectsError(error.message);}
            } finally {
                if (!controller.signal.aborted) {setProjectsLoading(false);}
            }
        }

        async function loadCompanyProfile() {
            setLoading(true);
            setError("");
            if (readOnly) {
                setCompany_name("");
                setPhone_no("");
                setAddress("");
                setDescription("");
                setHasProfile(false);
                setShowWelcome(false);
                setCompanyProjects([]);
                setCurrentPage(1);
                setProjectsError("");
            }
            try {
                if (!readOnly && (!Number.isInteger(user_id) || user_id <= 0)) {
                    throw new Error("Please log in again to load your company profile.");
                }

                const url = readOnly
                    ? `http://127.0.0.1:8000/projects/${projectId}/company-profile`
                    : `http://127.0.0.1:8000/company-profiles/${user_id}`;
                const response = await fetch(url, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(data?.detail || "Failed to load company profile. Please try again.");
                }
                if (!data || !("company_profile" in data)) {
                    throw new Error("Invalid company profile response. Please try again.");
                }
                if (readOnly && (!data.company_profile || data.company_profile.status !== "ACTIVE")) {
                    throw new Error("This company profile was inactive. Please try again later.");
                }
                if (controller.signal.aborted) return;

                if (data.company_profile === null) {
                    setHasProfile(false);
                    if (!readOnly) setShowWelcome(true);
                } else {
                    const profile = data.company_profile;
                    setCompany_name(profile.company_name ?? "");
                    setPhone_no(profile.phone_no ?? "");
                    setAddress(profile.address ?? "");
                    setDescription(profile.description ?? "");
                    setStatus(profile.status ?? "ACTIVE");
                    setHasProfile(true);
                    if (readOnly) {loadCompanyProjects(data.projects ?? []);}
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadCompanyProfile();
        return () => controller.abort();
    }, [user_id, readOnly, projectId]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (readOnly || loading || saving || error) return;

        setSaving(true);
        try {
            const company = { company_name, phone_no, address, description };
            if (hasProfile) company.status = status;

            const response = await fetch(`http://127.0.0.1:8000/company-profiles/${user_id}`, {
                method: hasProfile ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(company),
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(typeof data?.detail === "string" ? data.detail : "Unable to save company information. Please try again.");
            }
            setStatus(data.status);
            setHasProfile(true);
            alert("Company information saved successfully.");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={readOnly ? "CompanyProfile_page CompanyProfile_page--customer" : "CompanyProfile_page"}>
            <main className="CompanyProfile_content">
                <Link to={readOnly ? customerBackPath : "/designer_portal"} className="CompanyProfile_back">Back</Link>
                <header className="CompanyProfile_header">
                    <h1>Company Profile</h1>
                </header>

                {!readOnly && showWelcome && (
                    <div className="CompanyProfile_welcome">
                        <div role="status">
                            <h2>Welcome to the company profile function</h2>
                            <p>Since this is your first visit, please enter your company information.</p>
                        </div>
                        <button type="button" onClick={() => setShowWelcome(false)}>Got it</button>
                    </div>
                )}

                <div className="CompanyProfile_columns">
                    <section className="CompanyProfile_card" aria-labelledby="company-information-title">
                        <h2 id="company-information-title">Company information</h2>

                        {loading && <p role="status">Loading company information...</p>}
                        {error && <p role="alert">{error}</p>}

                        <form className="CompanyProfile_form" onSubmit={handleSubmit}>
                            <fieldset className="CompanyProfile_fields" disabled={loading || saving || Boolean(error)}>
                                <label htmlFor="company-name">Company name</label>
                                <input id="company-name" name="company_name" type="text" maxLength={150}
                                    placeholder="Company name" value={company_name}
                                    readOnly={readOnly} onChange={(e) => setCompany_name(e.target.value)} />

                                <label htmlFor="company-phone">Phone</label>
                                <input id="company-phone" name="phone_no" type="tel" maxLength={30} placeholder="Phone"
                                    value={phone_no} readOnly={readOnly} onChange={(e) => setPhone_no(e.target.value)} />

                                <label htmlFor="company-address">Address</label>
                                <input id="company-address" name="address" type="text" maxLength={255}
                                    placeholder="Address" value={address}
                                    readOnly={readOnly} onChange={(e) => setAddress(e.target.value)} />

                                <label htmlFor="company-description">About the company</label>
                                <textarea id="company-description" name="description" rows={4}
                                    placeholder="Tell me about the company" value={description}
                                    readOnly={readOnly} onChange={(e) => setDescription(e.target.value)} />

                                {hasProfile && !readOnly && (
                                    <>
                                        <label htmlFor="company-status">Status</label>
                                        <select id="company-status" name="status" value={status}
                                            onChange={(e) => setStatus(e.target.value)}>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                        </select>
                                    </>
                                )}

                                {!readOnly && <button className="CompanyProfile_save" type="submit">
                                    {saving ? "Saving..." : "Save"}
                                </button>}
                            </fieldset>
                        </form>
                    </section>
                </div>
                {readOnly && !loading && !error && hasProfile && (
                    <section className="CompanyProfile_projects" aria-labelledby="company-projects-title">
                        <h2 id="company-projects-title">Projects by {company_name}</h2>
                        {projectsLoading && <p role="status">Loading company projects...</p>}
                        {projectsError && <p role="alert">{projectsError}</p>}
                        {!projectsLoading && !projectsError && (
                            <>
                                <div className="CompanyProfile_projectGrid">
                                    {paginatedProjects.map((project) => (
                                        <article className="CompanyProfile_projectCard" key={project.id}>
                                            <Link to={`/projects/${project.id}`} className="CompanyProfile_projectImage">
                                                {project.image ? <img src={project.image} alt={project.name || "Interior design project"} />
                                                    : <span className="CompanyProfile_projectPlaceholder">Interior Design Cover Picture</span>}
                                            </Link>
                                            <div className="CompanyProfile_projectInfo">
                                                <h3><Link to={`/projects/${project.id}`}>{project.name}</Link></h3>
                                                {project.style && <span className="CompanyProfile_projectStyle">{project.style}</span>}
                                                <p>{project.description}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                                {companyProjects.length === 0 ? <p>No projects found for this company.</p> : (
                                    <nav className="CompanyProfile_pagination" aria-label="Company projects pagination">
                                        <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</button>
                                        <span role="status">Page {currentPage} / {totalPages}</span>
                                        <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Next</button>
                                    </nav>
                                )}
                            </>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

export default CompanyProfile;

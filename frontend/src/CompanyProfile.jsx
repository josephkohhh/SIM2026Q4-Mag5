import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import "./companyprofile.css";
import defaultImage from './Image/ProjectDefaultImage.png';


function CompanyProfile({ readOnly = false }) {
    const { projectId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const customerBackPath = location.state?.from === "/project" ? "/project" : `/projects/${projectId}`;
    const [company_name, setCompany_name] = useState("");
    const [phone_no,setPhone_no] = useState("");
    const [address,setAddress]=useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [hasProfile, setHasProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fieldsReadOnly = readOnly || !isEditing;  
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
    const ownerUserId = new URLSearchParams(location.search).get("user_id");

    useEffect(() => {
        if (!showWelcome) return;
        const timer = setTimeout(() => setShowWelcome(false), 5000);
        return () => clearTimeout(timer);
    }, [showWelcome]);

    useEffect(() => {
        const controller = new AbortController();
        async function loadCompanyProjects(companyprofileId) {
        setProjectsLoading(true);
        setProjectsError("");

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

                const projectsWithImages = items
                .filter(
                    (project) =>
                    Number(project.companyprofile_id) === Number(companyprofileId)
                )
                .map((project) => ({
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
                setCompanyProjects(projectsWithImages);
                setCurrentPage(1);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                setProjectsError(error.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                setProjectsLoading(false);
                }
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

                const profileUserId = readOnly ? ownerUserId : user_id;
                if (!profileUserId) {throw new Error("Missing company owner user ID.");}
                const url =
                `http://127.0.0.1:8000/get_companyprofile/${profileUserId}`;
                const response = await fetch(url, {
                    signal: controller.signal,
                    cache: "no-store",
                });
                const data = await response.json().catch(() => null);
                console.log(data)
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
                    if (readOnly) {await loadCompanyProjects(profile.companyprofile_id);}
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
    }, [user_id, readOnly, projectId, ownerUserId]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (fieldsReadOnly || loading || saving || error) return;

        if (!Number.isInteger(user_id) || user_id <= 0) {
            alert("Please log in again.");
            return;
        }

        setSaving(true);

        try {
            const company = {
                company_name,
                phone_no,
                address,
                description,
            };

            if (hasProfile) {
                company.status = status;
            } else {
                company.user_id = user_id;
            }

            const url = hasProfile
                ? `http://localhost:8000/update_companyprofile?user_id=${user_id}`
                : "http://localhost:8000/create_companyprofile";

            const response = await fetch(url, {
                method: hasProfile ? "PATCH" : "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(company),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    typeof data?.detail === "string"
                        ? data.detail
                        : "Unable to save company information. Please try again."
                );
            }

            setHasProfile(true);
            setShowWelcome(false);
            setIsEditing(false);

            alert(data?.message || "Company information saved successfully.");
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={readOnly ? "CompanyProfile_page CompanyProfile_page--customer" : "CompanyProfile_page"}>
            <main className="CompanyProfile_content">
                {readOnly && (
                    <Link to={customerBackPath} className="CompanyProfile_back">Back</Link>
                )}
                <header className="CompanyProfile_header">
                    <h1 className="CompanyProfile_title">Company Profile</h1>
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
                                    readOnly={fieldsReadOnly} onChange={(e) => setCompany_name(e.target.value)} />

                                <label htmlFor="company-phone">Phone</label>
                                <input id="company-phone" name="phone_no" type="tel" maxLength={30} placeholder="Phone"
                                    value={phone_no} readOnly={fieldsReadOnly} onChange={(e) => setPhone_no(e.target.value)} />

                                <label htmlFor="company-address">Address</label>
                                <input id="company-address" name="address" type="text" maxLength={255}
                                    placeholder="Address" value={address}
                                    readOnly={fieldsReadOnly} onChange={(e) => setAddress(e.target.value)} />

                                <label htmlFor="company-description">About the company</label>
                                <textarea id="company-description" name="description" rows={4}
                                    placeholder="Tell me about the company" value={description}
                                    readOnly={fieldsReadOnly} onChange={(e) => setDescription(e.target.value)} />

                                {hasProfile && !readOnly && (
                                    <>
                                        <label htmlFor="company-status">Status</label>
                                        <select id="company-status" name="status" value={status} disabled={fieldsReadOnly}
                                            onChange={(e) => setStatus(e.target.value)}>
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                        </select>
                                    </>
                                )}

                                {!readOnly && (
                                    isEditing ? (
                                        <button key="save" className="CompanyProfile_save" type="submit">
                                            {saving ? "Saving..." : "Save"}
                                        </button>
                                    ) : (
                                        <button
                                            key="update"
                                            className="CompanyProfile_save"
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Update
                                        </button>
                                    )
                                )}
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
                                                    : <img src={defaultImage} alt={project.name || "Interior design project"} />}
                                            </Link>
                                            <div className="CompanyProfile_projectInfo">
                                                <h3><Link to={`/projects/${project.id}`}>{project.name}</Link></h3>
                                                {project.style && <span className="CompanyProfile_projectStyle">{project.style}</span>}
                                                <p>{project.description}</p>
                                            </div>
                                            <div className="CompanyProfile_projectActions">
                                                <button
                                                type="button"
                                                onClick={() => navigate(`/projects/${project.id}`)}
                                                >
                                                View Project
                                                </button>
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

import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";

import "./App.css";


const API_URL =
    "https://devconnect-api-z9on.onrender.com";


function App() {

    const [user, setUser] = useState(null);

    const [page, setPage] = useState("home");

    const [projects, setProjects] = useState([]);

    const [publicProjects, setPublicProjects] = useState([]);

    const [skills, setSkills] = useState([]);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    /* =========================================
       AUTH FORM STATES
    ========================================= */

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [name, setName] = useState("");


    /* =========================================
       PROJECT MODAL
    ========================================= */

    const [showProjectModal, setShowProjectModal] =
        useState(false);

    const [editingProject, setEditingProject] =
        useState(null);


    const [projectTitle, setProjectTitle] =
        useState("");

    const [projectDescription, setProjectDescription] =
        useState("");

    const [githubUrl, setGithubUrl] =
        useState("");

    const [selectedSkills, setSelectedSkills] =
        useState([]);


    /* =========================================
       DISCOVER
    ========================================= */

    const [skillSearch, setSkillSearch] =
        useState("");

    const [developers, setDevelopers] =
        useState([]);


    /* =========================================
       GET TOKEN
    ========================================= */

    const getToken = () => {
        return localStorage.getItem("token");
    };


    /* =========================================
       INITIAL LOAD
    ========================================= */

    useEffect(() => {

        const savedToken =
            localStorage.getItem("token");

        const savedUser =
            localStorage.getItem("user");

        if (savedToken && savedUser) {

            try {

                setUser(JSON.parse(savedUser));

            } catch {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

            }
        }

    }, []);


    /* =========================================
       NAVIGATION
    ========================================= */

    const goHome = () => {

        setPage("home");

        clearMessages();

    };


    const goLogin = () => {

        setPage("login");

        clearMessages();

    };


    const goRegister = () => {

        setPage("register");

        clearMessages();

    };


    const goDiscover = () => {

        setPage("discover");

        clearMessages();

    };


    const goProjects = () => {

        setPage("projects");

        clearMessages();

        if (user) {

            getMyProjects();

        } else {

            getPublicProjects();

        }

    };


    const goProfile = () => {

        setPage("profile");

        clearMessages();

    };


    /* =========================================
       MESSAGES
    ========================================= */

    const clearMessages = () => {

        setMessage("");

        setError("");

    };


    /* =========================================
       LOGIN
    ========================================= */

    const login = async (e) => {

    e.preventDefault();

    clearMessages();

    setLoading(true);

    try {

        const formData = new URLSearchParams();

        formData.append("username", email);
        formData.append("password", password);


        const response = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {

            setError(
                data.detail ||
                "Login failed"
            );

            setLoading(false);

            return;
        }


        const token =
            data.access_token;


        localStorage.setItem(
            "token",
            token
        );


        /*
         * Get current user after login
         */

        const userResponse =
            await fetch(
                `${API_URL}/users/me`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const userData =
            await userResponse.json();


        if (!userResponse.ok) {

            setError(
                userData.detail ||
                "Could not load user profile."
            );

            localStorage.removeItem("token");

            setLoading(false);

            return;
        }


        setUser(userData);

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );


        setEmail("");

        setPassword("");


        setMessage(
            "Login successful!"
        );


        setPage("home");


    } catch (err) {

        console.error(
            "Login error:",
            err
        );

        setError(
            "Could not connect to the server."
        );

    }


    setLoading(false);
};


    /* =========================================
       REGISTER
    ========================================= */

    const register = async (e) => {

        e.preventDefault();

        clearMessages();

        setLoading(true);

        try {

            const response =
                await fetch(
                    `${API_URL}/users`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.detail ||
                    "Registration failed"
                );

                setLoading(false);

                return;
            }


            setName("");

            setEmail("");

            setPassword("");


            setMessage(
                "Account created successfully! Please login."
            );


            setPage("login");


        } catch (err) {

            console.error(err);

            setError(
                "Could not connect to the server."
            );

        }

        setLoading(false);
    };


    /* =========================================
       LOGOUT
    ========================================= */

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

        setProjects([]);

        setPage("home");

        setMessage(
            "You have been logged out."
        );
    };


    /* =========================================
       GET PUBLIC PROJECTS
    ========================================= */

    const getPublicProjects = async () => {

        setLoading(true);

        try {

            const response =
                await fetch(
                    `${API_URL}/projects/public`
                );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(data);

                setPublicProjects([]);

                return;
            }


            setPublicProjects(data);

        } catch (err) {

            console.error(
                "Could not fetch public projects:",
                err
            );

            setPublicProjects([]);

        } finally {

            setLoading(false);

        }
    };


    /* =========================================
       GET MY PROJECTS
    ========================================= */

    const getMyProjects = async () => {

        const token =
            getToken();

        if (!token) {

            getPublicProjects();

            return;
        }


        setLoading(true);

        try {

            const response =
                await fetch(
                    `${API_URL}/projects/`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(data);

                setProjects([]);

                return;
            }


            setProjects(data);

        } catch (err) {

            console.error(err);

            setProjects([]);

        } finally {

            setLoading(false);

        }
    };


    /* =========================================
       GET SKILLS
    ========================================= */

    const getSkills = async () => {

        try {

            const token =
                getToken();

            const response =
                await fetch(
                    `${API_URL}/skills/`,
                    {
                        headers: token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                            }
                            : {}
                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                setSkills(data);

            }

        } catch (err) {

            console.error(
                "Could not fetch skills:",
                err
            );

        }
    };


    /* =========================================
       OPEN CREATE PROJECT
    ========================================= */

    const openCreateProject = async () => {

        clearMessages();

        setEditingProject(null);

        setProjectTitle("");

        setProjectDescription("");

        setGithubUrl("");

        setSelectedSkills([]);

        await getSkills();

        setShowProjectModal(true);
    };


    /* =========================================
       OPEN EDIT PROJECT
    ========================================= */

    const openEditProject = async (project) => {

        clearMessages();

        setEditingProject(project);

        setProjectTitle(
            project.title || ""
        );

        setProjectDescription(
            project.description || ""
        );

        setGithubUrl(
            project.github_url || ""
        );


        await getSkills();


        if (project.skills) {

            setSelectedSkills(
                project.skills
            );

        } else {

            setSelectedSkills([]);

        }


        setShowProjectModal(true);
    };


    /* =========================================
       CLOSE PROJECT MODAL
    ========================================= */

    const closeProjectModal = () => {

        setShowProjectModal(false);

        setEditingProject(null);

        setProjectTitle("");

        setProjectDescription("");

        setGithubUrl("");

        setSelectedSkills([]);

    };


    /* =========================================
       SKILL SELECT
    ========================================= */

    const addSelectedSkill = (skillId) => {

        if (!skillId) {
            return;
        }


        const skill =
            skills.find(
                item =>
                    String(item.id) ===
                    String(skillId)
            );


        if (!skill) {
            return;
        }


        const alreadySelected =
            selectedSkills.some(
                item =>
                    item.id === skill.id
            );


        if (alreadySelected) {
            return;
        }


        setSelectedSkills([
            ...selectedSkills,
            skill
        ]);
    };


    /* =========================================
       REMOVE SELECTED SKILL
    ========================================= */

    const removeSelectedSkill = (skillId) => {

        setSelectedSkills(
            selectedSkills.filter(
                skill =>
                    skill.id !== skillId
            )
        );
    };


    /* =========================================
       CREATE PROJECT
    ========================================= */

    const createProject = async () => {

        const token =
            getToken();


        if (!token) {

            setError(
                "You must login to create a project."
            );

            return;
        }


        if (!projectTitle.trim()) {

            setError(
                "Please enter a project title."
            );

            return;
        }


        if (!projectDescription.trim()) {

            setError(
                "Please enter a project description."
            );

            return;
        }


        setLoading(true);

        clearMessages();


        try {

            const response =
                await fetch(
                    `${API_URL}/projects/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title:
                                projectTitle,

                            description:
                                projectDescription,

                            github_url:
                                githubUrl ||
                                null
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.detail ||
                    "Could not create project."
                );

                setLoading(false);

                return;
            }


            /*
             * Add selected skills to project
             */

            for (
                const skill
                of selectedSkills
            ) {

                await fetch(
                    `${API_URL}/projects/${data.id}/skills/${skill.id}`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            }


            closeProjectModal();


            await getMyProjects();


            /*
             * Also refresh public projects
             * so the new project appears
             * to other users.
             */

            await getPublicProjects();


            setMessage(
                "Project created successfully!"
            );


        } catch (err) {

            console.error(err);

            setError(
                "Could not connect to the server."
            );

        }


        setLoading(false);
    };


    /* =========================================
       UPDATE PROJECT
    ========================================= */

    const updateProject = async () => {

        const token =
            getToken();


        if (!token || !editingProject) {
            return;
        }


        if (!projectTitle.trim()) {

            setError(
                "Please enter a project title."
            );

            return;
        }


        if (!projectDescription.trim()) {

            setError(
                "Please enter a project description."
            );

            return;
        }


        setLoading(true);

        clearMessages();


        try {

            const response =
                await fetch(
                    `${API_URL}/projects/${editingProject.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title:
                                projectTitle,

                            description:
                                projectDescription,

                            github_url:
                                githubUrl ||
                                null
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.detail ||
                    "Could not update project."
                );

                setLoading(false);

                return;
            }


            /*
             * Get existing skills
             */

            let existingSkills = [];


            try {

                const skillResponse =
                    await fetch(
                        `${API_URL}/projects/${editingProject.id}/skills`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (skillResponse.ok) {

                    existingSkills =
                        await skillResponse.json();

                }

            } catch (err) {

                console.error(err);

            }


            /*
             * Remove old skills
             */

            for (
                const skill
                of existingSkills
            ) {

                const stillSelected =
                    selectedSkills.some(
                        selected =>
                            selected.id ===
                            skill.id
                    );


                if (!stillSelected) {

                    await fetch(
                        `${API_URL}/projects/${editingProject.id}/skills/${skill.id}`,
                        {
                            method: "DELETE",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                }

            }


            /*
             * Add new skills
             */

            for (
                const skill
                of selectedSkills
            ) {

                const alreadyExists =
                    existingSkills.some(
                        existing =>
                            existing.id ===
                            skill.id
                    );


                if (!alreadyExists) {

                    await fetch(
                        `${API_URL}/projects/${editingProject.id}/skills/${skill.id}`,
                        {
                            method: "POST",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                }

            }


            closeProjectModal();


            await getMyProjects();

            await getPublicProjects();


            setMessage(
                "Project updated successfully!"
            );


        } catch (err) {

            console.error(err);

            setError(
                "Could not connect to the server."
            );

        }


        setLoading(false);
    };


    /* =========================================
       SAVE PROJECT
    ========================================= */

    const saveProject = async () => {

        if (editingProject) {

            await updateProject();

        } else {

            await createProject();

        }
    };


    /* =========================================
       DELETE PROJECT
    ========================================= */

    const deleteProject = async (projectId) => {

        const token =
            getToken();


        if (!token) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this project?"
            );


        if (!confirmed) {
            return;
        }


        setLoading(true);

        clearMessages();


        try {

            const response =
                await fetch(
                    `${API_URL}/projects/${projectId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.detail ||
                    "Could not delete project."
                );

                setLoading(false);

                return;
            }


            await getMyProjects();

            await getPublicProjects();


            setMessage(
                "Project deleted successfully!"
            );


        } catch (err) {

            console.error(err);

            setError(
                "Could not connect to the server."
            );

        }


        setLoading(false);
    };


    /* =========================================
       DISCOVER DEVELOPERS
    ========================================= */

    const searchDevelopers = async () => {
        try {

            const response =
                await fetch(
                    `${API_URL}/users/search?skill=${encodeURIComponent(skillSearch)}`
                );


            const data =
                await response.json();


            if (response.ok) {

                setDevelopers(data);

            } else {

                setDevelopers([]);

            }

        } catch (err) {

            console.error(err);

            setDevelopers([]);

        }
    };


    /* =========================================
       RENDER AUTH FORM
    ========================================= */

    const renderAuth = () => {

        const isLogin =
            page === "login";


        return (

            <div className="auth-container">

                <div className="card">

                    <h2>
                        {isLogin
                            ? "Login"
                            : "Create Account"}
                    </h2>


                    {!isLogin && (

                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={
                                e =>
                                    setName(
                                        e.target.value
                                    )
                            }
                        />

                    )}


                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={
                            e =>
                                setEmail(
                                    e.target.value
                                )
                        }
                    />


                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={
                            e =>
                                setPassword(
                                    e.target.value
                                )
                        }
                    />


                    <button
                        onClick={
                            isLogin
                                ? login
                                : register
                        }
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                                ? "Login"
                                : "Create Account"}
                    </button>


                    {isLogin ? (

                        <p>

                            Don't have an account?

                            <button
                                className="text-button"
                                onClick={
                                    goRegister
                                }
                            >
                                Create Account
                            </button>

                        </p>

                    ) : (

                        <p>

                            Already have an account?

                            <button
                                className="text-button"
                                onClick={
                                    goLogin
                                }
                            >
                                Login
                            </button>

                        </p>

                    )}

                </div>

            </div>

        );
    };


    /* =========================================
       HOME
    ========================================= */

    const renderHome = () => {

        if (user) {

            return (

                <div className="container">

                    <div className="dashboard-header">

                        <h1>
                            Welcome, {user.name} 👋
                        </h1>

                        <p>
                            Here's your DevConnect dashboard.
                        </p>

                    </div>


                    <div className="dashboard-grid">


                        <div className="card profile-card">

                            <h2>
                                My Profile
                            </h2>

                            <p>
                                <strong>Name:</strong>{" "}
                                {user.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {user.email}
                            </p>

                            <button
                                onClick={
                                    goProfile
                                }
                            >
                                View Profile
                            </button>

                        </div>


                        <div className="card">

                            <h2>
                                Quick Actions
                            </h2>

                            <div className="quick-actions">

                                <button
                                    className="quick-action-button"
                                    onClick={
                                        goDiscover
                                    }
                                >
                                    🔎 Discover Developers
                                </button>


                                <button
                                    className="quick-action-button"
                                    onClick={
                                        goProjects
                                    }
                                >
                                    🚀 Explore Projects
                                </button>


                                <button
                                    className="quick-action-button"
                                    onClick={
                                        openCreateProject
                                    }
                                >
                                    🛠 Manage Projects
                                </button>

                            </div>

                        </div>

                    </div>


                    <div className="stats">

                        <div className="stat-card">

                            <h3>
                                {projects.length}
                            </h3>

                            <p>
                                Projects
                            </p>

                        </div>


                        <div className="stat-card">

                            <h3>
                                {skills.length}
                            </h3>

                            <p>
                                Skills
                            </p>

                        </div>


                        <div className="stat-card">

                            <h3>
                                0
                            </h3>

                            <p>
                                Connections
                            </p>

                        </div>

                    </div>

                </div>

            );
        }


        return (

            <section className="hero">

                <h1>
                    Welcome to DevConnect
                </h1>

                <p>
                    Connect with developers, discover skills, and build amazing projects together.
                </p>

            </section>

        );
    };


    /* =========================================
       DISCOVER PAGE
    ========================================= */

    const renderDiscover = () => {

        return (

            <div className="discover-page">

                <h1>
                    Discover Developers
                </h1>

                <p>
                    Find developers by their skills.
                </p>


                <div className="search-row">

                    <input
                        type="text"
                        placeholder="Search by skill (e.g. Python)"
                        value={skillSearch}
                        onChange={
                            e =>
                                setSkillSearch(
                                    e.target.value
                                )
                        }
                    />


                    <button
                        className="search-button"
                        onClick={
                            searchDevelopers
                        }
                    >
                        Search
                    </button>

                </div>


                {developers.length > 0 && (

                    <div className="developer-grid">

                        {developers.map(
                            developer => (

                                <div
                                    className="developer-card"
                                    key={
                                        developer.id
                                    }
                                >

                                    <h3>
                                        {
                                            developer.name
                                        }
                                    </h3>

                                    <p>
                                        {
                                            developer.email
                                        }
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        );
    };


    /* =========================================
       PROJECT CARD
    ========================================= */

    const renderProjectCard = (
        project,
        isOwner = false
    ) => {

        return (

            <div
                className="project-card"
                key={project.id}
            >

                <h3>
                    {project.title}
                </h3>


                <p className="project-description">
                    {project.description}
                </p>


                {!isOwner && project.user_name && (

                    <p className="project-author">

                        Posted by:{" "}

                        <strong>
                            {project.user_name}
                        </strong>

                    </p>

                )}


                {project.skills &&
                    project.skills.length > 0 && (

                        <div className="project-skills">

                            <div className="project-skills-title">
                                Technologies / Skills
                            </div>


                            <div className="skill-tags">

                                {project.skills.map(
                                    skill => (

                                        <span
                                            className="skill-tag"
                                            key={
                                                skill.id
                                            }
                                        >
                                            {skill.name}
                                        </span>

                                    )
                                )}

                            </div>

                        </div>

                    )}


                {project.github_url && (

                    <a
                        className="github-link"
                        href={
                            project.github_url
                        }
                        target="_blank"
                        rel="noreferrer"
                    >
                        View on GitHub ↗
                    </a>

                )}


                {isOwner && (

                    <div className="project-actions">

                        <button
                            className="edit-button"
                            onClick={() =>
                                openEditProject(
                                    project
                                )
                            }
                        >
                            Edit
                        </button>


                        <button
                            className="delete-button"
                            onClick={() =>
                                deleteProject(
                                    project.id
                                )
                            }
                        >
                            Delete
                        </button>

                    </div>

                )}

            </div>

        );
    };


    /* =========================================
       PROJECTS PAGE
    ========================================= */

    const renderProjects = () => {

        /*
         * LOGGED-IN USER
         */

        if (user) {

            return (

                <div className="projects-page">

                    <div className="projects-header">

                        <h1>
                            My Projects
                        </h1>


                        <button
                            className="create-project-button"
                            onClick={
                                openCreateProject
                            }
                        >
                            + Create Project
                        </button>

                    </div>


                    {loading && projects.length === 0 ? (

                        <div className="loading">
                            Loading projects...
                        </div>

                    ) : projects.length === 0 ? (

                        <div className="empty-projects">

                            <div className="empty-icon">
                                🚀
                            </div>

                            <h2>
                                You haven't posted any projects yet
                            </h2>

                            <p>
                                Share what you've built and let other developers discover your work.
                            </p>


                            <button
                                className="create-project-button"
                                onClick={
                                    openCreateProject
                                }
                            >
                                + Create Your First Project
                            </button>

                        </div>

                    ) : (

                        <div className="project-grid">

                            {projects.map(
                                project =>
                                    renderProjectCard(
                                        project,
                                        true
                                    )
                            )}

                        </div>

                    )}

                </div>

            );
        }


        /*
         * LOGGED-OUT USER
         */

        return (

            <div className="projects-page">

                <div className="projects-header">

                    <h1>
                        Projects
                    </h1>

                </div>


                {loading &&
                    publicProjects.length === 0 ? (

                    <div className="loading">
                        Loading projects...
                    </div>

                ) : publicProjects.length === 0 ? (

                    <div className="empty-projects">

                        <div className="empty-icon">
                            🚀
                        </div>

                        <h2>
                            No projects yet
                        </h2>

                        <p>
                            Developers haven't posted any projects yet.
                        </p>

                    </div>

                ) : (

                    <div className="project-grid">

                        {publicProjects.map(
                            project =>
                                renderProjectCard(
                                    project,
                                    false
                                )
                        )}

                    </div>

                )}

            </div>

        );
    };


    /* =========================================
       PROFILE PAGE
    ========================================= */

    const renderProfile = () => {

        if (!user) {

            return (

                <div className="profile-page">

                    <h1>
                        Profile
                    </h1>

                    <p>
                        Please login to view your profile.
                    </p>

                </div>

            );
        }


        return (

            <div className="profile-page">

                <h1>
                    My Profile
                </h1>


                <div className="profile-info">

                    <p>
                        <strong>Name:</strong>{" "}
                        {user.name}
                    </p>


                    <p>
                        <strong>Email:</strong>{" "}
                        {user.email}
                    </p>

                </div>

            </div>

        );
    };


    /* =========================================
       PROJECT MODAL
    ========================================= */

    const renderProjectModal = () => {

        if (!showProjectModal) {
            return null;
        }


        return (

            <div className="modal-overlay">

                <div className="modal">

                    <div className="modal-header">

                        <div>

                            <h2>
                                {editingProject
                                    ? "Edit Project"
                                    : "Create Project"}
                            </h2>

                            <div className="modal-subtitle">
                                Tell the community what you've built.
                            </div>

                        </div>


                        <button
                            className="close-button"
                            onClick={
                                closeProjectModal
                            }
                        >
                            ×
                        </button>

                    </div>


                    <label className="form-label">
                        Project Title
                    </label>

                    <input
                        type="text"
                        placeholder="e.g. DevConnect API"
                        value={projectTitle}
                        onChange={
                            e =>
                                setProjectTitle(
                                    e.target.value
                                )
                        }
                    />


                    <label className="form-label">
                        Description
                    </label>

                    <textarea
                        placeholder="Describe your project..."
                        value={
                            projectDescription
                        }
                        onChange={
                            e =>
                                setProjectDescription(
                                    e.target.value
                                )
                        }
                    />


                    <label className="form-label">
                        GitHub URL
                        <span style={{
                            color: "#94a3b8",
                            fontWeight: "normal"
                        }}>
                            {" "}(optional)
                        </span>
                    </label>

                    <input
                        type="text"
                        placeholder="https://github.com/username/project"
                        value={githubUrl}
                        onChange={
                            e =>
                                setGithubUrl(
                                    e.target.value
                                )
                        }
                    />


                    <div className="skills-selector">

                        <label className="form-label">
                            Technologies / Skills
                        </label>


                        {skills.length > 0 ? (

                            <>

                                <select
                                    className="skills-select"
                                    value=""
                                    onChange={
                                        e =>
                                            addSelectedSkill(
                                                e.target.value
                                            )
                                    }
                                >

                                    <option value="">
                                        Select a technology or skill
                                    </option>


                                    {skills.map(
                                        skill => (

                                            <option
                                                value={
                                                    skill.id
                                                }
                                                key={
                                                    skill.id
                                                }
                                            >
                                                {skill.name}
                                            </option>

                                        )
                                    )}

                                </select>


                                <div className="selected-skills">

                                    {selectedSkills.map(
                                        skill => (

                                            <span
                                                className="selected-skill"
                                                key={
                                                    skill.id
                                                }
                                            >

                                                {skill.name}

                                                <button
                                                    className="remove-skill"
                                                    onClick={() =>
                                                        removeSelectedSkill(
                                                            skill.id
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>

                                            </span>

                                        )
                                    )}

                                </div>

                            </>

                        ) : (

                            <input
                                type="text"
                                placeholder="e.g. Python, React, FastAPI"
                                disabled
                            />

                        )}

                    </div>


                    {error && (

                        <div className="error-message">
                            {error}
                        </div>

                    )}


                    <div className="modal-actions">

                        <button
                            className="cancel-button"
                            onClick={
                                closeProjectModal
                            }
                        >
                            Cancel
                        </button>


                        <button
                            className="submit-button"
                            onClick={
                                saveProject
                            }
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : editingProject
                                    ? "Update Project"
                                    : "Create Project"}
                        </button>

                    </div>

                </div>

            </div>

        );
    };


    /* =========================================
       MAIN PAGE RENDER
    ========================================= */

    return (

        <>

            <Navbar
                user={user}
                onLogout={logout}
                onLogin={goLogin}
                onRegister={goRegister}
                onHome={goHome}
                onDiscover={goDiscover}
                onProjects={goProjects}
                onProfile={goProfile}
            />


            {message && (

                <div className="message">
                    {message}
                </div>

            )}


            {page === "home" &&
                renderHome()}


            {page === "login" &&
                renderAuth()}


            {page === "register" &&
                renderAuth()}


            {page === "discover" &&
                renderDiscover()}


            {page === "projects" &&
                renderProjects()}


            {page === "profile" &&
                renderProfile()}


            {renderProjectModal()}

        </>

    );
}


export default App;
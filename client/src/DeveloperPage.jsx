import React from 'react';

// Developer data from the previous Ayush Ojha version (retained)
const DEVELOPER_INFO = {
    name: "Ayush Ojha",
    title: "Full Stack Web Developer",
    degree: "B.Tech in Information Technology",
    bio: "Passionate about creating intuitive web experiences and solving real-world problems through technology.",
    avatar: "https://ui-avatars.com/api/?name=Ayush+Ojha&background=5B21B6&color=fff&size=150&bold=true", 
    email: "0905IT231028@itm.in", // Placeholder based on provided enrollment
    social: [
        { icon: "🔗", link: "#", label: "LinkedIn" },
        { icon: "💻", link: "#", label: "GitHub" },
    ],
    education: {
        institute: "Madhav Institute of Technology & Science, Gwalior",
        degree: "B.Tech in Information Technology",
        duration: "Aug 2023 - Jun 2027",
        cgpa: "7.5/10",
        enrollment: "0905IT231028",
        department: "Information Technology",
    },
    achievements: [
        "Solely created this entire platform from scratch",
        "Active participant in various coding competitions",
        "Consistently maintaining good academic performance (CGPA: 7.5)",
        "Developing practical web development skills alongside academics",
    ],
    // Retaining projects as 'Internships' section for structure consistency with the image
    internships: [ 
        { company: "ITM GOI Platform", role: "Complete web platform development", duration: "Full Stack", details: "Developed with user authentication and contest management features." },
        { company: "Various Web Applications", role: "Multiple projects using MERN stack", duration: "MERN Stack", details: "Focusing on modern web technologies and scalable architectures." },
    ],
    supporting: [
        { name: "ITM Faculty/Mentors", title: "Guidance and Support", email: "support@itm.in", enrollment: "N/A" }
    ]
};

const SectionTitle = ({ children, icon }) => (
    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-xl text-indigo-600">{icon}</span>
        {children}
    </h3>
);

const DeveloperPageNew = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Meet the Developer</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-sm">
                        {DEVELOPER_INFO.bio}
                    </p>
                </header>

                {/* --- Developer Card (Indigo/Purple Theme) --- */}
                <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white rounded-xl shadow-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
                    <img 
                        src={DEVELOPER_INFO.avatar} 
                        alt={DEVELOPER_INFO.name} 
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-1">{DEVELOPER_INFO.name}</h2>
                        <p className="text-indigo-200 text-sm font-medium">{DEVELOPER_INFO.degree}</p>
                        <p className="text-indigo-300 text-xs mt-1">{DEVELOPER_INFO.title}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                            {DEVELOPER_INFO.social.map((item, index) => (
                                <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition">
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </a>
                            ))}
                            <span className="text-xs text-indigo-300 flex items-center gap-1.5">
                                ✉️ {DEVELOPER_INFO.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- Details Grid (CV Layout) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* COLUMN 1: Education */}
                    <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
                        <SectionTitle icon="📚">Education</SectionTitle>
                        <div className="text-sm text-gray-700 space-y-3">
                            <p className="font-bold text-gray-900">{DEVELOPER_INFO.education.institute}</p>
                            <p className="text-indigo-600">{DEVELOPER_INFO.education.degree}</p>
                            
                            <ul className="list-none space-y-1 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <li><span className="font-semibold">Duration:</span> {DEVELOPER_INFO.education.duration}</li>
                                <li><span className="font-semibold">CGPA:</span> {DEVELOPER_INFO.education.cgpa}</li>
                                <li><span className="font-semibold">Enrollment:</span> {DEVELOPER_INFO.education.enrollment}</li>
                                <li><span className="font-semibold">Department:</span> {DEVELOPER_INFO.education.department}</li>
                            </ul>
                        </div>
                    </div>

                    {/* COLUMN 2: Key Achievements */}
                    <div className="p-4 bg-white rounded-xl shadow border border-gray-100">
                        <SectionTitle icon="⭐">Key Achievements</SectionTitle>
                        <ul className="text-sm text-gray-700 space-y-3 list-none pl-0">
                            {DEVELOPER_INFO.achievements.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">✅</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* INTERNSHIPS / PROJECTS */}
                    <div className="lg:col-span-2 p-4 bg-white rounded-xl shadow border border-gray-100">
                        <SectionTitle icon="💼">Projects / Experience</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {DEVELOPER_INFO.internships.map((proj, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-indigo-200/50 hover:shadow-md transition">
                                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{proj.duration}</span>
                                    <h4 className="text-md font-bold text-gray-800 mt-2">{proj.company}</h4>
                                    <p className="text-xs text-gray-600 mb-3">{proj.role}</p>
                                    <p className="text-xs text-gray-500 mt-1">{proj.details}</p>
                                    <a href="#" className="text-xs font-semibold text-indigo-500 hover:underline mt-2 inline-block">View Project →</a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- Supporting Section (ITM Guidance) --- */}
                <div className="mt-8 p-4 bg-white rounded-xl shadow border border-gray-100">
                    <SectionTitle icon="🤝">Supporting Guidance</SectionTitle>
                    <div className="bg-indigo-50 p-4 rounded-lg flex items-center gap-4">
                        <img 
                            src={`https://ui-avatars.com/api/?name=${DEVELOPER_INFO.supporting[0].name}&background=EF4444&color=fff&size=80&bold=true`} 
                            alt={DEVELOPER_INFO.supporting[0].name} 
                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
                        />
                        <div>
                            <h4 className="text-md font-bold text-gray-800">{DEVELOPER_INFO.supporting[0].name}</h4>
                            <p className="text-sm text-indigo-600">{DEVELOPER_INFO.supporting[0].title}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPageNew;
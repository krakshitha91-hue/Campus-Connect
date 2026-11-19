import { useEffect, useState, createContext, useContext } from "react";
import { Routes, Route, Navigate, Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Megaphone, CalendarDays, BookOpen, MessageSquare, Search, PackageSearch, LogOut, GraduationCap, Menu, X, ShieldCheck } from "lucide-react";
import api, { fileUrl } from "./api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading CampusConnect…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}
function Shell({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const links = [
    ["/dashboard", "Overview", Home], ["/announcements", "Announcements", Megaphone],
    ["/events", "Events", CalendarDays], ["/notes", "Study materials", BookOpen],
    ["/forum", "Discussion forum", MessageSquare], ["/lost-found", "Lost & found", PackageSearch]
  ];
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "show" : ""}`}>
      <div className="brand"><span className="brand-icon"><GraduationCap size={23}/></span><span>Campus<span className="brand-light">Connect</span></span><button className="mobile-close" onClick={()=>setOpen(false)}><X/></button></div>
      <div className="side-label">CAMPUS</div>
      {links.map(([to,label,Icon])=><NavLink onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?"active":""}`} to={to} key={to}><Icon size={18}/>{label}</NavLink>)}
      {user?.role==="admin" && <><div className="side-label">MANAGEMENT</div><NavLink onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?"active":""}`} to="/admin"><ShieldCheck size={18}/>Admin panel</NavLink></>}
      <div className="sidebar-bottom"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div className="user-mini"><b>{user?.name}</b><small>{user?.role==="admin"?"Administrator":"Student"}</small></div><button className="icon-button" title="Logout" onClick={logout}><LogOut size={18}/></button></div>
    </aside>
    {open && <div className="overlay" onClick={()=>setOpen(false)}/>}
    <main className="main-area"><header className="topbar"><button className="mobile-menu icon-button" onClick={()=>setOpen(true)}><Menu/></button><div className="breadcrumb">CampusConnect <span>/</span> Campus hub</div><div className="top-right"><span className="online-dot"/> Campus community <div className="top-avatar">{user?.name?.[0]?.toUpperCase()}</div></div></header>{children}</main>
  </div>;
}
function Page({title, subtitle, action, children}) { return <div className="page"><div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>{children}</div>; }
function Notice({text, type="error"}) { return text ? <div className={`notice ${type}`}>{text}</div> : null; }
function AuthPage({register=false}) {
  const { login, registerUser, user } = useAuth(); const nav=useNavigate();
  const [form,setForm]=useState({name:"",email:"",password:"",department:"",year:""});
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{if(user) nav("/dashboard");},[user]);
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  const submit=async e=>{e.preventDefault();setError("");setBusy(true);try{register?await registerUser(form):await login(form.email,form.password);nav("/dashboard");}catch(err){setError(err.response?.data?.message||"Something went wrong");}finally{setBusy(false);}};
  return <div className="auth-wrap"><div className="auth-art"><div className="auth-logo"><GraduationCap/> CampusConnect</div><div><span className="eyebrow">YOUR CAMPUS. YOUR COMMUNITY.</span><h1>Make campus life<br/><em>more connected.</em></h1><p>One place for campus updates, events, shared knowledge and student conversations.</p></div><div className="art-footer">Learn together. Grow together.</div></div><div className="auth-panel"><div className="auth-form"><div className="mobile-auth-brand"><GraduationCap/> CampusConnect</div><span className="eyebrow">{register?"GET STARTED":"WELCOME BACK"}</span><h2>{register?"Create your account":"Sign in to your campus"}</h2><p className="muted">{register?"Join your campus community today.":"Your campus community is waiting for you."}</p><Notice text={error}/><form onSubmit={submit}>
    {register&&<><label>Full name<input name="name" autoComplete="name" value={form.name} onChange={change} placeholder="Your name" required/></label><label>Department<input name="department" value={form.department} onChange={change} placeholder="e.g. Computer Science"/></label><label>Year of study<select name="year" value={form.year} onChange={change}><option value="">Select year</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>Year {n}</option>)}</select></label></>}
    <label>Email address<input type="email" name="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@college.edu" required/></label><label>Password<input type="password" name="password" autoComplete={register?"new-password":"current-password"} value={form.password} onChange={change} placeholder="At least 8 characters" minLength="8" required/></label><button className="btn primary full" disabled={busy}>{busy?"Please wait…":register?"Create account":"Sign in"}</button></form><p className="auth-switch">{register?"Already have an account?":"New to CampusConnect?"} <Link to={register?"/login":"/register"}>{register?"Sign in":"Create account"}</Link></p></div></div></div>;
}
function Dashboard() {
  const {user}=useAuth(); const [data,setData]=useState({announcements:[],events:[],notes:[],posts:[]});
  useEffect(()=>{Promise.all([api.get("/announcements"),api.get("/events"),api.get("/notes"),api.get("/posts")]).then(([a,e,n,p])=>setData({announcements:a.data,events:e.data,notes:n.data,posts:p.data})).catch(()=>{});},[]);
  return <Page title={`Good to see you, ${user?.name?.split(" ")[0]} 👋`} subtitle="Here’s what’s happening around your campus today.">
    <div className="welcome-banner"><div><span className="eyebrow">YOUR CAMPUS AT A GLANCE</span><h2>Stay curious. Stay connected.</h2><p>Discover what’s happening, find your people and make the most of campus life.</p></div><div className="banner-mark"><GraduationCap size={76}/></div></div>
    <div className="stats-grid"><Stat icon={Megaphone} label="Announcements" value={data.announcements.length} color="purple"/><Stat icon={CalendarDays} label="Upcoming events" value={data.events.filter(e=>new Date(e.date)>=new Date()).length} color="orange"/><Stat icon={BookOpen} label="Study resources" value={data.notes.length} color="green"/><Stat icon={MessageSquare} label="Forum discussions" value={data.posts.length} color="blue"/></div>
    <div className="dashboard-grid"><section className="card"><div className="card-head"><div><h3>Latest announcements</h3><p>Important updates from campus</p></div><Link to="/announcements">View all →</Link></div>{data.announcements.slice(0,4).map(a=><div className="feed-row" key={a._id}><div className="feed-icon purple-bg"><Megaphone size={17}/></div><div className="feed-content"><b>{a.title}</b><p>{a.body}</p><small>{a.category} · {new Date(a.createdAt).toLocaleDateString()}</small></div></div>)}{!data.announcements.length&&<Empty text="No announcements yet."/>}</section>
    <section className="card"><div className="card-head"><div><h3>Upcoming events</h3><p>Things to look forward to</p></div><Link to="/events">View all →</Link></div>{data.events.filter(e=>new Date(e.date)>=new Date()).slice(0,4).map(e=><div className="event-row" key={e._id}><div className="date-tile"><b>{new Date(e.date).getDate()}</b><small>{new Date(e.date).toLocaleString("en",{month:"short"})}</small></div><div><b>{e.title}</b><p>{e.location}</p><small>{new Date(e.date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</small></div></div>)}{!data.events.filter(e=>new Date(e.date)>=new Date()).length&&<Empty text="No upcoming events."/>}</section></div>
    <div className="quick-links"><Link to="/notes"><BookOpen/> Explore study materials <span>→</span></Link><Link to="/forum"><MessageSquare/> Join a discussion <span>→</span></Link><Link to="/lost-found"><PackageSearch/> Lost something? <span>→</span></Link></div>
  </Page>;
}
function Stat({icon:Icon,label,value,color}) { return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={20}/></div><div><b>{value}</b><span>{label}</span></div></div>; }
function Empty({text}) { return <div className="empty">{text}</div>; }
function Announcements() {
 const {user}=useAuth();const [items,setItems]=useState([]);const [form,setForm]=useState({title:"",body:"",category:"General",pinned:false});const [error,setError]=useState("");
 const load=()=>api.get("/announcements").then(r=>setItems(r.data));useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();try{await api.post("/announcements",form);setForm({title:"",body:"",category:"General",pinned:false});load();}catch(e){setError(e.response?.data?.message||"Could not publish");}};
 const remove=async id=>{if(confirm("Delete this announcement?")){await api.delete(`/announcements/${id}`);load();}};
 return <Page title="Announcements" subtitle="The latest news and important updates from your campus." action={user.role==="admin"?<span className="admin-pill"><ShieldCheck size={15}/> Admin publishing</span>:null}>
 {user.role==="admin"&&<form className="card form-card" onSubmit={submit}><h3>Publish an announcement</h3><div className="form-grid"><label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["General","Academic","Examination","Placement","Urgent"].map(x=><option>{x}</option>)}</select></label></div><label>Message<textarea required rows="3" value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><label className="check-label"><input type="checkbox" checked={form.pinned} onChange={e=>setForm({...form,pinned:e.target.checked})}/> Pin announcement</label><Notice text={error}/><button className="btn primary">Publish announcement</button></form>}
 <div className="stack">{items.map(a=><article className="card announcement-card" key={a._id}><div className="announcement-top"><span className="tag">{a.category}</span>{a.pinned&&<span className="pinned">📌 Pinned</span>}</div><h3>{a.title}</h3><p>{a.body}</p><div className="meta">Posted by {a.author?.name||"Campus Admin"} · {new Date(a.createdAt).toLocaleString()}</div>{user.role==="admin"&&<button className="text-danger" onClick={()=>remove(a._id)}>Delete</button>}</article>)}{!items.length&&<Empty text="No announcements have been published yet."/>}</div>
 </Page>;
}
function Events() {
 const {user}=useAuth();const [items,setItems]=useState([]);const [form,setForm]=useState({title:"",description:"",date:"",location:"",capacity:0});const [error,setError]=useState("");
 const load=()=>api.get("/events").then(r=>setItems(r.data));useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();try{await api.post("/events",form);setForm({title:"",description:"",date:"",location:"",capacity:0});load();}catch(e){setError(e.response?.data?.message||"Could not create event");}};
 const register=async id=>{try{await api.post(`/events/${id}/register`);load();}catch(e){alert(e.response?.data?.message||"Registration failed");}};
 const remove=async id=>{if(confirm("Delete this event?")){await api.delete(`/events/${id}`);load();}};
 return <Page title="Campus events" subtitle="Find workshops, meetups and experiences happening around you.">
 {user.role==="admin"&&<form className="card form-card" onSubmit={submit}><h3>Create an event</h3><div className="form-grid"><label>Event title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>Date & time<input type="datetime-local" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Capacity (0 = unlimited)<input type="number" min="0" value={form.capacity} onChange={e=>setForm({...form,capacity:Number(e.target.value)})}/></label></div><label>Description<textarea required rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><Notice text={error}/><button className="btn primary">Create event</button></form>}
 <div className="event-grid">{items.map(e=><article className="card event-card" key={e._id}><div className="event-card-date"><CalendarDays size={19}/><span>{new Date(e.date).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</span></div><h3>{e.title}</h3><p>{e.description}</p><div className="meta">📍 {e.location}</div><div className="event-bottom"><span>{e.attendees?.length||0}{e.capacity?` / ${e.capacity}`:""} attending</span><div>{user.role==="admin"&&<button className="text-danger" onClick={()=>remove(e._id)}>Delete</button>}<button className="btn small primary" disabled={new Date(e.date)<new Date()||e.attendees?.includes(user.id)} onClick={()=>register(e._id)}>{e.attendees?.includes(user.id)?"Registered":"Join event"}</button></div></div></article>)}{!items.length&&<Empty text="No events yet. Check back soon!"/>}</div>
 </Page>;
}
function Notes() {
 const [items,setItems]=useState([]);const [search,setSearch]=useState("");const [form,setForm]=useState({title:"",subject:"",semester:"",description:"",file:null});const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 const load=()=>api.get("/notes").then(r=>setItems(r.data));useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();if(!form.file)return setError("Choose a file to upload");const data=new FormData();Object.entries(form).forEach(([k,v])=>{if(v!==null)data.append(k,v);});setBusy(true);setError("");try{await api.post("/notes",data,{headers:{"Content-Type":"multipart/form-data"}});setForm({title:"",subject:"",semester:"",description:"",file:null});e.target.reset();load();}catch(e){setError(e.response?.data?.message||"Upload failed");}finally{setBusy(false);}};
 const remove=async id=>{if(confirm("Delete this resource?")){try{await api.delete(`/notes/${id}`);load();}catch(e){alert(e.response?.data?.message||"Not allowed");}}};
 const {user}=useAuth();const filtered=items.filter(n=>`${n.title} ${n.subject} ${n.description}`.toLowerCase().includes(search.toLowerCase()));
 return <Page title="Study materials" subtitle="Share useful resources and learn from your campus community.">
 <form className="card form-card" onSubmit={submit}><h3>Share a study resource</h3><div className="form-grid"><label>Resource title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Subject<input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label><label>Semester<input type="number" min="1" max="12" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})}/></label><label>File (PDF, DOC, PPT · max 10MB)<input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" required onChange={e=>setForm({...form,file:e.target.files[0]})}/></label></div><label>Description<textarea rows="2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><Notice text={error}/><button className="btn primary" disabled={busy}>{busy?"Uploading…":"Upload resource"}</button></form>
 <div className="toolbar"><div className="searchbox"><Search size={18}/><input placeholder="Search by title or subject…" value={search} onChange={e=>setSearch(e.target.value)}/></div><span className="muted">{filtered.length} resources</span></div>
 <div className="resource-grid">{filtered.map(n=><article className="card resource-card" key={n._id}><div className="resource-icon"><BookOpen size={23}/></div><span className="tag">{n.subject}</span><h3>{n.title}</h3><p>{n.description||"Shared study resource"}</p><div className="meta">Semester {n.semester||"—"} · by {n.uploadedBy?.name||"Student"}</div><div className="resource-actions"><a className="btn small primary" href={fileUrl(n.fileUrl)} target="_blank" rel="noreferrer">Download</a>{(user.role==="admin"||n.uploadedBy?._id===user.id)&&<button className="text-danger" onClick={()=>remove(n._id)}>Delete</button>}</div></article>)}{!filtered.length&&<Empty text="No matching study resources found."/>}</div>
 </Page>;
}
function Forum() {
 const [items,setItems]=useState([]);const [form,setForm]=useState({title:"",body:"",tags:""});const [comment,setComment]=useState({});const [error,setError]=useState("");const {user}=useAuth();
 const load=()=>api.get("/posts").then(r=>setItems(r.data));useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();try{await api.post("/posts",{...form,tags:form.tags.split(",").map(x=>x.trim()).filter(Boolean)});setForm({title:"",body:"",tags:""});load();}catch(e){setError(e.response?.data?.message||"Could not post");}};
 const like=async id=>{await api.post(`/posts/${id}/like`);load();};
 const addComment=async id=>{if(!comment[id]?.trim())return;try{await api.post(`/posts/${id}/comments`,{text:comment[id]});setComment({...comment,[id]:""});load();}catch(e){alert("Could not add comment");}};
 const remove=async id=>{if(confirm("Delete this discussion?")){await api.delete(`/posts/${id}`);load();}};
 return <Page title="Discussion forum" subtitle="Ask questions, share ideas and help each other out.">
 <form className="card form-card" onSubmit={submit}><h3>Start a discussion</h3><label>Discussion title<input required maxLength="140" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="What would you like to discuss?"/></label><label>Details<textarea required rows="3" value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Add context to your question or idea…"/></label><label>Tags <span className="muted">(comma separated)</span><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="React, exams, placements"/></label><Notice text={error}/><button className="btn primary">Post discussion</button></form>
 <div className="stack">{items.map(p=><article className="card post-card" key={p._id}><div className="post-author"><div className="avatar">{p.author?.name?.[0]?.toUpperCase()}</div><div><b>{p.author?.name||"Student"}</b><small>{p.author?.department||"Campus member"} · {new Date(p.createdAt).toLocaleString()}</small></div></div><h3>{p.title}</h3><p className="post-body">{p.body}</p><div className="tags">{p.tags?.map(t=><span className="tag" key={t}>{t}</span>)}</div><div className="post-actions"><button onClick={()=>like(p._id)}>♡ {p.likes?.length||0} likes</button><span>💬 {p.comments?.length||0} comments</span>{(user.role==="admin"||p.author?._id===user.id)&&<button className="text-danger" onClick={()=>remove(p._id)}>Delete</button>}</div><div className="comments">{p.comments?.map(c=><div className="comment" key={c._id}><b>{c.author?.name||"Student"}</b><span>{c.text}</span></div>)}<div className="comment-input"><input value={comment[p._id]||""} onChange={e=>setComment({...comment,[p._id]:e.target.value})} placeholder="Write a comment…"/><button className="btn small secondary" onClick={()=>addComment(p._id)}>Reply</button></div></div></article>)}{!items.length&&<Empty text="No discussions yet. Start the conversation!"/>}</div>
 </Page>;
}
function LostFound() {
 const [items,setItems]=useState([]);const [filter,setFilter]=useState("All");const [form,setForm]=useState({title:"",description:"",type:"Lost",location:"",contact:""});const [error,setError]=useState("");const {user}=useAuth();
 const load=()=>api.get("/lost-found").then(r=>setItems(r.data));useEffect(()=>{load();},[]);
 const submit=async e=>{e.preventDefault();try{await api.post("/lost-found",form);setForm({title:"",description:"",type:"Lost",location:"",contact:""});load();}catch(e){setError(e.response?.data?.message||"Could not submit report");}};
 const resolve=async id=>{await api.patch(`/lost-found/${id}/resolve`);load();};
 const remove=async id=>{if(confirm("Delete this report?")){await api.delete(`/lost-found/${id}`);load();}};
 const shown=items.filter(i=>(filter==="All"||i.type===filter)&&(filter==="Resolved"?i.status==="Resolved":filter==="All"||i.status==="Open"||filter===i.type));
 return <Page title="Lost & found" subtitle="Help return lost belongings to their owners.">
 <form className="card form-card" onSubmit={submit}><h3>Post a lost or found item</h3><div className="form-grid"><label>Item name<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Report type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Lost</option><option>Found</option></select></label><label>Location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Where was it lost/found?"/></label><label>Contact details<input required value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Email or phone"/></label></div><label>Description<textarea rows="2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><Notice text={error}/><button className="btn primary">Submit report</button></form>
 <div className="filter-row">{["All","Lost","Found","Resolved"].map(x=><button key={x} className={filter===x?"filter active":"filter"} onClick={()=>setFilter(x)}>{x}</button>)}</div>
 <div className="lost-grid">{shown.map(i=><article className="card lost-card" key={i._id}><div className="lost-top"><span className={`tag ${i.type==="Lost"?"red-tag":"green-tag"}`}>{i.type}</span><span className={`status ${i.status==="Resolved"?"done":""}`}>{i.status}</span></div><h3>{i.title}</h3><p>{i.description||"No additional details."}</p><div className="meta">📍 {i.location}</div><div className="contact-box"><small>CONTACT</small><b>{i.contact}</b></div><div className="meta">Posted by {i.createdBy?.name||"Student"}</div>{i.status==="Open"&&(user.role==="admin"||i.createdBy?._id===user.id)&&<button className="btn small secondary" onClick={()=>resolve(i._id)}>Mark resolved</button>}{user.role==="admin"&&<button className="text-danger" onClick={()=>remove(i._id)}>Delete</button>}</article>)}{!shown.length&&<Empty text="No reports in this category."/>}</div>
 </Page>;
}
function Admin() {
 const [stats,setStats]=useState(null);const [users,setUsers]=useState([]);const [error,setError]=useState("");
 useEffect(()=>{Promise.all([api.get("/users/stats"),api.get("/users")]).then(([s,u])=>{setStats(s.data);setUsers(u.data);}).catch(e=>setError(e.response?.data?.message||"Unable to load admin data"));},[]);
 return <Page title="Admin dashboard" subtitle="Manage your campus community and monitor activity."><Notice text={error}/>{stats&&<div className="stats-grid"><Stat icon={GraduationCap} label="Registered users" value={stats.users} color="purple"/><Stat icon={BookOpen} label="Study resources" value={stats.notes} color="green"/><Stat icon={MessageSquare} label="Discussions" value={stats.posts} color="blue"/><Stat icon={CalendarDays} label="Events" value={stats.events} color="orange"/></div>}<section className="card"><div className="card-head"><div><h3>Registered students</h3><p>CampusConnect member directory</p></div><span className="tag">{users.length} members</span></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Year</th><th>Role</th></tr></thead><tbody>{users.map(u=><tr key={u._id}><td><b>{u.name}</b></td><td>{u.email}</td><td>{u.department||"—"}</td><td>{u.year||"—"}</td><td><span className="tag">{u.role}</span></td></tr>)}</tbody></table></div></section></Page>;
}
export default function App() {
 const [user,setUser]=useState(null);const [loading,setLoading]=useState(true);const nav=useNavigate();
 useEffect(()=>{const token=localStorage.getItem("cc_token");if(!token){setLoading(false);return;}api.get("/auth/me").then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem("cc_token")).finally(()=>setLoading(false));},[]);
 const login=async(email,password)=>{const {data}=await api.post("/auth/login",{email,password});localStorage.setItem("cc_token",data.token);setUser(data.user);};
 const registerUser=async form=>{const {data}=await api.post("/auth/register",form);localStorage.setItem("cc_token",data.token);setUser(data.user);};
 const logout=()=>{localStorage.removeItem("cc_token");setUser(null);nav("/login");};
 return <AuthContext.Provider value={{user,loading,login,registerUser,logout}}><Routes><Route path="/" element={<Navigate to={user?"/dashboard":"/login"}/>}/><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage register/>}/><Route path="/dashboard" element={<Protected><Shell><Dashboard/></Shell></Protected>}/><Route path="/announcements" element={<Protected><Shell><Announcements/></Shell></Protected>}/><Route path="/events" element={<Protected><Shell><Events/></Shell></Protected>}/><Route path="/notes" element={<Protected><Shell><Notes/></Shell></Protected>}/><Route path="/forum" element={<Protected><Shell><Forum/></Shell></Protected>}/><Route path="/lost-found" element={<Protected><Shell><LostFound/></Shell></Protected>}/><Route path="/admin" element={<Protected admin><Shell><Admin/></Shell></Protected>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></AuthContext.Provider>;
}

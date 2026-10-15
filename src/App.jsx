// import { useState } from "react";
// import Upload from "./Upload";


// const CATEGORIES = ["Teaching", "Infrastructure", "Library", "Other"];
// const STORAGE_KEY = "anonymous-feedback";

// export default function App() {
//   const [feedback, setFeedback] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
//     } catch {
//       return [];
//     }
//   });

//   const [category, setCategory] = useState("Teaching");
//   const [message, setMessage] = useState("");
//   const [admin, setAdmin] = useState(false);
//   const [password, setPassword] = useState("");
//   const [filter, setFilter] = useState("");
//   const [date, setDate] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const saveFeedback = (data) => {
//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
//       setFeedback(data);
//       return true;
//     } catch {
//       setError("Unable to save feedback in browser storage.");
//       return false;
//     }
//   };

//   const submitFeedback = (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!message.trim()) {
//       setError("Please enter your feedback.");
//       return;
//     }

//     const item = {
//       id: crypto.randomUUID(),
//       category,
//       message: message.trim(),
//       date: new Date().toISOString().slice(0, 10),
//     };

//     if (saveFeedback([...feedback, item])) {
//       setMessage("");
//       setSuccess("Your anonymous feedback was submitted successfully!");
//     }
//   };

//   const login = (e) => {
//     e.preventDefault();
//     if (password === "admin123") {
//       setAdmin(true);
//       setPassword("");
//       setError("");
//     } else {
//       setError("Incorrect admin password.");
//     }
//   };

//   const filtered = feedback.filter(
//     (f) =>
//       (!filter || f.category === filter) &&
//       (!date || f.date === date)
//   );

//   const styles = {
//     page: {
//       minHeight: "100vh",
//       background: "#f1f5f9",
//       padding: "30px 15px",
//       fontFamily: "Arial, sans-serif",
//       color: "#1e293b",
//       boxSizing: "border-box",
//     },
//     card: {
//       maxWidth: 800,
//       margin: "auto",
//       padding: 25,
//       background: "white",
//       borderRadius: 14,
//       boxShadow: "0 4px 20px #00000010",
//     },
//     input: {
//       width: "100%",
//       padding: 12,
//       margin: "8px 0 14px",
//       border: "1px solid #cbd5e1",
//       borderRadius: 7,
//       boxSizing: "border-box",
//       fontSize: 15,
//     },
//     button: {
//       padding: "11px 18px",
//       background: "#4f46e5",
//       color: "white",
//       border: 0,
//       borderRadius: 7,
//       cursor: "pointer",
//       fontSize: 15,
//     },
//     feedback: {
//       background: "#f8fafc",
//       padding: 15,
//       margin: "12px 0",
//       borderRadius: 8,
//       border: "1px solid #e2e8f0",
//       overflowWrap: "anywhere",
//     },
//   };

//   return (
//     <div style={styles.page}>
//       <main style={styles.card}>
//         <h1 style={{ color: "#4338ca" }}>Anonymous Feedback System</h1>
//         <p>Share your honest feedback without creating an account.</p>

//         <h2>Submit Feedback</h2>

//         <form onSubmit={submitFeedback}>
//           <label>Feedback Category</label>
//           <select
//             style={styles.input}
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//           >
//             {CATEGORIES.map((c) => (
//               <option key={c} value={c}>{c}</option>
//             ))}
//           </select>

//           <label>Your Feedback</label>
//           <textarea
//             style={{ ...styles.input, minHeight: 120, resize: "vertical" }}
//             placeholder="Write your feedback here..."
//             value={message}
//             maxLength={2000}
//             onChange={(e) => setMessage(e.target.value)}
//             required
//           />

//           <p style={{ color: "#64748b", fontSize: 13 }}>
//             {message.length}/2000 characters
//           </p>

//           <button style={styles.button} type="submit">
//             Submit Feedback
//           </button>
//         </form>

//         {error && <p role="alert" style={{ color: "#dc2626" }}>{error}</p>}
//         {success && <p role="status" style={{ color: "#15803d" }}>{success}</p>}

//         <hr style={{ margin: "30px 0", borderColor: "#e2e8f0" }} />

//         <h2>Administrator Dashboard</h2>

//         {!admin ? (
//           <form onSubmit={login}>
//             <label>Admin Password</label>
//             <input
//               style={styles.input}
//               type="password"
//               placeholder="Enter admin password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button style={styles.button} type="submit">Admin Login</button>
//           </form>
//         ) : (
//           <>
//             <div style={{
//               display: "flex",
//               gap: 12,
//               flexWrap: "wrap",
//               margin: "20px 0",
//             }}>
//               <div style={{ ...styles.feedback, flex: "1 1 140px" }}>
//                 <h3>Total Feedback</h3>
//                 <h2>{feedback.length}</h2>
//               </div>
//               <div style={{ ...styles.feedback, flex: "1 1 140px" }}>
//                 <h3>Filtered Results</h3>
//                 <h2>{filtered.length}</h2>
//               </div>
//             </div>

//             <label>Filter by Category</label>
//             <select
//               style={styles.input}
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             >
//               <option value="">All Categories</option>
//               {CATEGORIES.map((c) => (
//                 <option key={c} value={c}>{c}</option>
//               ))}
//             </select>

//             <label>Filter by Submission Date</label>
//             <input
//               style={styles.input}
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//             />

//             {filtered.length === 0 ? (
//               <p>No feedback found.</p>
//             ) : (
//               filtered.map((f) => (
//                 <article key={f.id} style={styles.feedback}>
//                   <strong>{f.category}</strong>
//                   <span style={{ color: "#64748b", float: "right" }}>
//                     {f.date}
//                   </span>
//                   <p style={{ whiteSpace: "pre-wrap" }}>{f.message}</p>
//                 </article>
//               ))
//             )}

//             <button
//               style={styles.button}
//               onClick={() => {
//                 setAdmin(false);
//                 setFilter("");
//                 setDate("");
//               }}
//             >
//               Logout
//             </button>
//           </>
//         )}
//       </main>
//     </div>
//   );
// }
import Upload from "./Upload";

export default function App() {
  return <Upload />;
}
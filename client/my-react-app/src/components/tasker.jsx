import React, { useState, useEffect } from "react";
import axios from "axios";
import "./tasker.css";

function TaskerForm() {
  const [tasker, setTasker] = useState({
    fullName: "",
    phone: "",
    address: "",
    jobTitle: "",
    jobDescription: "",
    skills: "",
    budget: "",
    idProof: null,
    idNumber: "",
    availability: "Full-time",
  });

  const [taskerId, setTaskerId] = useState(null);

  useEffect(() => {
    const savedTasker = JSON.parse(localStorage.getItem("tasker"));
    if (savedTasker) {
      setTasker(savedTasker);
      setTaskerId(savedTasker.id);
    }
  }, []);

  const handleChange = (e) => {
    setTasker({ ...tasker, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setTasker({ ...tasker, idProof: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tasker.fullName || !tasker.phone) {
      alert("Full Name and Phone Number are required!");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(tasker).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (taskerId) {
        await axios.put(`http://localhost:5000/taskers/${taskerId}`, formData);
        alert("Tasker details updated!");
      } else {
        const res = await axios.post("http://localhost:5000/taskers", formData);
        setTaskerId(res.data.id);
        alert("Registration successful!");
      }

      localStorage.setItem("tasker", JSON.stringify(tasker));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async () => {
    if (taskerId) {
      await axios.delete(`http://localhost:5000/taskers/${taskerId}`);
      alert("Account deleted!");
      setTaskerId(null);
      setTasker({
        fullName: "",
        phone: "",
        address: "",
        jobTitle: "",
        jobDescription: "",
        skills: "",
        budget: "",
        idProof: null,
        idNumber: "",
        availability: "Full-time",
      });
      localStorage.removeItem("tasker");
    }
  };

  return (
    <div className="form-container">
      <h2>{taskerId ? "Edit Tasker Details" : "Tasker Registration"}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Full Name</label>
        <input type="text" name="fullName" value={tasker.fullName} onChange={handleChange} required />

        <label>Phone Number</label>
        <input type="tel" name="phone" value={tasker.phone} onChange={handleChange} required />

        <label>Address</label>
        <input type="text" name="address" value={tasker.address} onChange={handleChange} />

        <label>Job Title</label>
        <input type="text" name="jobTitle" value={tasker.jobTitle} onChange={handleChange} />

        <label>Job Description</label>
        <textarea name="jobDescription" value={tasker.jobDescription} onChange={handleChange}></textarea>

        <label>Skills</label>
        <input type="text" name="skills" value={tasker.skills} onChange={handleChange} placeholder="E.g., Plumbing, Electrical" />

        <label>Budget ($)</label>
        <input type="number" name="budget" value={tasker.budget} onChange={handleChange} />

        <label>ID Proof</label>
        <input type="file" name="idProof" accept="image/*,application/pdf" onChange={handleFileChange} />

        <label>ID Number</label>
        <input type="text" name="idNumber" value={tasker.idNumber} onChange={handleChange} />

        <label>Availability</label>
        <select name="availability" value={tasker.availability} onChange={handleChange}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="On-demand">On-demand</option>
        </select>

        <button type="submit">{taskerId ? "Update" : "Register"}</button>

        {taskerId && <button type="button" onClick={handleDelete} className="delete-btn">Delete Account</button>}
      </form>
    </div>
  );
}

export default TaskerForm;

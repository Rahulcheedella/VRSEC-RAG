import React, { useState } from "react";
import { generateTimetable } from "../api/timetable.api";
import styles from "../styles/timetable.module.css";

const TimetablePage = () => {
  const [departments, setDepartments] = useState([
    { name: "CSE", subjects: ["DSA", "OS", "DBMS", "DAA"] },
    { name: "ECE", subjects: ["Signals", "VLSI", "EM"] },
    { name: "MEC", subjects: ["Thermodynamics", "Manufacturing", "Fluid Mechanics"] },
  ]);

  const [startDate, setStartDate] = useState("2026-02-02");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const addDepartment = () => {
    setDepartments([...departments, { name: "", subjects: [""] }]);
  };

  const updateDeptName = (index, value) => {
    const newDepts = [...departments];
    newDepts[index].name = value.toUpperCase();
    setDepartments(newDepts);
  };

  const updateSubject = (deptIndex, subjIndex, value) => {
    const newDepts = [...departments];
    newDepts[deptIndex].subjects[subjIndex] = value.trim();
    setDepartments(newDepts);
  };

  const addSubject = (deptIndex) => {
    const newDepts = [...departments];
    newDepts[deptIndex].subjects.push("");
    setDepartments(newDepts);
  };

  const removeSubject = (deptIndex, subjIndex) => {
    const newDepts = [...departments];
    newDepts[deptIndex].subjects = newDepts[deptIndex].subjects.filter((_, i) => i !== subjIndex);
    setDepartments(newDepts);
  };

  const removeDepartment = (index) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {};
    departments.forEach((dept) => {
      if (dept.name.trim() && dept.subjects.some((s) => s.trim())) {
        payload[dept.name.trim()] = dept.subjects
          .filter((s) => s.trim())
          .map((s) => s.trim());
      }
    });

    if (Object.keys(payload).length === 0) {
      setError("Add at least one department with subjects");
      setLoading(false);
      return;
    }

    if (startDate) payload.start_date = startDate;

    try {
      const data = await generateTimetable(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.timetableContainer}>
      <h1 className={styles.title}>VRSEC Exam Timetable Generator</h1>

      <form onSubmit={handleSubmit}>
        <div className={styles.dateRow}>
          <div>
            <label className={styles.label}>Start Date</label>
            <input
              className={styles.input}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
        </div>

        {departments.map((dept, deptIdx) => (
          <div key={deptIdx} className={styles.departmentBlock}>
            <div className={styles.deptHeader}>
              <input
                className={`${styles.input} ${styles.deptName}`}
                type="text"
                placeholder="Department (e.g. CSE)"
                value={dept.name}
                onChange={(e) => updateDeptName(deptIdx, e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeDepartment(deptIdx)}
              >
                ×
              </button>
            </div>

            <div>
              {dept.subjects.map((subj, subjIdx) => (
                <div key={subjIdx} className={styles.subjectRow}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Subject name / code"
                    value={subj}
                    onChange={(e) => updateSubject(deptIdx, subjIdx, e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.removeSubject}
                    onClick={() => removeSubject(deptIdx, subjIdx)}
                  >
                    −
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className={styles.addSubjectBtn} onClick={() => addSubject(deptIdx)}>
              + Add Subject
            </button>
          </div>
        ))}

        <button type="button" className={styles.addDeptBtn} onClick={addDepartment}>
          + Add Department
        </button>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? "Generating Timetable..." : "Generate Timetable"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.result}>
          <h2 className={styles.resultTitle}>Generated Timetable</h2>
          <pre className={styles.pre}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TimetablePage;

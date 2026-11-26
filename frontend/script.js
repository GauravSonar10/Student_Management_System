const API_URL = "http://127.0.0.1:8000/api/students";

let students = [];
let editId = null;
let searchDebounceTimer = null;

// DOM Elements
const studentForm = document.getElementById("studentForm");
const formHeading = document.getElementById("formHeading");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const mobileInput = document.getElementById("mobile");
const courseInput = document.getElementById("course");

const searchInput = document.getElementById("searchInput");
const courseFilter = document.getElementById("courseFilter");
const totalStudents = document.getElementById("totalStudents");
const studentTableBody = document.getElementById("studentTableBody");

// Fetch students from FastAPI backend with optional search & course query params
async function fetchStudents() {
    try {
        const params = new URLSearchParams();
        const keyword = searchInput.value.trim();
        const selectedCourse = courseFilter.value;

        if (keyword) {
            params.append("search", keyword);
        }
        if (selectedCourse && selectedCourse !== "All") {
            params.append("course", selectedCourse);
        }

        const queryString = params.toString();
        const url = queryString ? `${API_URL}?${queryString}` : API_URL;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch students.");

        students = await response.json();
        displayStudents(students);
    } catch (error) {
        console.error("Error loading students:", error);
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: red;">
                    Unable to connect to backend server.
                </td>
            </tr>
        `;
    }
}

// Debounced search handler (waits 300ms after user stops typing)
function handleSearchInput() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(fetchStudents, 300);
}

// Display students in the table and update total count
function displayStudents(list) {
    studentTableBody.innerHTML = "";
    totalStudents.textContent = list.length;

    if (list.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No student records found.</td>
            </tr>
        `;
        return;
    }

    list.forEach(function (student) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.mobile}</td>
            <td>${student.course}</td>
            <td>
                <button class="edit-btn" onclick="editStudent(${student.id})">Edit</button>
                <button class="delete-btn" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        `;

        studentTableBody.appendChild(row);
    });
}

// Reset form and exit edit mode
function resetForm() {
    studentForm.reset();
    editId = null;
    formHeading.textContent = "Add Student";
    submitBtn.textContent = "Add Student";
}

// Handle Add (POST) and Update (PUT) on form submit
async function handleFormSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const course = courseInput.value;

    if (name === "" || email === "" || mobile === "" || course === "") {
        alert("All fields are required.");
        return;
    }

    const payload = { name, email, mobile, course };

    try {
        let response;
        if (editId !== null) {
            response = await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            const message = Array.isArray(errorData.detail)
                ? errorData.detail[0].msg.replace(/^Value error,\s*/i, "")
                : errorData.detail || "Operation failed.";
            alert(message);
            return;
        }

        resetForm();
        await fetchStudents();
    } catch (error) {
        console.error("Error saving student:", error);
        alert("Server error while saving student.");
    }
}

// Populate form with selected student's data
function editStudent(id) {
    const student = students.find(function (item) {
        return item.id === id;
    });

    if (!student) return;

    nameInput.value = student.name;
    emailInput.value = student.email;
    mobileInput.value = student.mobile;
    courseInput.value = student.course;

    editId = id;
    formHeading.textContent = "Edit Student";
    submitBtn.textContent = "Update Student";
}

// Remove student via DELETE API
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Failed to delete student.");
            return;
        }

        if (editId === id) {
            resetForm();
        }
        await fetchStudents();
    } catch (error) {
        console.error("Error deleting student:", error);
        alert("Server error while deleting student.");
    }
}

// Strip non-numeric characters automatically as user types mobile number
mobileInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
});

// Event Listeners
studentForm.addEventListener("submit", handleFormSubmit);
resetBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", handleSearchInput);
courseFilter.addEventListener("change", fetchStudents);

// Initial load from backend API
fetchStudents();
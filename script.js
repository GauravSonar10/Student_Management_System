// Load existing students from localStorage, or start with an empty array
let students = JSON.parse(localStorage.getItem("students")) || [];
let editId = null;

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

// Save the current students array to localStorage
function saveToLocalStorage() {
    localStorage.setItem("students", JSON.stringify(students));
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

// Handle Add and Update on form submit
function handleFormSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const course = courseInput.value;

    // 1. Check mandatory fields
    if (name === "" || email === "" || mobile === "" || course === "") {
        alert("All fields are required.");
        return;
    }

    // 2. Basic email format validation
    if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
    }

    // 3. Prevent duplicate email entries (ignore current student when editing)
    const isDuplicate = students.some(function (student) {
        return student.email.toLowerCase() === email.toLowerCase() && student.id !== editId;
    });

    if (isDuplicate) {
        alert("A student with this email already exists.");
        return;
    }

    if (editId !== null) {
        // Update existing student using findIndex()
        const index = students.findIndex(function (student) {
            return student.id === editId;
        });

        if (index !== -1) {
            students[index] = {
                id: editId,
                name: name,
                email: email,
                mobile: mobile,
                course: course
            };
        }
    } else {
        // Add new student
        const newStudent = {
            id: Date.now(),
            name: name,
            email: email,
            mobile: mobile,
            course: course
        };

        students.push(newStudent);
    }

    saveToLocalStorage();
    resetForm();
    filterStudents();
}

// Populate form with selected student's data using find()
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

// Remove student using filter()
function deleteStudent(id) {
    students = students.filter(function (student) {
        return student.id !== id;
    });

    saveToLocalStorage();
    filterStudents();
}

// Filter students by both name search and course dropdown
function filterStudents() {
    const keyword = searchInput.value.toLowerCase();
    const selectedCourse = courseFilter.value;

    const filteredStudents = students.filter(function (student) {
        const matchesName = student.name.toLowerCase().includes(keyword);
        const matchesCourse = selectedCourse === "All" || student.course === selectedCourse;
        return matchesName && matchesCourse;
    });

    displayStudents(filteredStudents);
}

// Event Listeners
studentForm.addEventListener("submit", handleFormSubmit);
resetBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", filterStudents);
courseFilter.addEventListener("change", filterStudents);

// Initial render on page load
displayStudents(students);
document.addEventListener('DOMContentLoaded', () => {
    // Declare global variables for sections
    const recordsSection = document.getElementById('records-section');
    const createAppealsSection = document.getElementById('create-appeal-section');

    const currentPage = document.body.dataset.page;
    const links = [
        {
            id: 'records-btn',
            text: 'Records',
            target: recordsSection,
            hiddenSection: [createAppealsSection],
            isActive: true  // Default active link for student
        },
        {
            id: 'create-appeal-btn',
            text: 'Create Appeal',
            target: createAppealsSection,
            hiddenSection: [recordsSection],
            isActive: false // Not active by default
        }
    ];

    // Create navbar
    createNavbar(links, true); // Pass true for student navbar style

    // Helper function to reset styles for recordsSection
    function resetRecordsStyles() {
        recordsSection.style.display = 'flex';
        recordsSection.style.flexWrap = 'wrap';
        recordsSection.style.gap = '20px';
    }

    // Function to toggle visibility based on button clicks
    function toggleSection(targetSection, hiddenSections) {
        // Show the target section
        targetSection.style.display = 'block';
        if (targetSection === recordsSection) {
            resetRecordsStyles();
        }

        // Hide all other sections
        hiddenSections.forEach(section => {
            section.style.display = 'none';
        });
    }

    // Add event listeners to buttons
    links.forEach(link => {
        const button = document.getElementById(link.id);

        // Set the initial visibility
        if (link.isActive) {
            toggleSection(link.target, link.hiddenSection);
        }

        // Add click event listener
        button.addEventListener('click', () => {
            toggleSection(link.target, link.hiddenSection);

            // Trigger the displayStudentCourseButtons when "Records" is clicked
            if (link.id === 'records-btn') {
                displayStudentCourseButtons();
            }
        });
    });

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Function to display course buttons for the student
    const displayStudentCourseButtons = () => {
        // Fetch courses and lectures JSON
        Promise.all([ 
            fetch('jsons/courses.json').then(response => response.json()),
            fetch('jsons/lectures.json').then(response => response.json())
        ])
        .then(([courses, lectures]) => {
            const studentId = currentUser.id;

            // Filter lectures to find those the student is registered for
            const studentLectures = lectures.filter(lecture => lecture.students_ids.includes(studentId));

            // Get unique course IDs from student lectures
            const uniqueCourseIds = [...new Set(studentLectures.map(lecture => lecture.course_id))];

            if (recordsSection) {
                recordsSection.innerHTML = ''; // Clear existing content
                resetRecordsStyles(); // Apply consistent styles

                // Create buttons for each unique course
                uniqueCourseIds.forEach(courseId => {
                    const course = courses.find(course => course.id === courseId);
                    if (course) {
                        const button = document.createElement('div');
                        button.classList.add('p-6', 'bg-white', 'rounded-lg', 'shadow-md', 'cursor-pointer',
                            'transform', 'transition-transform', 'duration-300',
                            'hover:scale-105', 'hover:transform-origin-center',
                            'min-w-[350px]', 'min-h-[200px]', 'sm:w-4/5', 'md:w-3/4',
                            'lg:w-2/3', 'xl:w-1/2', 'mx-auto');
                        button.innerHTML = `
                            <h3 class="lg:text-xl md:text-md sm:text-xs font-bold">
                                ${course.id} / ${course.name}
                            </h3>
                        `;
                        button.addEventListener('click', () => {
                            hideCourseButtonsAndShowStatistics(course.id);
                        });
                        recordsSection.appendChild(button);
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching courses or lectures:', error));
    };

    const hideCourseButtonsAndShowStatistics = (courseId) => {
        // Hide all course buttons
        recordsSection.innerHTML = '';
    
        // Create statistics container
        const statisticsContainer = document.createElement('div');
        statisticsContainer.id = 'statistics-container';
        statisticsContainer.style.display = 'flex';
        statisticsContainer.style.justifyContent = 'center';
        statisticsContainer.style.alignItems = 'center';
        statisticsContainer.style.gap = '50px';
        statisticsContainer.style.margin = '50px auto';
        statisticsContainer.style.width = '80%';
    
        // Create four squares inside the container
        const squareTitles = ["Classes", "Tutorials", "Labs", "Appeals"];
        const squareData = [
            { missing: "2 / 10", percentage: "80%" },  // Data for Classes
            { missing: "0 / 9", percentage: "100%" },  // Data for Tutorials
            { missing: "1 / 9", percentage: "88%" },   // Data for Labs
            { missing: "1", accepted: "1" }            // Data for Appeals
        ];
    
        for (let i = 0; i < 4; i++) {
            const square = document.createElement('div');
            square.classList.add('statistics-square', 'dark:statistics-square');
            square.style.width = '270px';
            square.style.height = '270px';
            square.style.backgroundColor = 'white';
            square.style.borderRadius = '10px';
            square.style.display = 'flex';
            square.style.flexDirection = 'column';  // Stack the headline on top
            square.style.justifyContent = 'flex-start';  // Align headline to the top
            square.style.alignItems = 'center';
            square.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    
            // Create the headline for each square
            const headline = document.createElement('h4');
            headline.textContent = squareTitles[i];
            headline.style.fontSize = '18px';
            headline.style.fontWeight = 'bold';
            headline.style.marginTop = '10px';  // Add some space above the headline
    
            // Append the headline and square content
            square.appendChild(headline);
    
            // Add content inside the square based on the squareData array
            const content = document.createElement('div');
            content.style.flexGrow = '1';  // Fill remaining space
            content.style.display = 'flex';
            content.style.flexDirection = 'column';  // Stack the content
            content.style.justifyContent = 'center';
            content.style.alignItems = 'center';
    
            if (i < 3) {
                // For Classes, Tutorials, Labs
                content.innerHTML = `
                    <p>Missings: ${squareData[i].missing}</p>
                    <p>Percentage of Attendance: ${squareData[i].percentage}</p>
                `;
            } else {
                // For Appeals
                content.innerHTML = `
                    <p>Appeals sent: ${squareData[i].missing}</p>
                    <p>Appeals accepted: ${squareData[i].accepted}</p>
                `;
            }
    
            square.appendChild(content);
    
            statisticsContainer.appendChild(square);
        }
    
        recordsSection.appendChild(statisticsContainer);
    
        // Create the table under the statistics squares with Tailwind classes
        const table = document.createElement('table');
        table.classList.add('table-auto', 'my-6', 'bg-white', 'border-collapse', 'shadow-md');
        table.style.width = '67%';  // Adjust the width to 80% of its container (or any value you prefer)
        table.style.margin = '0 auto';  // Center the table horizontally
        
        // Create the table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Date', 'Type', 'Status'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.classList.add('px-4', 'py-2', 'text-center', 'bg-green-500', 'text-white', 'border');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        tableHeader.appendChild(headerRow);
        table.appendChild(tableHeader);
    
        // Create the table body and populate it with dates and statuses
        const tableBody = document.createElement('tbody');
        const startDate = new Date('2024-10-11'); // Start date: 10/11/2024
        const endDate = new Date('2025-01-05'); // End date: 5/1/2025
    
        let missedClasses = 0;
        let missedLabs = 0;
    
        for (let currentDate = new Date(startDate); currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
            const dayOfWeek = currentDate.getDay();
            let type = '';
            let status = 'attended';
    
            if (dayOfWeek === 0) { // Sunday (Classes)
                type = 'Class';
                if (missedClasses < 2) {
                    missedClasses++;
                    status = 'missed';
                }
            } else if (dayOfWeek === 2) { // Tuesday (Labs)
                type = 'Lab';
                if (missedLabs < 1) {
                    missedLabs++;
                    status = 'missed';
                }
            } else if (dayOfWeek === 3) { // Wednesday (Tutorials)
                type = 'Tutorial';
                // Tutorials are always attended, no missed status
            } else {
                continue; // Skip non-course days
            }
    
            // Add the row to the table
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.classList.add('px-4', 'py-2', 'text-center', 'border');
            dateCell.textContent = currentDate.toLocaleDateString();
            row.appendChild(dateCell);
    
            const typeCell = document.createElement('td');
            typeCell.classList.add('px-4', 'py-2', 'text-center', 'border');
            typeCell.textContent = type;
            row.appendChild(typeCell);
    
            const statusCell = document.createElement('td');
            statusCell.classList.add('px-4', 'py-2', 'text-center', 'border');
            statusCell.textContent = status;
            row.appendChild(statusCell);
    
            tableBody.appendChild(row);
        }
    
        table.appendChild(tableBody);
        recordsSection.appendChild(table);
    };
    
    // Check if the current page is the student page and display the buttons
    if (currentPage === 'student') {
        displayStudentCourseButtons();
    }
    
    
});
